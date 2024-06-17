async function loadDestinations() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/destinos');
        const destinos = response.data;
        const select = document.getElementById('select-destinos');

        destinos.forEach(destino => {
            const option = document.createElement('option');
            option.value = destino.IdDestino;
            option.textContent = destino.Descripcion;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los destinos:', error);
    }
}
loadDestinations()

async function loadEspecialidades() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/especialidad');
        const especialidad = response.data.Especialidad;
        const tableBody = document.getElementById('espe');
        tableBody.innerHTML = '';

        especialidad.forEach(espe => {
            const row = document.createElement('tr');

            row.innerHTML = `
              <td><input type="checkbox" id="seleccionarEspe"/></td>
                <td>${espe.Especialidad}</td>
                 <td><button class="btn btn-outline-danger btn-sm" id="btnEliminarEspe"><i
                 class="bi bi-trash"></i></button></td>
            `;

            tableBody.appendChild(row);

        });
    } catch (error) {
        console.error('Error al cargar las especialidades:', error);

    }

}

loadEspecialidades()

document.getElementById('BtnGuardarUbi').addEventListener('click', async () => {
    const nuevaUbicacion = document.getElementById('AgregarUbi').value;
    const nuevaAbreviacion = document.getElementById('AgregarAbre').value;

    if (nuevaUbicacion) {
        try {
            const response = await axios.post('https://backend-transporteccss.onrender.com/api/destinos', {
                IdDestino: nuevaAbreviacion,
                Descripcion: nuevaUbicacion
            });

            console.log('Ubicación agregada:', response.data);

            document.getElementById('AgregarUbi').value = '';

            const modalElement = document.getElementById('AgregarUbiModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        } catch (error) {
            console.error('Error al agregar la ubicación:', error);
        }
    } else {
        console.error('El campo de ubicación está vacío');
    }
});

document.getElementById('BtnGuardarEspe').addEventListener('click', async () => {
    const nuevaEspecialidad = document.getElementById('AgregarEspe').value;

    if (nuevaEspecialidad) {
        try {
            const response = await axios.get('https://backend-transporteccss.onrender.com/api/especialidad');
            const especialidades = response.data.Especialidad;

            let maxId = 0;
            especialidades.forEach(especialidad => {
                if (especialidad.idEspecialidad > maxId) {
                    maxId = especialidad.idEspecialidad;
                }
            });
            const nuevoId = maxId + 1;
            const especialidadData = {
                idEspecialidad: nuevoId,
                Especialidad: nuevaEspecialidad
            };
            console.log('Datos a enviar:', especialidadData);

            const postResponse = await axios.post('https://backend-transporteccss.onrender.com/api/especialidad', especialidadData);

            console.log('Especialidad agregada:', postResponse.data);

            document.getElementById('AgregarEspe').value = '';

            const modalElement = document.getElementById('AgregarEspeModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        } catch (error) {
            console.error('Error al agregar la especialidad:', error.response ? error.response.data : error.message);
        }
    } else {
        console.error('El campo de especialidad está vacío');
    }
});
