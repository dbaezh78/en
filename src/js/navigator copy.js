(function() {
    // 1. Inyectar el archivo CSS automáticamente
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/css/navigator.css';
    link.href = '/src/css/setting.css';
    document.head.appendChild(link);

    const linkSettings = document.createElement('link');
    linkSettings.rel = 'stylesheet';
    linkSettings.href = '/src/css/setting.css'; // Verifica que esta ruta sea la correcta
    document.head.appendChild(linkSettings);

    // 2. Inyectar el archivo JS de ajustes (Corregido)
    const scriptSettings = document.createElement('script');
    scriptSettings.src = '/src/js/setting.js';
    document.head.appendChild(scriptSettings);

    // 3. Crear el HTML de la navegación
    const navHTML = `
        <div class="nav-bottom-bar">
            <a href="/" class="nav-item">
                <span class="material-symbols-outlined">home</span>
                <span>Inicio</span>
            </a>

            <button class="nav-item" id="btn-nav-menu">
                <span class="material-symbols-outlined">menu</span>
                <span>Menú</span>
                <div class="nav-submenu" id="nav-submenu">
                    <a href="https://www.youtube.com/@CristoJesusReydereyes" target="_blank"><span class="material-symbols-outlined">youtube_activity</span> YouTube</a>
                    <a href="https://www.facebook.com/groups/721999947892692" target="_blank"><span class="material-symbols-outlined">communities</span> Facebook</a>
                    <a href="https://dbaezh78.github.io/salterios/" target="_blank"><span class="material-symbols-outlined">prayer_times</span> Laudes</a>
                    <a href="https://dbaezh78.github.io/ev/" target="_blank"><span class="material-symbols-outlined">book_2</span> Evangelio del Día</a>
                    <a href="#"><span class="material-symbols-outlined">group</span> Comunidad Cantor</a>
                </div>
            </button>

            <button class="nav-item" id="btn-nav-neocate">
                <span class="material-symbols-outlined">church</span>
                <span>NeoCate</span>
                <div class="nav-submenu" id="nav-submenu-neocate">
                    <a href="https://neocatechumenaleiter.org/noticias/"><span class="material-symbols-outlined">newspaper</span> Noticias</a>
                    <a href="/info.html"><span class="material-symbols-outlined">info</span> Info</a>
                    <a href="/comunidades.html"><span class="material-symbols-outlined">groups</span> Comunidades</a>
                    <a href="/cantores.html"><span class="material-symbols-outlined">record_voice_over</span> Cantores</a>
                </div>
            </button>

            <button class="nav-item" id="btn-nav-resucito">
                <span class="material-symbols-outlined">menu_book</span>
                <span>Resucitó</span>
                <div class="nav-submenu" id="nav-submenu-resucito">
                    <a href="/"><span class="material-symbols-outlined">home</span> Inicio</a>
                    <a href="/src/select.html"><span class="material-symbols-outlined">playlist_add</span> Nueva Lista</a>
                    <a href="/perfil.html"><span class="material-symbols-outlined">person</span> Perfil</a>
                    <a href="/src/html/intro.html"><span class="material-symbols-outlined">menu_book</span> Introducción</a>
                    <a href="/catequesis.html"><span class="material-symbols-outlined">history_edu</span> Catequesis</a>
                </div>
            </button>

            <button class="nav-item" id="btn-open-settings">
                <span class="material-symbols-outlined">settings</span>
                <span>Ajustes</span>
            </button>

            <a id="nav-google-auth" class="nav-item">
                <span class="material-symbols-outlined" id="nav-auth-icon">account_circle</span>
                <span id="nav-auth-text">Entrar</span>
            </a>

            <a id="nav-logout" class="nav-item" style="display:none;">
                <span class="material-symbols-outlined">logout</span>
                <span>Salir</span>
            </a>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', navHTML);

    // --- LÓGICA DE SUBMENÚS ---
    const setupSubmenu = (btnId, menuId) => {
        const btn = document.getElementById(btnId);
        const menu = document.getElementById(menuId);
        if (btn && menu) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.nav-submenu').forEach(m => {
                    if (m !== menu) m.classList.remove('active');
                });
                menu.classList.toggle('active');
            });
        }
    };

    setupSubmenu('btn-nav-menu', 'nav-submenu');
    setupSubmenu('btn-nav-neocate', 'nav-submenu-neocate');
    setupSubmenu('btn-nav-resucito', 'nav-submenu-resucito');

    document.addEventListener('click', () => {
        document.querySelectorAll('.nav-submenu').forEach(m => m.classList.remove('active'));
    });

    // --- LÓGICA DE AUTENTICACIÓN ---
    const updateAuthUI = (user) => {
        const icon = document.getElementById('nav-auth-icon');
        const text = document.getElementById('nav-auth-text');
        const btnAuth = document.getElementById('nav-google-auth');
        const btnLogout = document.getElementById('nav-logout');

        if (!btnAuth || !icon || !text || !btnLogout) return;

        if (user) {
            icon.innerHTML = user.photoURL 
                ? `<img src="${user.photoURL}" style="width:24px; height:24px; border-radius:50%; border:1px solid #ccc;">`
                : `<span class="material-symbols-outlined">person</span>`;
            text.innerText = "Perfil";
            btnAuth.onclick = () => window.location.href = '/perfil.html';
            btnLogout.style.display = "flex";
            btnLogout.onclick = async () => {
                if (window.firebaseAPI?.logout) await window.firebaseAPI.logout();
                else location.reload();
            };
        } else {
            icon.innerHTML = "account_circle";
            text.innerText = "Entrar";
            btnAuth.onclick = () => window.firebaseAPI?.login?.();
            btnLogout.style.display = "none";
        }
    };

    if (window.firebaseAPI?.onAuthReady) {
        window.firebaseAPI.onAuthReady(updateAuthUI);
    } else {
        const checkInterval = setInterval(() => {
            if (window.firebaseAPI?.onAuthReady) {
                window.firebaseAPI.onAuthReady(updateAuthUI);
                clearInterval(checkInterval);
            }
        }, 500);
    }
})();

// --- LÓGICA DE AJUSTES
// Listener para abrir el modal
document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-open-settings') || e.target.closest('#btn-open-settings-inner')) {
        e.preventDefault();
        abrirModalConfiguracion();
    }
});

function abrirModalConfiguracion() {
    if (document.getElementById('modal-global-settings')) return;

    const modal = document.createElement('div');
    modal.id = 'modal-global-settings';
    modal.className = 'settings-overlay';
    
    modal.onclick = (e) => {
        if (e.target.id === 'modal-global-settings') cerrarModalConfiguracion();
    };

    modal.innerHTML = `
        <div class="settings-frame">
            <div class="settings-header">
                <h2>
                    <span class="material-symbols-outlined" style="color:#bc0009">settings</span>
                    Configuración
                </h2>
                <button onclick="cerrarModalConfiguracion()" class="btn-close-settings">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="settings-content">
                ${window.generarContenidoSettings()} 
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    document.addEventListener('keydown', manejarEscapeSettings);
}
// Función para manejar la tecla Esc
function manejarEscapeSettings(e) {
    if (e.key === "Escape") {
        cerrarModalConfiguracion();
    }
}

window.cerrarModalConfiguracion = function() {
    const modal = document.getElementById('modal-global-settings');
    if (modal) {
        modal.classList.remove('active');
        // Quitar el listener de escape al cerrar
        document.removeEventListener('keydown', manejarEscapeSettings);
        setTimeout(() => modal.remove(), 300);
    }
};