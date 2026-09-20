"""Browser regression tests; Python + Playwright, no production dependencies.

The fake player and SVG fixture exercise interaction, never scientific data.
Run: python tests/test_presentation.py
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import unittest

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
MOCK_API = r"""
window.mockPlayer = {time: 0, duration: 783, state: -1, calls: [], deferSeek: false};
window.YT = {Player: function(id, options) {
  const mock = window.mockPlayer;
  const iframe = document.createElement('iframe');
  iframe.id = id;
  document.getElementById(id).replaceWith(iframe);
  mock.options = options;
  mock.emit = (state) => {mock.state = state; options.events.onStateChange({data: state});};
  this.getIframe = () => iframe;
  this.getCurrentTime = () => mock.time;
  this.getDuration = () => mock.duration;
  this.getPlayerState = () => mock.state;
  this.seekTo = (time, allow) => {
    mock.calls.push(['seek', time, allow]);
    if (!mock.deferSeek) mock.time = time;
  };
  this.cueVideoById = (video) => {mock.time = video.startSeconds; mock.calls.push(['cue', video]); mock.emit(5);};
  this.playVideo = () => {mock.calls.push(['play']); mock.emit(1);};
  this.pauseVideo = () => {mock.calls.push(['pause']); mock.emit(2);};
  mock.ready = () => options.events.onReady({target: this});
  if (!window.deferPlayerReady) setTimeout(mock.ready, 0);
}};
window.onYouTubeIframeAPIReady();
"""


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def translate_path(self, path):
        # Emulate GitHub Pages' project subdirectory with the same source files.
        if path.startswith('/project/'):
            path = path[len('/project'):]
        return super().translate_path(path)


class PresentationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
        cls.thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width': 1440, 'height': 1000})
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.route('https://www.youtube.com/iframe_api',
                        lambda route: route.fulfill(content_type='application/javascript', body=MOCK_API))

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [], 'Unexpected JavaScript errors')

    def load(self, suffix='/'):
        self.page.goto(self.base + suffix)
        expect(self.page.locator('.chapter')).to_have_count(9)

    def expect_section(self, section):
        expect(self.page.locator('.chapter[aria-current="step"]')).to_have_attribute('data-section', section)
        expect(self.page.locator('.timeline-segment.is-active')).to_have_attribute('data-section', section)

    def test_video_configuration_and_controls(self):
        self.load()
        expect(self.page.locator('#playButton')).to_be_enabled()
        self.assertEqual(self.page.evaluate('mockPlayer.options.videoId'), 'DtUZBM2LZTA')
        self.assertEqual(self.page.evaluate('mockPlayer.options.playerVars.origin'), self.base)
        self.page.locator('#playButton').click()
        expect(self.page.locator('#playButton')).to_have_attribute('aria-label', 'Pausar video')
        self.page.locator('#playButton').click()
        expect(self.page.locator('#playback-status')).to_have_text('En pausa')
        self.assertEqual(self.page.evaluate('mockPlayer.calls'), [['play'], ['pause']])

    def test_every_boundary_gap_and_manual_forward_backward_seek(self):
        self.load()
        cases = [(0, 'introduction'), (1, 'introduction'), (207.99, 'introduction'),
                 (208, 'objective'), (229.99, 'objective'), (230, 'methodology'),
                 (340, 'methodology'), (341, 'methodology'), (351.99, 'methodology'),
                 (352, 'ros'), (411.99, 'ros'), (412, 'lipid-peroxidation'),
                 (474.99, 'lipid-peroxidation'), (475, 'mtt'), (585.99, 'mtt'),
                 (586, 'discussion'), (656.99, 'discussion'), (657, 'limitations'),
                 (727.99, 'limitations'), (728, 'conclusions'), (783, 'conclusions')]
        for time, section in cases + list(reversed(cases)):
            with self.subTest(time=time, section=section):
                self.page.evaluate('(time) => {mockPlayer.time = time; mockPlayer.emit(2);}', time)
                self.expect_section(section)
        # Ordinary playback advancement is picked up by the polling timer.
        self.page.evaluate('mockPlayer.time = 500; mockPlayer.emit(1);')
        self.expect_section('mtt')
        self.page.evaluate('mockPlayer.time = 660')
        self.expect_section('limitations')

    def test_chapters_timeline_click_keyboard_and_delayed_seek(self):
        self.load()
        self.page.locator('.chapter[data-section="ros"]').click()
        self.expect_section('ros')
        self.assertEqual(self.page.evaluate('mockPlayer.calls.at(-1)'), ['seek', 352, True])
        self.page.locator('#timeline-seek').focus()
        self.page.keyboard.press('End')
        self.expect_section('conclusions')
        self.page.keyboard.press('Home')
        self.expect_section('introduction')
        box = self.page.locator('#timeline-seek').bounding_box()
        self.page.locator('#timeline-seek').click(position={'x': box['width'] * 0.65, 'y': box['height'] / 2})
        self.expect_section('mtt')
        self.page.evaluate('mockPlayer.deferSeek = true')
        self.page.locator('.chapter[data-section="objective"]').click()
        self.page.evaluate('readPlayerTime()')
        self.expect_section('objective')
        self.page.evaluate('mockPlayer.time = 208; readPlayerTime()')
        self.expect_section('objective')
        self.assertEqual(self.page.evaluate('mockPlayer.calls.at(-1)'), ['seek', 208, True])
        # Segment boundaries agree with seeks, including the methodology gap.
        left = self.page.locator('.timeline-segment[data-section="ros"]').evaluate('(el) => parseFloat(el.style.left)')
        self.assertAlmostEqual(left, 352 / 783 * 100, places=5)

    def test_late_video_load_preserves_selected_chapter_without_autoplay(self):
        self.page.add_init_script('window.deferPlayerReady = true')
        self.load()
        self.page.locator('.chapter[data-section="mtt"]').click()
        self.expect_section('mtt')
        self.page.evaluate('mockPlayer.ready()')
        expect(self.page.locator('#playButton')).to_be_enabled()
        self.expect_section('mtt')
        self.assertEqual(self.page.evaluate('mockPlayer.calls'), [['cue', {'videoId': 'DtUZBM2LZTA', 'startSeconds': 475}]])
        # YouTube can report zero for a cued video until the viewer presses play.
        self.page.evaluate('mockPlayer.time = 0; seekInFlight.expires = 0; readPlayerTime()')
        self.expect_section('mtt')
        self.page.evaluate('mockPlayer.time = 476; mockPlayer.emit(1)')
        self.expect_section('mtt')

    def enable_test_figure(self):
        self.page.evaluate("""() => {
          const figure = sections.find(s => s.id === 'ros');
          figure.imageAvailable = true;
          figure.image = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="white"/><text x="40" y="180" font-size="24">TEST FIXTURE — NO SCIENTIFIC DATA</text></svg>');
          activeSectionId = '';
          seekToSection('ros');
        }""")
        expect(self.page.locator('.figure-button')).to_have_count(1)

    def test_modal_pauses_focus_escape_close_and_backdrop_never_resume(self):
        self.load()
        self.enable_test_figure()
        for method in ('escape', 'close', 'backdrop'):
            with self.subTest(method=method):
                self.page.locator('#playButton').click()
                self.page.locator('.figure-button').click()
                expect(self.page.locator('#figure-modal')).to_be_visible()
                expect(self.page.locator('#modal-close')).to_be_focused()
                self.page.keyboard.press('Tab')
                self.assertTrue(self.page.evaluate('document.querySelector("#figure-modal").contains(document.activeElement)'))
                self.assertEqual(self.page.evaluate('mockPlayer.state'), 2)
                before = self.page.evaluate('mockPlayer.calls.filter(c => c[0] === "play").length')
                if method == 'escape':
                    self.page.keyboard.press('Escape')
                elif method == 'close':
                    self.page.locator('#modal-close').click()
                else:
                    self.page.mouse.click(2, 2)
                expect(self.page.locator('#figure-modal')).not_to_be_visible()
                expect(self.page.locator('.figure-button')).to_be_focused()
                self.assertEqual(self.page.evaluate('mockPlayer.calls.filter(c => c[0] === "play").length'), before)
                self.assertEqual(self.page.evaluate('mockPlayer.state'), 2)

    def test_missing_enabled_figure_falls_back_without_breaking_navigation(self):
        self.load()
        self.page.route('**/assets/missing-test.svg', lambda route: route.fulfill(status=404, body=''))
        self.page.evaluate("""() => {
            const figure = sections.find(s => s.id === 'ros');
            figure.imageAvailable = true;
            figure.image = 'assets/missing-test.svg';
            seekToSection('ros');
        }""")
        expect(self.page.locator('.figure-fallback')).to_contain_text('Scientific visual unavailable')
        self.page.locator('.chapter[data-section="discussion"]').click()
        expect(self.page.locator('.integration-figures .figure-fallback')).to_have_count(1)
        expect(self.page.locator('.integration-figures .figure-button')).to_have_count(2)
        expect(self.page.locator('.key-message')).to_contain_text('depends on both postnatal age')
        self.page.locator('.chapter[data-section="methodology"]').click()
        expect(self.page.locator('.figure-button img')).to_have_attribute('src', 'assets/methodology.svg')

    def test_api_unavailable_and_error_leave_chapters_and_references_usable(self):
        self.page.unroute('https://www.youtube.com/iframe_api')
        self.page.route('https://www.youtube.com/iframe_api', lambda route: route.abort())
        local_failures = []
        self.page.on('response', lambda response: local_failures.append(response.url)
                     if response.url.startswith(self.base) and response.status >= 400 else None)
        self.load()
        expect(self.page.locator('#video-status')).to_contain_text('YouTube no está disponible')
        for section in ('ros', 'discussion', 'conclusions', 'introduction'):
            self.page.locator(f'.chapter[data-section="{section}"]').click()
            self.expect_section(section)
        expect(self.page.locator('.reference')).to_have_count(10)
        self.assertEqual(local_failures, [])
        self.page.unroute('https://www.youtube.com/iframe_api')
        self.page.route('https://www.youtube.com/iframe_api',
                        lambda route: route.fulfill(content_type='application/javascript', body=MOCK_API))
        self.load()
        self.page.evaluate('mockPlayer.options.events.onError({data: 153})')
        expect(self.page.locator('#playButton')).to_be_disabled()
        self.page.locator('.chapter[data-section="mtt"]').click()
        self.expect_section('mtt')

    def test_references_copy_links_and_no_javascript(self):
        self.context.grant_permissions(['clipboard-read', 'clipboard-write'])
        self.load()
        expect(self.page.locator('.reference')).to_have_count(10)
        expect(self.page.locator('.reference .links a')).to_have_count(23)
        self.page.locator('#copyButton').click()
        expect(self.page.locator('#toast')).to_contain_text('Referencias copiadas')
        copied = self.page.evaluate('navigator.clipboard.readText()')
        self.assertEqual(len(copied.split('\n\n')), 10)
        self.assertIn('https://doi.org/10.1002/1873-3468.12972', copied)
        self.assertIn('PMCID: PMC4456256', copied)
        context = self.browser.new_context(java_script_enabled=False)
        page = context.new_page()
        page.goto(self.base)
        expect(page.locator('.reference')).to_have_count(10)
        expect(page.locator('noscript')).to_be_visible()
        context.close()

    def test_responsive_no_overflow_and_reduced_motion(self):
        self.load()
        for width in (320, 360, 390, 620, 768, 1024, 1440):
            self.page.set_viewport_size({'width': width, 'height': 1000})
            for section in ('introduction', 'objective', 'methodology', 'ros', 'discussion', 'limitations', 'conclusions'):
                with self.subTest(width=width, section=section):
                    self.page.evaluate('(id) => seekToSection(id)', section)
                    dimensions = self.page.evaluate('({scroll: document.documentElement.scrollWidth, viewport: innerWidth})')
                    self.assertLessEqual(dimensions['scroll'], dimensions['viewport'])
                    video = self.page.locator('.video-frame').bounding_box()
                    self.assertAlmostEqual(video['width'] / video['height'], 16 / 9, places=2)
                    content = self.page.locator('.active-panel').bounding_box()
                    if width <= 620:
                        self.assertGreater(content['y'], video['y'])
                    else:
                        self.assertGreater(content['x'], video['x'])
        self.page.emulate_media(reduced_motion='reduce')
        self.assertEqual(self.page.locator('#active-content').evaluate('(el) => getComputedStyle(el).animationName'), 'none')

    def test_theme_storage_restriction_and_project_subdirectory(self):
        self.load('/project/')
        expect(self.page.locator('#active-content')).to_contain_text('equilibrio redox')
        self.page.locator('#themeButton').click()
        expect(self.page.locator('body')).to_have_class('dark')
        self.page.reload()
        expect(self.page.locator('body')).to_have_class('dark')
        self.page.add_init_script("Object.defineProperty(window, 'localStorage', {get() {throw new Error('Storage disabled')}})")
        self.page.reload()
        expect(self.page.locator('.chapter')).to_have_count(9)
        self.page.locator('#themeButton').click()
        expect(self.page.locator('body')).to_have_class('dark')


if __name__ == '__main__':
    unittest.main(verbosity=2)
