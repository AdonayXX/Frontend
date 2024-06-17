
loadCitas();

async function loadCitas() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/cita');
        console.log("Hola Mundo")
        const citas = response.data;
        $(document).ready(function () {
            console.log("entro")
            if ($.fn.DataTable.isDataTable('#TableAppointment')) {
                $('#TableAppointment').DataTable().destroy();
            }
            renderTable(citas);

            let table = $('#TableAppointment').DataTable({
                dom: "<'row'<'col-sm-6'l>" +
                    "<'row'<'col-sm-12't>>" +
                    "<'row '<'col-sm-6'i><'col-sm-6'p>>",
                ordering: false,
                searching: true,
                paging: true,
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
                },
                caseInsensitive: true,
                smart: true

            });
            $('#searchAppointment').on('keyup', function () {
                let inputValue = $(this).val().toLowerCase();
                table.search(inputValue).draw();
            });
        })
    } catch (error) {
        console.error('Error al obtener las citas:', error);
    }
}

function renderTable(citas) {
    const tableBody = document.getElementById('viajesTableBody');
    tableBody.innerHTML = '';

    citas.forEach(cita => {
        if (cita.estadoCita === 'Finalizado') {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td class="text-center">${cita.idCita}</td>
                <td class="text-center">${cita.nombreCompletoPaciente}</td>
                <td class="text-center">${cita.fechaCita}</td>
                <td class="text-center">${cita.horaCita}</td>
                <td class="text-center">${cita.ubicacionDestino}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#AcompananteModal" onclick="getAcompanantes(${12})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        }
    });

}

async function getAcompanantes(idPaciente) {
    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/paciente/acompanantes`);
        const pacientes = response.data.pacientes;

        const pacienteSeleccionado = pacientes.find(paciente => paciente.IdPaciente === parseInt(idPaciente));

        if (!pacienteSeleccionado) {
            console.error(`No se encontró un paciente con id ${idPaciente}`);
            return;
        }

        const acompanantes = pacienteSeleccionado.acompanantes;
        const tableBody = document.getElementById('AcompananteTableBody');
        tableBody.innerHTML = '';

        acompanantes.forEach(acompanante => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${acompanante.Nombre}</td>
                <td>${acompanante.Apellido1} ${acompanante.Apellido2}</td>
                <td>${acompanante.Telefono1} / ${acompanante.Telefono2}</td>
                <td>${acompanante.Parentesco}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener los acompañantes:', error);
        showToast(error, 'Error al obtener los acompañantes:');
    }
}

