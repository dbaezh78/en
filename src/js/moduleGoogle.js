import { auth, db, loginConGoogle } from './firebase-auth.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// SVG del Icono de Google (Insignia pequeña para el estado invitado)
const googleIconSVG = `
    <svg width="14" height="14" viewBox="0 0 48 48" style="display: block;">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>`;

// --- API DE GESTIÓN DE DATOS ---
window.firebaseAPI = {
    // 1. Iniciar sesión
    login: async () => {
        try {
            await loginConGoogle();
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    },

    // 2. Cerrar sesión
    logout: async () => {
        if (confirm("¿Deseas cerrar sesión?")) {
            try {
                await signOut(auth);
                // Opcional: limpiar datos locales al salir
                // localStorage.clear(); 
                window.location.reload();
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        }
    },

    // 3. Escuchador de autenticación para componentes externos (como navigator.js)
    onAuthReady: (callback) => {
        onAuthStateChanged(auth, (user) => {
            callback(user);
        });
    },

    // 4. Guardar datos (Acordes, cejilla, etc.)
    guardarDato: (cantoId, valor, tipo) => {
        const clave = `${tipo}_${cantoId}`;
        localStorage.setItem(clave, JSON.stringify(valor));
        if (auth.currentUser) {
            const docRef = doc(db, "usuarios", auth.currentUser.uid, tipo, cantoId);
            setDoc(docRef, { valor: valor }, { merge: true })
                .catch(err => console.warn("Modo offline: Sincronización pendiente."));
        }
    },

    // 5. Obtener datos con prioridad Nube si hay internet
    obtenerDato: async (cantoId, tipo) => {
        const clave = `${tipo}_${cantoId}`;
        const localData = localStorage.getItem(clave);
        
        if (navigator.onLine && auth.currentUser) {
            try {
                const docRef = doc(db, "usuarios", auth.currentUser.uid, tipo, cantoId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const nubeValor = docSnap.data().valor;
                    localStorage.setItem(clave, JSON.stringify(nubeValor));
                    return nubeValor;
                }
            } catch (e) { console.error("Error al obtener de nube:", e); }
        }
        
        try { 
            return localData ? JSON.parse(localData) : null; 
        } catch (e) { 
            return localData; 
        }
    }
};

// --- GESTIÓN DE INTERFAZ DE USUARIO (Para auth-container tradicional) ---
onAuthStateChanged(auth, (user) => {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    if (user) {
        // ESTADO: LOGUEADO
        authContainer.innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 8px;">
                <div id="btn-login-google" class="avatar" data-action="profile" style="cursor:pointer;">
                    <img src="${user.photoURL}" alt="Perfil" 
                         style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #23a5f6; object-fit: cover; display: block;">
                </div>
                <span id="btn-logout" class="material-symbols-outlined icon-button" 
                      style="cursor:pointer; color: #bc0009; font-size: 24px; vertical-align: middle;" 
                      title="Cerrar Sesión">
                    logout
                </span>
            </div>
        `;
    } else {
        // ESTADO: INVITADO
        authContainer.innerHTML = `
            <button id="btn-login-google" class="avatarborde" data-action="login" title="Entrar con Google">
                <div style="position: relative; display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
                    <span class="material-symbols-outlined" style="font-size: 34px; color: #bc0009;">account_circle</span>
                    <div style="position: absolute; bottom: -2px; right: -2px; background: white; border-radius: 50%; padding: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
                        ${googleIconSVG}
                    </div>
                </div>
            </button>
        `;
    }
});

// --- LISTENER GLOBAL DE CLICS (UNIFICADO) ---
document.addEventListener('click', async (e) => {
    const btnLogin = e.target.closest('#btn-login-google');
    const btnLogout = e.target.closest('#btn-logout');

    if (btnLogin) {
        const action = btnLogin.dataset.action;
        if (action === 'login') {
            window.firebaseAPI.login();
        } else if (action === 'profile') {
            window.location.href = '/perfil.html';
        }
    }

    if (btnLogout) {
        window.firebaseAPI.logout();
    }
});