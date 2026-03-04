// 1: INICIO DE PERFIL JS
import { auth, db } from './firebase-auth.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- 1. VARIABLES GLOBALES ---
let etapaGuardada = null;
const CODIGO_ADMIN_SECRETO = "RE77"; 
let ALMACEN_CANTOS = {};
window.cacheData = {}; 
window.indiceCantosGlobal = [];

// 2: PROCESO DE CARGA EN SEGUNDO PLANO (SILENCIOSO)
const cargarDatosBaseSilenciosos = async () => {
    try {
        // Cargar JSON de cantos
        const response = await fetch('src/data/indicecantos.json');
        window.indiceCantosGlobal = await response.json();
        console.log("✅ Datos base cargados en segundo plano.");

        // Llenar RAM desde LocalStorage (Carga instantánea)
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('data-')) {
                const cantoId = key.replace('data-', '');
                try {
                    const localData = JSON.parse(localStorage.getItem(key));
                    if (localData) ALMACEN_CANTOS[cantoId] = localData;
                } catch (e) { }
            }
        });

        // Preparar selectores (Países y Comunidades)
        await cargarPaisesEIP();
        llenarComunidades();
    } catch (err) {
        console.error("❌ Error en carga silenciosa:", err);
    }
};

// Disparo inmediato de la carga silenciosa
cargarDatosBaseSilenciosos();

// 3: OBSERVADOR DE AUTENTICACIÓN (EL PORTERO)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("👤 Usuario verificado:", user.uid);
        
        // Eliminamos el aviso de bloqueo si existe
        const aviso = document.getElementById('overlay-auth-aviso');
        if (aviso) aviso.remove();

        // A. Cargamos perfil (País, Parroquia, etc.)
        const docRef = doc(db, "usuarios", user.uid, "perfil", "config");
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                aplicarDatosPerfilAInputs(docSnap.data()); 
            }
        } catch (e) { console.warn("Error perfil:", e); }

        // B. ESPERAMOS a la nube (Sección 35)
        // Esto evita que la tabla salga vacía o "congelada"
        if (typeof window.sincronizarTodoARam === 'function') {
            await window.sincronizarTodoARam(); 
        }

        // C. Dibujamos la tabla
        await renderizarTablaCantos();

    } else {
        // SI NO HAY SESIÓN: Bloqueo inmediato
        if (window.location.pathname.includes('perfil.html')) {
            mostrarBloqueoAcceso(); // Función de la Sección 4
        }
    }
});

// 4: Muestra el modal de bloqueo
function mostrarBloqueoAcceso() {
    if (document.getElementById('overlay-auth-aviso')) return;

    const overlay = document.createElement('div');
    overlay.id = "overlay-auth-aviso";
    overlay.className = "auth-overlay"; // Usa la clase de perfil.css
    overlay.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);";
    overlay.innerHTML = `
        <div class="auth-modal" style="background: white; padding: 40px 30px; border-radius: 20px; max-width: 380px; width: 90%; text-align: center; font-family: sans-serif; box-shadow: 0 15px 35px rgba(0,0,0,0.5);">
            <span class="material-symbols-outlined" style="font-size: 70px; color: #bc0009;">lock_open</span>
            <h2 style="margin: 20px 0 10px; color: #1d1d1f; font-size: 24px;">Cuenta Necesaria</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
            
            Para entrar al perfil, necesitas usar tu cuenta de Google. Se sincronizaran tus acordes y cejillas con los cantos.
            
            </p>


            <div class="auth-buttons" style="display: flex; flex-direction: column; gap: 15px;">
                <button class="btn-auth-login" onclick="window.firebaseAPI.login()" style="background: #bc0009; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; font-size: 16px; cursor: pointer;">Iniciar Sesión con Google</button>
                <button class="btn-auth-back" onclick="window.location.href='../../index.html'" style="background: #f0f0f2; color: #333; border: none; padding: 15px; border-radius: 12px; font-weight: bold; font-size: 16px; cursor: pointer;">Volver al Inicio</button>
            </div>
            <p class="auth-footer" style="margin-top: 25px; font-size: 13px; color: #999;">Puedes seguir usando el libro de canto sin cuenta, pero tus ajustes no se guardarán en la nube.</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

// 5: Función auxiliar para aplicar datos a selectores
function aplicarDatosPerfilAInputs(data) {
    const selPais = document.getElementById('userCountry');
    const selParr = document.getElementById('userParroquia');
    const selComu = document.getElementById('userComunidad');
    const selStep = document.getElementById('userStep');

    if (selParr) selParr.value = data.parroquia || "";
    if (selStep) {
        selStep.value = data.etapa || "0";
        etapaGuardada = parseInt(data.etapa) || 0;
    }

    if (selPais && data.pais) {
        const intP = setInterval(() => {
            if (selPais.options.length > 1) {
                selPais.value = data.pais;
                clearInterval(intP);
                llenarComunidades();
                const intC = setInterval(() => {
                    if (selComu && selComu.options.length > 1) {
                        selComu.value = data.comunidad || "1";
                        clearInterval(intC);
                    }
                }, 100);
            }
        }, 100);
    }
}

 // 6: MAPA DE ACORDES
const MAPA_ACORDES = {
    "0": "La m",
    "1": "Si b m",
    "2": "Si m",
    "3": "Do m",
    "4": "Do# m",
    "5": "Re m",
    "6": "Re# m",
    "7": "Mi m",
    "8": "Fa m",
    "9": "Fa# m",
    "10": "Sol m",
    "11": "Sol# m"
};

// 7: INICIALIZACIÓN: Llena comunidades, países y CARGA LA RAM (ALMACEN_CANTOS)
document.addEventListener('DOMContentLoaded', async () => {
    llenarComunidades();
    await cargarPaisesEIP();

    // >>> NUEVO: LLENADO DE RAM DESDE LOCALSTORAGE <<<
    // Esto recorre tu "Escudo" y lo mete a la RAM de un solo golpe
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('data-')) {
            const cantoId = key.replace('data-', '');
            try {
                const localData = JSON.parse(localStorage.getItem(key));
                if (localData) {
                    ALMACEN_CANTOS[cantoId] = localData;
                }
            } catch (e) {
                console.error("Error cargando RAM inicial:", e);
            }
        }
    });

    // Recuperar la preferencia del switch del teléfono
    const pref = localStorage.getItem('preferencia_sync');
    const toggle = document.getElementById('syncToggle');
    if (toggle && pref !== null) {
        toggle.checked = (pref === 'true');
    }
});


// 11: RENDERIZADO DE TABLA 
async function renderizarTablaCantos() {
    const contenedor = document.getElementById('lista-cantos-gestion');
    if (!contenedor) return;

    try {
        const response = await fetch('src/data/indicecantos.json');
        const cantos = await response.json();

        let html = `
            <div class="buscador-container" style="position: relative; width: 100%; margin-bottom: 15px;">
                <input id="inputBuscador" type="text" placeholder="🔍 Buscar canto..." oninput="window.filtrarCantos()" 
                style="width:100%; max-width:100%; padding:10px 40px 10px 10px; border-radius:20px; border:1px solid #ccc; box-sizing: border-box;">
    
                <span onclick="window.limpiarBuscador()" 
                    style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #888; font-size: 20px; font-weight: bold; display: none;" 
                    id="btnLimpiar">
                    &times;
                </span>
            </div>
            
            <table class="tabla-gestion" id="tablaCantos">
                <thead>
                    <tr>
                        <th>Canto</th>
                        <th>Rate</th> <th>Online</th>     <th>Uso</th>        <th>Cejilla (Or/Tu)</th> <th>Acorde (Or/Tu)</th>  </tr>
                </thead>
                <tbody id="cuerpo-tabla-perfil">`;

        cantos.forEach(canto => {
            const datosRAM = ALMACEN_CANTOS[canto.id] || null;
            
            const cejillaVisual = datosRAM ? (datosRAM.cejilla === "0" ? "-" : datosRAM.cejilla) : ""; 
            const numAcorde = datosRAM ? String(datosRAM.acorde) : null;
            
            // Usamos tu lógica de MAPA_ACORDES o la que inyecta S5 después
            const acordeTexto = (numAcorde !== null && MAPA_ACORDES[numAcorde]) ? MAPA_ACORDES[numAcorde] : "";

            let fechaTexto = "---";
            if (datosRAM && (datosRAM.fecha || datosRAM.valor)) {
                const fRaw = datosRAM.fecha || datosRAM.valor;
                const f = new Date(fRaw);
                if (!isNaN(f.getTime())) {
                    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
                    fechaTexto = `${String(f.getDate()).padStart(2, '0')} ${meses[f.getMonth()]}`;
                }
            }

            const enlaceCanto = `src/index.html?canto=${canto.id}${numAcorde ? '&tonalidad='+numAcorde : ''}${datosRAM?.cejilla ? '&cejilla='+datosRAM.cejilla : ''}`;

            html += `
                <tr class="fila-canto" id="fila-${canto.id}">
                    <td style="text-align:left;">
                        <a href="${enlaceCanto}" id="enlace-${canto.id}" class="listcanto">
                            ${canto.titulo}
                        </a>
                    </td>
                    <td id="valoracion-${canto.id}">...</td>
                    
                    <td id="status-${canto.id}">⌛</td>
                    
                    <td id="uso-${canto.id}">
                        ${fechaTexto} <span onclick="event.stopPropagation(); window.abrirCalendario('${canto.id}')" style="cursor:pointer; font-size:16px;">📅</span>
                    </td>
                    
                    <td>${canto.cejilla ?? 0} / <b id="cejilla-tu-${canto.id}" style="color: #bc0009;">${cejillaVisual}</b></td>
                    
                    <td>${canto.acorde ?? 'N/A'} / <b id="acorde-tu-${canto.id}" style="color: #bc0009;">${acordeTexto}</b></td>
                </tr>`;
        });

        html += `</tbody></table>`;
        contenedor.innerHTML = html;

        completarDatosLentamente(cantos);

    } catch (e) {
        console.error("Error en tabla:", e);
    }
}
// FIN 11. RENDERIZADO DE TABLA



// 12: COMPLETAR DATOS:
async function completarDatosLentamente(cantos) {
    const user = auth.currentUser;
    if (!user) return;

    const cache = await caches.open('cantos-cache-v2.09');
    
    // 1. Detectamos el estado del interruptor de sincronización
    const syncToggle = document.getElementById('syncToggle');
    const syncActiva = syncToggle ? syncToggle.checked : true;

    // PROCESO 1: Carga instantánea desde el almacenamiento local (LocalStorage)
    // Esto hace que la tabla no se vea vacía mientras esperamos a Firebase
    cantos.forEach(async (canto) => {
        // A. Verificar estado de descarga (Online/Offline)
        const urlCanto = `src/css/pg/${canto.id}.css`;
        const estaCargado = await cache.match(urlCanto);
        const celdaStatus = document.getElementById(`status-${canto.id}`);
        
        if (celdaStatus) {
            const iconoEstado = estaCargado 
                ? '<span style="color: #28a745;"></span>' 
                : '<span style="color: #ff0000;"></span>';

                /*
                ? '<span style="color: #28a745;">✅ Online</span>' 
                : '<span style="color: #ff0000;">❌ Offline</span>';
                */
            
            celdaStatus.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0px; justify-content: center;">
                    ${iconoEstado}
                    <input type="checkbox" ${estaCargado ? 'checked' : ''} 
                            onchange="window.gestionarMemoria('${canto.id}', this.checked)">
                </div>`;
        }

        // B. Cargar datos locales (Escudo)
        const localData = localStorage.getItem(`data-${canto.id}`);
        if (localData) {
            // Pintamos inmediatamente lo que ya conocemos localmente (punto verde local)
            inyectarDatosEnTabla(canto.id, JSON.parse(localData), true);
        }
    });

    // PROCESO 2: Sincronización Real-Time con Firebase (dbdata)
    if (syncActiva) {
        console.log("🔄 Sincronizando dbdata con la nube...");
        // Llamamos a la Sección 21 que ya configuramos para mapear acorde y cejilla
        await sincronizarTodoARam();
        
        // OPCIONAL: Si después de sincronizar algunos siguen en "---", 
        // les ponemos el valor por defecto "La m"
        cantos.forEach(canto => {
            const elAco = document.getElementById(`acorde-tu-${canto.id}`);
            if (elAco && elAco.innerText === "---") {
                elAco.innerText = "La m";
            }
        });
    }
}

// FIN 12: COMPLETAR DATOS


// 13: INYECTAR DATOS (LOGICA DIRECTA + BLINDAJE DE MENORES)
window.inyectarDatosEnTabla = function(cantoId, data, esLocal = false) {
    const elCej = document.getElementById(`cejilla-tu-${cantoId}`);
    const elAco = document.getElementById(`acorde-tu-${cantoId}`);
    const elUso = document.getElementById(`uso-${cantoId}`);
    const fila = document.getElementById(`fila-${cantoId}`);

       // 5.A Valoracion de Estrllas 
        const elVal = document.getElementById(`valoracion-${cantoId}`);
        if (elVal) {
            // Aquí usamos la valoración que normalizamos en el paso anterior
            const puntos = parseInt(data.valoracion) || 0; 
            let estrellasHTML = '<div class="estrellas-contenedor" style="cursor:pointer; font-size: 18px;">';
            
            for (let i = 1; i <= 5; i++) {
                const color = (i <= puntos) ? '#FFD700' : '#C0C0C0'; 
                estrellasHTML += `<span onclick="guardarValoracion('${cantoId}', ${i})" style="color: ${color}; padding: 0 1px;">★</span>`;
            }
            
            estrellasHTML += '</div>';
            elVal.innerHTML = estrellasHTML;
        }

    if (elCej) {
        const valorCej = data.cejilla || "0";
        elCej.innerText = (valorCej === "0") ? "-" : valorCej;
    }
    
        if (elAco) {
            const cords = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "Si♭", "Si"];
            const t = (data.acorde !== undefined) ? parseInt(data.acorde) : 0;

            // Buscamos en la variable global que cargamos arriba
            const lista = window.indiceCantosGlobal || [];
            const cantoMaestro = lista.find(c => String(c.id) === String(cantoId));

            if (!cantoMaestro) {
                // Si el JSON aún no llega, ponemos un estado de carga
                elAco.innerHTML = `<span style="color:gray;">Cargando...</span>`;
            } else {
                // Lógica de transporte que ya definimos
                const acordeOriginalStr = cantoMaestro.acorde || "La m";
                const esMenor = acordeOriginalStr.toLowerCase().includes("m");
                const notaBasePura = acordeOriginalStr.split(" ")[0].replace("m", "").trim();
                const indiceBase = cords.indexOf(notaBasePura);

                if (indiceBase !== -1) {
                    const posicionFinal = (indiceBase + t) % 12;
                    const notaFinal = cords[posicionFinal];
                    elAco.innerHTML = `<b style="color:red;">${notaFinal}${esMenor ? " m" : ""}</b>`;
                } else {
                    elAco.innerHTML = acordeOriginalStr;
                }
            }
}
    if (fila) {
        const enlace = fila.querySelector('a');
        if (enlace) {
            const ton = (data.acorde !== undefined) ? data.acorde : "0";
            const cej = (data.cejilla !== undefined) ? data.cejilla : "0";
            enlace.href = `src/index.html?canto=${cantoId}&tonalidad=${ton}&cejilla=${cej}`;
        }
    }

    const fechaOrigen = data.fecha || data.valor; 
    if (elUso && fechaOrigen) {
        const f = (fechaOrigen.toDate) ? fechaOrigen.toDate() : new Date(fechaOrigen);
        if (!isNaN(f.getTime())) {
            const dia = String(f.getDate()).padStart(2, '0');
            const mesesShort = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
            elUso.innerHTML = `${dia} ${mesesShort[f.getMonth()]} <span onclick="event.stopPropagation(); window.abrirCalendario('${cantoId}')" style="cursor:pointer; font-size:16px;">📅</span>`;
        }
    }
};


// 14: OBTENER FIREBASE:
async function obtenerDatosExtraFirebase(cantoId, uid) {
    try {
        const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        const docRef = doc(db, "usuarios", uid, "dbdata", cantoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const rawData = docSnap.data();
            
            // 1. Procesamos la fecha igual que en la 21
            let fechaObjeto = null;
            const d = rawData.fecha || rawData.valor; 
            if (d) {
                fechaObjeto = d.toDate ? d.toDate() : new Date(d);
            }

            // 2. Creamos el objeto EXACTAMENTE igual al de la Sección 21
            const datosNormalizados = {
                fecha: (fechaObjeto && !isNaN(fechaObjeto.getTime())) ? fechaObjeto : null,
                valor: (fechaObjeto && !isNaN(fechaObjeto.getTime())) ? fechaObjeto : null, // Doble campo por seguridad
                acorde: String(rawData.acorde || "0"),
                cejilla: String(rawData.cejilla || "0"),
                valoracion: parseInt(rawData.valoracion || 0)
            };

            console.log(`✅ Sección 6 (dbdata) > Datos cargados para ${cantoId}:`, datosNormalizados);

            // 3. Guardamos en RAM
            ALMACEN_CANTOS[cantoId] = datosNormalizados;

            // 4. Guardamos en LocalStorage
            localStorage.setItem(`data-${cantoId}`, JSON.stringify(datosNormalizados));

            // 5. ¡ESTO ES LO QUE PINTA LA TABLA!
            if (typeof inyectarDatosEnTabla === 'function') {
                inyectarDatosEnTabla(cantoId, datosNormalizados, false);
            }
        }
    } catch (e) { 
        console.warn("⚠️ Error en Sección 6:", e); 
    }
}

// 15: TOGGLE SECTIONS: Abre/Cierra secciones y gira la flecha (collapsed)
window.toggleSection = function(sectionId, wrapperId) {
    const section = document.getElementById(sectionId);
    const wrapper = document.getElementById(wrapperId);
    
    if (section && wrapper) {
        // Alternamos la clase collapsed (para la flecha en CSS)
        const isCollapsed = wrapper.classList.toggle('collapsed');
        
        // Usamos tu clase cfg-close para ocultar/mostrar el contenido
        if (isCollapsed) {
            section.classList.add('cfg-close');
        } else {
            section.classList.remove('cfg-close');
        }
    }
};

// 16: GESTIONAR MEMORIA: Descarga o borra CSS (Global).
window.gestionarMemoria = async (cantoId, cargar) => {
    const cache = await caches.open('cantos-cache-v2.08');
    const url = `src/css/pg/${cantoId}.css`;
    if (cargar) {
        try {
            const res = await fetch(url);
            if(res.ok) await cache.put(url, res);
        } catch (e) { alert("Error al descargar."); }
    } else {
        if (confirm("¿Borrar offline?")) await cache.delete(url);
    }
};

// 17: LLENAR COMUNIDADES: Opciones del select.
function llenarComunidades() {
    const select = document.getElementById('userComunidad');
    if (!select) return;
    for (let i = 1; i <= 73; i++) {
        let opt = document.createElement('option');
        opt.value = i; opt.innerText = `Comunidad ${i}`;
        select.appendChild(opt);
    }
}

// 18: CARGAR PAISES: Desde JSON local.
async function cargarPaisesEIP() {
    const selectPais = document.getElementById('userCountry'); // ID original restaurado
    if (!selectPais) return;

    try {
        const res = await fetch('src/data/paises.json');
        const paises = await res.json();

        // Limpiamos el mensaje de "Cargando..."
        selectPais.innerHTML = '<option value="">Selecciona tu país</option>';

        paises.forEach(p => {
            let opt = document.createElement('option');
            opt.value = p.nombre;
            opt.textContent = p.nombre; // Importante para que el texto sea visible en el select
            selectPais.appendChild(opt);
        });

        console.log("🌍 Países cargados correctamente en el selector.");
    } catch (e) {
        console.error("Error cargando el archivo de países:", e);
        selectPais.innerHTML = '<option value="">Error al cargar países</option>';
    }
}


// 19. GUARDAR PERFIL: Función global para enviar a Firebase.
window.guardarPerfil = async function() {
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para guardar cambios.");
        return;
    }

    // Capturamos los datos con los IDs originales que restauramos
    const perfilData = {
        pais: document.getElementById('userCountry').value,
        parroquia: document.getElementById('userParroquia').value,
        comunidad: document.getElementById('userComunidad').value,
        etapa: document.getElementById('userStep').value,
        ultimaActualizacion: new Date()
    };

    console.log("Intentando guardar datos:", perfilData);

    try {
        // Ruta exacta confirmada: usuarios > UID > perfil > config
        const docRef = doc(db, "usuarios", user.uid, "perfil", "config");
        
        await setDoc(docRef, perfilData, { merge: true });
        
        alert("¡Perfil actualizado con éxito! 🎸");

        // Actualizamos la etapa en memoria para que la tabla se refresque correctamente
        etapaGuardada = parseInt(perfilData.etapa);
        if (typeof renderizarTablaCantos === 'function') {
            await renderizarTablaCantos();
        }

    } catch (e) {
        console.error("Error al guardar perfil:", e);
        alert("Error al conectar con la nube. Revisa tu conexión.");
    }
};


// 19.1: LOGOUT CON CONFIRMACIÓN
document.getElementById('btn-logout-perfil')?.addEventListener('click', () => {
    const confirmar = confirm("¿Deseas Cerrar sesión?\n\nAl cerrar sesión, serás llevado a la página de inicio.");
    if (confirmar) {
        signOut(auth).then(() => { 
            window.location.href = '../../index.html'; 
        }).catch((error) => {
            console.error("Error al cerrar sesión:", error);
        });
    }
});

// 20: SINCRONIZACIÓN DE DATOS (FIREBASE A RAM)
window.sincronizarTodoARam = async function() { 
    const user = auth.currentUser;
    if (!user) return;

    const container = document.getElementById('progreso-nube-container');
    const barra = document.getElementById('barra-nube');

    try {
        if (container) container.style.display = 'block';
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        const colRef = collection(db, "usuarios", user.uid, "dbdata");
        const querySnapshot = await getDocs(colRef);

        querySnapshot.forEach((docSnap) => {
            const cantoId = docSnap.id; 
            const docData = docSnap.data();
            const rawData = docData.valor ? docData.valor : docData;
            
            // Guardamos en la memoria global y local para que la tabla lo vea
            const datos = {
                acorde: String(rawData.acorde || "0"),
                cejilla: String(rawData.cejilla || "0"),
                fecha: rawData.fecha || null
            };
            ALMACEN_CANTOS[cantoId] = datos;
            localStorage.setItem(`data-${cantoId}`, JSON.stringify(datos));
        });
        console.log("✅ Datos de Firebase listos en RAM.");
    } catch (e) {
        console.warn("Error en sincronización:", e);
    } finally {
        if (container) container.style.display = 'none';
    }
};

// 21: GESTIONAR DESCARGA TOTAL (Uso Offline con Barra y Reporte)
window.gestionarDescargaTotal = async () => {
    const divProgreso = document.getElementById('progreso-descarga-container');
    const barra = document.getElementById('barra-progreso');
    const texto = document.getElementById('status-descarga-texto');
    const btn = document.getElementById('btnDescargarTodo');
    
    if (!confirm("¿Descargar todos los cantos para uso offline?")) return;

    let total = 0;
    let descargados = 0;
    let yaExistian = 0;
    let errores = 0;

    try {
        if (divProgreso) divProgreso.style.display = "block";
        if (texto) {
            texto.style.display = "block";
            texto.innerText = "Iniciando descarga...";
        }
        if (btn) btn.disabled = true;

        const response = await fetch('src/data/indicecantos.json');
        const cantos = await response.json();
        total = cantos.length;
        
        // Debe coincidir con CACHE_NAME en sworker.js
        const cache = await caches.open('cantos-cache-v2.08');

        // IMPORTANTE: Primero descargamos el archivo index.html una sola vez
        // Este es el "molde" que se usa para todos los cantos
        try {
            const resIndex = await fetch('index.html');
            if (resIndex.ok) await cache.put('index.html', resIndex);
        } catch (e) { console.warn("Error al cachear index.html base"); }

        for (let i = 0; i < total; i++) {
            const cantoId = cantos[i].id;
            
            // Descargamos el CSS específico de cada canto
            const fileUrl = `src/css/pg/${cantoId}.css`;
            
            const coincidencia = await cache.match(fileUrl);
            if (!coincidencia) {
                try {
                    const res = await fetch(fileUrl);
                    if (res.ok) {
                        await cache.put(fileUrl, res);
                        descargados++;
                    } else { errores++; }
                } catch (e) { errores++; }
            } else {
                yaExistian++;
            }

            let porc = Math.round(((i + 1) / total) * 100);
            if (barra) barra.style.width = `${porc}%`; 
            if (texto) texto.innerText = `Descargando recursos: ${i + 1} de ${total} (${porc}%)`;
            
            if (i % 20 === 0) await new Promise(r => setTimeout(r, 5));
        }

        alert(`✅ ¡Listo! Ahora los cantos funcionan sin internet.\n\n• Procesados: ${total}\n• En memoria: ${yaExistian}\n• Nuevos: ${descargados}\n• Errores: ${errores}`);

        // Recargando los cantos descargados
        window.location.reload();

    } catch (e) { 
        alert("Error crítico durante la descarga."); 
        console.error(e);
    } finally { 
        if (divProgreso) divProgreso.style.display = "none";
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = "✅ Contenido Offline Listo";
        }
    }
};


// 22: EXPORTAR RESPALDO: Descarga el LocalStorage a JSON (Global).
window.exportarDatosLocales = function() {
    let datosExportar = {};
    for (let i = 0; i < localStorage.length; i++) {
        let clave = localStorage.key(i);
        if (clave.startsWith('data-')) {
            datosExportar[clave] = JSON.parse(localStorage.getItem(clave));
        }
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(datosExportar, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mis_cantos_respaldo.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

// 23. FILTRADO INTELIGENTE: Ignora acentos, espacios, comas y símbolos
window.filtrarCantos = function() {
    const input = document.getElementById('inputBuscador');
    const btnLimpiar = document.getElementById('btnLimpiarBuscador');
    if (!input) return;
    
    // Función auxiliar para "limpiar" el texto al máximo
    const superNormalizar = (texto) => {
        return texto.toLowerCase()
                    .normalize("NFD") // Descompone caracteres con acentos
                    .replace(/[\u0300-\u036f]/g, "") // Quita los acentos
                    .replace(/[^a-z0-9]/g, ""); // Quita espacios, comas, puntos y símbolos
    };

    const filtro = superNormalizar(input.value);
    const filas = document.getElementsByClassName('fila-canto');

    // Mostrar/ocultar la 'X' de limpieza
    if (btnLimpiar) {
        btnLimpiar.style.display = input.value.length > 0 ? "block" : "none";
    }

    for (let i = 0; i < filas.length; i++) {
        const celdaTitulo = filas[i].getElementsByTagName('td')[0];
        if (celdaTitulo) {
            // Normalizamos el título del canto de la misma forma
            const textoCanto = superNormalizar(celdaTitulo.textContent || celdaTitulo.innerText);
            
            // Si el título normalizado contiene el filtro normalizado, mostramos la fila
            if (textoCanto.indexOf(filtro) > -1) {
                filas[i].style.display = "";
            } else {
                filas[i].style.display = "none";
            }
        }
    }
};

// 24: FUNCIÓN PARA LIMPIAR EL BUSCADOR
window.limpiarBuscador = function() {
    const input = document.getElementById('inputBuscador');
    const btn = document.getElementById('btnLimpiar');
    
    input.value = "";       // Limpiamos el texto
    btn.style.display = "none"; // Ocultamos la X
    window.filtrarCantos(); // Refrescamos la lista para que salgan todos
    input.focus();          // Devolvemos el foco al input
};

// MODIFICACIÓN EN TU FILTRAR CANTOS (Para que la X aparezca solo cuando escribes)
const originalFiltrar = window.filtrarCantos;
window.filtrarCantos = function() {
    const input = document.getElementById('inputBuscador');
    const btn = document.getElementById('btnLimpiar');
    
    // Si hay texto, mostramos la X. Si no, la ocultamos.
    if (input.value.length > 0) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
    
    // Llamamos a la lógica original de filtrado
    if (typeof originalFiltrar === 'function') originalFiltrar();
};

// 25: Guardar preferencia y forzar refresco si se activa
document.getElementById('syncToggle').addEventListener('change', (e) => {
    const activa = e.target.checked;
    localStorage.setItem('preferencia_sync', activa);
    
    if (activa) {
        // Al activar, borramos solo los datos de los cantos para refrescar desde Firebase
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const clave = localStorage.key(i);
            if (clave.startsWith('data-')) {
                localStorage.removeItem(clave);
            }
        }
        // Volvemos a renderizar para que la Función 4 pida todo de nuevo
        renderizarTablaCantos();
    }
});


// 26: REGISTRO DE CAMBIO (Escritura en dbdata con Historial Unificado)
async function guardarCambioTransporte(cantoId, nuevoValor) {
    const user = auth.currentUser;
    if (!user) return;
    try {
        const ahora = new Date();
        const fechaId = ahora.getTime().toString(); 

        // 1. OBTENEMOS EL ESTADO ACTUAL: Para no perder la cejilla al cambiar el acorde
        const refCantoRaiz = doc(db, "usuarios", user.uid, "dbdata", cantoId);
        const snapCanto = await getDoc(refCantoRaiz);
        
        let cejillaActual = "0";
        if (snapCanto.exists()) {
            cejillaActual = snapCanto.data().cejilla || "0";
        }

        // 2. PREPARAMOS EL PAQUETE DBDATA (Como lo definimos en jsgral)
        const datosDB = { 
            fecha: ahora, 
            acorde: nuevoValor.toString(), 
            cejilla: cejillaActual 
        };

        // A. Actualizamos la Raíz de dbdata para este canto
        // Ruta: /usuarios/UID/dbdata/ID_CANTO
        await setDoc(refCantoRaiz, datosDB, { merge: true });

        // B. Creamos el punto en el HISTORIAL dentro de dbdata
        // Ruta: /usuarios/UID/dbdata/ID_CANTO/historial/ID_FECHA
        const refHist = doc(db, "usuarios", user.uid, "dbdata", cantoId, "historial", fechaId);
        await setDoc(refHist, datosDB, { merge: true });

        console.log(`✅ Sincronizado en dbdata: ${cantoId} (Acorde: ${nuevoValor}, Cejilla: ${cejillaActual})`);
        
    } catch (error) { 
        console.error("Error en Sección 19 (dbdata):", error); 
    }
}


//  27: SISTEMA DE HISTORIAL VISUAL Y LISTADO ---
let fechasHistorialActivas = [];
let fechasOriginalesFull = []; 
let mesVisualizado = new Date().getMonth();
let añoVisualizado = new Date().getFullYear();
let totalRegistrosCanto = 0; 

// 28: APERTURA Y CARGA DE DATOS (CORRECCIÓN NIVEL "VALOR")
window.abrirCalendario = async function(cantoId) {
    const user = auth.currentUser;
    if (!user) return;

    window.ultimoCantoVisto = cantoId;

    try {
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        let modal = document.getElementById('calendar-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'calendar-modal';
            modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:999999; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.7); font-family: sans-serif;";
            document.body.appendChild(modal);
        }
        modal.style.display = "flex";
        modal.innerHTML = '<div style="background:white; padding:20px; border-radius:10px;">⌛ Cargando historial técnico...</div>';

        fechasHistorialActivas = [];
        fechasOriginalesFull = [];
        totalRegistrosCanto = 0;

        const refHistorial = collection(db, "usuarios", user.uid, "dbdata", cantoId, "historial");
        const snapshot = await getDocs(refHistorial);
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const idDoc = docSnap.id; 

            // --- TRUCO MAESTRO: Entramos en 'valor' ---
            // Como vimos en tu imagen, los datos están dentro de un campo llamado 'valor'
            const infoReal = data.valor || {}; 

            let timestamp = parseInt(idDoc);
            let fechaFinal = new Date(timestamp);

            if (!isNaN(fechaFinal.getTime())) {
                const clave = `${fechaFinal.getFullYear()}-${fechaFinal.getMonth() + 1}-${fechaFinal.getDate()}`;
                fechasHistorialActivas.push(clave);
                
                // Guardamos acorde y cejilla extrayéndolos de 'infoReal' (el campo valor)
                fechasOriginalesFull.push({
                    fecha: fechaFinal,
                    acorde: String(infoReal.acorde || "0"), 
                    cejilla: String(infoReal.cejilla || "0")
                });
                totalRegistrosCanto++;
            }
        });

        fechasOriginalesFull.sort((a, b) => b.fecha - a.fecha);

        if (fechasOriginalesFull.length > 0) {
            const ultima = fechasOriginalesFull[0].fecha;
            window.mesVisualizado = ultima.getMonth();
            window.añoVisualizado = ultima.getFullYear();
        }

        if (typeof actualizarVistaCalendario === 'function') {
            actualizarVistaCalendario(); 
        }
        document.addEventListener('keydown', manejarEscape);

    } catch (e) { 
        console.error("❌ Error cargando historial:", e);
    }
};


// 29: NAVEGACIÓN DE MESES
window.cambiarMes = function(direccion) {
    mesVisualizado += direccion;
    if (mesVisualizado < 0) { mesVisualizado = 11; añoVisualizado--; }
    if (mesVisualizado > 11) { mesVisualizado = 0; añoVisualizado++; }
    actualizarVistaCalendario();
};

// 30: VISTA DEL CALENDARIO (CORREGIDO)
function actualizarVistaCalendario() {
    const modal = document.getElementById('calendar-modal');
    if (!modal) return; 

    // Obtenemos el nombre del mes actual para el encabezado
    const nombreMes = new Date(añoVisualizado, mesVisualizado).toLocaleString('es-ES', { month: 'long' }).toUpperCase();

    modal.innerHTML = `
        <div id="calendar-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center;">
            <div id="calendar-content" style="background:white; padding:20px; border-radius:15px; width:300px; text-align:center; position:relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <button onclick="cerrarCalendario()" class="xclose">&times;</button>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <button onclick="cambiarMes(-1)" style="border:none; background:#e0e0e0; border-radius:5px; padding:5px 12px; cursor:pointer; font-weight:bold;">&lt;</button>
                    <h3 style="margin:0; font-size:1.1em; color:#333;">${nombreMes} ${añoVisualizado}</h3>
                    <button onclick="cambiarMes(1)" style="border:none; background:#e0e0e0; border-radius:5px; padding:5px 12px; cursor:pointer; font-weight:bold;">&gt;</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; background: #fdfdfd; padding: 10px; border-radius: 10px; border: 1px solid #eee;">
                    ${generarGridNavegable(fechasHistorialActivas, mesVisualizado, añoVisualizado)}
                </div>
                
                <div style="margin-top:20px; border-top: 1px solid #eee; padding-top:15px;">
                    <p style="margin:0; font-size:13px; color:#444;">
                        Has usado este canto 
                        <span onclick="abrirListaDetallada()" style="color:#bc0009; font-weight:bold; font-size:18px; cursor:pointer; text-decoration:underline;">
                            ${totalRegistrosCanto}
                        </span> veces
                    </p>
                    <small style="color:gray; font-size:10px;">(Toca el número para ver el detalle)</small>
                </div>
            </div>
        </div>`;

    // Cerrar al hacer clic fuera
    document.getElementById('calendar-overlay').onclick = (e) => {
        if (e.target.id === 'calendar-overlay') cerrarCalendario();
    };
}

// 31: LISTADO TÉCNICO DETALLADO
window.abrirListaDetallada = function() {
    // 1. Buscamos el nombre del canto y su acorde base original
    const idABuscar = window.ultimoCantoVisto; 
    const infoCanto = window.indiceCantosGlobal.find(c => String(c.id) === String(idABuscar));
    const tituloCanto = infoCanto ? infoCanto.titulo : "Canto seleccionado";
    
    // Recuperamos el acorde base del JSON (ej: "Re m", "Sol", etc.)
    const acordeOriginalStr = infoCanto ? (infoCanto.acorde || "La m") : "La m";

    let listaModal = document.getElementById('lista-detallada-modal');
    if (!listaModal) {
        listaModal = document.createElement('div');
        listaModal.id = 'lista-detallada-modal';
        listaModal.style = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:1000001; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; font-family: sans-serif;";
        document.body.appendChild(listaModal);
    }

    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

    // Definición de notas para el cálculo de transporte
    const cords = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "Si♭", "Si"];

    const itemsHtml = fechasOriginalesFull.map((reg, index) => {
        const f = reg.fecha;
        if (!f || isNaN(f.getTime())) return `<div style="padding:10px; color:red;">Dato no disponible</div>`;

        const dia = String(f.getDate()).padStart(2, '0');
        const mesTxt = meses[f.getMonth()];
        const año = f.getFullYear();
        const hora = String(f.getHours()).padStart(2, '0');
        const min = String(f.getMinutes()).padStart(2, '0');

        // --- LÓGICA DE TRANSPORTE DINÁMICO ---
        let acordeTxt = acordeOriginalStr; 
        const esMenor = acordeOriginalStr.toLowerCase().includes("m");
        const notaBasePura = acordeOriginalStr.split(" ")[0].replace("m", "").trim();
        const indiceBase = cords.indexOf(notaBasePura);

        if (indiceBase !== -1) {
            const t = parseInt(reg.acorde) || 0; // El valor de transporte guardado en Firebase
            const posicionFinal = (indiceBase + t + 12) % 12; 
            const notaFinal = cords[posicionFinal];
            acordeTxt = `${notaFinal}${esMenor ? " m" : ""}`;
        }

        const cejillaTxt = (reg.cejilla && reg.cejilla !== "0") ? reg.cejilla : "No";

        return `
        <div style="padding:12px; border-bottom:1px solid #eee; display:flex; flex-direction:column; gap:5px; background: white; text-align: left;">
            <div style="display:flex; justify-content:space-between; font-size:12px;">
                <span style="color:#888;">${dia} ${mesTxt} ${año} - ${hora}:${min}</span>
                <b style="color:#d4af37;">#${fechasOriginalesFull.length - index}</b>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:15px; font-weight:bold; color:#333;">🎸 ${acordeTxt}</span>
                <span style="font-size:14px; background:#f5f5f5; padding:3px 10px; border-radius:12px; color:#666; border:1px solid #eee; font-weight: 900;">🗜️ ${cejillaTxt}</span>
            </div>
        </div>`;
    }).join('');

    // --- 3. INYECTAR HTML FINAL ---
    listaModal.innerHTML = `
        <div id="lista-overlay" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
            <div style="background:white; border-radius:15px; width:320px; max-height:80vh; overflow:hidden; display:flex; flex-direction:column; position:relative; box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
                
                <button onclick="document.getElementById('lista-detallada-modal').remove()" 
                        style="position:absolute; top:-3px; right:-3px; border:none; background:none; font-size:24px; cursor:pointer; color:white; z-index:11;">&times;</button>
                
                <div class="ttlo" style="padding:25px 20px 5px 20px; background:#d4af37; color:white; font-weight:bold; text-align:center; font-size: 20px; line-height: 1.2;">
                    ${tituloCanto.toUpperCase()}
                </div>

                <div style="background:#d4af37; color:rgba(255,255,255,0.8); padding:0 20px 20px 20px; text-align:center; font-size:13px; letter-spacing: 1px; font-weight: lighter;">
                    TU HISTORIAL
                </div>

                <div style="flex-grow:1; overflow-y:auto; background:#fff;">
                    ${itemsHtml || '<p style="padding:20px; text-align:center; color:gray;">Sin registros en el historial</p>'}
                </div>
            </div>
        </div>`;

    listaModal.onclick = (e) => { 
        if (e.target.id === 'lista-overlay') listaModal.remove(); 
    };
};


// 32: CIERRE Y LIMPIEZA
window.cerrarCalendario = function() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
        modal.remove();
    }
    // IMPORTANTE: Dejamos de escuchar la tecla Escape
    document.removeEventListener('keydown', manejarEscape);
};

// 33: MENSAJE ESCAPE
function manejarEscape(e) {
    if (e.key === "Escape") {
        const lista = document.getElementById('lista-detallada-modal');
        const cal = document.getElementById('calendar-modal');

        if (lista) {
            lista.remove();
            console.log("Cerrando lista detallada con Escape");
        } else if (cal) {
            console.log("Cerrando calendario con Escape");
            
            // Verificamos si la función existe antes de usarla
            if (typeof window.cerrarCalendario === 'function') {
                window.cerrarCalendario();
            } else {
                cal.remove();
            }
        }
    }
}

// 34: FUNCION GENERAR GRID
function generarGridNavegable(fechasActivas, mes, año) {
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    const primerDiaSemana = new Date(año, mes, 1).getDay();
    let html = "";
    ['D','L','M','M','J','V','S'].forEach(d => html += `<b style="font-size:0.75em; color:#bbb; padding-bottom:5px;">${d}</b>`);
    for (let e = 0; e < primerDiaSemana; e++) html += `<div></div>`;
    for (let i = 1; i <= ultimoDia; i++) {
        const clave = `${año}-${mes + 1}-${i}`;
        const activo = fechasActivas.includes(clave);
        const estilo = activo 
            ? "background:#d4af37; color:white; font-weight:bold; border-radius:4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" 
            : "color:#555;";
        html += `<div style="padding:6px 0; font-size:0.95em; ${estilo}">${i}</div>`;
    }
    return html;
}

// 35: COMUNICACIÓN ENTRE EQUIPO, NUBE Y RAM
// 35: COMUNICACIÓN ENTRE EQUIPO, NUBE Y RAM (VERSIÓN FUSIONADA Y FINAL)
window.sincronizarTodoARam = async function() { 
    const user = auth.currentUser;
    if (!user) {
        alert("Debes estar logueado para sincronizar.");
        return;
    }

    const container = document.getElementById('progreso-nube-container');
    const barra = document.getElementById('barra-nube');
    const texto = document.getElementById('status-nube-texto');

    try {
        // --- INICIO VISUAL (Tus estilos originales) ---
        if (container) container.style.display = 'block';
        if (texto) {
            texto.style.display = 'block';
            texto.innerText = "Conectando con la nube...";
        }
        if (barra) {
            barra.style.width = '10%';
            barra.style.background = 'linear-gradient(90deg, #4285F4, #34A853)';
        }

        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        const colRef = collection(db, "usuarios", user.uid, "dbdata");
        const querySnapshot = await getDocs(colRef);
        const total = querySnapshot.size;

        if (total === 0) {
            if (texto) texto.innerText = "No se encontraron registros.";
            setTimeout(() => { if (container) container.style.display = 'none'; }, 3000);
            return true; // Retornamos true aunque esté vacío para que la tabla se dibuje
        }

        let procesados = 0;

        // --- PROCESAMIENTO DE DATOS ---
        querySnapshot.forEach((docSnap) => {
            const cantoId = docSnap.id; 
            const docData = docSnap.data();
            
            // Log de depuración que tenías
            console.log(`📡 LOG 1 > Datos de dbdata [${cantoId}]:`, docData);

            // Lógica de campo 'valor'
            const rawData = docData.valor ? docData.valor : docData;

            let fechaObjeto = null;
            const d = rawData.fecha || docData.fecha; 

            if (d) {
                fechaObjeto = (d && typeof d.toDate === 'function') ? d.toDate() : new Date(d);
            }

            const datosNormalizados = {
                fecha: (fechaObjeto && !isNaN(fechaObjeto.getTime())) ? fechaObjeto : null,
                valor: (fechaObjeto && !isNaN(fechaObjeto.getTime())) ? fechaObjeto : null,
                acorde: String(rawData.acorde || "0"),
                cejilla: String(rawData.cejilla || "0"),
                valoracion: parseInt(rawData.valoracion || 0)
            };

            window.cacheData[cantoId] = datosNormalizados;

            // Guardamos en RAM y LocalStorage
            ALMACEN_CANTOS[cantoId] = datosNormalizados;
            localStorage.setItem(`data-${cantoId}`, JSON.stringify(datosNormalizados));
            
            // Actualización visual en tiempo real (si la tabla ya existe)
            if (typeof inyectarDatosEnTabla === 'function') {
                inyectarDatosEnTabla(cantoId, datosNormalizados, false);
            }

            // --- ACTUALIZACIÓN DE BARRA (Tus cálculos) ---
            procesados++;
            const porcentaje = Math.round((procesados / total) * 100);
            if (barra) barra.style.width = `${porcentaje}%`;
            if (texto) texto.innerText = `Sincronizando: ${procesados} de ${total}...`;
        });

        if (texto) texto.innerText = "¡Sincronización completada!";
        if (barra) barra.style.background = "#34A853"; 

        console.log("✅ Sincronización completa: RAM actualizada.");
        return true; // IMPORTANTE: Avisamos a la Sección 3 que terminamos

    } catch (e) {
        console.error("❌ Error en sincronización:", e);
        if (texto) texto.innerText = "Error al conectar con la nube.";
        return false;
    } finally {
        // Cierre suave de la barra
        setTimeout(() => {
            if (container) container.style.display = 'none';
            if (barra) barra.style.width = '0%';
        }, 2500);
    }
};


// 36 AUTO-SINCRONIZACIÓN AL ENTRAR
// Este bloque detecta cuando Firebase termina de cargar el usuario y arranca la sincronía
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("🚀 Usuario detectado, iniciando sincronización automática...");
        
        // Verificamos que la función exista antes de llamarla para evitar errores
        if (typeof window.sincronizarTodoARam === 'function') {
            window.sincronizarTodoARam();
        }
    }
});

// 37: GUARDAR VALORACION
        window.guardarValoracion = async function(cantoId, puntos) {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                const docRef = doc(db, "usuarios", user.uid, "dbdata", cantoId);
                
                // Guardamos dentro del campo 'valor' para que coincida con tu base de datos
                await setDoc(docRef, { 
                    valor: { 
                        valoracion: puntos 
                    } 
                }, { merge: true });
                
                // Actualizamos caché local para el brillo instantáneo
                if (!window.cacheData[cantoId]) window.cacheData[cantoId] = {};
                window.cacheData[cantoId].valoracion = puntos;
                
                window.inyectarDatosEnTabla(cantoId, window.cacheData[cantoId]);
                
                console.log(`✅ Valoración ${puntos} guardada en mapa 'valor' para: ${cantoId}`);
            } catch (e) {
                console.error("❌ Error al guardar valoración:", e);
            }
        };

// 38: CONTROL DE COLAPSO Y SINCRONIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    const configPaneles = {
        'toggle-perfil':  { content: 'section-config',        wrapper: 'wrapper-config' },
        'toggle-gestion': { content: 'lista-cantos-gestion-wrapper',  wrapper: 'wrapper-gestion' },
        'toggle-settings': { content: 'section-settings',     wrapper: 'wrapper-settings' }
    };

    const syncToggle = document.getElementById('syncToggle');

    function aplicarEstadoPanel(idSwitch, mostrar) {
        const refs = configPaneles[idSwitch];
        if (!refs) return;
        const content = document.getElementById(refs.content);
        const wrapper = document.getElementById(refs.wrapper);
        if (content && wrapper) {
            if (mostrar) {
                content.classList.remove('cfg-close');
                wrapper.classList.remove('collapsed');
            } else {
                content.classList.add('cfg-close');
                wrapper.classList.add('collapsed');
            }
        }
    }

    async function guardarEstadoEnNube(idSwitch, estado) {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            const docRef = doc(db, "usuarios", user.uid, "configuracion", "paneles");
            await setDoc(docRef, { [idSwitch]: estado }, { merge: true });
        } catch (e) { console.error("Error al guardar:", e); }
    }

    // Eventos para los paneles (Mostrar/Ocultar)
    Object.keys(configPaneles).forEach(id => {
        const sw = document.getElementById(id);
        if (sw) {
            sw.addEventListener('change', (e) => {
                const activo = e.target.checked;
                aplicarEstadoPanel(id, activo);
                guardarEstadoEnNube(id, activo);
            });
        }
    });

    // Lógica del Switch Maestro (Sincronización) - YA NO AFECTA A LOS DEMÁS
    if (syncToggle) {
        syncToggle.addEventListener('change', function() {
            const activo = this.checked;
            localStorage.setItem('syncNube', activo);
            guardarEstadoEnNube('syncToggle', activo); // Solo guarda su propio estado

            if (activo && typeof window.sincronizarTodoARam === 'function') {
                window.sincronizarTodoARam();
            }
        });
    }

    // Cargar estados iniciales
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                const docRef = doc(db, "usuarios", user.uid, "configuracion", "paneles");
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    // Cargar estados de paneles
                    Object.keys(configPaneles).forEach(id => {
                        const sw = document.getElementById(id);
                        if (sw && data[id] !== undefined) {
                            sw.checked = data[id];
                            aplicarEstadoPanel(id, data[id]);
                        }
                    });
                    // Cargar estado del sync maestro
                    if (syncToggle && data['syncToggle'] !== undefined) {
                        syncToggle.checked = data['syncToggle'];
                    }
                }
            } catch (e) { console.log("Cargando vista..."); }
        }
    });
});


// 39: FUNCIÓN PARA DESCARGA FÍSICA (OFFLINE REAL) ---
async function descargarArchivosParaOffline(listaIds) {
    if (!('caches' in window)) return;

    try {
        // Usamos el mismo nombre de caché que tienes en sworker.js
        const nombreCache = 'cantos-cache-v2.08'; 
        const cache = await caches.open(nombreCache);
        
        // Generamos las rutas exactas de los archivos HTML de los cantos
        const urlsParaGuardar = listaIds.map(id => `src/html/visor.html?canto=${id}`);
        
        console.log(`Iniciando almacenamiento en caché de ${urlsParaGuardar.length} archivos...`);
        
        // Esto descarga y guarda los archivos uno por uno en segundo plano
        await cache.addAll(urlsParaGuardar);
        
        console.log("✅ Archivos guardados en caché correctamente.");
    } catch (error) {
        console.error("❌ Fallo al guardar archivos en caché:", error);
    }
}