// --- 1. DEFINICIÓN DE PESTAÑAS Y OPCIONES ---
const tabsConfig = [
    {
        id: 'tab-general',
        label: 'General',
        icon: 'settings',
        secciones: [
            { label: 'Idioma', tipo: 'select', options: ['Español', 'English', 'Italiano'] },
            { 
                id: 'global-set-font',
                label: 'Fuente', 
                tipo: 'select', 
                storageKey: 'pref-font-size',
                default: '16px',
                options: [
                    { val: '16px', text: 'Normal' },
                    { val: '18px', text: 'Grande' },
                    { val: '20px', text: 'Muy Grande' }
                ],
                accion: (val) => {
                    document.documentElement.style.setProperty('--font-size-base', val);
                    localStorage.setItem('pref-font-size', val);
                }
            },
            { 
                id: 'global-set-dark',
                label: 'Modo Oscuro', 
                tipo: 'switch',
                storageKey: 'pref-dark-mode',
                default: false,
                accion: (val) => {
                    document.body.classList.toggle('dark-theme', val);
                    localStorage.setItem('pref-dark-mode', val);
                }
            },
            { label: 'Mantener pantalla encendida', tipo: 'switch' }
        ]
    },
    {
        id: 'tab-canto',
        label: 'Canto',
        icon: 'music_note',
        secciones: [
            { label: 'Mantenimiento', tipo: 'switch' },
            { label: 'Velocidad', tipo: 'range' },
            { label: 'URL Nota de Canto', tipo: 'text' },
            { label: 'Audio', tipo: 'switch' },
            { label: 'Nota', tipo: 'text' },
            { label: 'Cejilla', tipo: 'text' },
            { label: 'Categoría Principal', tipo: 'select', options: ['Precat', 'Cat', 'Liturgia', 'Elección'] },
            { label: 'Categoría', tipo: 'text' }
        ]
    },
    {
        id: 'tab-tema',
        label: 'Tema',
        icon: 'palette',
        secciones: [
            { label: 'Cintillo / Cabecera', tipo: 'color' },
            { label: 'Texto Cabecera', tipo: 'color' },
            { label: 'Fondo del Canto', tipo: 'color' },
            { label: 'Título', tipo: 'color' },
            { label: 'Subtítulo', tipo: 'color' },
            { label: 'Texto del Canto', tipo: 'color' },
            { label: 'Acorde', tipo: 'color' },
            { label: 'Categoría Pie', tipo: 'color' },
            { label: 'Número Canto', tipo: 'color' }
        ]
    },
    {
        id: 'tab-perfil',
        label: 'Perfil',
        icon: 'person',
        secciones: [
            { label: 'Sincronizar nube', tipo: 'switch' },
            { label: 'Descarga automática', tipo: 'switch' },
            { label: 'Sincronización Automática', tipo: 'switch' },
            { label: 'Mostrar datos perfil', tipo: 'switch' },
            { label: 'Gestión de Cantos', tipo: 'switch' },
            { label: 'Configuración', tipo: 'switch' }
        ]
    }
];

// --- 2. MOTOR DE GENERACIÓN DE HTML ---
window.generarContenidoSettings = function() {
    // Generar Cabecera de Tabs
    const tabsHeader = `
        <div class="settings-tabs-bar">
            ${tabsConfig.map((tab, index) => `
                <button class="tab-btn ${index === 0 ? 'active' : ''}" onclick="window.cambiarTab('${tab.id}')">
                    <span class="material-symbols-outlined">${tab.icon}</span>
                    <span>${tab.label}</span>
                </button>
            `).join('')}
        </div>
    `;

    // Generar Contenedores de Contenido
    const tabsContent = tabsConfig.map((tab, index) => `
        <div id="${tab.id}" class="tab-panel ${index === 0 ? 'active' : ''}">
            ${tab.secciones.map(opt => `
                <div class="setting-row">
                    <label>${opt.label}</label>
                    <div class="setting-control">${renderControl(opt)}</div>
                </div>
            `).join('')}
        </div>
    `).join('');

    return tabsHeader + `<div class="settings-tabs-container">${tabsContent}</div>`;
};

// Función auxiliar para dibujar cada control
function renderControl(opt) {
    if (opt.tipo === 'switch') return `<label class="switch"><input type="checkbox"><span class="slider"></span></label>`;
    if (opt.tipo === 'select') return `<select>${opt.options.map(o => `<option>${o}</option>`).join('')}</select>`;
    if (opt.tipo === 'color') return `<input type="color" value="#bc0009">`;
    if (opt.tipo === 'text') return `<input type="text" placeholder="...">`;
    if (opt.tipo === 'range') return `<input type="range">`;
    return '';
}

// Lógica para cambiar de pestaña
window.cambiarTab = function(tabId) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
};

// FUNCIONES DE LOS ATRIBUOS
// Auxiliar para mantener el Wake Lock activo al volver a la pestaña
window.reestablecerWakeLock = async () => {
    const isActive = localStorage.getItem('pref-wakelock') === 'true';
    if (isActive && document.visibilityState === 'visible') {
        window.wakeLock = await navigator.wakeLock.request('screen');
    }
};

// Aplicar preferencias al cargar cualquier página
// Usamos una función autoejecutable para que se aplique lo antes posible

