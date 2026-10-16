"""Build the accessible CV page from the supplied DOCX using only the standard library.

Document contents are treated as data. The original download stays unchanged.
Run from any directory: python tools/build_cv.py
"""
from html import escape
from pathlib import Path
import re
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{" + NS["w"] + "}"
SECTIONS = {
    "PROFESSIONAL PROFILE": ("profile", "Professional profile"),
    "RESEARCH INTERESTS": ("interests", "Research interests"),
    "EDUCATION": ("education", "Education"),
    "RESEARCH EXPERIENCE": ("research", "Research experience"),
    "SCIENTIFIC OUTPUT": ("scientific-output", "Scientific output"),
    "SCIENTIFIC PRESENTATIONS": ("presentations", "Scientific presentations"),
    "TEACHING EXPERIENCE": ("teaching", "Teaching experience"),
    "LABORATORY & TECHNICAL SKILLS": ("skills", "Laboratory & technical skills"),
    "COURSES, CERTIFICATIONS & CONTINUING EDUCATION": ("courses", "Courses & continuing education"),
    "CONGRESS & CONFERENCE ATTENDANCE": ("conferences", "Conference attendance"),
    "LANGUAGES": ("languages", "Languages"),
}
SUBHEADINGS = {
    "Manuscripts in Preparation", "Neurochemistry & Biochemistry", "Research & Academic Skills"
}


def paragraph_text(paragraph):
    return "".join(
        node.text or "" if node.tag == W + "t" else "\t"
        for node in paragraph.iter() if node.tag in {W + "t", W + "tab"}
    ).strip()


def build():
    with ZipFile(ROOT / "assets/CV_Arturo_Lopez_EN.docx") as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
    content, navigation = [], []
    section_open = list_open = False
    for paragraph in document.findall(".//w:body/w:p", NS):
        text = paragraph_text(paragraph)
        if not text:
            continue
        if text in SECTIONS:
            if list_open:
                content.append("</ul>")
                list_open = False
            if section_open:
                content.append("</section>")
            section_id, title = SECTIONS[text]
            navigation.append(f'<a href="#{section_id}">{escape(title)}</a>')
            content.append(f'<section class="cv-section" id="{section_id}" aria-labelledby="{section_id}-title"><h2 id="{section_id}-title">{escape(title)}</h2>')
            section_open = True
            continue
        # The public page uses city-level contact details; the provided file is unchanged.
        if not section_open:
            continue
        text = text.replace("Tenth-semester/intership medical student", "Medical student completing a pre-graduate internship")
        text = text.replace("México", "Mexico")
        is_list = paragraph.find("w:pPr/w:numPr", NS) is not None
        if list_open and not is_list:
            content.append("</ul>")
            list_open = False
        if is_list:
            if not list_open:
                content.append("<ul>")
                list_open = True
            content.append(f"<li>{escape(text)}</li>")
        elif "\t" in text:
            title, date = re.split(r"\t+", text, maxsplit=1)
            # Clearly identify the medical degree as in progress.
            if title == "Doctor of Medicine (M.D.)":
                title += " — in progress"
            content.append(f'<h3 class="cv-entry-heading">{escape(title)}<span>{escape(date)}</span></h3>')
        elif text in SUBHEADINGS:
            content.append(f"<h3>{escape(text)}</h3>")
        else:
            content.append(f"<p>{escape(text)}</p>")
    if list_open:
        content.append("</ul>")
    if section_open:
        content.append("</section>")
    page = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Curriculum vitae of Jesús Arturo López Holguín. Medical training, neuroscience research, teaching and scientific work at UACH, INNN and the University of Belgrade.">
  <meta name="theme-color" content="#f6f8fb">
  <title>Curriculum Vitae | Jesús Arturo López Holguín</title>
  <link rel="stylesheet" href="style.css">
  <script src="cv.js" defer></script>
</head>
<body class="cv-page">
  <a class="skip-link" href="#cv-content">Skip to curriculum vitae</a>
  <header class="site-header"><div class="cv-container header-inner">
    <a class="brand" href="index.html">Arturo López Holguín<span class="brand-secondary">Medicine &amp; neuroscience</span></a>
    <nav class="top-nav" aria-label="Main navigation"><a href="index.html">Back to study <span aria-hidden="true">↗</span></a><a href="#profile" aria-current="page">Curriculum vitae</a><a class="contact-nav" href="index.html#contact">Contact <span aria-hidden="true">↗</span></a></nav>
  </div></header>
  <main class="cv-container">
    <div class="cv-hero">
      <p class="eyebrow">Curriculum vitae · English</p>
      <h1>Jesús Arturo<br>López Holguín</h1>
      <p class="hero-description">Medical student · Pre-graduate medical internship<br>Autonomous University of Chihuahua (UACH)</p>
      <div class="cv-contact-links"><span>Chihuahua, Mexico</span><a href="mailto:a358172@uach.mx">a358172@uach.mx</a><a href="mailto:arturolol559@gmail.com">arturolol559@gmail.com</a></div>
      <div class="cv-actions"><a class="primary-button" href="assets/CV_Arturo_Lopez_EN.docx" download>Download original CV <span class="file-type">DOCX</span><span aria-hidden="true">↓</span></a><button class="outline-button" id="printCv" type="button" hidden>Print / save as PDF</button></div>
    </div>
    <div class="cv-layout">
      <nav class="cv-nav" aria-label="CV sections"><p class="eyebrow">In this CV</p><div class="cv-nav-links">__NAVIGATION__</div></nav>
      <div id="cv-content">__CONTENT__</div>
    </div>
    <footer class="site-footer"><div><strong>Jesús Arturo López Holguín</strong><span>Medical student · Neuroscience research</span></div><a href="index.html#contact">Contact <span aria-hidden="true">↗</span></a><a href="index.html">Back to the study <span aria-hidden="true">↗</span></a></footer>
  </main>
</body>
</html>
'''
    (ROOT / "cv.html").write_text(page.replace("__NAVIGATION__", "\n".join(navigation)).replace("__CONTENT__", "\n".join(content)))


if __name__ == "__main__":
    build()
