// index.js - JavaScript específico del canto para la página principal

// Asumiendo que `allCantosData` está disponible globalmente desde `canto_data.js`
// En un sistema de módulos, usarías: import { allCantosData } from './canto_data.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");

    // Helper para normalizar nombres para parámetros de URL (elimina acentos y convierte espacios a guiones)
    const normalizeForUrl = (name) => {
        return name.toLowerCase()
                   .replace(/á/g, 'a')
                   .replace(/é/g, 'e')
                   .replace(/í/g, 'i')
                   .replace(/ó/g, 'o')
                   .replace(/ú/g, 'u')
                   .replace(/ñ/g, 'n') // Esta línea convierte 'ñ' a 'n'
                   .replace(/\s/g, '-');
    };

    // Listas de categorías y momentos para determinar el tipo de URL
    // Estas listas almacenan los nombres NORMALIZADOS para una comparación consistente.
    const categoriesList = ["precatecumenado", "catecumenado", "eleccion", "liturgia"];
    const momentsList = [
        "ninos", // *** CAMBIO AQUÍ: Usar "ninos" sin 'ñ' ***
        "entrada", "paz", "fraccion-del-pan", "comunion", "final",
        "adviento", "navidad", "pascua", "pentecostes",
        "virgen-maria",
        "aclamacion", "salmodias", "penitencial", "salmodia", "nuevo-testamento", "antiguo-testamento",
        "cuaresma"
    ];

    // Mapeo de nombres normalizados a sus nombres canónicos para CATEGORÍAS
    const canonicalCategoryNames = {
        "precatecumenado": "Precatecumenado",
        "catecumenado": "Catecumenado",
        "eleccion": "Elección",
        "liturgia": "Liturgia",
        "Catolicos": "Catolicos",
    };

    // Mapeo de nombres normalizados a sus nombres canónicos para MOMENTOS
    const canonicalMomentNames = {
        "ninos": "Niños", // *** CAMBIO AQUÍ: La clave es "ninos", el valor es "Niños" ***
        "entrada": "Entrada",
        "paz": "Paz",
        "fraccion-del-pan": "Fracción del Pan",
        "comunion": "Comunión",
        "final": "Final",
        "adviento": "Adviento",
        "navidad": "Navidad",
        "pascua": "Pascua",
        "pentecostes": "Pentecostés",
        "virgen-maria": "Vírgen María",
        "aclamacion": "Aclamación",
        "Salmodias": "Salmodias",
        "salmodias": "Salmodias",
        "penitencial": "Penitencial",
        "nuevo-testamento": "Nuevo Testamento",
        "antiguo-testamento": "Antiguo Testamento",
        "cuaresma": "Cuaresma",
    };

    // *** INICIO DE CÓDIGO NUEVO PARA CARGAR CSS DINÁMICO ***
    // Función para crear y agregar dinámicamente un link de CSS al head
    const loadDynamicCSS = (cantoId) => {
        // La ruta del archivo CSS ahora es src/css/pg/
        const cssPath = `/src/css/pg/${cantoId}.css`;
        const link = document.createElement('link');
        link.id = `css-${cantoId}`; // Agregar un ID único
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssPath;
        link.onerror = () => {
            console.log(`No se encontró el archivo CSS específico para el canto: ${cssPath}`);
        };
        link.onload = () => {
            console.log(`Se cargó el CSS dinámico para el canto: ${cssPath}`);
        };
        document.head.appendChild(link);
        console.log(`Intentando cargar CSS dinámico para el canto: ${cssPath}`);
    };

    
    // *** FIN DE CÓDIGO NUEVO ***

    // Función para obtener el valor de un parámetro de la URL por su nombre
    const getUrlParameter = (name) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // Debugging: Confirmar el contenido de momentsList al inicio
    console.log("momentsList content (at start):", momentsList);


    // 1. Obtener el parámetro 'canto' de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cantoIdFromUrl = urlParams.get('canto');

    // 2. Definir el ID del canto a cargar
    // Si hay un ID en la URL, úsalo; de lo contrario, usa "alavictimapascual" como predeterminado
    const cantoIdToLoad = cantoIdFromUrl || "alavictimapascual"; 

    // 3. Busca el canto específico por su ID en la base de datos
    // Asumiendo que allCantosData está importado o globalmente disponible
    const currentCanto = typeof allCantosData !== 'undefined' ? allCantosData.find(canto => canto.id === cantoIdToLoad) : null;


    if (currentCanto) {
        console.log("Canto found:", currentCanto.title);
        // Llamada a la nueva función para cargar el CSS específico del canto
        loadDynamicCSS(cantoIdToLoad);

    if (window.firebaseAPI && typeof window.firebaseAPI.guardarDato === 'function') {
        const hoy = new Date().toLocaleDateString();
        window.firebaseAPI.guardarDato(cantoIdToLoad, hoy, 'historial_uso');
    }

        
        // Procesar las categorías para incluir sus URLs
        const processedCategories = currentCanto.category.map(catName => {
            let baseUrl = "/index.html?";
            let paramType = "";
            
            // Normalizar el nombre de la categoría/momento para la comparación
            let normalizedCatNameForComparison = normalizeForUrl(catName);
            let nameForUrl = catName; // Por defecto, usar el nombre original de canto_data.js

            // *** INICIO DE LOS LOGS PARA DEPURACIÓN ADICIONAL ***
            console.log(`--- Processing Category/Moment: "${catName}" ---`);
            console.log(`  Normalized name for comparison: "${normalizedCatNameForComparison}" (length: ${normalizedCatNameForComparison.length})`);
            
            // Verificar si momentsList tiene al menos un elemento antes de acceder a momentsList[0]
            if (momentsList.length > 0) {
                console.log(`  momentsList[0] (should be "ninos"): "${momentsList[0]}" (length: ${momentsList[0].length})`);
                console.log(`  Are normalizedCatNameForComparison and momentsList[0] strictly equal? ${normalizedCatNameForComparison === momentsList[0]}`);
            } else {
                console.log("  momentsList is empty or does not have a first element.");
            }
            
            console.log(`  Is in categoriesList? ${categoriesList.includes(normalizedCatNameForComparison)}`);
            console.log(`  Is in momentsList? ${momentsList.includes(normalizedCatNameForComparison)}`);
            // *** FIN DE LOS LOGS PARA DEPURACIÓN ADICIONAL ***

            // Determinar si es una categoría o un momento usando las listas normalizadas
            // PRIORIZAR LA COMPROBACIÓN DE MOMENTOS
            if (momentsList.includes(normalizedCatNameForComparison)) {
                paramType = "moment";
                // Si existe un nombre canónico en el mapa de momentos, usarlo para la URL
                if (canonicalMomentNames[normalizedCatNameForComparison]) {
                    nameForUrl = canonicalMomentNames[normalizedCatNameForComparison];
                }
            } else if (categoriesList.includes(normalizedCatNameForComparison)) {
                paramType = "category";
                // Si existe un nombre canónico en el mapa de categorías, usarlo para la URL
                if (canonicalCategoryNames[normalizedCatNameForComparison]) {
                    nameForUrl = canonicalCategoryNames[normalizedCatNameForComparison];
                }
            } else {
                // Fallback si no se encuentra en ninguna lista, se asume como categoría
                console.warn(`Categoría/Momento "${catName}" (normalizado: "${normalizedCatNameForComparison}") no encontrado en las listas predefinidas. Se usará el parámetro "category".`);
                paramType = "category";
            }
            
            // *** INICIO DE LOS LOGS PARA DEPURACIÓN FINAL ***
            console.log(`  Final paramType determined: "${paramType}"`);
            console.log(`  Name for URL: "${nameForUrl}"`);
            // *** FIN DE LOS LOGS PARA DEPURACIÓN FINAL ***

            // Usar el nombre determinado (nameForUrl) para el valor del parámetro en la URL
            // El navegador se encargará de codificar los caracteres especiales (como acentos)
            const categoryUrl = `${baseUrl}${paramType}=${nameForUrl}`;
            return { name: catName, url: categoryUrl };
        });
        console.log("Processed categories:", processedCategories);

        // Llamar a la función de inicialización del JS general, pasándole los datos del canto
        // y las categorías procesadas.
        if (typeof initializeCantoPage === 'function') {
            initializeCantoPage(currentCanto, processedCategories);
        } else {
            console.error("Error: initializeCantoPage no está definida. Asegúrate de que jsgral.js se cargue correctamente.");
        }
    } else {
        console.error(`Error: El canto con ID \"${cantoIdToLoad}\" no se encontró en canto_data.js. Verifica el ID y el contenido de canto_data.js.`);
        // Aquí está el bloque de código de manejo de errores
        document.querySelector('.dbt1').textContent = "Canto no encontrado";
        document.querySelector('.dbs2').textContent = "Verifica la URL o el ID del canto.";
        document.getElementById('canto-left-container').innerHTML = "<p>Lo sentimos, el canto solicitado no existe.</p>";
        document.getElementById('canto-right-container').innerHTML = "";
        document.getElementById('cantoCategories').innerHTML = "";
        document.getElementById('dbno').textContent = "";
        document.getElementById('tt').textContent = "Canto no encontrado";
    }
});


// Dentro de tu index.js, donde manejas el clic a un canto:
function abrirCanto(cantoId) {
    // ... tu lógica para abrir la página del canto ...
    
    // REGISTRO DE USO PARA EL CALENDARIO
    if (window.firebaseAPI && typeof window.firebaseAPI.guardarDato === 'function') {
        const hoy = new Date().toLocaleDateString(); // Ejemplo: "24/1/2026"
        
        // Guardamos la fecha en la colección 'historial_uso'
        window.firebaseAPI.guardarDato(cantoId, hoy, 'historial_uso');
        
        console.log(`📅 Uso registrado: ${cantoId} el ${hoy}`);
    }

    // Finalmente rediriges al canto
    window.location.href = `src/html/pantalla.html?canto=${cantoId}`;
}

// MODIFICACIÓN AL FINAL DEL ARCHIVO
window.abrirCanto = function(cantoId) {
    // REGISTRO DE USO PARA EL CALENDARIO
    if (window.firebaseAPI && typeof window.firebaseAPI.guardarDato === 'function') {
        const hoy = new Date().toLocaleDateString(); 
        window.firebaseAPI.guardarDato(cantoId, hoy, 'historial_uso');
        console.log(`📅 Uso registrado: ${cantoId} el ${hoy}`);
    }

    // Redirección
    window.location.href = `src/html/pantalla.html?canto=${cantoId}`;

}