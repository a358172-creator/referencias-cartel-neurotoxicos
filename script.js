const references = [
  {authors:'Huang TT, Leu D, Zou Y.',title:'Oxidative stress and redox regulation on hippocampal-dependent cognitive functions.',journal:'Arch Biochem Biophys.',details:'2015 Jun 15;576:2-7.',doi:'10.1016/j.abb.2015.03.026',pmid:'25828527',pmcid:'PMC4450077'},
  {authors:'Franco R, Vargas MR.',title:'Redox Biology in Neurological Function, Dysfunction, and Aging.',journal:'Antioxid Redox Signal.',details:'2018 Jun 20;28(18):1583-1586.',doi:'10.1089/ars.2018.7513'},
  {authors:'Aizenman E, Loring RH, Reynolds IJ, Rosenberg PA.',title:'The Redox Biology of Excitotoxic Processes: The NMDA Receptor, TOPA Quinone, and the Oxidative Liberation of Intracellular Zinc.',journal:'Antioxid Redox Signal.',details:'2016 Apr 1;24(10):517-528.',doi:'10.1089/ars.2015.6506'},
  {authors:'Girouard H, Wang G, Gallo EF, Anrather J, Zhou P, Pickel VM, Iadecola C.',title:'NMDA receptor activation increases free radical production through nitric oxide and NOX2.',journal:'J Neurosci.',details:'2009 Mar 11;29(10):2545-2552.',doi:'10.1523/JNEUROSCI.0133-09.2009'},
  {authors:'Reyes RC, Brennan AM, Shen Y, Baldwin Y, Swanson RA.',title:'Activation of neuronal NMDA receptors induces superoxide-mediated oxidative stress in neighboring neurons and astrocytes.',journal:'J Neurosci.',details:'2012 Aug 8;32(32):10806-10813.',doi:'10.1523/JNEUROSCI.0341-12.2012'},
  {authors:'Parellada E, Gassó P.',title:'Activación del glutamato y la microglía como factor desencadenante de la apoptosis dendrítica: un mecanismo fisiopatológico fundamental para comprender la esquizofrenia.',journal:'Rev Psiquiatr Salud Ment.',details:'2012 Jul-Sep;5(3):158-168.',doi:'10.1016/j.rpsm.2012.07.001'},
  {authors:'Garcia-Reyero N, Escalon L, Prats E, Faria M, Soares A, Raldúa D.',title:'Targeted Gene Expression in Zebrafish Exposed to Chlorpyrifos-Oxon Confirms Phenotype-Specific Mechanisms Leading to Adverse Outcomes.',journal:'Environ Health Perspect.',details:'2016 Oct;124(10):1609-1615.',doi:'10.1289/ehp.1510518'},
  {authors:'Sun G, He Y, Chuang D, Lee J, Gu Z, Simonyi A, Sun A.',title:'Integrating Cytosolic Phospholipase A2 with Oxidative/Nitrosative Signaling Pathways in Neurons: A Novel Therapeutic Strategy for AD.',journal:'Mol Neurodegener.',details:'2012 Feb 7;7:6.',doi:'10.1186/1750-1326-7-6'},
  {authors:'Wilson C, Muñoz-Palma E, González-Billault C.',title:'From birth to death: A role for reactive oxygen species in neuronal development.',journal:'Semin Cell Dev Biol.',details:'2018 Aug;80:43-49.',doi:'10.1016/j.semcdb.2017.09.011'},
  {authors:'Oswald MCW, Garnham N, Sweeney ST, Landgraf M.',title:'Regulation of neuronal development and function by ROS.',journal:'FEBS Lett.',details:'2018 Mar;592(5):679-691.',doi:'10.1002/1873-3468.12972'}
];

const fullCitation = r => `${r.authors} ${r.title} ${r.journal} ${r.details} doi: ${r.doi}.${r.pmid ? ` PMID: ${r.pmid}.` : ''}${r.pmcid ? ` PMCID: ${r.pmcid}.` : ''}`;

const list = document.querySelector('#references');
list.innerHTML = references.map((r,i) => `<article class="reference" style="animation-delay:${i * 55}ms"><div class="ref-number">${String(i+1).padStart(2,'0')}</div><div><p class="authors">${r.authors}</p><p class="title">${r.title}</p><p class="journal"><em>${r.journal}</em> ${r.details}</p><p class="citation-meta"><a href="https://doi.org/${r.doi}" target="_blank" rel="noopener">doi:${r.doi}</a>${r.pmid ? ` · <a href="https://pubmed.ncbi.nlm.nih.gov/${r.pmid}" target="_blank" rel="noopener">PubMed</a>` : ''}</p></div></article>`).join('');

const copyButton = document.querySelector('#copyButton');
const toast = document.querySelector('#toast');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(references.map((r, i) => `${i + 1}. ${fullCitation(r)}`).join('\n\n'));
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
});

const themeButton = document.querySelector('#themeButton');
themeButton.addEventListener('click', () => {
  const light = document.body.classList.toggle('light');
  themeButton.setAttribute('aria-label', light ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  themeButton.textContent = light ? '☀️' : '🌙';
  localStorage.setItem('theme', light ? 'light' : 'dark');
});

if (localStorage.getItem('theme') === 'light') themeButton.click();
