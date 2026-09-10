/* ============================================
   NEUROREDOX — Scientific Research
   Data & Interactivity
   ============================================ */

// Bibliography Data
const references = [
  {
    authors: 'Huang TT, Leu D, Zou Y.',
    title: 'Oxidative stress and redox regulation on hippocampal-dependent cognitive functions.',
    journal: 'Arch Biochem Biophys.',
    year: 2015,
    details: '576:2-7',
    doi: '10.1016/j.abb.2015.03.036',
    pmid: '25900963',
    pmcid: 'PMC4475801'
  },
  {
    authors: 'Franco R, Vargas MR.',
    title: 'Redox Biology in Neurological Function, Dysfunction, and Aging.',
    journal: 'Antioxid Redox Signal.',
    year: 2018,
    details: '28(18):1583-1586',
    doi: '10.1089/ars.2018.7516',
    pmid: '29405812',
    pmcid: 'PMC5945219'
  },
  {
    authors: 'Aizenman E, Loring RH, Reynolds IJ, Rosenberg PA.',
    title: 'The Redox Biology of Excitotoxic Processes: The NMDA Receptor, TOPA Quinone, and the Oxidative Liberation of Intracellular Zinc.',
    journal: 'Antioxid Redox Signal.',
    year: 2016,
    details: '24(5):201-213',
    doi: '10.1089/ars.2015.6483',
    pmid: '26511106',
    pmcid: 'PMC4735373'
  },
  {
    authors: 'Girouard H, Wang G, Gallo EF, Anrather J, Zhou P, Pickel VM, Iadecola C.',
    title: 'NMDA receptor activation increases free radical production through nitric oxide and NOX2.',
    journal: 'J Neurosci.',
    year: 2009,
    details: '29(9):2672-2681',
    doi: '10.1523/JNEUROSCI.0996-08.2009',
    pmid: '19261863',
    pmcid: 'PMC2680041'
  },
  {
    authors: 'Reyes RC, Brennan AM, Shen Y, Baldwin Y, Swanson RA.',
    title: 'Activation of neuronal NMDA receptors induces superoxide-mediated oxidative stress in neighboring neurons and astrocytes.',
    journal: 'J Neurosci.',
    year: 2012,
    details: '32(37):12973-12978',
    doi: '10.1523/JNEUROSCI.1597-12.2012',
    pmid: '22973021',
    pmcid: 'PMC3461697'
  },
  {
    authors: 'Parellada E, Gassó P.',
    title: 'Activación del glutamato y la microglía como factor desencadenante de la apoptosis dendrítica: un mecanismo fisiopatológico fundamental para comprender el daño cerebral de origen inmunitario.',
    journal: 'Rev Neurol.',
    year: 2017,
    details: '64(12):549-559',
    doi: '10.33588/rn.6412.2016426',
    pmid: '28598547',
    pmcid: null
  },
  {
    authors: 'Garcia-Reyero N, Escalon L, Prats E, Faria M, Soares A, Raldúa D.',
    title: 'Targeted Gene Expression in Zebrafish Exposed to Chlorpyrifos-Oxon Confirms Phenotype-Specific Mechanisms Leading to Neurotoxicity.',
    journal: 'Toxicol Sci.',
    year: 2015,
    details: '148(2):360-372',
    doi: '10.1093/toxsci/kfv189',
    pmid: '26206916',
    pmcid: 'PMC4635925'
  },
  {
    authors: 'Sun G, He Y, Chuang D, Lee J, Gu Z, Simonyi A, Sun A.',
    title: 'Integrating Cytosolic Phospholipase A2 with Oxidative/Nitrosative Signaling Pathways in Neurons: A Novel Therapeutic Strategy.',
    journal: 'Mol Neurobiol.',
    year: 2013,
    details: '48(2):341-350',
    doi: '10.1007/s12035-013-8471-1',
    pmid: '23780843',
    pmcid: 'PMC3753755'
  },
  {
    authors: 'Wilson C, Muñoz-Palma E, González-Billault C.',
    title: 'From birth to death: A role for reactive oxygen species in neuronal development.',
    journal: 'Semin Cell Dev Biol.',
    year: 2018,
    details: '80:43-53',
    doi: '10.1016/j.semcdb.2017.09.011',
    pmid: '28919133',
    pmcid: 'PMC5879537'
  },
  {
    authors: 'Oswald MCW, Garnham N, Sweeney ST, Landgraf M.',
    title: 'Regulation of neuronal development and function by ROS.',
    journal: 'FEBS Lett.',
    year: 2018,
    details: '592(5):679-691',
    doi: '10.1002/1873-3468.12972',
    pmid: '29292516',
    pmcid: 'PMC5851369'
  }
];

// Render references when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  renderReferences();
  initTheme();
  setupEventListeners();
});

/* ============================================
   RENDER REFERENCES
   ============================================ */

function renderReferences() {
  const referencesList = document.getElementById('references-list');
  
  if (!referencesList) {
    console.error('Element #references-list not found');
    return;
  }

  referencesList.innerHTML = references
    .map((ref, index) => createReferenceCard(ref, index))
    .join('');

  // Add animation delays
  const cards = referencesList.querySelectorAll('.reference-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.05}s`;
  });

  observeReferences();
}

function createReferenceCard(ref, index) {
  const number = String(index + 1).padStart(2, '0');

  let identifiersHTML = '';

  // DOI Button
  if (ref.doi) {
    identifiersHTML += `
      <a href="https://doi.org/${ref.doi}" target="_blank" rel="noopener noreferrer" class="identifier-button doi" title="Abrir DOI en nueva pestaña">
        <span>DOI</span>
        <span>↗</span>
      </a>
    `;
  }

  // PMID Button
  if (ref.pmid) {
    identifiersHTML += `
      <a href="https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/" target="_blank" rel="noopener noreferrer" class="identifier-button pmid" title="Abrir PMID en PubMed">
        <span>PMID: ${ref.pmid}</span>
      </a>
    `;
  }

  // PMCID Button
  if (ref.pmcid) {
    identifiersHTML += `
      <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/${ref.pmcid}/" target="_blank" rel="noopener noreferrer" class="identifier-button pmcid" title="Abrir en PubMed Central">
        <span>${ref.pmcid}</span>
      </a>
    `;
  }

  return `
    <article class="reference-card">
      <div class="reference-header">
        <div class="reference-number">${number}</div>
        <div class="reference-content">
          <p class="reference-authors">${ref.authors}</p>
          <p class="reference-title">"${ref.title}"</p>
          <div class="reference-journal">
            <span class="journal-name">${ref.journal}</span>
            <span class="journal-year">${ref.year}</span>
            ${ref.details ? `<span class="journal-details">${ref.details}</span>` : ''}
          </div>
          ${identifiersHTML ? `<div class="reference-identifiers">${identifiersHTML}</div>` : ''}
        </div>
      </div>
    </article>
  `;
}

/* ============================================
   INTERSECTION OBSERVER FOR SCROLL ANIMATION
   ============================================ */

function observeReferences() {
  const options = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, options);

  const cards = document.querySelectorAll('.reference-card');
  cards.forEach((card) => {
    observer.observe(card);
  });
}

/* ============================================
   COPY FUNCTIONALITY
   ============================================ */

function createFullCitation(ref, index) {
  let citation = `${index + 1}. ${ref.authors} ${ref.title} ${ref.journal} ${ref.year}`;

  if (ref.details) {
    citation += `; ${ref.details}`;
  }

  if (ref.doi) {
    citation += `. doi: ${ref.doi}`;
  }

  if (ref.pmid) {
    citation += `. PMID: ${ref.pmid}`;
  }

  if (ref.pmcid) {
    citation += `. ${ref.pmcid}`;
  }

  return citation;
}

async function copyReferences() {
  try {
    const citations = references
      .map((ref, index) => createFullCitation(ref, index))
      .join('\n\n');

    await navigator.clipboard.writeText(citations);
    showToast();
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    fallbackCopy();
  }
}

function fallbackCopy() {
  const citations = references
    .map((ref, index) => createFullCitation(ref, index))
    .join('\n\n');

  const textarea = document.createElement('textarea');
  textarea.value = citations;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  showToast();
}

function showToast() {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

/* ============================================
   THEME TOGGLE
   ============================================ */

function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.toggle('light');

  // Update nav button
  const themeNavButton = document.getElementById('themeNavButton');
  if (themeNavButton) {
    const icon = themeNavButton.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = isLight ? '☀️' : '🌙';
    }
    themeNavButton.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  }

  // Save preference
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    const themeNavButton = document.getElementById('themeNavButton');
    if (themeNavButton) {
      const icon = themeNavButton.querySelector('.theme-icon');
      if (icon) {
        icon.textContent = '☀️';
      }
    }
  }
}

/* ============================================
   EVENT LISTENERS SETUP
   ============================================ */

function setupEventListeners() {
  // Copy button in nav
  const copyNavButton = document.getElementById('copyNavButton');
  if (copyNavButton) {
    copyNavButton.addEventListener('click', copyReferences);
  }

  // Theme toggle button
  const themeNavButton = document.getElementById('themeNavButton');
  if (themeNavButton) {
    themeNavButton.addEventListener('click', toggleTheme);
  }

  // Smooth scroll to references
  const navLink = document.querySelector('.nav-link[href="#references"]');
  if (navLink) {
    navLink.addEventListener('click', (e) => {
      e.preventDefault();
      const section = document.getElementById('references');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* ============================================
   UTILITY: Log
   ============================================ */

console.log('%cNEUROREDOX — Scientific Research', 'color: #00d4ff; font-weight: bold; font-size: 14px; font-family: monospace;');
console.log('%cBibliography loaded: ' + references.length + ' references', 'color: #7c3aed; font-size: 12px; font-family: monospace;');
