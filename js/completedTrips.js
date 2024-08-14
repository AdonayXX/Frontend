async function loadChoferes() {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer', {
            headers: {
                'Authorization': `Bearer ${token}`
            }

        });
        const choferes = response.data.choferes;
        const select = document.getElementById('seleccionar-chofer');

        choferes.forEach(chofer => {
            const option = document.createElement('option');
            option.value = chofer.nombre + " " + chofer.apellido1 + " " + chofer.apellido2;
            option.textContent = chofer.nombre + " " + chofer.apellido1 + " " + chofer.apellido2;
            select.appendChild(option);
        });
    } catch (error) {
        showToast("Error", "Error al obtener los choferes.")

    }
}

async function loadUnidades() {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const unidades = response.data.unidades;
        const select = document.getElementById('seleccionar-unidad');

        unidades.forEach(unidad => {
            const option = document.createElement('option');
            option.value = unidad.numeroUnidad;
            option.textContent = unidad.numeroUnidad;
            select.appendChild(option);
        });
    } catch (error) {
        showToast("Error", "Error al obtener las unidades.")
    }
}

async function loadViajes() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/viaje/registro', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const citas = response.data.registro;
        renderTable(citas);

        if ($.fn.DataTable.isDataTable('#tablaViajes')) {
            $('#tablaViajes').DataTable().clear().destroy();
        }
        const table = $('#tablaViajes').DataTable({
            dom: "<'row'<'col-sm-6'l>" +
                "<'row'<'col-sm-12't>>" +
                "<'row'<'col-sm-6'i><'col-sm-6'p>>",
            ordering: false,
            searching: true,
            paging: true,
            pageLength: 25,
            lengthMenu: [[25, 50, 100, -1], [25, 50, 100, "Todo"]],
            language: {
                url: './assets/json/Spanish.json'
            },
            caseInsensitive: true,
            smart: true
        });

        $('#buscarViaje').on('keyup', function () {
            let inputValue = $(this).val().toLowerCase();
            table.search(inputValue).draw();
        });

        $('#fechaViaje').on('change', function () {
            let fechaInput = $(this).val();
            table.column(6).search(fechaInput).draw();
        });

        $('#seleccionar-unidad').on('change', function () {
            let selectedUnit = $(this).val();
            if (selectedUnit === 'verTodoUnidad') {
                table.column(1).search('').draw();
            } else {
                table.column(1).search(selectedUnit).draw();
            }
        });

        $('#seleccionar-chofer').on('change', function () {
            let selectedDriver = $(this).val();
            if (selectedDriver === 'verTodoChofer') {
                table.column(2).search('').draw();
            } else {
                table.column(2).search(selectedDriver).draw();
            }
        });

        ocultarSpinner();

    } catch (error) {
        showToast("Error", "Error al cargar los viajes finalizados.")
    }
}


function renderTable(viajes) {
    const tableBody = document.getElementById('viajesTableBody');
    tableBody.innerHTML = '';

    viajes.forEach(viaje => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td class="text-center">${viaje.idViaje}</td>
            <td class="text-center">${viaje.numeroUnidad}</td>
            <td class="text-center">${viaje.NombreChofer}</td>
            <td class="text-center">${viaje.recurso}</td>
            <td class="text-center">${viaje.Ocupación}</td>
            <td class="text-center">${viaje.EstadoViaje}</td>
            <td class="text-center">${viaje.fechaInicioViaje.split('T')[0]}</td>
            <td class="text-center">${viaje.ubicacionDestino}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#ViajeModal" onclick='getACitas(${JSON.stringify(viaje)})'>
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getACitas(cita) {

    try {
        const tableBody = document.getElementById('citasTablebody');
        tableBody.innerHTML = '';

        const row = document.createElement('tr');

        const infoAdicional = [
            cita.idCita,
            cita.NombrePaciente,
        ];

        infoAdicional.forEach(info => {
            const cell = document.createElement('td');
            cell.textContent = info;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    } catch (error) {
        showToast("Error", 'Error al obtener los acompañantes.');
    }
}

function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}

loadChoferes();
loadUnidades();
loadViajes();

