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
                 <td>
                    <button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmarEliminarModal2">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
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
            loadDestinations2();
            showToast('¡Éxitos!', 'Ubicación agregada correctamente.');


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
            loadDestinations2();
            showToast('¡Éxitos!', 'Especialidad agregada correctamente.');


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


function renderTableDestinations(ubicaciones) {
    const tableBody = document.getElementById('destinosTableBody');
    tableBody.innerHTML = '';

    ubicaciones.forEach(ubicacion => {

        const row = document.createElement('tr');
        row.innerHTML = `
                <td class="text-center">${ubicacion.IdDestino}</td>
                <td class="text-center">${ubicacion.Descripcion}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmarEliminarModal">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
        tableBody.appendChild(row);
    });
}


async function deleteDestination(idDestino) {
    try {
        const response = await axios.delete(`https://backend-transporteccss.onrender.com/api/destinos/${idDestino}`);
        console.log('Ubicación eliminada:', response.data);

        loadDestinations2();
        showToast('¡Éxito!', 'Ubicación eliminada correctamente.');

    } catch (error) {
        console.error('Error al eliminar la ubicación:', error);
        showToast('Error', 'No se pudo eliminar la ubicación.');
    }
}

async function loadDestinations2() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/destinos');
        const destinos = response.data;
        renderTableDestinations(destinos);

        if ($.fn.DataTable.isDataTable('#TableDestinations')) {
            $('#TableDestinations').DataTable().destroy();
        }

        let table = $('#TableDestinations').DataTable({
            dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                "<'row'<'col-sm-12't>>" +
                "<'row '<'col-sm-6'i><'col-sm-6'p>>",
            ordering: false,
            searching: true,
            paging: true,
            pageLength: 5,
            lengthMenu: [5, 10, 25, 50],
            pagingType: 'simple_numbers',
            autoWidth: false,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
            },
            caseInsensitive: true,
            smart: true
        });

        $('#buscarDestino').on('keyup', function () {
            let inputValue = $(this).val().toLowerCase();
            table.search(inputValue).draw();
        });

    } catch (error) {
        console.error('Error al obtener los destinos:', error);
    }
}

loadDestinations2();
