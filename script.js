"use strict";

// EDITAR VIDEO: todos los enlaces y el reproductor utilizan este identificador.
const VIDEO_ID = "DtUZBM2LZTA";

// EDITAR CAPÍTULOS: tiempos en segundos, textos científicos y rutas de figuras.
// Los intervalos sin contenido conservan el capítulo anterior.
// Activa imageAvailable solo después de guardar el SVG original extraído.
const sections = [
  {
    id: "introduction", start: 1, end: 207, title: "Brain development and redox balance",
    chapter: "Introduction", eyebrow: "Background", lang: "en", type: "image",
    image: "assets/intro.svg", imageAvailable: true,
    alt: "Original poster diagram (Spanish): reactive oxygen species and brain development.",
    message: "Physiological and pathological roles of reactive oxygen species in redox balance, brain development, mitochondrial metabolism and NMDA-mediated excitotoxicity.",
    content: `<div class="concept-map">
      <span class="concept-kicker">Postnatal brain development</span>
      <p class="concept-center">Redox balance</p>
      <div class="concept-connector" aria-hidden="true"></div>
      <div class="concept-branches"><div><strong>Physiological functions</strong><span>Signaling and development</span></div><div><strong>Pathological processes</strong><span>Oxidative stress and excitotoxicity</span></div></div>
      <p class="concept-footnote">Mitochondrial metabolism · NMDA receptors</p>
    </div>`
  },
  {
    id: "objective", start: 208, end: 229, title: "Study objective",
    chapter: "Objective", eyebrow: "Research question", lang: "en", type: "content",
    content: `<p class="objective-text">To determine brain susceptibility at different postnatal stages to three types of neurotoxic insults: excitotoxic, mitochondrial and oxidative.</p>
      <div class="mechanisms" lang="en" aria-label="Three neurotoxic mechanisms"><span>Excitotoxic</span><span>Mitochondrial</span><span>Oxidative</span></div>`
  },
  {
    id: "methodology", start: 230, end: 340, title: "Experimental design",
    chapter: "Methods", eyebrow: "Materials and methods", lang: "en", type: "image",
    image: "assets/methodology.svg", imageAvailable: true,
    alt: "Original poster methods (Spanish): brain homogenates, neurotoxic exposures and assays.",
    content: `<div class="method-flow" lang="en">
      <div class="method-step"><span>01</span><div><strong>Whole-brain homogenates</strong><p>Wistar rats at different postnatal stages.</p></div></div>
      <div class="method-step"><span>02</span><div><strong>Two-hour exposure</strong><p>FeSO₄ · 3-NP · QUIN</p></div></div>
      <div class="method-step"><span>03</span><div><strong>Assessment</strong><p>ROS · Lipid peroxidation · MTT reduction</p></div></div>
      <div class="method-step"><span>04</span><div><strong>Data analysis</strong><p>Normalization to protein content and statistical analysis.</p></div></div>
    </div>`
  },
  {
    id: "ros", start: 352, end: 411, title: "Reactive oxygen species",
    chapter: "ROS", eyebrow: "Result 01", lang: "en", type: "image",
    image: "assets/figure-ros.svg", imageAvailable: true,
    alt: "Original ROS figure (Spanish), showing postnatal ages, neurotoxic exposures, axes, units and statistical annotations.",
    message: "Basal ROS levels were elevated at early postnatal stages. The acute neurotoxic insults tested did not produce a significant additional increase."
  },
  {
    id: "lipid-peroxidation", start: 412, end: 474, title: "Lipid peroxidation",
    chapter: "Lipid peroxidation", eyebrow: "Result 02", lang: "en", type: "image",
    image: "assets/figure-lipid-peroxidation.svg", imageAvailable: true,
    alt: "Original lipid peroxidation figure (Spanish), showing postnatal ages, neurotoxic exposures, axes, units and statistical annotations.",
    message: "Lipid peroxidation increased with postnatal age. FeSO₄ significantly increased lipid peroxidation, particularly at later postnatal stages."
  },
  {
    id: "mtt", start: 475, end: 585, title: "Mitochondrial function",
    chapter: "Mitochondrial function", eyebrow: "Result 03", lang: "en", type: "image",
    image: "assets/figure-mtt.svg", imageAvailable: true,
    alt: "Original MTT reduction figure (Spanish), showing postnatal ages, neurotoxic exposures, axes, units and statistical annotations.",
    message: "FeSO₄ and 3-NP decreased MTT reduction. Acute QUIN exposure did not produce a significant change."
  },
  {
    id: "discussion", start: 586, end: 656, title: "Integrating the results",
    chapter: "Discussion", eyebrow: "Integrated interpretation", lang: "en", type: "multi",
    figures: ["ros", "lipid-peroxidation", "mtt"],
    message: "The susceptibility of the developing brain depends on both postnatal age and the neurotoxic mechanism examined."
  },
  {
    id: "limitations", start: 657, end: 727, title: "Limitations and future directions",
    chapter: "Limitations", eyebrow: "Study scope", lang: "en", type: "content",
    content: `<div class="perspectives"><div><h4>LIMITATIONS</h4><p>Whole-brain homogenates:</p><ul><li>Loss of cellular architecture</li><li>Limited cell-type specificity</li><li>Acute exposure period</li></ul></div>
      <div><h4>FUTURE DIRECTIONS</h4><ul><li>Brain slices</li><li>Organotypic cultures</li><li>Different exposure durations</li><li>Further mechanistic analysis</li></ul></div></div>`
  },
  {
    id: "conclusions", start: 728, end: 783, title: "Conclusions",
    chapter: "Conclusions", eyebrow: "Conclusions", lang: "en", type: "content",
    image: "assets/conclusions.svg", imageAvailable: false,
    alt: "Original scientific poster conclusions diagram.",
    content: `<ol class="conclusions-list"><li>ROS participate in physiological processes during early postnatal brain development.</li><li>Brain susceptibility to neurotoxic insults varies with postnatal age.</li><li>ROS production, oxidative membrane damage and mitochondrial dysfunction represent related but distinct dimensions of neurotoxicity.</li></ol>`
  }
];

const $ = (selector) => document.querySelector(selector);
const failedImages = new Set();
let player = null;
let playerReady = false;
let playerState = -1;
let activeSectionId = "";
let duration = sections[sections.length - 1].end;
let currentTime = 0;
let pendingSeek = null;
let seekInFlight = null;
let pollingTimer = null;
let loadingTimer = null;
let toastTimer = null;
let modalTrigger = null;

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatTime(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function getCurrentSection(time) {
  // Start boundaries also cover 00:00, fractional seconds, gaps and outro.
  return sections.reduce((active, section) => time >= section.start ? section : active, sections[0]);
}

function contentFragment(html) {
  const template = document.createElement("template");
  // Only the site's own scientific content above is interpreted as HTML.
  template.innerHTML = html || "";
  return template.content.cloneNode(true);
}

function figureFallback(section) {
  if (section.content && section.type === "image") return contentFragment(section.content);
  const fallback = createElement("div", "figure-fallback");
  fallback.lang = "en";
  fallback.append(createElement("span", "eyebrow", "Figure"),
    createElement("strong", "", section.title),
    createElement("p", "", "Scientific image unavailable"));
  return fallback;
}

function createFigure(section) {
  if (!section.imageAvailable || failedImages.has(section.image)) return figureFallback(section);
  const button = createElement("button", "figure-button");
  button.type = "button";
  button.setAttribute("aria-label", `Expand original figure: ${section.title}`);
  button.setAttribute("aria-haspopup", "dialog");
  const img = createElement("img");
  img.alt = section.alt || section.title;
  img.lang = "en";
  img.decoding = "async";
  img.addEventListener("error", () => {
    failedImages.add(section.image);
    const hadFocus = document.activeElement === button;
    button.replaceWith(figureFallback(section));
    if (hadFocus) $("#active-content").focus({ preventScroll: true });
  }, { once: true });
  img.src = section.image;
  const caption = createElement("span", "figure-expand", "Expand original figure ↗");
  caption.lang = "en";
  button.append(img, caption);
  button.addEventListener("click", () => openFigureModal(section, button));
  return button;
}

const sectionRenderers = {
  image: (section) => {
    const fragment = document.createDocumentFragment();
    if (section.content) fragment.append(contentFragment(section.content));
    fragment.append(createFigure(section));
    return fragment;
  },
  content: (section) => {
    const fragment = document.createDocumentFragment();
    if (section.imageAvailable) fragment.append(createFigure(section));
    fragment.append(contentFragment(section.content));
    return fragment;
  },
  multi: (section) => {
    const group = createElement("div", "integration-figures");
    section.figures.forEach((id) => {
      const figure = sections.find((entry) => entry.id === id);
      if (figure) group.append(createFigure(figure));
    });
    return group;
  }
};

function renderSection(section) {
  const content = $("#active-content");
  const hadFocus = content.contains(document.activeElement);
  const heading = createElement("h3", "", section.title);
  heading.id = "active-title";
  content.lang = section.lang;
  content.replaceChildren(heading, sectionRenderers[section.type](section));
  if (section.message) {
    const message = createElement("p", "key-message");
    message.append(createElement("span", "key-label", "Key finding"),
      document.createTextNode(section.message));
    content.append(message);
  }
  content.scrollTop = 0;
  content.classList.remove("is-changing");
  void content.offsetWidth;
  content.classList.add("is-changing");
  if (hadFocus) content.focus({ preventScroll: true });
  $("#active-eyebrow").textContent = section.eyebrow;
  $("#active-index").textContent = `${String(sections.indexOf(section) + 1).padStart(2, "0")} / ${String(sections.length).padStart(2, "0")}`;
  $("#active-time").textContent = `${formatTime(section.start)} — ${formatTime(section.end)}`;
  $("#chapter-announcement").textContent = `Chapter: ${section.chapter}, ${formatTime(section.start)}.`;
}

function buildChapterNavigation() {
  const chapters = $("#chapters");
  const segments = $("#timeline-segments");
  sections.forEach((section) => {
    const button = createElement("button", "chapter");
    button.type = "button";
    button.dataset.section = section.id;
    button.setAttribute("aria-controls", "active-content");
    button.setAttribute("aria-label", `${formatTime(section.start)} ${section.chapter}`);
    button.append(createElement("span", "", formatTime(section.start)), createElement("strong", "", section.chapter));
    chapters.append(button);
    const segment = createElement("span", "timeline-segment");
    segment.dataset.section = section.id;
    segments.append(segment);
  });
  resizeTimeline();
}

function resizeTimeline() {
  sections.forEach((section, index) => {
    const start = index === 0 ? 0 : section.start;
    const end = sections[index + 1]?.start ?? duration;
    const segment = $(`#timeline-segments [data-section="${section.id}"]`);
    // Gaps belong to the previous section, exactly as in getCurrentSection().
    segment.style.left = `${100 * start / duration}%`;
    segment.style.width = `${100 * Math.max(0, end - start) / duration}%`;
  });
  $("#timeline-seek").max = String(duration);
  $("#total-time").textContent = formatTime(duration);
}

function updateChapterNavigation(section) {
  document.querySelectorAll(".chapter, .timeline-segment").forEach((node) => {
    const active = node.dataset.section === section.id;
    node.classList.toggle("is-active", active);
    if (node.classList.contains("chapter")) {
      if (active) node.setAttribute("aria-current", "step");
      else node.removeAttribute("aria-current");
    }
  });
  const chapter = $(`.chapter[data-section="${section.id}"]`);
  const nav = $("#chapters");
  // Move only the horizontal chapter strip; never move the reader's page.
  const chapterRect = chapter.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  if (chapterRect.left < navRect.left || chapterRect.right > navRect.right) {
    nav.scrollLeft += chapterRect.left - navRect.left - (navRect.width - chapterRect.width) / 2;
  }
}

function updateTimeline(time, section) {
  const percentage = 100 * Math.min(1, Math.max(0, time / duration));
  $("#timeline-progress").style.width = `${percentage}%`;
  $("#timeline-position").style.left = `${percentage}%`;
  $("#current-time").textContent = formatTime(time);
  $("#timeline-seek").value = String(Math.floor(time));
  $("#timeline-seek").setAttribute("aria-valuetext", `${formatTime(time)}, ${section.chapter}`);
}

function updatePresentation(time = currentTime) {
  currentTime = Math.min(duration, Math.max(0, Number(time) || 0));
  const section = getCurrentSection(currentTime);
  if (section.id !== activeSectionId) {
    activeSectionId = section.id;
    renderSection(section);
    updateChapterNavigation(section);
  }
  updateTimeline(currentTime, section);
}

function seekToTime(time) {
  const target = Math.min(duration, Math.max(0, Number(time) || 0));
  updatePresentation(target);
  if (!playerReady) {
    pendingSeek = target;
    return;
  }
  // Ignore stale getCurrentTime briefly while YouTube applies an async seek.
  seekInFlight = { target, expires: performance.now() + 2000 };
  player.seekTo(target, true);
}

function seekToSection(id) {
  const section = sections.find((entry) => entry.id === id);
  if (section) seekToTime(section.start);
}

function readPlayerTime() {
  if (!playerReady || document.hidden) return;
  const time = player.getCurrentTime();
  if (!Number.isFinite(time)) return;
  if (seekInFlight) {
    // A cued video may report 0 until playback begins. Keep the chapter preview
    // selected during loading, even when its metadata has not supplied a time.
    if (seekInFlight.cued && [-1, 5].includes(player.getPlayerState())) return;
    if (Math.abs(time - seekInFlight.target) > 1.5 && performance.now() < seekInFlight.expires) return;
    seekInFlight = null;
  }
  const actualDuration = player.getDuration();
  if (Number.isFinite(actualDuration) && actualDuration > 0 && actualDuration !== duration) {
    duration = actualDuration;
    resizeTimeline();
  }
  updatePresentation(time);
}

function setPlaybackState(state) {
  playerState = state;
  const playing = state === 1 || state === 3;
  const labels = { "-1": "Ready to play", 0: "Presentation ended", 1: "Playing", 2: "Paused", 3: "Loading video…", 5: "Ready to play" };
  $("#playback-status").textContent = labels[state] || "Ready to play";
  $("#playButton").setAttribute("aria-label", playing ? "Pause video" : "Play video");
  $("#play-label").textContent = playing ? "Pause" : "Play";
  $("#play-icon").textContent = playing ? "Ⅱ" : "▷";
  $("#panel-mode").replaceChildren(createElement("span", "status-dot"), document.createTextNode(" Synchronized with video"));
  $("#panel-mode .status-dot").setAttribute("aria-hidden", "true");
}

function showVideoFallback(message) {
  clearTimeout(loadingTimer);
  clearInterval(pollingTimer);
  playerReady = false;
  seekInFlight = null;
  $("#video-frame").setAttribute("aria-busy", "false");
  $("#video-placeholder").hidden = false;
  $("#video-status").textContent = message;
  $("#playButton").disabled = true;
  $("#playback-status").textContent = "Video unavailable here";
  $("#panel-mode").textContent = "Explore the chapters";
}

function onPlayerReady(event) {
  player = event.target;
  playerReady = true;
  clearTimeout(loadingTimer);
  $("#video-placeholder").hidden = true;
  $("#video-frame").setAttribute("aria-busy", "false");
  $("#playButton").disabled = false;
  player.getIframe().title = "Scientific presentation: age-dependent brain vulnerability to neurotoxic insults";
  setPlaybackState(player.getPlayerState());
  if (pendingSeek !== null) {
    // A chapter selected during loading must not trigger unsolicited playback.
    player.cueVideoById({ videoId: VIDEO_ID, startSeconds: pendingSeek });
    seekInFlight = { target: pendingSeek, expires: performance.now() + 2000, cued: true };
    pendingSeek = null;
  }
  clearInterval(pollingTimer);
  pollingTimer = setInterval(readPlayerTime, 200);
}

function initializeYouTubePlayer() {
  if (player || !window.YT?.Player) return;
  try {
    player = new window.YT.Player("youtube-player", {
      videoId: VIDEO_ID,
      width: "100%", height: "100%",
      playerVars: { playsinline: 1, controls: 1, rel: 0, origin: window.location.origin },
      events: {
        onReady: onPlayerReady,
        onStateChange(event) {
          if (!playerReady) return;
          if ($("#figure-modal").open && (event.data === 1 || event.data === 3)) {
            player.pauseVideo();
            return;
          }
          setPlaybackState(event.data);
          readPlayerTime();
        },
        onError() { showVideoFallback("Watch this presentation on YouTube."); },
        onAutoplayBlocked() { $("#playback-status").textContent = "Press play in the video"; }
      }
    });
  } catch {
    showVideoFallback("Could not connect to YouTube.");
  }
}

function loadYouTubeAPI() {
  window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
  loadingTimer = setTimeout(() => showVideoFallback("Explore the chapters or open YouTube."), 15000);
  if (window.YT?.Player) {
    initializeYouTubePlayer();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  script.async = true;
  script.onerror = () => showVideoFallback("YouTube is unavailable. Explore the chapters.");
  document.head.append(script);
}

function openFigureModal(section, trigger) {
  const modal = $("#figure-modal");
  if (playerReady) player.pauseVideo();
  modalTrigger = trigger;
  $("#modal-title").textContent = section.title;
  $("#modal-title").lang = section.lang;
  $("#modal-description").textContent = playerReady
    ? "The video is paused. You can resume it after closing this figure. Original figure labels are in Spanish."
    : "Original scientific poster figure. Source labels are in Spanish.";
  const img = createElement("img");
  img.alt = section.alt || section.title;
  img.addEventListener("error", () => {
    failedImages.add(section.image);
    $("#modal-visual").replaceChildren(figureFallback(section));
  }, { once: true });
  img.src = section.image;
  $("#modal-visual").replaceChildren(img);
  document.body.classList.add("modal-open");
  modal.showModal();
  $("#modal-close").focus();
}

function closeFigureModal() {
  $("#figure-modal").close();
  // Never call playVideo here: resuming belongs to the viewer.
}

function renderResultSummaries() {
  const container = $("#result-summaries");
  sections.filter((section) => section.eyebrow.startsWith("Result ")).forEach((section) => {
    const article = createElement("article", "result-summary");
    const title = createElement("h3", "", section.title);
    const message = createElement("p", "", section.message);
    title.lang = message.lang = section.lang;
    const link = createElement("a", "", `Explore result · ${formatTime(section.start)} ↗`);
    link.href = "#presentation";
    link.dataset.section = section.id;
    link.setAttribute("aria-label", `Explore ${section.title}, ${formatTime(section.start)}`);
    article.append(createElement("span", "eyebrow", section.eyebrow), title, message, link);
    container.append(article);
  });
}

function showToast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3200);
}

function initializeReferences() {
  const references = [...document.querySelectorAll("#reference-list .reference")];
  references.forEach((reference, index) => {
    reference.querySelector(".ref-number").textContent = String(index + 1).padStart(2, "0");
    reference.querySelector(".links").setAttribute("aria-label", `Links for reference ${index + 1}`);
  });
  $("#count").textContent = `${references.length} sources`;
  $("#copyButton").addEventListener("click", async () => {
    const citations = references.map((reference, index) => {
      const citation = [".authors", ".title", ".citation"].map((selector) => reference.querySelector(selector).textContent.trim()).join(" ");
      const links = [...reference.querySelectorAll(".links a")].map((link) => `${link.textContent.trim()} (${link.href})`).join(" ");
      return `${index + 1}. ${citation} ${links}`;
    }).join("\n\n");
    try {
      await navigator.clipboard.writeText(citations);
      showToast("References copied with links.");
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents($("#reference-list"));
      selection.removeAllRanges();
      selection.addRange(range);
      showToast("References selected. Use Copy in your browser.");
    }
  });
}

function initializeTheme() {
  const applyTheme = (dark) => {
    document.body.classList.toggle("dark", dark);
    $("#themeButton").setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    $(".theme-label").textContent = dark ? "Light" : "Dark";
    $(".theme-symbol").textContent = dark ? "☼" : "◐";
    $('meta[name="theme-color"]').content = dark ? "#0d1827" : "#f6f8fb";
  };
  try { applyTheme(localStorage.getItem("theme") === "dark"); } catch { applyTheme(false); }
  $("#themeButton").addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark");
    applyTheme(dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { /* Storage can be disabled. */ }
  });
}

function initializePresentation() {
  initializeTheme();
  initializeReferences();
  buildChapterNavigation();
  renderResultSummaries();
  updatePresentation(0);
  document.querySelectorAll("[data-video-link]").forEach((link) => {
    link.href = `https://www.youtube.com/watch?v=${encodeURIComponent(VIDEO_ID)}`;
  });
  document.addEventListener("click", (event) => {
    const chapter = event.target.closest("button[data-section], a[data-section]");
    if (chapter) seekToSection(chapter.dataset.section);
  });
  $("#timeline-seek").addEventListener("input", (event) => seekToTime(event.target.value));
  $("#playButton").addEventListener("click", () => {
    if (!playerReady) return;
    if (playerState === 1 || playerState === 3) player.pauseVideo();
    else player.playVideo();
  });
  const modal = $("#figure-modal");
  $("#modal-close").addEventListener("click", closeFigureModal);
  modal.addEventListener("keydown", (event) => {
    // The close button is the dialog's only interactive control. Keep Tab here
    // instead of allowing the browser to move focus into its own toolbar.
    if (event.key === "Tab") {
      event.preventDefault();
      $("#modal-close").focus();
    }
  });
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    const bounds = modal.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeFigureModal();
  });
  // Escape uses the dialog's native cancel behavior and native focus trap.
  modal.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    $("#modal-visual").replaceChildren();
    if (modalTrigger?.isConnected) modalTrigger.focus({ preventScroll: true });
    else $("#active-content").focus({ preventScroll: true });
    modalTrigger = null;
  });
  document.addEventListener("visibilitychange", readPlayerTime);
  window.addEventListener("resize", () => updateChapterNavigation(getCurrentSection(currentTime)));
  window.addEventListener("pagehide", () => {
    clearInterval(pollingTimer);
    clearTimeout(loadingTimer);
    if (playerReady) player.pauseVideo();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && playerReady) {
      clearInterval(pollingTimer);
      pollingTimer = setInterval(readPlayerTime, 200);
      readPlayerTime();
    }
  });
  loadYouTubeAPI();
}

initializePresentation();
