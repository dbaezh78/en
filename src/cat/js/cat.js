document.addEventListener('DOMContentLoaded', () => {
    const songTitles = document.querySelectorAll('.song-title');
    const contentAreas = document.querySelectorAll('.content-area');
    const searchInput = document.getElementById('searchInput');

    // Función para cargar el contenido de un archivo de texto
    const loadCatechesisText = async (id, fileName) => {
        try {
            // Se utiliza la ruta correcta para acceder a la carpeta docs desde el archivo HTML principal
            const response = await fetch(`cat/docs/${fileName}.txt`); 
            if (!response.ok) {
                // Si la respuesta no es OK (por ejemplo, 404), se lanza un error
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            document.getElementById(`catequesis-${id}`).textContent = text;
        } catch (error) {
            console.error('Error al cargar la catequesis:', error);
            document.getElementById(`catequesis-${id}`).textContent = 'Error al cargar el contenido. Por favor, revisa el archivo.';
        }
    };

    // Función para mostrar el contenido activo
    const showContent = (targetId, catechesisId) => {
        contentAreas.forEach(area => {
            area.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');

        songTitles.forEach(title => {
            title.classList.remove('active');
            if (title.getAttribute('href').substring(1) === targetId) {
                title.classList.add('active');
            }
        });

        // Carga el texto de la catequesis
        loadCatechesisText(catechesisId, catechesisId);
    };

    // Evento para los clics en los títulos
    songTitles.forEach(title => {
        title.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = title.getAttribute('href').substring(1);
            const catechesisId = title.getAttribute('data-id');
            showContent(targetId, catechesisId);
        });
    });

    // Evento para el campo de búsqueda
    searchInput.addEventListener('keyup', () => {
        const filter = searchInput.value.toLowerCase();
        songTitles.forEach(title => {
            const text = title.textContent || title.innerText;
            if (text.toLowerCase().indexOf(filter) > -1) {
                title.style.display = "";
            } else {
                title.style.display = "none";
            }
        });
    });
    
    // Muestra el primer canto por defecto al cargar la página
    if (songTitles.length > 0) {
        const firstTitle = songTitles[0];
        const targetId = firstTitle.getAttribute('href').substring(1);
        const catechesisId = firstTitle.getAttribute('data-id');
        showContent(targetId, catechesisId);
    }
});