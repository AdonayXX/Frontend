


document.getElementById('identificacion').addEventListener('blur', async function (event) {
    const identificacion = this.value.trim();
    let idPaciente = null;
    let acompanantes = [];
   

    if (identificacion) {
        const pacienteActivo = await getPacienteCita(identificacion);
        if (pacienteActivo) {
            await getAcompanantes(identificacion);
        }
    } else {
        limpiarCampos();
    }

    document.getElementById('btnGuardar').addEventListener('click', async function (event) {
        event.preventDefault();
        await guardarCita();
        console.log(idPaciente)
        console.log(acompanantes)
        
    });
    
    async function getPacienteCita(identificacion) {
        try {
            const API_URL = `https://backend-transporteccss.onrender.com/api/paciente`;
            const response = await axios.get(API_URL);
            pacientes = response.data.pacientes; 
    
            const pacienteEncontrado = pacientes.find(paciente => paciente.Identificacion === identificacion && paciente.Estado === 'Activo');
    
            if (pacienteEncontrado) {
                idPaciente = pacienteEncontrado.IdPaciente;
                document.getElementById('nombre').value = pacienteEncontrado.Nombre || '';
                document.getElementById('primerApellido').value = pacienteEncontrado.Apellido1 || '';
                document.getElementById('segundoApellido').value = pacienteEncontrado.Apellido2 || '';
                document.getElementById('telefono1').value = pacienteEncontrado.Telefono1 || '';
                document.getElementById('telefono2').value = pacienteEncontrado.Telefono2 || '';
                document.getElementById('direccion').value = pacienteEncontrado.Direccion || '';
    
           
                showToast('Datos del paciente', 'Datos del paciente cargados correctamente.');
                return true;
            } else {
                showToast('Error', 'No se encontró ningún paciente con esa identificación.');
                return false; 
            }
        } catch (error) {
            console.error('Error fetching patient data:', error);
            showToast('Error', 'Error al obtener los datos del paciente.');
            return false; 
        }
    }
    

async function getAcompanantes(identificacion) {
    try {
        const API_URL_ACOMPANANTE = `https://backend-transporteccss.onrender.com/api/paciente/acompanantes/${identificacion}`;
        const responseAcompanante = await axios.get(API_URL_ACOMPANANTE);
        acompanantes = responseAcompanante.data.acompanantes;

        const acompanante1Select = document.getElementById('acompananteNombre1');
        const acompanante2Select = document.getElementById('acompananteNombre2');

        acompanante1Select.innerHTML = '<option value="">Seleccionar Acompañante</option>';
        acompanante2Select.innerHTML = '<option value="">Seleccionar Acompañante</option>';

        acompanantes.forEach(acompanante => {
            const option = document.createElement('option');
            option.text = acompanante.Nombre;
            option.value = acompanante.Nombre;
            acompanante1Select.add(option);
            acompanante2Select.add(option.cloneNode(true));
        });

        acompanante2Select.disabled = true;

        if (acompanantes.length > 0) {
            showToast('Acompañantes', 'Acompañantes cargados correctamente.');
        } else {
            showToast('Acompañantes', 'No se encontraron acompañantes para este paciente.');
        }
    } catch (error) {
        console.error('Error fetching companions data:', error);
        showToast('Error', 'Error al obtener los datos de los acompañantes.');
    }
}


function showAcompananteDetails(event, nombreField, apellido1Field, apellido2Field, telefonoField, parentescoField) {
    const selectedOption = event.target.value;
    if (selectedOption === "") {
        nombreField.value = '';
        apellido1Field.value = '';
        apellido2Field.value = '';
        telefonoField.value = '';
        parentescoField.value = '';
    } else {
        const acompanante = acompanantes.find(acompanante => acompanante.Nombre === selectedOption);
        if (acompanante) {
            nombreField.value = acompanante.Nombre || '';
            apellido1Field.value = acompanante.Apellido1 || '';
            apellido2Field.value = acompanante.Apellido2 || '';
            telefonoField.value = `${acompanante.Telefono1} / ${acompanante.Telefono2}` || '';
            parentescoField.value = acompanante.Parentesco || '';
        }
    }
}


function handleAcompanante1Change(event) {
    const acompanante2Select = document.getElementById('acompananteNombre2');
    const selectedValue1 = event.target.value;

    if (selectedValue1 === "") {
        limpiarCamposAcompanantes();
        acompanante2Select.disabled = false;
    } else {
        Array.from(acompanante2Select.options).forEach(option => {
            option.disabled = option.value === selectedValue1;
        });
    }

    if (selectedValue1 !== "") {
        showAcompananteDetails(event, document.getElementById('acompananteNombre1'), document.getElementById('acompananteApellido1_1'), document.getElementById('acompananteApellido2_1'), document.getElementById('acompananteTelefono1_1'), document.getElementById('acompananteParentesco1'));
    }
}

function handleAcompanante2Change(event) {
    const acompanante1Select = document.getElementById('acompananteNombre1');
    const selectedValue2 = event.target.value;

    if (selectedValue2 === "") {
        limpiarCamposAcompanantes();
        acompanante1Select.disabled = false;
    } else {
        Array.from(acompanante1Select.options).forEach(option => {
            option.disabled = option.value === selectedValue2;
        });
    }

    if (selectedValue2 !== "") {
        showAcompananteDetails(event, document.getElementById('acompananteNombre2'), document.getElementById('acompananteApellido1_2'), document.getElementById('acompananteApellido2_2'), document.getElementById('acompananteTelefono1_2'), document.getElementById('acompananteParentesco2'));
    }
}

document.getElementById('acompananteNombre1').addEventListener('change', handleAcompanante1Change);
document.getElementById('acompananteNombre2').addEventListener('change', handleAcompanante2Change);


function limpiarCamposAcompanantes() {
    document.getElementById('acompananteNombre1').value = '';
    document.getElementById('acompananteApellido1_1').value = '';
    document.getElementById('acompananteApellido2_1').value = '';
    document.getElementById('acompananteTelefono1_1').value = '';
    document.getElementById('acompananteParentesco1').value = '';

    document.getElementById('acompananteNombre2').value = '';
    document.getElementById('acompananteApellido1_2').value = '';
    document.getElementById('acompananteApellido2_2').value = '';
    document.getElementById('acompananteTelefono1_2').value = '';
    document.getElementById('acompananteParentesco2').value = '';
}
function limpiarCampos() {
    document.getElementById('nombre').value = '';
    document.getElementById('primerApellido').value = '';
    document.getElementById('segundoApellido').value = '';
    document.getElementById('telefono1').value = '';
    document.getElementById('telefono2').value = '';
    document.getElementById('direccion').value = '';

    limpiarCamposAcompanantes();
}


    

async function guardarCita() {
    if (!idPaciente) {
        showToast('Error', 'No se ha obtenido el IdPaciente.');
        return;
    }
    const acompanante1Nombre = document.getElementById('acompananteNombre1').value;
    const acompanante2Nombre = document.getElementById('acompananteNombre2').value;
    const idAcompanante1 = acompanantes.find(acompanante => acompanante.Nombre === acompanante1Nombre)?.IdAcompanante || null;
    const idAcompanante2 = acompanantes.find(acompanante => acompanante.Nombre === acompanante2Nombre)?.IdAcompanante || null;
    const idUbicacionDestino = "HEBB";  // DATOS QUEMADOS
    const idEspecialidad = 805;          // DATOS QUEMADOS
    const ubicacionOrigen = document.getElementById('traslado').value;
    const camillaCheckbox = document.getElementById('camilla');
    const prioridadCheckbox = document.getElementById('prelacion');
    const camilla = camillaCheckbox.checked ? 'Requerido' : 'No requerido';
    const prioridad = prioridadCheckbox.checked ? 'Alta' : 'Baja';
    const condicionCita = document.getElementById('condicion').value;
    const diagnostico = document.getElementById('diagnostico').value;
    const fechaCita = document.getElementById('fechaCita').value;
    const horaCitaInput = document.getElementById('horaCita').value;
    const horaCita = `${horaCitaInput}:00`;



    


    const citaData = {
        "idPaciente" : idPaciente,
        "idAcompanante1": idAcompanante1,
        "idAcompanante2": idAcompanante2,
        "idUbicacionDestino": idUbicacionDestino,
        "idEspecialidad": idEspecialidad,
        "ubicacionOrigen": ubicacionOrigen,
        "camilla": camilla,
        "prioridad": prioridad,
        "condicionCita": condicionCita,
        "diagnostico": diagnostico,
        "fechaCita": fechaCita,
        "horaCita": horaCita
    };

    console.log('Datos de la cita:',citaData);  

    try {
        const response = await axios.post('https://backend-transporteccss.onrender.com/api/cita', citaData); //o usar forma de const URL API
        showToast('Cita', 'Cita guardada correctamente.');
        // console.log('Respuesta del servidor:', response.data);
        const frmCita = document.getElementById('2');
        frmCita.reset();

    } catch (error) {
        console.error('Error saving appointment:', error);
        showToast('Error', 'Error al guardar la cita.');
    }
}



});









// const citaData = {
//     idPaciente: 14,
//     idAcompanante1: 0,
//     idAcompanante2: 0,
//     idUbicacionDestino: "HEBB",
//     idEspecialidad: 805,
//     ubicacionOrigen: "Hospital Upala",
//     camilla: "No requerido",
//     prioridad: "Baja",
//     condicionCita: "Verde",
//     diagnostico: "Corte en la pierna cabeza",
//     fechaCita: "2024-06-22",
//     horaCita: "08:00:00"
//   };
  

// // Luego, puedes usar este objeto para enviar los datos a través de una solicitud HTTP, por ejemplo, con Axios:
// async function enviarDatosCita(citaData) {
//     try {
//         const response = await axios.post('https://backend-transporteccss.onrender.com/api/cita/', citaData);
//         console.log('Respuesta del servidor:', response.data);
//     } catch (error) {
//         console.error('Error al enviar los datos de la cita:', error);
//     }
// }

// // Llamada a la función para enviar los datos de la cita
// enviarDatosCita(citaData);

// console.log('Datos de la cita:', citaData);