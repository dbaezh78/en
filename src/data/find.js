/* ****************************************
FUNCION DE BUSCADOR MEJORADA David was here
******************************************/
document.getElementById('DavidLoBusca')?.addEventListener('input', async function(e) {
    const query = normalizeText(e.target.value.trim());
    const resultadosDiv = document.getElementById('resultadosBusqueda');

    if (!resultadosDiv) { // Añadir verificación para resultadosDiv también
        console.warn("Elemento 'resultadosBusqueda' no encontrado. El buscador no funcionará.");
        return;
    }

    if (query.length < 1) {
        resultadosDiv.style.display = 'none';
        resultadosDiv.innerHTML = '';
        return;
    }

    try {
        // La URL para fetch se mantiene con el parámetro para evitar problemas de caché del navegador,
        // el Service Worker se encarga de ignorarlo para la búsqueda en caché.
        //const response = await fetch(`/src/data/find.json?v=${Date.now()}`);
        const response = await fetch('/src/data/find.json');

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const cantos = await response.json();

        // Normalizar y buscar
        const resultados = cantos.filter(canto => {
            const tituloNormalizado = normalizeText(canto.titulo);
            const letraNormalizada = normalizeText(canto.letra);

            return tituloNormalizado.includes(query) ||
                   letraNormalizada.includes(query);
        });

        mostrarResultados(resultados);
    } catch (error) {
        console.error("Error en búsqueda:", error);
        resultadosDiv.innerHTML = `
            <div class="resultado-item">
                Error al cargar: ${error.message}<br>
                <small>Ruta intentada: /src/data/find.json</small>
            </div>`;
        resultadosDiv.style.display = 'block';
    }
});

// Función para normalizar texto (quitar acentos, comas, etc.)
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""); // quita signos de puntuación
}

// Función para mostrar resultados con scroll lateral
function mostrarResultados(resultados) {
    const contenedor = document.getElementById('resultadosBusqueda');
    if (!contenedor) return; // Asegurar que el contenedor existe

    contenedor.innerHTML = '';

    if (resultados.length === 0) {
        contenedor.innerHTML = '<div class="resultado-item">No hay coincidencias</div>';
        contenedor.style.display = 'block';
        return;
    }

    // Crear contenedor principal
    const mainResults = document.createElement('div');
    mainResults.className = 'main-results';

    // Mostrar todos los resultados en el contenedor principal con scroll
    resultados.forEach(canto => {
        const div = document.createElement('div');
        div.className = 'resultado-item';
        div.innerHTML = `
            <strong>${canto.titulo}</strong>
            <br>
            <small>${canto.salmo}</small>
        `;
        div.onclick = () => window.location.href = canto.archivo;
        mainResults.appendChild(div);
    });

    contenedor.appendChild(mainResults);
    contenedor.style.display = 'block';
}

// Cerrar resultados al hacer clic fuera
document.addEventListener('click', function(e) {
    const buscador = document.querySelector('.buscador-cantos');
    const resultados = document.getElementById('resultadosBusqueda');

    if (resultados && buscador && !buscador.contains(e.target)) { // Verificar que ambos elementos existen
        resultados.style.display = 'none';
    }
});
