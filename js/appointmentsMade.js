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
                url: '/assets/json/Spanish.json'
            },
            caseInsensitive: true,
            smart: true,
            pageLength: 25,
            lengthMenu: [[25, 50, 100, -1], [25, 50, 100, "Todo"]],
            caseInsensitive: true,
            smart: true
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
        setTimeout(function () {
            $('#TableAppointment').DataTable().search('iniciada').draw();
        }, 1)
        ocultarSpinner();
    } catch (error) {
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

    getEspecialidadesByDestino(cita.idUbicacionDestino, cita.especialidad);

    document.querySelector('#formEditarCita').addEventListener('submit', function (event) {
        event.preventDefault();

        const especialidadSeleccionada = document.querySelector('#especialidad').value;
        if (!especialidadSeleccionada) {
            showToast('Error','Debe seleccionar una especialidad antes de guardar los cambios.');
            return;
        }

        updateCita(cita.idCita);
    });
}

function getRutas() {
    const selectDestino = document.getElementById('seleccionar-destino');

    const token = localStorage.getItem('token');
    axios.get('https://backend-transporteccss.onrender.com/api/rutaEspecialidad', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            const rutas = response.data;
            rutas.forEach(ruta => {
                const option = document.createElement('option');
                option.value = ruta.IdRuta;
                option.textContent = ruta.Descripcion;
                selectDestino.appendChild(option);
            });

            if (selectDestino.value === cita.idUbicacionDestino) {
                getEspecialidadesByDestino(selectDestino.value, cita.especialidad);
            }
        })
        .catch(error => {
        });
}

getRutas();

function getEspecialidadesByDestino(IdRuta, especialidadSeleccionada = '') {
    const selectEspecialidad = document.getElementById('especialidad');
    selectEspecialidad.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = especialidadSeleccionada ? especialidadSeleccionada : '-- Seleccione una especialidad --';
    selectEspecialidad.appendChild(defaultOption);

    const token = localStorage.getItem('token');
    axios.get(`https://backend-transporteccss.onrender.com/api/rutaEspecialidad/${IdRuta}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }

    })
        .then(response => {
            const especialidades = response.data;
            especialidades.forEach(especialidad => {
                const option = document.createElement('option');
                option.value = especialidad.idEspecialidad;
                option.textContent = especialidad.Especialidad;
                if (especialidad.Especialidad === especialidadSeleccionada) {
                    option.selected = true;
                }
                selectEspecialidad.appendChild(option);
            });
        })
        .catch(error => {
            console.error(error);
        });
}


document.getElementById('seleccionar-destino').addEventListener('change', function () {
    const IdRuta = this.value;
    getEspecialidadesByDestino(IdRuta);
});


async function updateCita(idCita) {
    const fechaCita = document.querySelector('#editarFechaCita').value;
    const horaCita = document.querySelector('#editarHora').value;
    const idUbicacionDestino = document.querySelector('#seleccionar-destino').value;
    const tipoSeguro = document.querySelector("#tipoSeguro").value;
    const especialidad = document.getElementById('especialidad').value;


    const updatedCitas = {
        idUbicacionDestino: idUbicacionDestino,
        fechaCita: fechaCita,
        horaCita: horaCita,
        tipoSeguro: tipoSeguro,
        especialidad: especialidad
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
