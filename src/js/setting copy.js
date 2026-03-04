const opcionesConfig = [
    {
        id: 'global-set-font',
        label: 'Tamaño de Fuente',
        tipo: 'select',
        storageKey: 'pref-font-size',
        default: '16px',
        opciones: [
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
    
    // Opcion para no oscurecer la pantalla

    {
        id: 'global-set-wakelock',
        label: 'Mantener pantalla encendida',
        tipo: 'switch',
        storageKey: 'pref-wakelock',
        default: false,
        accion: async (val) => {
            if (val) {
                try {
                    // Intentamos activar el bloqueo de pantalla
                    window.wakeLock = await navigator.wakeLock.request('screen');
                    console.log("✅ Pantalla bloqueada: No se apagará.");
                    
                    // Si la pestaña se oculta y vuelve, hay que reactivarlo
                    document.addEventListener('visibilitychange', window.reestablecerWakeLock);
                } catch (err) {
                    console.error("❌ Error con Wake Lock:", err);
                }
            } else {
                // Liberamos el bloqueo si existe
                if (window.wakeLock) {
                    window.wakeLock.release();
                    window.wakeLock = null;
                }
                document.removeEventListener('visibilitychange', window.reestablecerWakeLock);
                console.log("🔓 Pantalla liberada: Se apagará normalmente.");
            }
            localStorage.setItem('pref-wakelock', val);
        }
    },

];

// --- 2. MOTOR QUE GENERA EL HTML ---
window.generarContenidoSettings = function() {
    return opcionesConfig.map(opt => {
        let control = '';
        const valorGuardado = localStorage.getItem(opt.storageKey);

        if (opt.tipo === 'select') {
            control = `<select id="${opt.id}" onchange="window.ejecutarAccion('${opt.id}', this.value)">
                ${opt.opciones.map(o => `<option value="${o.val}" ${valorGuardado === o.val ? 'selected' : ''}>${o.text}</option>`).join('')}
            </select>`;
        } 
        else if (opt.tipo === 'switch') {
            const checked = valorGuardado === 'true' || (valorGuardado === null && opt.default === true);
            control = `<label class="switch">
                <input type="checkbox" id="${opt.id}" ${checked ? 'checked' : ''} onchange="window.ejecutarAccion('${opt.id}', this.checked)">
                <span class="slider"></span>
            </label>`;
        }

        return `<div class="setting-item"><label>${opt.label}</label>${control}</div>`;
    }).join('');
};

// Auxiliar para ejecutar la acción
window.ejecutarAccion = (id, valor) => {
    const config = opcionesConfig.find(c => c.id === id);
    if (config) config.accion(valor);
};

// Aplicar preferencias al cargar cualquier página
// Usamos una función autoejecutable para que se aplique lo antes posible
(function aplicarPreferencias() {
    opcionesConfig.forEach(opt => {
        const val = localStorage.getItem(opt.storageKey) || opt.default;
        const finalVal = opt.tipo === 'switch' ? val === 'true' : val;
        
        // Esperamos un momento a que el body exista si es modo oscuro
        if (opt.id === 'global-set-dark') {
            document.addEventListener('DOMContentLoaded', () => opt.accion(finalVal));
        } else {
            opt.accion(finalVal);
        }
    });
})();

// Auxiliar para mantener el Wake Lock activo al volver a la pestaña
window.reestablecerWakeLock = async () => {
    const isActive = localStorage.getItem('pref-wakelock') === 'true';
    if (isActive && document.visibilityState === 'visible') {
        window.wakeLock = await navigator.wakeLock.request('screen');
    }
};