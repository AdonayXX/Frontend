async function loadCitas() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/cita', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const citas = response.data;
        ocultarSpinner();
        renderTable(citas);

        if ($.fn.DataTable.isDataTable('#TableAppointment')) {
            $('#TableAppointment').DataTable().clear().destroy();
        }
        $('#TableAppointment').DataTable({
            dom: "<'row'<'col-sm-6'l>" +
                "<'row'<'col-sm-12't>>" +
                "<'row'<'col-sm-6'i><'col-sm-6'p>>",
            ordering: false,
            searching: true,
            paging: true,
            language: {
                url: spanish
              },
            caseInsensitive: true,
            smart: true,
            pageLength: 25,
            lengthMenu: [[25, 50, 100, -1], [25, 50, 100, "Todo"]],
            caseInsensitive: true,
            smart: true
        });
      const spanish =  DataTable().lenguage.url = '/assets/json/Spanish.json'; 

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
    } catch (error) {
    if(error.response.status === 404) {
        showToast("Error", "No hay citas registradas.")
    }
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

function getAcompanantes(cita) {
    try {
        const tableBody = document.getElementById('AcompananteTableBody');
        tableBody.innerHTML = '';

        const row = document.createElement('tr');

        const infoAdicional = [
            cita.ubicacionOrigen,
            cita.transladoCita,
            cita.camilla,
            cita.diagnostico,
            cita.especialidad,
            cita.prioridad,
            cita.nombreCompletoAcompanante1 || 'No posee.',
            cita.nombreCompletoAcompanante2 || 'No posee.'
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

document.querySelector('#searchAppointment').addEventListener('input', function (e) {
    if (this.value.length > 15) {
        this.value = this.value.slice(0, 15);
    }
});

function editarCita(cita) {
    document.querySelector('#editarIdCita').value = cita.idCita;
    document.querySelector('#editarNombrePaciente').value = cita.nombreCompletoPaciente;
    document.querySelector('#editarFechaCita').value = cita.fechaCita;
    document.querySelector('#editarHora').value = cita.horaCita;
    document.querySelector('#seleccionar-destino').value = cita.idUbicacionDestino;
    document.querySelector('#tipoSeguro').value = cita.tipoSeguro;
    document.querySelector('#formEditarCita').addEventListener('submit', function (event) {
        event.preventDefault();
        updateCita(cita.idCita);
    });
}

function getRutas() {
    const selectDestino = document.getElementById('seleccionar-destino');

    axios.get('https://backend-transporteccss.onrender.com/api/rutas')
        .then(response => {
            const destinos = response.data;
            destinos.forEach(destino => {
                const option = document.createElement('option');
                option.value = destino.IdRuta;
                option.textContent = destino.Descripcion;
                selectDestino.appendChild(option);
            });
        })
        .catch(() => {
            showToast("Error", "Error al obtener los destinos.");
        });
}

getRutas();

async function updateCita(idCita) {
    const fechaCita = document.querySelector('#editarFechaCita').value;
    const horaCita = document.querySelector('#editarHora').value;
    const idUbicacionDestino = document.querySelector('#seleccionar-destino').value;
    const tipoSeguro = document.querySelector("#tipoSeguro").value;

    const updatedCitas = {
        idUbicacionDestino: idUbicacionDestino,
        fechaCita: fechaCita,
        horaCita: horaCita,
        tipoSeguro: tipoSeguro
    };

    try {
        const token = localStorage.getItem('token');
        await axios.put(`https://backend-transporteccss.onrender.com/api/cita/${idCita}`, updatedCitas, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        $('#editarModal').modal('hide');
        setTimeout(function () {
            loadContent('appointmentsMade.html', 'mainContent');
        }, 1500);
        showToast("¡Éxito!", "Cita actualizada correctamente.");
    } catch (error) {
        $('#editarModal').modal('hide');
        showToast("Error", "Error al actualizar la cita.");
    }
}

function ocultarSpinner() {
    const spinnerContainer = document.getElementById('spinnerContainer');
    if (spinnerContainer) {
        spinnerContainer.style.display = 'none';
    }
}
