// src/js/logout.js
import { auth } from './firebase-auth.js'; 
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1: Control de visibilidad y acceso
onAuthStateChanged(auth, (user) => {
    const btnLogout = document.getElementById('btn-logout-perfil');
    const seccionNueva = document.getElementById('wrapper-nueva-lista');
    const seccionMisListas = document.getElementById('wrapper-mis-listas');

    // Siempre mostramos las secciones para permitir modo offline
    if (seccionNueva) seccionNueva.style.display = 'block';
    if (seccionMisListas) seccionMisListas.style.display = 'block';

    if (user) {
        if (btnLogout) btnLogout.style.display = 'inline-block';
        console.log("Sesión activa sincronizando...");
    } else {
        if (btnLogout) btnLogout.style.display = 'none';
        // REDIRECCIÓN ELIMINADA: Ahora permitimos modo offline
        console.log("Modo Equipo: Operando sin cuenta.");
    }
});

// 2: Lógica del botón de cerrar sesión
document.getElementById('btn-logout-perfil')?.addEventListener('click', () => {
    if (confirm("¿Deseas cerrar la sesión?")) {
        signOut(auth).then(() => {
            window.location.href = '/index.html';
        }).catch((error) => console.error("Error:", error));
    }
});


// 3: Función para colapsar secciones
        function toggleSection(contentId, wrapperId) {
            const content = document.getElementById(contentId);
            const wrapper = document.getElementById(wrapperId);
            if (content && wrapper) {
                content.classList.toggle('cfg-close');
                wrapper.classList.toggle('collapsed');
            }
        }

// 4: Función de cierre que será llamada desde el iframe (index.html)
        window.confirmarCerrarVisor = () => {
            const modal = document.getElementById('modalVisorCanto');
            const contenido = document.getElementById('contenidoCantoVisor');
            if (modal) modal.classList.add('cfg-close');
            if (contenido) contenido.innerHTML = ''; 
            document.body.style.overflow = 'auto';
        };
