// ==========================================
// MODULO: DICCIONARIO Y TRADUCCION (I18N)
// ==========================================
const i18n = {
    'Español': {
        tab_general: 'General', tab_canto: 'Canto', tab_tema: 'Tema', tab_perfil: 'Perfil',
        lbl_idioma: 'Idioma', lbl_fuente: 'Fuente', lbl_oscuro: 'Modo Oscuro', lbl_wake: 'Mantener pantalla encendida'
    },
    'English': {
        tab_general: 'General', tab_canto: 'Song', tab_tema: 'Theme', tab_perfil: 'Profile',
        lbl_idioma: 'Language', lbl_fuente: 'Font Size', lbl_oscuro: 'Dark Mode', lbl_wake: 'Keep screen on'
    },
    'Italiano': {
        tab_general: 'Generale', tab_canto: 'Canto', tab_tema: 'Tema', tab_perfil: 'Profilo',
        lbl_idioma: 'Lingua', lbl_fuente: 'Carattere', lbl_oscuro: 'Modo Oscuro', lbl_wake: 'Schermo Acceso'
    },
    'Português': {
        tab_general: 'Geral', tab_canto: 'Canto', tab_tema: 'Tema', tab_perfil: 'Perfil',
        lbl_idioma: 'Idioma', lbl_fuente: 'Fonte', lbl_oscuro: 'Modo Escuro', lbl_wake: 'Manter tela ligada'
    },
    'Français': {
        tab_general: 'Général', tab_canto: 'Chant', tab_tema: 'Thème', tab_perfil: 'Profil',
        lbl_idioma: 'Langue', lbl_fuente: 'Taille Police', lbl_oscuro: 'Mode Sombre', lbl_wake: 'Garder l\'écran allumé'
    }
};

const txt = (key) => {
    const lang = localStorage.getItem('pref-lang') || 'Español';
    return (i18n[lang] && i18n[lang][key]) ? i18n[lang][key] : key;
};

// ==========================================
// MODULO: DEFINICION DE PESTAÑAS Y OPCIONES
// ==========================================
const tabsConfig = [
    {
        id: 'tab-general',
        label: txt('tab_general'),
        icon: 'settings',
        secciones: [
            { 
                id: 'global-set-lang',
                label: txt('lbl_idioma'), 
                tipo: 'select', 
                storageKey: 'pref-lang',
                default: 'Español',
                options: ['Español', 'English', 'Italiano', 'Português', 'Français', 'Latin', 'Ruso', 'Chino'],
                accion: (val) => {
                    const langActual = localStorage.getItem('pref-lang') || 'Español';
                    if (val !== langActual) {
                        localStorage.setItem('pref-lang', val);
                        
                        // Mapeo de Subdominios
                        const mapaDominios = {
                            'Español': 'https://resucito.do',
                            'English': 'https://en.resucito.do',
                            'Italiano': 'https://it.resucito.do',
                            'Português': 'https://po.resucito.do',
                            'Français': 'https://fr.resucito.do',
                            'Latin': 'https://la.resucito.do'
                        };

                        const urlParams = new URLSearchParams(window.location.search);
                        const cantoId = urlParams.get('canto');
                        let nuevaUrl = (mapaDominios[val] || mapaDominios['Español']) + '/src/index.html';
                        if (cantoId) nuevaUrl += '?canto=' + cantoId;

                        window.location.href = nuevaUrl;
                    }
                }
            },
            { 
                id: 'global-set-font',
                label: txt('lbl_fuente'), 
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
                label: txt('lbl_oscuro'), 
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
                label: txt('lbl_wake'), 
                tipo: 'switch',
                storageKey: 'pref-wakelock',
                default: false,
                accion: async (val) => {
                    if (val) {
                        try {
                            if ('wakeLock' in navigator) {
                                window.wakeLock = await navigator.wakeLock.request('screen');
                                document.addEventListener('visibilitychange', window.reestablecerWakeLock);
                            }
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
        label: txt('tab_canto'),
        icon: 'music_note',
        secciones: [
            { id: 'canto-vel', label: 'Velocidad Scroll', tipo: 'range', storageKey: 'canto-scroll-speed', default: 5 },
            { id: 'canto-audio', label: 'Reproductor Audio', tipo: 'switch', storageKey: 'canto-audio-enable', default: true },
            { id: 'canto-cejilla', label: 'Mostrar Cejilla', tipo: 'switch', storageKey: 'canto-show-capo', default: true }
        ]
    },
    {
        id: 'tab-tema',
        label: txt('tab_tema'),
        icon: 'palette',
        secciones: [
            { id: 'color-header', label: 'Cabecera', tipo: 'color', storageKey: 'theme-color-header', default: '#bc0009' },
            { id: 'color-txt-canto', label: 'Texto Canto', tipo: 'color', storageKey: 'theme-color-txt', default: '#000000' },
            { id: 'color-acorde', label: 'Color Acordes', tipo: 'color', storageKey: 'theme-color-chord', default: '#bc0009' }
        ]
    },
    {
        id: 'tab-perfil',
        label: txt('tab_perfil'),
        icon: 'person',
        secciones: [] // Próximamente
    }
];

// ==========================================
// MODULO: MOTOR DE GENERACION DE HTML
// ==========================================
window.generarContenidoSettings = function() {
    const hayCantoCargado = document.querySelector('.letra') || document.getElementById('tt');

    const tabsHeader = `
        <div class="settings-tabs-bar">
            ${tabsConfig.map((tab, index) => {
                const isDisabled = tab.id === 'tab-canto' && !hayCantoCargado;
                const attrDisabled = isDisabled ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : '';
                return `
                <button class="tab-btn ${index === 0 ? 'active' : ''}" 
                        ${attrDisabled} 
                        onclick="window.cambiarTab('${tab.id}')">
                    <span class="material-symbols-outlined">${tab.icon}</span>
                    <span>${tab.label}</span>
                </button>`;
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

function renderControl(opt, isChecked, valActual) {
    const onchange = `onchange="window.ejecutarAccionTabs('${opt.id}', this.type === 'checkbox' ? this.checked : this.value)"`;
    if (opt.tipo === 'switch') return `<label class="switch"><input type="checkbox" ${isChecked ? 'checked' : ''} ${onchange}><span class="slider"></span></label>`;
    if (opt.tipo === 'select') {
        return `<select ${onchange}>${opt.options.map(o => {
            const v = typeof o === 'object' ? o.val : o;
            const t = typeof o === 'object' ? o.text : o;
            return `<option value="${v}" ${valActual === v ? 'selected' : ''}>${t}</option>`;
        }).join('')}</select>`;
    }
    if (opt.tipo === 'color') return `<input type="color" value="${valActual}" ${onchange}>`;
    if (opt.tipo === 'range') return `<input type="range" min="1" max="10" value="${valActual}" ${onchange}>`;
    return '';
}

// ==========================================
// MODULO: LOGICA DE NAVEGACION
// ==========================================
window.cambiarTab = function(tabId) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(tabId);
    if(target) target.classList.add('active');
    if(event) event.currentTarget.classList.add('active');
};

window.ejecutarAccionTabs = (id, valor) => {
    tabsConfig.forEach(tab => {
        const opt = tab.secciones.find(s => s.id === id);
        if (opt && opt.accion) opt.accion(valor);
    });
};

window.reestablecerWakeLock = async () => {
    if (localStorage.getItem('pref-wakelock') === 'true' && document.visibilityState === 'visible') {
        window.wakeLock = await navigator.wakeLock.request('screen');
    }
};

(function aplicarPreferenciasGlobales() {
    tabsConfig.forEach(tab => {
        tab.secciones.forEach(opt => {
            if (opt.accion && opt.storageKey) {
                const val = localStorage.getItem(opt.storageKey) || opt.default;
                const finalVal = opt.tipo === 'switch' ? val === 'true' : val;
                opt.accion(finalVal);
            }
        });
    });
})();