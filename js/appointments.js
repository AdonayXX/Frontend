document.getElementById('identificacion').addEventListener('blur', async function (event) {
    const identificacion = this.value.trim();
    if (identificacion) {
        await getPacienteCita(identificacion);
        await getAcompanantes(id);
    }
});

async function getPacienteCita(identificacion) {
    try {
        const API_URL = `http://localhost:56336/api/citaPaciente/${identificacion}`;
        const response = await axios.get(API_URL);
        const paciente = response.data.paciente; // Acceder a la propiedad 'paciente' del objeto de respuesta

        document.getElementById('nombre').value = paciente.Nombre || '';
        document.getElementById('primerApellido').value = paciente.Apellido1 || '';
        document.getElementById('segundoApellido').value = paciente.Apellido2 || '';
        document.getElementById('telefono1').value = paciente.Telefono1 || '';
        document.getElementById('telefono2').value = paciente.Telefono2 || '';
        document.getElementById('direccion').value = paciente.Direccion || '';

        showToast('Datos del paciente', 'Datos del paciente cargados correctamente.');

        
    } catch (error) {
        console.error('Error fetching patient data:', error);
        showToast('Error', 'Error al obtener los datos del paciente.')
    }
}



// ------------------------}

// async function getAcompanantes(id) {
//     try {
//         const API_URL = `http://localhost:56336/api/acompanantes/${id}`;
//         const response = await axios.get(API_URL);
//         const acompanantes = response.data.citaAcompanantes; // Acceder a la propiedad 'acompanantes' del objeto de respuesta

//         const selectAcompanante = document.getElementById('acompananteNombre1');
//         selectAcompanante.innerHTML = ''; // Limpiar el contenido actual del select

//         acompanantes.forEach(acompanante => {
//             const option = document.createElement('option');
//             option.value = acompanante.Id;
//             option.text = acompanante.Nombre;
//             selectAcompanante.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error fetching acompañantes data:', error);
//     }
// }