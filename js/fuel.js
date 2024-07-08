function populateChoferes() {
    axios.get('https://backend-transporteccss.onrender.com/api/chofer')
        .then(response => {
            console.log('Respuesta de la API:', response); 

            const choferes = response.data.choferes;
            if (!choferes || !choferes.length) {
                console.error('No se encontraron choferes en la respuesta.');
                return;
            }

            const usuarioSelect = document.getElementById('usuario');

        
            usuarioSelect.innerHTML = '';

            choferes.forEach(chofer => {
                const option = document.createElement('option');
                option.value = chofer.idChofer;
                option.textContent = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
                usuarioSelect.appendChild(option);
            });

            console.log('Choferes poblados en el select:', usuarioSelect); 
        })
        .catch(error => {
            console.error('Error al obtener los choferes:', error); 
        });
}

populateChoferes();

function populateUnidades() {
    axios.get('https://backend-transporteccss.onrender.com/api/unidades')
        .then(response => {
            console.log('Respuesta de la API de unidades:', response); 

            const unidades = response.data.unidades;
            if (!unidades || !unidades.length) {
                console.error('No se encontraron unidades en la respuesta.');
                return;
            }

            const unidadSelect = document.getElementById('unidad');

            unidadSelect.innerHTML = '';

            unidades.forEach(unidad => {
                const option = document.createElement('option');
                option.value = unidad.id;
                option.textContent = unidad.numeroUnidad;
                unidadSelect.appendChild(option);
            });

            console.log('Unidades pobladas en el select:', unidadSelect); 
        })
        .catch(error => {
            console.error('Error al obtener las unidades:', error); 
        });
}

populateUnidades();



