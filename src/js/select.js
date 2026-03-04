import { auth, db, loginConGoogle } from './firebase-auth.js';
import { 
    doc, setDoc, serverTimestamp, deleteDoc, 
    collection, query, onSnapshot, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// --- VARIABLES DE ESTADO ---
let listaOrdenada = [];
let todosLosCantos = [];
let snapshotActual = null;
let listasLocalesCache = []; 
let bloqueoSnapshot = false;

// --- UTILIDAD: NORMALIZADOR DE TEXTO AVANZADO ---
const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quita acentos
        .replace(/ñ/g, "n")              // ñ -> n
        .replace(/[^a-z0-9\s]/g, "")     // QUITA comas, puntos, guiones, etc.
        .trim();
};

// --- 1. MOTOR DE PERSISTENCIA LOCAL ---
const cargarDesdeEquipo = () => {
    try {
        const datosLocales = localStorage.getItem('cache_listas_personalizadas');
        if (datosLocales) {
            listasLocalesCache = JSON.parse(datosLocales);
            renderizarListasUI(listasLocalesCache);
            snapshotActual = { docs: listasLocalesCache.map(l => ({ id: l.id, data: () => l })) };
        }
    } catch (e) { console.error("Error en caché local:", e); }
};

cargarDesdeEquipo();

// --- 2. CARGA DE BASE DE DATOS (JSON) ---
fetch('data/indicecantos.json')
    .then(res => res.json())
    .then(data => { 
        todosLosCantos = data; 
        renderizarLista(todosLosCantos); 
    })
    .catch(err => console.error("Error al cargar JSON:", err));

// --- 3. SINCRONIZACIÓN ONLINE Y GESTIÓN DE PERFIL ---
// --- 3. SINCRONIZACIÓN ONLINE Y GESTIÓN DE PERFIL ---
onAuthStateChanged(auth, (user) => {
    const btnLogin = document.getElementById('btn-login-google');
    const btnLogout = document.getElementById('btn-logout-perfil');
    const userPhoto = document.getElementById('user-photo');

    // ✅ LANZAR SIEMPRE AL INICIO (Para invitados y usuarios logueados)
    detectarLinkCompartido();

    if (user) {
        console.log("👤 Sesión activa:", user.displayName);
        
        // UI de usuario
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'block';
        if (userPhoto) {
            userPhoto.src = user.photoURL || '';
            userPhoto.style.display = 'block';
            userPhoto.title = user.displayName;
        }

        // Escucha de listas (Firestore)
        const q = query(collection(db, "usuarios", user.uid, "listasPersonalizadas"), orderBy("ultimaActualizacion", "desc"));
        onSnapshot(q, (snapshot) => {
            if (bloqueoSnapshot) return; 
            if (snapshot.metadata.fromCache && listasLocalesCache.length > 0) return;
            
            snapshotActual = snapshot;
            listasLocalesCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderizarListasUI(listasLocalesCache);
            localStorage.setItem('cache_listas_personalizadas', JSON.stringify(listasLocalesCache));
        });

        // ❌ BORRADO: Ya no llamamos detectarLinkCompartido() aquí dentro

    } else {
        // No hay sesión
        if (btnLogin) btnLogin.style.display = 'block';
        if (btnLogout) btnLogout.style.display = 'none';
        if (userPhoto) userPhoto.style.display = 'none';
        
        // Si no hay sesión, mostramos lo que haya en LocalStorage (importaciones de invitados)
        const datosLocales = localStorage.getItem('cache_listas_personalizadas');
        if (datosLocales) {
            listasLocalesCache = JSON.parse(datosLocales);
            renderizarListasUI(listasLocalesCache);
        } else {
            renderizarListasUI([]); 
        }
    }
});

// --- 4. FUNCIONES DE RENDERIZADO ---
function crearTarjetaLista(idLista, data, contenedor) {
    const ids = data.ids_cantos || [];
    const nombreEscapado = data.nombre.replace(/'/g, "\\'").replace(/"/g, "&quot;");
    const div = document.createElement('div');
    div.className = 'tarjeta-lista-wrapper';
    div.innerHTML = `
        <div class="tarjeta-lista" onclick="window.toggleDetalleLista('${idLista}')">
            <div class="info-lista"><strong>${data.nombre}</strong><span>${ids.length} cantos</span></div>
            <div class="acciones-lista" onclick="event.stopPropagation()">
                <button class="btn-icono share-universal" onclick="window.compartirUniversal('${idLista}')" title="Compartir">
                    <span class="material-symbols-outlined">share</span>
                </button>
                
                <button class="btn-icono link" onclick="window.copiarSoloLink('${idLista}')" title="Copiar enlace">
                    <span class="material-symbols-outlined">link</span>
                </button>

                <button class="btn-icono export" onclick="window.exportarLista('${idLista}')" title="Descargar archivo">
                    <span class="material-symbols-outlined">download</span>
                </button>

                <button class="btn-icono edit" onclick="window.cargarListaParaEditar('${idLista}', ${JSON.stringify(ids).replace(/"/g, '&quot;')}, '${nombreEscapado}')">
                    <span class="material-symbols-outlined">edit</span>
                </button>

                <button class="btn-icono delete" onclick="window.eliminarLista('${idLista}', '${nombreEscapado}')">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
        <div id="detalle-${idLista}" class="detalle-lista-cantos cfg-close"></div>
    `;
    contenedor.appendChild(div);
}

function renderizarListasUI(listas) {
    const contenedor = document.getElementById('lista-colecciones');
    if (!contenedor) return;
    if (listas.length === 0) {
        contenedor.innerHTML = `
            <div class="status-msg-vacia">
                <p>No hay listas creadas.</p>
                <a href="javascript:void(0)" onclick="window.irANuevaLista()" class="link-crear-lista">¿Deseas crearla?</a>
            </div>`;
    } else {
        contenedor.innerHTML = '';
        listas.forEach(l => crearTarjetaLista(l.id, l, contenedor));
    }
}

function renderizarLista(lista) {
    const contenedor = document.getElementById('contenedor-seleccion');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    lista.forEach(canto => {
        const div = document.createElement('div');
        div.className = 'item-canto';
        const isChecked = listaOrdenada.includes(String(canto.id));
        div.onclick = () => window.toggleCanto(canto.id);
        div.innerHTML = `
            <span class="titulo-canto-seleccion">${canto.titulo}</span>
            <label class="switch">
                <input type="checkbox" data-id="${canto.id}" ${isChecked ? 'checked' : ''} readonly>
                <span class="slider"></span>
            </label>`;
        contenedor.appendChild(div);
    });
}

// --- 5. BUSCADORES Y LIMPIEZA ---

// A. Filtro de Selección de Cantos
window.filtrarSeleccion = () => {
    const input = document.getElementById('inputBuscadorCantos');
    const btnX = document.getElementById('btnLimpiarCantos');
    if (!input) return;

    if (btnX) btnX.style.display = input.value.length > 0 ? 'block' : 'none';

    const palabrasBusqueda = normalizarTexto(input.value).split(/\s+/).filter(p => p.length > 0);
    
    const filtrados = todosLosCantos.filter(canto => {
        const tituloNormalizado = normalizarTexto(canto.titulo);
        return palabrasBusqueda.every(palabra => tituloNormalizado.includes(palabra));
    });
    
    renderizarLista(filtrados);
};

window.limpiarBuscadorSeleccion = () => {
    const input = document.getElementById('inputBuscadorCantos');
    if (input) {
        input.value = '';
        window.filtrarSeleccion();
        input.focus();
    }
};

// B. Filtro de Mis Listados
window.filtrarMisListas = () => {
    const input = document.getElementById('inputBuscadorListas');
    const btnX = document.getElementById('btnLimpiarListas');
    if (!input) return;

    if (btnX) btnX.style.display = input.value.length > 0 ? 'block' : 'none';

    const busqueda = normalizarTexto(input.value);
    const filtradas = listasLocalesCache.filter(l => 
        normalizarTexto(l.nombre).includes(busqueda)
    );
    renderizarListasUI(filtradas);
};

window.limpiarBuscadorListas = () => {
    const input = document.getElementById('inputBuscadorListas');
    if (input) {
        input.value = '';
        window.filtrarMisListas();
        input.focus();
    }
};


// B. Filtro de Mis Listados
window.filtrarMisListas = () => {
    const input = document.getElementById('inputBuscadorListas');
    const btnX = document.getElementById('btnLimpiarListas');
    if (!input) return;

    if (btnX) btnX.style.display = input.value.length > 0 ? 'block' : 'none';

    const busqueda = normalizarTexto(input.value);
    const filtradas = listasLocalesCache.filter(l => 
        normalizarTexto(l.nombre).includes(busqueda)
    );
    renderizarListasUI(filtradas);
};

window.limpiarBuscadorListas = () => {
    const input = document.getElementById('inputBuscadorListas');
    if (input) {
        input.value = '';
        window.filtrarMisListas();
        input.focus();
    }
};

// B. Filtro de Mis Listados Guardados
window.filtrarMisListas = () => {
    const input = document.getElementById('inputBuscadorListas');
    const btnX = document.getElementById('btnLimpiarListas');
    if (!input) return;

    if (btnX) btnX.style.display = input.value.length > 0 ? 'block' : 'none';

    const busqueda = normalizarTexto(input.value);
    const filtradas = listasLocalesCache.filter(l => 
        normalizarTexto(l.nombre).includes(busqueda)
    );
    
    renderizarListasUI(filtradas);
};

// Limpiar buscador de mis listas
window.limpiarBuscadorListas = () => {
    const input = document.getElementById('inputBuscadorListas');
    if (input) {
        input.value = '';
        window.filtrarMisListas(); // Reset lista y oculta X
        input.focus();
    }
};

// --- 6. LÓGICA DE NEGOCIO ---
window.toggleCanto = (id) => {
    const stringId = String(id);
    const index = listaOrdenada.indexOf(stringId);
    index !== -1 ? listaOrdenada.splice(index, 1) : listaOrdenada.push(stringId);
    actualizarInterfazSeleccion();
};

function actualizarInterfazSeleccion() {
    const contador = document.getElementById('contador-seleccion');
    if (contador) contador.innerText = listaOrdenada.length;
    const cola = document.getElementById('cola-seleccion');
    if (cola) {
        cola.innerHTML = '';
        listaOrdenada.forEach((id, i) => {
            const canto = todosLosCantos.find(c => String(c.id) === id);
            if (canto) {
                const tag = document.createElement('div');
                tag.className = 'canto-tag';
                tag.innerHTML = `<span>${i + 1}</span> ${canto.titulo}`;
                tag.onclick = (e) => { e.stopPropagation(); window.toggleCanto(id); };
                cola.appendChild(tag);
            }
        });
    }
    document.querySelectorAll('.item-canto input[type="checkbox"]').forEach(input => {
        const idInput = input.getAttribute('data-id');
        input.checked = listaOrdenada.includes(String(idInput));
    });
}

window.guardarListaFirebase = async () => {
    const nombre = document.getElementById('nombreLista').value.trim();
    const user = auth.currentUser;
    if (!nombre || listaOrdenada.length === 0) return alert("Faltan datos.");

    const listaId = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    const nuevaLista = { id: listaId, nombre, ids_cantos: [...listaOrdenada], ultimaActualizacion: new Date().toISOString() };

    let cache = JSON.parse(localStorage.getItem('cache_listas_personalizadas') || "[]");
    const idx = cache.findIndex(l => l.id === listaId);
    idx !== -1 ? cache[idx] = nuevaLista : cache.unshift(nuevaLista);
    localStorage.setItem('cache_listas_personalizadas', JSON.stringify(cache));

    if (user) {
        try { 
            await setDoc(doc(db, "usuarios", user.uid, "listasPersonalizadas", listaId), { ...nuevaLista, ultimaActualizacion: serverTimestamp() }); 
        } catch (e) { console.warn("Offline."); }
    }
    location.reload(); 
};

window.eliminarLista = async (idLista, nombreLista) => {
    if (confirm(`¿Eliminar "${nombreLista}"?`)) {
        let cache = JSON.parse(localStorage.getItem('cache_listas_personalizadas') || "[]");
        cache = cache.filter(l => l.id !== idLista);
        localStorage.setItem('cache_listas_personalizadas', JSON.stringify(cache));
        if (auth.currentUser) await deleteDoc(doc(db, "usuarios", auth.currentUser.uid, "listasPersonalizadas", idLista));
        location.reload();
    }
};

// --- 7. SISTEMA DE COMPARTIR ---
// --- 7. SISTEMA DE COMPARTIR ---

// FUNCIÓN A: Compartir Universal (Móvil / WhatsApp)
window.compartirUniversal = async (idLista) => {
    const lista = listasLocalesCache.find(l => l.id === idLista);
    if (!lista) return;

    try {
        const idCorto = Math.random().toString(36).substring(2, 8);
        const docRef = doc(db, "listasCompartidas", idCorto);
        
        await setDoc(docRef, {
            n: lista.nombre,
            i: lista.ids_cantos,
            creado: serverTimestamp()
        });

        const urlFinal = `${window.location.origin}${window.location.pathname}?v=${idCorto}`;
        const mensaje = `🎼 Lista: *${lista.nombre}*`;

        if (navigator.share) {
            // Abre el menú nativo en móviles (WhatsApp, Telegram, etc.)
            await navigator.share({
                title: lista.nombre,
                text: mensaje,
                url: urlFinal,
            });
        } else {
            // Respaldo para PC: Abre WhatsApp Web
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje + "\n" + urlFinal)}`;
            window.open(whatsappUrl, '_blank');
        }
    } catch (e) { 
        console.error("Error al compartir universal:", e); 
    }
};

// FUNCIÓN B: Solo Copiar Link (Icono de cadena)
window.copiarSoloLink = async (idLista) => {
    const lista = listasLocalesCache.find(l => l.id === idLista);
    if (!lista) return;

    try {
        const idCorto = Math.random().toString(36).substring(2, 8);
        const docRef = doc(db, "listasCompartidas", idCorto);
        
        await setDoc(docRef, {
            n: lista.nombre,
            i: lista.ids_cantos,
            creado: serverTimestamp()
        });

        const urlFinal = `${window.location.origin}${window.location.pathname}?v=${idCorto}`;
        
        await navigator.clipboard.writeText(urlFinal);
        alert("Enlace copiado al portapapeles");
        
    } catch (e) { 
        console.error("Error al copiar link:", e);
        alert("No se pudo generar el enlace.");
    }
};



// --- FUNCIÓN 2: SOLO COPIAR EL LINK (Icono cadena) ---
window.copiarSoloLink = async (idLista) => {
    const lista = listasLocalesCache.find(l => l.id === idLista);
    if (!lista) return;

    try {
        const idCorto = Math.random().toString(36).substring(2, 8);
        await setDoc(doc(db, "listasCompartidas", idCorto), {
            n: lista.nombre,
            i: lista.ids_cantos,
            creado: serverTimestamp()
        });

        const urlFinal = `${window.location.origin}${window.location.pathname}?v=${idCorto}`;
        await navigator.clipboard.writeText(urlFinal);
        alert("Enlace copiado al portapapeles");
    } catch (e) { console.error("Error copy:", e); }
};




window.exportarLista = (idLista) => {
    const lista = listasLocalesCache.find(l => l.id === idLista);
    if (!lista) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lista));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Resucito_${lista.nombre.replace(/\s+/g, '_')}.resucito`);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

window.importarLista = (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const l = JSON.parse(e.target.result);
            l.id = "imp-" + Date.now();
            
            // Verificamos si ya tiene el icono para no duplicarlo
            if (!l.nombre.includes("📂") && !l.nombre.includes("🔗")) {
                l.nombre = "📂 " + l.nombre;
            }

            let cache = JSON.parse(localStorage.getItem('cache_listas_personalizadas') || "[]");
            cache.unshift(l);
            localStorage.setItem('cache_listas_personalizadas', JSON.stringify(cache));
            
            if (auth.currentUser) {
                await setDoc(doc(db, "usuarios", auth.currentUser.uid, "listasPersonalizadas", l.id), { 
                    ...l, 
                    ultimaActualizacion: serverTimestamp() 
                });
            }
            location.reload();
        } catch (err) { alert("Archivo no válido."); }
    };
    reader.readAsText(archivo);
};

// --- 8. UTILIDADES ---
window.irANuevaLista = () => {
    const contentNueva = document.getElementById('content-nueva-lista');
    if (contentNueva && contentNueva.classList.contains('cfg-close')) {
        window.toggleSection('content-nueva-lista', 'wrapper-nueva-lista');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { document.getElementById('nombreLista')?.focus(); }, 500);
};

window.toggleDetalleLista = (idLista) => {
    const detalleDiv = document.getElementById(`detalle-${idLista}`);
    if (!detalleDiv || !snapshotActual) return;
    const estaCerrado = detalleDiv.classList.contains('cfg-close');
    document.querySelectorAll('.detalle-lista-cantos').forEach(d => d.classList.add('cfg-close'));
    if (estaCerrado) {
        detalleDiv.classList.remove('cfg-close');
        const source = snapshotActual.docs || snapshotActual;
        const docSnap = source.find(d => d.id === idLista);
        const data = docSnap.data ? docSnap.data() : docSnap;
        detalleDiv.innerHTML = data.ids_cantos.map((id, i) => {
            const c = todosLosCantos.find(can => String(can.id) === String(id));
            return `<div class="sub-item-canto" onclick="window.abrirVisorCanto('${id}')">
                <span class="num">${i + 1}</span><span>${c ? c.titulo : id}</span>
            </div>`;
        }).join('');
    }
};

window.cargarListaParaEditar = (docId, ids, nombre) => {
    listaOrdenada = [...ids];
    document.getElementById('nombreLista').value = nombre;
    if (document.getElementById('content-nueva-lista').classList.contains('cfg-close')) {
        window.toggleSection('content-nueva-lista', 'wrapper-nueva-lista');
    }
    actualizarInterfazSeleccion();
    renderizarLista(todosLosCantos);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.abrirVisorCanto = (idCanto) => {
    const modal = document.getElementById('modalVisorCanto');
    const contenido = document.getElementById('contenidoCantoVisor');
    if (!modal || !contenido) return;
    modal.classList.remove('cfg-close');
    document.body.style.overflow = 'hidden';
    contenido.innerHTML = `<iframe src="./index.html?canto=${idCanto}" style="width:100%; height:100%; border:none; background: white;"></iframe>`;
};

window.confirmarCerrarVisor = () => {
    const modal = document.getElementById('modalVisorCanto');
    if (modal) modal.classList.add('cfg-close');
    document.getElementById('contenidoCantoVisor').innerHTML = '';
    document.body.style.overflow = 'auto';
};

window.toggleSection = (contentId, wrapperId) => {
    const content = document.getElementById(contentId);
    const wrapper = document.getElementById(wrapperId);
    if (content && wrapper) {
        content.classList.toggle('cfg-close');
        wrapper.classList.toggle('collapsed');
    }
};







// --- DETECCIÓN DE COMPARTIDO CON REFRESH FORZOSO Y SOPORTE DE ACENTOS ---
import { getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const detectarLinkCompartido = async () => {
    const params = new URLSearchParams(window.location.search);
    const idCorto = params.get('v'); 
    const shareLargo = params.get('sh') || params.get('share'); 

    if (idCorto || shareLargo) {
        bloqueoSnapshot = true;
        try {
            let datosCanto;

            if (idCorto) {
                // --- MODO CORTO: BUSCAR EN FIREBASE ---
                const docRef = doc(db, "listasCompartidas", idCorto);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    datosCanto = docSnap.data();
                } else {
                    alert("El enlace ha expirado o no existe.");
                    bloqueoSnapshot = false;
                    return;
                }
            } else {
                // --- MODO LARGO: DECODIFICAR URL (Soporte legado) ---
                const binString = atob(shareLargo);
                const uint8Array = Uint8Array.from(binString, (m) => m.charCodeAt(0));
                const decoded = new TextDecoder().decode(uint8Array);
                const data = JSON.parse(decoded);
                datosCanto = Array.isArray(data) ? { n: data[0], i: data[1] } : data;
            }

            if (datosCanto && datosCanto.n && datosCanto.i) {
                const idFinal = "imp-" + Date.now();
                let nombreLimpio = datosCanto.n.replace(/🔗/g, '').replace(/📂/g, '').trim();
                const nl = { 
                    id: idFinal, 
                    nombre: "🔗 " + nombreLimpio, 
                    ids_cantos: datosCanto.i, 
                    ultimaActualizacion: new Date().toISOString() 
                };

                // 1. Guardar local (Para todos, invitados y logueados)
                let cache = JSON.parse(localStorage.getItem('cache_listas_personalizadas') || "[]");
                cache.unshift(nl);
                localStorage.setItem('cache_listas_personalizadas', JSON.stringify(cache));

                // 2. Guardar en la nube (Solo si está logueado)
                if (auth.currentUser) {
                    const userRef = doc(db, "usuarios", auth.currentUser.uid, "listasPersonalizadas", idFinal);
                    await setDoc(userRef, { ...nl, ultimaActualizacion: serverTimestamp() });
                }

                // 3. Limpiar URL y recargar
                window.location.href = window.location.origin + window.location.pathname;
            }
        } catch (e) {
            console.error("❌ Error en importación:", e);
            bloqueoSnapshot = false;
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
};


// Activar Login al presionar el icono de perfil
document.getElementById('btn-login-google')?.addEventListener('click', async () => {
    try {
        await loginConGoogle();
        // No hace falta recargar, onAuthStateChanged detectará el cambio y mostrará la foto
    } catch (err) {
        console.error("Fallo en el login:", err);
    }
});

// Activar Login
document.getElementById('btn-login-google')?.addEventListener('click', async () => {
    try {
        await loginConGoogle();
    } catch (err) {
        console.error("Fallo en el login:", err);
    }
});

/* HE COMENTADO AQUI, PARA QUE NO SALGA DOS VECES EL MENSAJE DE CIERRE DE SESSION
// Activar Logout
document.getElementById('btn-logout-perfil')?.addEventListener('click', async () => {
    if (confirm("¿Cerrar sesión?")) {
        try {
            await signOut(auth);
            localStorage.removeItem('cache_listas_personalizadas');
            window.location.reload();
        } catch (error) {
            console.error("Error al salir:", error);
        }
    }
});*/