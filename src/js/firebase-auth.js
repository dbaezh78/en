// Importamos las librerías necesarias desde los servidores de Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCnUXqn8MXgy00Bk1lb1D_n-pxlZmcJ124",
    authDomain: "cristoresucito.firebaseapp.com",
    projectId: "cristoresucito",
    storageBucket: "cristoresucito.firebasestorage.app",
    messagingSenderId: "558116648057",
    appId: "1:558116648057:web:15db4912b0a840daa7d0a8",
    measurementId: "G-ETSQBMPBEE"
};

// 1. Inicializamos la App
const app = initializeApp(firebaseConfig);

// 2. Exportamos las herramientas (Solo una instancia de cada una)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // Usaremos este nombre

/**
 * Función para que el usuario inicie sesión con Google
 */
export async function loginConGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Usuario identificado:", result.user.displayName);
        return result.user;
    } catch (error) {
        console.error("Error al autenticar con Google:", error);
        throw error; // Lanzamos el error por si queremos manejarlo en el UI
    }
}

/**
 * Función para guardar la cejilla (transportación) del canto
 * @param {string} cantoId - El ID único del canto (ej: 'alavictimapascual')
 * @param {string} tono - El valor de la cejilla (ej: '3')
 */


/**
 * Función para guardar la cejilla (transportación) del canto
 */
export async function guardarTonoEnNube(cantoId, tono) {
    const user = auth.currentUser;
    if (user) {
        try {
            await setDoc(doc(db, "usuarios", user.uid, "transportacion", cantoId), {
                tono: tono,
                ultimaActualizacion: new Date()
            });
            console.log(`Tono ${tono} guardado para el canto ${cantoId}`);
        } catch (e) {
            console.error("Error guardando el tono:", e);
        }
    }
}