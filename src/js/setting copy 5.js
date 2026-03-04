// ==========================================
// MODULO: DICCIONARIO Y TRADUCCION
// ==========================================

const i18n = {
    'Español': {
        tab_general: 'General',
        tab_canto: 'Canto',
        tab_tema: 'Tema',
        tab_perfil: 'Perfil',
        lbl_idioma: 'Idioma',
        lbl_fuente: 'Fuente',
        lbl_oscuro: 'Modo Oscuro',
        lbl_wake: 'Mantener pantalla encendida'
    },
    'English': {
        tab_general: 'General',
        tab_canto: 'Song',
        tab_tema: 'Theme',
        tab_perfil: 'Profile',
        lbl_idioma: 'Language',
        lbl_fuente: 'Font Size',
        lbl_oscuro: 'Dark Mode',
        lbl_wake: 'Keep screen on'
    },
    'Italiano': {
        tab_general: 'Generale',
        tab_canto: 'Canto',
        tab_tema: 'Tema',
        tab_perfil: 'Profilo',
        lbl_idioma: 'Lingua',
        lbl_fuente: 'Carattere',
        lbl_oscuro: 'Modo Oscuro',
        lbl_wake: 'Schermo Acceso'
    }
};

// Función que devuelve el texto traducido
// Se puede llamar en cualquier parte del código
const txt = (key) => {
    const lang = localStorage.getItem('pref-lang') || 'Español';
    return i18n[lang][key] || key;
};



// ==========================================
// MODULO: DEFINICION DE PESTAÑAS Y OPCIONES
// ==========================================
const tabsConfig = [
    {
        id: 'tab-general',
        label: txt('tab_general'), // Llamada a la función traductora
        icon: 'settings',
        secciones: 
        [

// ==========================================
// TABULACION GENERAL
// ==========================================
            { 
                id: 'global-set-lang',
                label: txt('lbl_idioma'), 
                tipo: 'select', 
                storageKey: 'pref-lang',
                default: 'Español',
                options: ['Español', 'English', 'Italiano'],
                accion: (val) => 
                    {
                        // 1. Obtenemos el idioma que ya estaba guardado
                        const langActual = localStorage.getItem('pref-lang') || 'Español';
                                        
                        // 2. SOLO si el idioma nuevo es diferente al actual, guardamos y recargamos
                        if (val !== langActual) 
                            {
                                localStorage.setItem('pref-lang', val);
                                                
                                // Damos un pequeño respiro de 100ms para asegurar el guardado
                                setTimeout(() => 
                                    {
                                        location.reload();
                                    }, 100);
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

// ==========================================
// MODULO: TABULACION DE CANTO
// ==========================================
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

// ==========================================
// MODULO: TABULACION DE CANTO
// ==========================================

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
// ==========================================
// TABULACION DE PERFIL
// ==========================================
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
    // Identificamos si hay un canto cargado buscando el contenedor de la letra
    // Ajusta '.letra' o '.main-wrapper' según el nombre de tu clase en el HTML
    const hayCantoCargado = document.querySelector('.letra') || document.querySelector('.main-wrapper');

    const tabsHeader = `
        <div class="settings-tabs-bar">
            ${tabsConfig.map((tab, index) => {
                // Si la pestaña es 'Canto' y no hay canto cargado, la deshabilitamos
                const isDisabled = tab.id === 'tab-canto' && !hayCantoCargado;
                const attrDisabled = isDisabled ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : '';
                
                return `
                <button class="tab-btn ${index === 0 ? 'active' : ''}" 
                        ${attrDisabled} 
                        onclick="window.cambiarTab('${tab.id}')">
                    <span class="material-symbols-outlined">${tab.icon}</span>
                    <span>${tab.label}</span>
                </button>
                `;
            }).join('')}
        </div>
    `;

    const tabsContent = tabsConfig.map((tab, index) => `
        <div id="${tab.id}" class="tab-panel ${index === 0 ? 'active' : ''}">
            ${tab.secciones.length > 0 ? 
                tab.secciones.map(opt => {
                    const valorGuardado = opt.storageKey ? localStorage.getItem(opt.storageKey) : null;
                    const isChecked = opt.tipo === 'switch' ? (valorGuardado === 'true' || (valorGuardado === null && opt.default === true)) : false;
                    const valActual = valorGuardado || opt.default;

                    return `
                    <div class="setting-row">
                        <label>${opt.label}</label>
                        <div class="setting-control">${renderControl(opt, isChecked, valActual)}</div>
                    </div>`;
                }).join('') 
                : `<p style="text-align:center; padding:20px; color:#666;">Próximamente...</p>`
            }
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