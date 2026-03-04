// MODULO: IDIOMA (I18N) - setting-idioma.js

window.i18nLib = {
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

// Función global segura para obtener traducciones
window.txt = (key) => {
    const lang = localStorage.getItem('pref-lang') || 'Español';
    if (window.i18nLib && window.i18nLib[lang] && window.i18nLib[lang][key]) {
        return window.i18nLib[lang][key];
    }
    return key; // Fallback: devuelve la llave si no hay traducción
};