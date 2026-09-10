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
    doi: '10.1016/j.abb.2015.03.014',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Franco R, Vargas MR.',
    title: 'Redox Biology in Neurological Function, Dysfunction, and Aging.',
    journal: 'Antioxid Redox Signal.',
    year: 2018,
    details: '28(18):1583-1586',
    doi: '10.1089/ars.2018.7509',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Aizenman E, Loring RH, Reynolds IJ, Rosenberg PA.',
    title: 'The Redox Biology of Excitotoxic Processes: The NMDA Receptor, TOPA Quinone, and the Oxidative Liberation of Intracellular Zinc.',
    journal: 'Front Neurosci.',
    year: 2020,
    details: '14:778',
    doi: '10.3389/fnins.2020.00778',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Girouard H, Wang G, Gallo EF, Anrather J, Zhou P, Pickel VM, Iadecola C.',
    title: 'NMDA receptor activation increases free radical production through nitric oxide and NOX2.',
    journal: 'J Neurosci.',
    year: 2009,
    details: '29(8):2545-52',
    doi: '10.1523/JNEUROSCI.0133-09.2009',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Reyes RC, Brennan AM, Shen Y, Baldwin Y, Swanson RA.',
    title: 'Activation of neuronal NMDA receptors induces superoxide-mediated oxidative stress in neighboring neurons and astrocytes.',
    journal: 'J Neurosci.',
    year: 2012,
    details: '32(37):12973-8',
    doi: '10.1523/JNEUROSCI.1597-12.2012',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Parellada E, Gassó P.',
    title: 'Glutamate and microglia activation as a driver of dendritic apoptosis: a core pathophysiological mechanism to understand schizophrenia.',
    journal: 'Transl Psychiatry.',
    year: 2021,
    details: '11(1):271',
    doi: '10.1038/s41398-021-01385-9',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Garcia-Reyero N, Escalon BL, Prats E, Faria M, Soares AM, Raldúa D.',
    title: 'Targeted Gene Expression in Zebrafish Exposed to Chlorpyrifos-Oxon Confirms Phenotype-Specific Mechanisms Leading to Adverse Outcomes.',
    journal: 'Bull Environ Contam Toxicol.',
    year: 2016,
    details: '96(6):740-747',
    doi: '10.1007/s00128-016-1798-3',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Sun GY, He Y, Chuang DY, Shen X, Cui J, Simonyi A, Sun AY.',
    title: 'Integrating Cytosolic Phospholipase A2 with Oxidative/Nitrosative Signaling Pathways in Neurons: A Novel Therapeutic Strategy for Alzheimer\'s Disease.',
    journal: 'Mol Neurobiol.',
    year: 2012,
    details: '46(1):85-95',
    doi: '10.1007/s12035-012-8261-1',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Wilson C, Muñoz-Palma E, González-Billault C.',
    title: 'From birth to death: A role for reactive oxygen species in neuronal development.',
    journal: 'Semin Cell Dev Biol.',
    year: 2018,
    details: '80:43-49',
    doi: '10.1016/j.semcdb.2017.09.012',
    pmid: null,
    pmcid: null
  },
  {
    authors: 'Oswald MCW, Garnham N, Sweeney ST, Landgraf M.',
    title: 'Regulation of neuronal development and function by ROS.',
    journal: 'FEBS Lett.',
    year: 2018,
    details: '592(5):679-691',
    doi: '10.1002/1873-3468.12972',
    pmid: null,
    pmcid: null
  }
];

// Render references when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  renderReferences();
  setupEventListeners();
});

/* ============================================
    RENDER REFERENCES
    ============================================ */

function renderReferences() {
  const referencesList = document.getElementById('references-list');
  const refHeader = document.querySelector('.references-header');
  
  if (!referencesList) {
    console.error('Element #references-list not found');
    return;
  }

  // Render reference cards
  referencesList.innerHTML = references
    .map((ref, index) => createReferenceCard(ref, index))
    .join('');
}

function createReferenceCard(ref, index) {
  const number = String(index + 1).padStart(2, '0');

  let identifiersHTML = '';

  // DOI Button
  if (ref.doi) {
    identifiersHTML += `
      <a href="https://doi.org/${ref.doi}" target="_blank" rel="noopener noreferrer" class="identifier-button doi" title="Abrir DOI en nueva pestaña">
        DOI ↗
      </a>
    `;
  }

  // PMID Button
  if (ref.pmid) {
    identifiersHTML += `
      <a href="https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/" target="_blank" rel="noopener noreferrer" class="identifier-button pmid" title="Abrir PMID en PubMed">
        PMID: ${ref.pmid}
      </a>
    `;
  }

  // PMCID Button
  if (ref.pmcid) {
    identifiersHTML += `
      <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/${ref.pmcid}/" target="_blank" rel="noopener noreferrer" class="identifier-button pmcid" title="Abrir en PubMed Central">
        ${ref.pmcid}
      </a>
    `;
  }

  return `
    <article class="reference-card">
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
    </article>
  `;
}

/* ============================================
    EVENT LISTENERS SETUP
    ============================================ */

function setupEventListeners() {
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

console.log('%cCientific Reference Library', 'color: #596653; font-weight: bold; font-size: 14px; font-family: serif;');
console.log('%cBibliografía cargada: ' + references.length + ' referencias', 'color: #A47D5B; font-size: 12px;');
