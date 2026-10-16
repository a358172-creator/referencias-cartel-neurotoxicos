# Age-dependent brain vulnerability to neurotoxic insults

English-language scientific presentation and researcher profile for the SfN Neuroscience 2026 audience. This is the existing static GitHub Pages project: HTML, CSS and JavaScript, with no production dependencies or build step.

## Visitor experience

- Persistent navigation to Presentation, Results, References, About & CV, and Contact.
- A prominent “Explore in 3D” button opens the external visual experience with models of pathophysiology and experimental design in a new tab.
- English scientific content, chapter navigation, player controls, accessibility labels and bibliography.
- A profile of Jesús Arturo López Holguín, with education, research and teaching highlights taken from the supplied CV.
- A full browser-readable CV at `cv.html`, original DOCX download, institutional and personal email links, and a print / save as PDF action.
- Ivory, warm white, sand, orange, blue and gray visual palette, responsive layouts, light/dark themes on the study page, keyboard access and reduced-motion support.

The nine timed chapters, YouTube player, timeline, figure dialogs and ten references with their 23 DOI/PubMed/PMC links remain available. The original recording and scientific figure assets are in Spanish. Their source content is unchanged; English explanations accompany the chapters. The conference details link to the [official SfN Neuroscience 2026 page](https://www.sfn.org/meetings/neuroscience-2026). No poster acceptance, session number or presentation slot is asserted.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Study, affiliations, researcher profile, contact and bibliography |
| `style.css` | Shared responsive design, themes and print styles |
| `script.js` | Scientific chapters, player synchronization, timeline, figure dialogs and reference copying |
| `cv.html` | Generated, accessible English CV; readable without JavaScript |
| `cv.js` | Progressive enhancement for printing or saving the CV as PDF |
| `assets/CV_Arturo_Lopez_EN.docx` | Supplied original CV, served unchanged for download |
| `assets/poster.svg` | Original scientific poster |
| `assets/intro.svg`, `assets/methodology.svg` | Original introduction and methods extracts |
| `assets/figure-*.svg` | Original ROS, lipid peroxidation and MTT figures |
| `tools/build_cv.py` | Regenerate the browser CV from the supplied DOCX using Python's standard library |
| `tools/extract_figures.py` | Reproduce the reviewed SVG extracts without redrawing or rasterizing them |
| `tests/test_presentation.py` | Browser interaction, responsive layout and CV/download regression checks |
| `tests/test_svg_assets.py` | Integrity checks for the original poster and extracted scene nodes |

## Preview and hosting

From the repository root:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. All application links are relative, including the CV and its download, so the site also works under GitHub Pages' project subdirectory. Serve this repository as static files; no server-side code or compilation is required. This update does not change the repository's hosting configuration or publish a deployment.

## Update the CV

Replace `assets/CV_Arturo_Lopez_EN.docx`, then run:

```sh
python tools/build_cv.py
```

The generator copies the document's professional content into semantic HTML, corrects the internship spelling in the introductory profile, and explicitly marks the medical degree as in progress. The browser version shows city-level contact information; the downloadable document remains the supplied original. New DOCX section names should also be added to `SECTIONS` in the generator. Update the selected homepage highlights separately when the CV changes.

## Edit study content

`const sections` at the beginning of `script.js` contains each chapter's ID, start/end time in seconds, English title, chapter label, content and figure path. Keep it ordered by `start`. Gaps retain the previous chapter until the next one begins. Result summaries reuse the entries whose `eyebrow` starts with `Result `.

Introduction and methods include English HTML explanations alongside the original figures. Set `imageAvailable` only after saving an actual scientific asset. Missing enabled images show a fallback without breaking chapter navigation. The discussion reuses the three original result figures.

Change `VIDEO_ID` in `script.js` to replace the video, then update the no-JavaScript YouTube link in `index.html` and the chapter timings. Playback uses the YouTube IFrame API. A blocked or unavailable video leaves the chapters, figures, CV and references usable. Opening a figure pauses playback; closing it does not resume playback automatically.

## Scientific asset integrity

The source poster SHA-256 is:

```text
2b8e8dc342fbcc70b5abddba1f41ad1b1de99992dfab2b0e6c0b928d0efb76d0
```

The SVGs contain both vectors and embedded raster images. Original images, masks, transforms, axes, units, labels, captions and statistical annotations are retained. `python tools/extract_figures.py` reproduces the reviewed extracts after verifying the source fingerprint. If the source poster changes, review its scene indices and boundaries before extracting again.

## Validation

With Python, Playwright and Chromium installed:

```sh
python tests/test_presentation.py
python tests/test_svg_assets.py
node --check script.js
node --check cv.js
```

The browser suite uses a simulated player to test chapter timing, seeking, delayed initialization, unavailable video, dialog focus and pausing, clipboard copying, themes, restricted local storage, reduced motion, responsive layouts and project subdirectory routing. CV checks cover the complete browser page, manuscript status, contact links, byte-for-byte original download, print action and access without JavaScript.

Browser tests do not certify live YouTube playback. The recording remains an external dependency and should also be checked in a regular browser on the published site.
