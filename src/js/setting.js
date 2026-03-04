// ==========================================
// MODULO: DEFINICION DE PESTAÑAS Y OPCIONES
// ==========================================
const tabsConfig = [
    {
        id: 'tab-general',
        label: 'General',
        icon: 'settings',
        secciones: [
            { 
                id: 'global-set-lang',
                label: 'Idioma', 
                tipo: 'select', 
                storageKey: 'pref-lang',
                default: 'Español',
                options: ['Español', 'English', 'Italiano', 'Português', 'Français', 'Latin', 'Ruso', 'Chino'],
                accion: (val) => {
                    const langActual = localStorage.getItem('pref-lang') || 'Español';
                    if (val !== langActual) {
                        localStorage.setItem('pref-lang', val);
                        
                        // Mapeo de Subdominios para redirección
                        const mapaDominios = {
                            'Español': 'https://resucito.do',
                            'English': 'https://en.resucito.do',
                            'Italiano': 'https://it.resucito.do',
                            'Português': 'https://po.resucito.do',
                            'Français': 'https://fr.resucito.do',
                            'Latin': 'https://la.resucito.do',
                            'Ruso': 'https://ru.resucito.do',
                            'Chino': 'https://ch.resucito.do'
                        };

                        const urlParams = new URLSearchParams(window.location.search);
                        const cantoId = urlParams.get('canto');
                        
                        // Si el idioma no tiene subdominio asignado, vuelve al principal
                        let nuevaUrl = (mapaDominios[val] || mapaDominios['Español']) + '/src/index.html';
                        if (cantoId) nuevaUrl += '?canto=' + cantoId;

                        window.location.href = nuevaUrl;
                    }
                }
            },
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
            { 
                id: 'global-set-wakelock',
                label: 'Mantener pantalla encendida', 
                tipo: 'switch',
                storageKey: 'pref-wakelock',
                default: false,
                accion: async (val) => {
                    if (val) {
                        try {
                            window.wakeLock = await navigator.wakeLock.request('screen');
                            document.addEventListener('visibilitychange', window.reestablecerWakeLock);
                        } catch (err) { console.error("WakeLock Error:", err); }
                    } else {
                        if (window.wakeLock) window.wakeLock.release();
                        window.wakeLock = null;
                        document.removeEventListener('visibilitychange', window.reestablecerWakeLock);
                    }
                    localStorage.setItem('pref-wakelock', val);
                }
            }
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

// ==========================================
// MODULO: MOTOR DE GENERACION DE HTML
// ==========================================
window.generarContenidoSettings = function() {
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

    const tabsContent = tabsConfig.map((tab, index) => `
        <div id="${tab.id}" class="tab-panel ${index === 0 ? 'active' : ''}">
            ${tab.secciones.map(opt => {
                const valorGuardado = opt.storageKey ? localStorage.getItem(opt.storageKey) : null;
                const isChecked = opt.tipo === 'switch' ? (valorGuardado === 'true' || (valorGuardado === null && opt.default === true)) : false;
                const valActual = valorGuardado || opt.default;

                return `
                <div class="setting-row">
                    <label>${opt.label}</label>
                    <div class="setting-control">${renderControl(opt, isChecked, valActual)}</div>
                </div>`;
            }).join('')}
        </div>
    `).join('');

    return tabsHeader + `<div class="settings-tabs-container">${tabsContent}</div>`;
};

// ==========================================
// MODULO: RENDERIZADO DE CONTROLES
// ==========================================
function renderControl(opt, isChecked, valActual) {
    const onchange = opt.accion ? `onchange="window.ejecutarAccionTabs('${opt.id}', this.type === 'checkbox' ? this.checked : this.value)"` : '';

    if (opt.tipo === 'switch') return `<label class="switch"><input type="checkbox" ${isChecked ? 'checked' : ''} ${onchange}><span class="slider"></span></label>`;
    
    if (opt.tipo === 'select') {
        const optionsHTML = opt.options ? opt.options.map(o => {
            const val = typeof o === 'object' ? o.val : o;
            const text = typeof o === 'object' ? o.text : o;
            return `<option value="${val}" ${valActual === val ? 'selected' : ''}>${text}</option>`;
        }).join('') : '';
        return `<select ${onchange}>${optionsHTML}</select>`;
    }
    
    if (opt.tipo === 'color') return `<input type="color" value="${valActual || '#bc0009'}" ${onchange}>`;
    if (opt.tipo === 'text') return `<input type="text" placeholder="..." value="${valActual || ''}" ${onchange}>`;
    if (opt.tipo === 'range') return `<input type="range" ${onchange}>`;
    return '';
}

// ==========================================
// MODULO: LOGICA DE NAVEGACION Y EJECUCION
// ==========================================
window.cambiarTab = function(tabId) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
};

window.ejecutarAccionTabs = (id, valor) => {
    let opcion;
    tabsConfig.forEach(tab => {
        const encontrada = tab.secciones.find(s => s.id === id);
        if (encontrada) opcion = encontrada;
    });
    if (opcion && opcion.accion) opcion.accion(valor);
};

// ==========================================
// MODULO: FUNCIONES DE LOS ATRIBUTOS
// ==========================================
window.reestablecerWakeLock = async () => {
    const isActive = localStorage.getItem('pref-wakelock') === 'true';
    if (isActive && document.visibilityState === 'visible') {
        window.wakeLock = await navigator.wakeLock.request('screen');
    }
};

// ==========================================
// MODULO: PERSISTENCIA AL CARGAR
// ==========================================
(function aplicarPreferenciasGlobales() {
    tabsConfig.forEach(tab => {
        tab.secciones.forEach(opt => {
            if (opt.accion && opt.storageKey) {
                const val = localStorage.getItem(opt.storageKey) || opt.default;
                const finalVal = opt.tipo === 'switch' ? val === 'true' : val;
                
                // Aplicar inmediatamente o esperar al DOM según el tipo
                if (opt.id === 'global-set-dark' || opt.id === 'global-set-wakelock') {
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', () => opt.accion(finalVal));
                    } else {
                        opt.accion(finalVal);
                    }
                } else {
                    opt.accion(finalVal);
                }
            }
        });
    });
})();