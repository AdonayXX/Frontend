async function loadCitas() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/cita');
        const citas = response.data;
        const tableBody = document.getElementById('viajesTableBody');
        tableBody.innerHTML = '';

        citas.forEach(cita => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${cita.idCita}</td>
                <td>${cita.nombreCompletoPaciente}</td>
                <td>${cita.fechaCita}</td>
                <td>${cita.horaCita}</td>
                <td>${cita.ubicacionDestino}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#AcompananteModal" onclick="getAcompanantes(12)">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener las citas:', error);
    }
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

loadCitas();
