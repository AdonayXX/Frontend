loadCitas();

async function loadCitas() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/cita');
        const citas = response.data;
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

        $('#fechaCita').on('change', function () {
            let fechaInput = $('#fechaCita').val();
            table.column(2).search(fechaInput).draw();
        });
    } catch (error) {
        console.error('Error al obtener las citas:', error);
    }
}

function renderTable(citas) {
    const tableBody = document.getElementById('viajesTableBody');
    tableBody.innerHTML = '';

    citas.forEach(cita => {
        if (cita.estadoCita === 'Finalizada' && cita.ausente !== null) {
            showToast('¡Éxitos!', 'Citas cargadas correctamente.');

            const row = document.createElement('tr');

            row.innerHTML = `
                <td class="text-center">${cita.idCita}</td>
                <td class="text-center">${cita.nombreCompletoPaciente}</td>
                <td class="text-center">${cita.fechaCita}</td>
                <td class="text-center">${cita.horaCita}</td>
                <td class="text-center">${cita.ubicacionDestino}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#AcompananteModal" onclick='getAcompanantes(${JSON.stringify(cita)})'>
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);

        }
    });
}

function getAcompanantes(cita) {
    console.log(cita);
    try {
        const acompanantes = [cita.nombreCompletoAcompanante1, cita.nombreCompletoAcompanante2];
        const tableBody = document.getElementById('AcompananteTableBody');
        tableBody.innerHTML = '';

        const infoAdicional = [
            { label: 'Ubicación Origen', value: cita.ubicacionOrigen },
            { label: 'Ubicación Destino', value: cita.ubicacionDestino },
            { label: 'Especialidad', value: cita.especialidad },
            { label: 'Fecha Cita', value: cita.fechaCita }
        ];

        infoAdicional.forEach(info => {
            const row = document.createElement('tr');
            row.innerHTML = `<td><strong>${info.label}:</strong></td><td>${info.value || 'No disponible'}</td>`;
            tableBody.appendChild(row);
        });

        let hasAcompanantes = false;
        acompanantes.forEach(acompanante => {
            if (acompanante) {
                hasAcompanantes = true;
                const row = document.createElement('tr');
                row.innerHTML = `<td><strong>Acompañante:</strong></td><td>${acompanante}</td>`;
                tableBody.appendChild(row);
            }
        });

        if (!hasAcompanantes) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="2">No existen acompañantes asignados a esta cita.</td>`;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error al obtener los acompañantes:', error);
        showToast(error, 'Error al obtener los acompañantes:');
    }
}

document.querySelector('#searchAppointment').addEventListener('input', function (e) {
    if (this.value.length > 15) {
        this.value = this.value.slice(0, 15);
    }
});
