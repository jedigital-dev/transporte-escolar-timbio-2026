/**
 * ==========================================================================
 * CONSULTA TRANSPORTE ESCOLAR 2026 - ALCALDÍA MUNICIPAL DE TIMBÍO, CAUCA
 * Lógica de búsqueda, filtrado y renderizado institucional.
 * Estricta protección de privacidad y datos de menores.
 * ==========================================================================
 */

// CONFIGURACIÓN CENTRALIZADA
const CONFIG = {
  // Rutas a documentos oficiales y datos
  dataPath: 'data/postulantes.json',
  pdfListadoUrl: 'docs/Listado_definitivo_Transporte_Escolar_2026_Timbio.pdf',
  pdfConvocatoriaUrl: 'docs/Convocatoria_Subsidio_Transporte_Escolar_2026_Timbio.pdf',
  pdfCronogramaUrl: 'docs/Modificacion_Cronograma_Transporte_Escolar_2026.pdf',

  // Longitud mínima obligatoria de caracteres para realizar cualquier consulta
  minSearchLength: 3,

  // Límite de resultados a renderizar inicialmente para garantizar rendimiento fluido en celular
  maxRenderResults: 300
};

// ESTADO DE LA APLICACIÓN
const state = {
  allStudents: [],
  filteredStudents: [],
  institutions: [],
  isLoading: true
};

// REFERENCIAS AL DOM
const dom = {
  inputSearch: document.getElementById('input-search'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  btnSearch: document.getElementById('btn-search'),
  selectInstitution: document.getElementById('select-institution'),
  searchMeta: document.getElementById('search-meta'),
  resultsCounter: document.getElementById('results-counter'),
  btnResetAll: document.getElementById('btn-reset-all'),
  stateInitial: document.getElementById('state-initial'),
  stateLoading: document.getElementById('state-loading'),
  stateEmpty: document.getElementById('state-empty'),
  studentsGrid: document.getElementById('students-grid'),
  linkPdfListado: document.getElementById('link-pdf-listado'),
  linkPdfConvocatoria: document.getElementById('link-pdf-convocatoria'),
  linkPdfCronograma: document.getElementById('link-pdf-cronograma')
};

/**
 * Normaliza una cadena de texto para búsqueda:
 * - Convierte a minúsculas
 * - Remueve tildes y diacríticos (á -> a, é -> e, etc.)
 * - Elimina espacios múltiples
 */
function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/\s+/g, ' ');           // Elimina espacios duplicados
}

/**
 * Inicialización al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', () => {
  setupConfigLinks();
  bindEvents();
  loadData();
});

/**
 * Configura los enlaces a los PDFs oficiales
 */
function setupConfigLinks() {
  if (dom.linkPdfListado) dom.linkPdfListado.href = CONFIG.pdfListadoUrl;
  if (dom.linkPdfConvocatoria) dom.linkPdfConvocatoria.href = CONFIG.pdfConvocatoriaUrl;
  if (dom.linkPdfCronograma) dom.linkPdfCronograma.href = CONFIG.pdfCronogramaUrl;
}

/**
 * Vinculación de eventos de la interfaz
 */
function bindEvents() {
  // Búsqueda en tiempo real mientras se escribe con debounce
  dom.inputSearch.addEventListener('input', debounce(() => {
    updateClearButton();
    performQuery();
  }, 100));

  // Tecla Enter en el buscador
  dom.inputSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateClearButton();
      performQuery();
    }
  });

  // Botón institucional "Buscar"
  if (dom.btnSearch) {
    dom.btnSearch.addEventListener('click', (e) => {
      e.preventDefault();
      performQuery();
    });
  }

  // Botón borrar texto
  dom.btnClearSearch.addEventListener('click', () => {
    dom.inputSearch.value = '';
    dom.inputSearch.focus();
    updateClearButton();
    performQuery();
  });

  // Selector de institución (solo refina búsqueda ya iniciada)
  dom.selectInstitution.addEventListener('change', () => {
    performQuery();
  });

  // Botón restablecer todos los filtros
  dom.btnResetAll.addEventListener('click', resetAllFilters);
}

/**
 * Actualiza la visibilidad del botón de limpiar texto
 */
function updateClearButton() {
  if (dom.inputSearch.value.trim().length > 0) {
    dom.btnClearSearch.style.display = 'block';
  } else {
    dom.btnClearSearch.style.display = 'none';
  }
}

/**
 * Restablece todos los campos de búsqueda
 */
function resetAllFilters() {
  dom.inputSearch.value = '';
  dom.selectInstitution.value = '';
  updateClearButton();
  performQuery();
  dom.inputSearch.focus();
}

/**
 * Carga el dataset JSON local y prepara índices de búsqueda
 */
async function loadData() {
  showPanel('loading');
  try {
    const response = await fetch(CONFIG.dataPath);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} al cargar ${CONFIG.dataPath}`);
    }
    const data = await response.json();

    // Pre-procesar registros:
    // NOTA ESTRICTA DE PRIVACIDAD:
    // - Solo se normaliza e indexa el nombre del estudiante para búsqueda.
    // - El acudiente se almacena ya anonimizado y NUNCA se indexa ni se busca.
    // - No se expone ningún listado masivo en memoria a la vista pública.
    state.allStudents = data.map(item => ({
      nombre: item.nombre || '',
      institucion: item.institucion || '',
      grado: item.grado || '',
      acudiente: item.acudiente || '',
      _normalizedNombre: normalizeText(item.nombre)
    }));

    // Extraer lista de instituciones únicas y poblar el selector dinámicamente
    populateInstitutions(state.allStudents);

    state.isLoading = false;

    // Estado inicial obligatorio: al entrar a la página NUNCA se muestra ningún estudiante
    showPanel('initial');
  } catch (error) {
    console.error('Error al cargar datos:', error);
    dom.stateLoading.innerHTML = `
      <div class="empty-icon empty-icon-warning">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3 class="empty-title">No fue posible cargar el listado</h3>
      <p class="empty-desc">Por favor recarga la página o verifica tu conexión a internet.</p>
    `;
  }
}

/**
 * Genera el selector de instituciones dinámicamente a partir de los datos
 */
function populateInstitutions(students) {
  const instSet = new Set();
  students.forEach(s => {
    if (s.institucion) instSet.add(s.institucion);
  });

  state.institutions = Array.from(instSet).sort((a, b) => a.localeCompare(b, 'es'));

  // Limpiar y agregar opciones
  dom.selectInstitution.innerHTML = '<option value="">Todas las instituciones</option>';
  state.institutions.forEach(inst => {
    const opt = document.createElement('option');
    opt.value = inst;
    opt.textContent = inst;
    dom.selectInstitution.appendChild(opt);
  });
}

/**
 * Ejecuta el filtrado según las condiciones estrictas de consulta y privacidad
 */
function performQuery() {
  if (state.isLoading) return;

  const rawSearch = dom.inputSearch.value.trim();
  const selectedInst = dom.selectInstitution.value;

  const searchNormalized = normalizeText(rawSearch);
  const searchTerms = searchNormalized.split(' ').filter(term => term.length > 0);

  // REGLA ESTRICTA DE PRIVACIDAD:
  // Siempre es OBLIGATORIO que el usuario escriba al menos 3 caracteres del nombre o apellido.
  // Seleccionar únicamente una institución NO lista a los estudiantes;
  // el filtro de institución sirve solamente para refinar una búsqueda ya iniciada.
  if (searchNormalized.length < CONFIG.minSearchLength) {
    showPanel('initial');
    dom.searchMeta.style.display = 'none';
    dom.studentsGrid.innerHTML = '';
    return;
  }

  // Filtrado: SE REALIZA EXCLUSIVAMENTE POR NOMBRE DEL ESTUDIANTE E INSTITUCIÓN.
  // El acudiente está estrictamente excluido de la búsqueda.
  const hasInst = selectedInst !== '';

  const results = state.allStudents.filter(student => {
    // 1. Filtro por término(s) de búsqueda sobre student._normalizedNombre
    const matchesAllTerms = searchTerms.every(term => 
      student._normalizedNombre.includes(term)
    );
    if (!matchesAllTerms) {
      return false;
    }

    // 2. Refinamiento por institución (si está seleccionada)
    if (hasInst && student.institucion !== selectedInst) {
      return false;
    }

    return true;
  });

  state.filteredStudents = results;

  // Actualizar metadatos y contador
  dom.searchMeta.style.display = 'flex';
  updateCounter(results.length);

  if (results.length === 0) {
    showPanel('empty');
    dom.studentsGrid.innerHTML = '';
  } else {
    showPanel('results');
    renderStudents(results, searchTerms);
  }
}

/**
 * Actualiza el contador legible de resultados
 */
function updateCounter(count) {
  if (count === 0) {
    dom.resultsCounter.textContent = '0 resultados';
  } else if (count === 1) {
    dom.resultsCounter.textContent = '1 estudiante encontrado';
  } else {
    dom.resultsCounter.textContent = `${count} estudiantes encontrados`;
  }
}

/**
 * Renderiza las tarjetas de resultados en el DOM (estilo institucional sobrio)
 */
function renderStudents(students, searchTerms) {
  const fragment = document.createDocumentFragment();
  const limit = Math.min(students.length, CONFIG.maxRenderResults);

  for (let i = 0; i < limit; i++) {
    const student = students[i];
    const card = document.createElement('article');
    card.className = 'portal-student-card';
    card.setAttribute('aria-label', `Postulante: ${student.nombre}`);

    // Resaltar términos de búsqueda en el nombre si aplica
    const displayName = highlightMatches(student.nombre, searchTerms);

    // Formato de acudiente anonimizado para verificación auxiliar
    const acudienteDisplay = student.acudiente ? escapeHtml(student.acudiente) : 'No registrado';

    card.innerHTML = `
      <div class="card-student-top">
        <h3 class="card-student-name">${displayName}</h3>
        <div class="card-student-details">
          <div class="card-detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <span>${escapeHtml(student.institucion)}</span>
          </div>
          <div class="card-detail-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>Grado: <span class="card-detail-value">${escapeHtml(student.grado)}</span></span>
          </div>
          <div class="card-detail-item card-detail-guardian">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Acudiente: <strong class="card-detail-value guardian-name">${acudienteDisplay}</strong></span>
          </div>
        </div>
      </div>
      <div class="card-student-footer">
        <span class="card-footer-label">Estado</span>
        <span class="card-badge-status" title="Estudiante incluido en el listado definitivo oficial">
          <span class="badge-status-dot" aria-hidden="true"></span>
          <span>Listado definitivo</span>
        </span>
      </div>
    `;

    fragment.appendChild(card);
  }

  // Si hay más de maxRenderResults, informar al usuario
  if (students.length > CONFIG.maxRenderResults) {
    const moreNotice = document.createElement('div');
    moreNotice.className = 'portal-empty-card';
    moreNotice.style.gridColumn = '1 / -1';
    moreNotice.style.padding = '1.25rem';
    moreNotice.innerHTML = `
      <p class="empty-desc" style="font-size: 0.88rem;">
        Mostrando los primeros <strong>${CONFIG.maxRenderResults}</strong> de <strong>${students.length}</strong> resultados.
        Escribe letras adicionales en el buscador para acotar tu consulta.
      </p>
    `;
    fragment.appendChild(moreNotice);
  }

  dom.studentsGrid.innerHTML = '';
  dom.studentsGrid.appendChild(fragment);
}

/**
 * Resalta suavemente los términos de búsqueda en el nombre
 */
function highlightMatches(text, terms) {
  if (!terms || terms.length === 0) {
    return escapeHtml(text);
  }

  const normText = normalizeText(text);
  const safeText = escapeHtml(text);

  const intervals = [];
  terms.forEach(term => {
    if (term.length < 2) return;
    let pos = 0;
    while ((pos = normText.indexOf(term, pos)) !== -1) {
      intervals.push({ start: pos, end: pos + term.length });
      pos += term.length;
    }
  });

  if (intervals.length === 0) {
    return safeText;
  }

  // Ordenar y fusionar intervalos
  intervals.sort((a, b) => a.start - b.start);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = intervals[i];
    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end);
    } else {
      merged.push(curr);
    }
  }

  // Construir HTML resaltado
  let result = '';
  let lastIndex = 0;
  for (const iv of merged) {
    result += escapeHtml(text.substring(lastIndex, iv.start));
    result += `<mark class="mark-highlight">${escapeHtml(text.substring(iv.start, iv.end))}</mark>`;
    lastIndex = iv.end;
  }
  result += escapeHtml(text.substring(lastIndex));

  return result;
}

/**
 * Escapa HTML para prevenir inyecciones
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Alterna entre paneles de estado
 */
function showPanel(panelName) {
  dom.stateInitial.style.display = (panelName === 'initial') ? 'block' : 'none';
  dom.stateLoading.style.display = (panelName === 'loading') ? 'block' : 'none';
  dom.stateEmpty.style.display = (panelName === 'empty') ? 'block' : 'none';
  dom.studentsGrid.style.display = (panelName === 'results') ? 'grid' : 'none';
}

/**
 * Función debounce para escritura fluida
 */
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
