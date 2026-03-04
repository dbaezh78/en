// showAcorde.js - Script temporal para mover y mostrar la posición de los acordes
// Este script es autónomo y se activa solo si el canto actual tiene mant: "Si"

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el ID del canto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cantoIdFromUrl = urlParams.get('canto');

    // 2. Definir el ID del canto a cargar (usa un valor predeterminado si no hay en la URL)
    const cantoIdToLoad = cantoIdFromUrl || "alavictimapascual"; 

    // 3. Buscar el canto específico por su ID en la base de datos global
    // Se asume que allCantosData está disponible globalmente desde canto_data.js
    const currentCanto = allCantosData.find(canto => canto.id === cantoIdToLoad);

    // 4. Verificar la propiedad 'mant' del canto actual
    if (!currentCanto || currentCanto.mant !== "Si") {
        console.log("showAcorde.js deshabilitado para este canto (mant: No o no definido).");
        return; // Salir de la función si el mantenimiento no está habilitado
    }

    console.log("showAcorde.js habilitado para este canto (mant: Si).");

    // Selecciona todos los elementos de acordes que tienen la clase 'nota-posicionada'
    const chordNotes = document.querySelectorAll('.nota-posicionada');

    chordNotes.forEach(noteSpan => {
        let isDragging = false; // Bandera para saber si se está arrastrando
        let initialMouseX;      // Posición inicial del ratón al empezar a arrastrar
        let initialNoteLeft;    // Posición 'left' inicial del acorde
        let positionDisplay;    // Elemento para mostrar la posición actual

        // Crea un nuevo elemento <span> para mostrar la posición del acorde
        positionDisplay = document.createElement('span');
        positionDisplay.classList.add('chord-position-display');
        // Aplica estilos para que sea simple, sin fondo y de color negro
        positionDisplay.style.cssText = `
            position: absolute;
            top: -13px; /* -1.2em Posiciona el número un poco por encima del acorde */
            left: 10px;
            font-size: 1.1em;
            color: rgb(196 76 75);
            background: none;
            pointer-events: none; /* Permite hacer clic a través del texto para el acorde subyacente */
            white-space: nowrap; /* Evita que el texto se rompa en varias líneas */
            z-index: 10; /* Asegura que el número esté por encima del acorde */
            transform: translateX(-50%); /* Centra el texto de posición con el acorde */
        `;
        noteSpan.appendChild(positionDisplay); // Añade el elemento de posición al acorde

        // Función para actualizar el texto que muestra la posición
        const updatePositionDisplay = () => {
            // Obtiene el valor 'left' actual del estilo del elemento, lo convierte a número
            const currentLeftPx = parseFloat(noteSpan.style.left || 0);
            // Actualiza el texto con la posición actual en píxeles
            positionDisplay.textContent = `${currentLeftPx.toFixed(0)}`;
        };

        // Muestra la posición inicial del acorde al cargar la página
        updatePositionDisplay();

        // Evento cuando se presiona el botón del ratón sobre el acorde (inicio del arrastre)
        noteSpan.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialMouseX = e.clientX;
            // Obtiene la posición 'left' computada actual del elemento para un arrastre preciso
            initialNoteLeft = parseFloat(window.getComputedStyle(noteSpan).left);
            noteSpan.style.cursor = 'grabbing'; // Cambia el cursor para indicar arrastre
            e.preventDefault(); // Previene el comportamiento por defecto (ej. selección de texto)
        });

        // Evento cuando el ratón se mueve (durante el arrastre)
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return; // Si no se está arrastrando, no hace nada

            // Calcula la diferencia de movimiento del ratón
            const deltaX = e.clientX - initialMouseX;
            // Calcula la nueva posición 'left'
            const newLeft = initialNoteLeft + deltaX;

            noteSpan.style.left = `${newLeft}px`; // Aplica la nueva posición
            updatePositionDisplay(); // Actualiza el texto de la posición
        });

        // Evento cuando se suelta el botón del ratón (fin del arrastre)
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                noteSpan.style.cursor = 'grab'; // Restaura el cursor
                const finalLeft = parseFloat(noteSpan.style.left).toFixed(0);
                const originalConceptualUnit = noteSpan.dataset.conceptualPositionUnit;
                // Muestra la posición final en la consola para que puedas copiarla
                console.log(`Acorde: ${noteSpan.textContent.split(' ')[0]} (Original: ${originalConceptualUnit}) movido a: ${finalLeft}px`);
                console.log(`Para actualizar canto_data.js, busca este acorde y cambia su valor conceptualPositionUnit a: ${finalLeft}`);
            }
        });

        // Cambia el cursor a 'grab' cuando el ratón está sobre el acorde para indicar que es arrastrable
        noteSpan.style.cursor = 'grab';
    });
});
