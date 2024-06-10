async function mostrarCitas() {
    try {
        const API_URL = 'http://localhost:56336/api/citas';
        const response = await axios.get(API_URL);
        console.log(response.data);

        const citas = response.data.citas;
        const tableBody = document.querySelector("#viajesTableBody");

        tableBody.innerHTML = '';

        citas.forEach(cita => {
            const row = `
                <tr>
                    <td>${cita.Cedula}</td>
                    <td>${cita.Paciente}</td>
                    <td>${cita.Fecha}</td>
                    <td>${cita.Destino}</td>
                    <td class="narrow-col">
                        <button class="btn btn-outline-primary btn-sm" onclick="MostrarAcompanante('${cita.Acompanante.Nombre}', '${cita.Acompanante.Apellido1}', '${cita.Acompanante.Apellido2}', '${cita.Acompanante.Telefono1}', '${cita.Acompanante.Telefono2}', '${cita.Acompanante.Parentesco}')" data-bs-toggle="modal" data-bs-target="#ausenteModal">
                            <i class="bi bi-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Ha habido un problema:', error);
    }
}

function MostrarAcompanante(nombre, apellido1, apellido2, telefono1, telefono2, parentesco) {
    const modal = document.getElementById("ausenteModal");
    modal.querySelector(".modal-body").innerHTML = `
        <p><strong>Nombre:</strong> ${nombre} ${apellido1} ${apellido2}</p>
        <p><strong>Telefono1 :</strong> ${telefono1}</p>
        <p><strong>Telefono2 :</strong> ${telefono2}</p>
        <p><strong>Parentesco:</strong> ${parentesco}</p>
    `;
    $('#ausenteModal').modal('show');
}

mostrarCitas();
