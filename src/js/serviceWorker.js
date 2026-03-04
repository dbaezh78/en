        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            // La ruta '/' es vital si colocas sworker.js en la raíz de tu proyecto (resucito/sworker.js)
            navigator.serviceWorker.register('./sworker.js')
              .then(registration => {
                console.log('Service Worker registrado con éxito en:', registration.scope);
              })
              .catch(error => {
                console.log('Fallo en el registro del Service Worker:', error);
              });
          });
        }
