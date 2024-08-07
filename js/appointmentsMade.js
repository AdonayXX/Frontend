async function loadCitas() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/cita', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const citas = response.data;
        renderTable(citas);
        ocultarSpinner();


        if ($.fn.DataTable.isDataTable('#TableAppointment')) {
            $('#TableAppointment').DataTable().clear().destroy();
        }

        $.getJSON('https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json', function (langJson) { //buscar en datatable idioma español y migrarlo a local(pendiente)
            $('#TableAppointment').DataTable({
                dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                    "<'row'<'col-sm-12't>>" +
                    "<'row'<'col-sm-6'i><'col-sm-6'p>>",
                ordering: false,
                searching: true,
                paging: true,
                pageLength: 25,
                lengthMenu: [ [25, 50, 100, -1], [25, 50, 100, "Todo"] ],
                language: langJson,
                columns: [
                    { data: 'idCita' },
                    { data: 'nombreCompletoPaciente' },
                    { data: 'fechaCita' },
                    { data: 'horaCita' },
                    { data: 'ubicacionDestino' },
                    { data: 'tipoSeguro' },
                    { data: 'estadoCita' },
                    { data: null, defaultContent: '<button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#AcompananteModal"><i class="bi bi-eye"></i></button>' },
                    { data: null, defaultContent: '<button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editarModal"><i class="bi bi-pencil"></i></button>' }
                ]
            });

            $('#searchAppointment').on('keyup', function () {
                let inputValue = $(this).val().toLowerCase();
                let selectedState = $('#seleccionar-estado').val().toLowerCase();
                $('#TableAppointment').DataTable().search(inputValue + ' ' + selectedState).draw();
            });

            $('#fechaCita').on('change', function () {
                let fechaInput = $('#fechaCita').val();
                $('#TableAppointment').DataTable().column(2).search(fechaInput).draw();
            });

            $(document).ready(function () {
                $('#seleccionar-estado').val('Iniciada').trigger('change');

                $('#seleccionar-estado').on('change', function () {
                    let selectedState = $(this).val().toLowerCase();
                    $('#TableAppointment').DataTable().column(6).search(selectedState).draw();

                    let tituloCitas = document.getElementById('tituloCitas');
                    tituloCitas.textContent = `Citas ${selectedState.charAt(0).toUpperCase() + selectedState.slice(1)}s`;

                    let inputValue = $('#searchAppointment').val().toLowerCase();
                    $('#TableAppointment').DataTable().search(inputValue + ' ' + selectedState).draw();
                });
            });

            $('#TableAppointment').DataTable().search('iniciada').draw();
        });
    } catch (error) {
        console.error('Error al obtener las citas:', error);
        showToast("Error", "Error al obtener las citas.");
    }
}

loadCitas();

function renderTable(citas) {
    citas.sort((a, b) => {
        const fechaHoraA = new Date(`${a.fechaCita} ${a.horaCita}`);
        const fechaHoraB = new Date(`${b.fechaCita} ${b.horaCita}`);
        return fechaHoraB - fechaHoraA;
    });

    const tableBody = document.getElementById('viajesTableBody');
    tableBody.innerHTML = '';

    citas.forEach(cita => {
        const row = document.createElement('tr');

        const isDisabled = (cita.estadoCita.toLowerCase() === 'finalizada' || cita.estadoCita.toLowerCase() === 'cancelada');
        const disabledAttribute = isDisabled ? 'disabled' : '';

        row.innerHTML = `
            <td class="text-center">${cita.idCita}</td>
            <td class="text-center">${cita.nombreCompletoPaciente}</td>
            <td class="text-center">${cita.fechaCita}</td>
            <td class="text-center">${cita.horaCita}</td>
            <td class="text-center">${cita.ubicacionDestino}</td>
            <td class="text-center">${cita.tipoSeguro}</td>
            <td class="text-center">${cita.estadoCita}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#AcompananteModal" onclick='getAcompanantes(${JSON.stringify(cita)})'>
                    <i class="bi bi-eye"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editarModal" onclick='editarCita(${JSON.stringify(cita)})' ${disabledAttribute}>
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function ocultarSpinner() {
    const spinnerContainer = document.getElementById('spinnerContainer');
    if (spinnerContainer) {
        spinnerContainer.style.display = 'none';
    }
}
