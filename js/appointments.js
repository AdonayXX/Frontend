

document.getElementById('identificacion').addEventListener('blur', async function (event) {
    const identificacion = this.value.trim();
    let idPaciente = null;
    let acompanantes = [];
    populateDestinos();


    if (identificacion) {
        const pacienteActivo = await getPacienteCita(identificacion);
        if (pacienteActivo) {
            await getAcompanantes(identificacion);
        }
    } else {
        limpiarCampos();
    }

 
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

                const prioridadCheckbox = document.getElementById('prelacion');
                prioridadCheckbox.checked = pacienteEncontrado.Prioridad === 1;

                const origenSelect = document.getElementById('origen');
                origenSelect.value = pacienteEncontrado.Traslado;
    
           
                showToast('Datos del paciente', 'Datos del paciente cargados correctamente.');
                return true;
            } else {
                showToast('Error', 'No se encontró ningún paciente con esa identificación.');
                limpiarCampos();
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

            if (acompanantes && acompanantes.length > 0) {
                acompanantes.forEach(acompanante => {
                    const option = document.createElement('option');
                    option.text = acompanante.Nombre;
                    option.value = acompanante.Nombre;
                    acompanante1Select.add(option);
                    acompanante2Select.add(option.cloneNode(true));
                });

                acompanante2Select.disabled = true;

                setTimeout(() => {
                    showToast('Acompañantes', 'Acompañantes cargados correctamente.');
                }, 1000);
            } else {
                setTimeout(() => {
                    showToast('Acompañantes', 'No se encontraron acompañantes para este paciente.');
                }, 1000);
            }
        } catch (error) {
            console.error('Error fetching companions data:', error);
            showToast('Error', 'Error al obtener los datos de los acompañantes.');
        }
    }
    function showAcompananteDetails(event, nombreField, apellido1Field, apellido2Field, telefonoField, parentescoField) {
        const selectedOption = event.target.value;
        if (!acompanantes || acompanantes.length === 0) {
            showToast('Acompañantes', 'No se encontraron acompañantes para este paciente.');
            return;
        }
    
        const acompanante = acompanantes.find(acompanante => acompanante.Nombre === selectedOption);
        if (acompanante) {
            nombreField.value = acompanante.Nombre || '';
            apellido1Field.value = acompanante.Apellido1 || '';
            apellido2Field.value = acompanante.Apellido2 || '';
            telefonoField.value = `${acompanante.Telefono1} / ${acompanante.Telefono2}` || '';
            parentescoField.value = acompanante.Parentesco || '';
        } else {
            showToast('Acompañantes', 'No se encontró información para el acompañante seleccionado.');
        }
    }
    
function handleAcompanante1Change(event) {
    const acompanante2Select = document.getElementById('acompananteNombre2');
    const selectedValue1 = event.target.value;

    if (selectedValue1 === "") {
        limpiarCamposAcompanantes();
        acompanante2Select.disabled = true;
        acompanante2Select.value = "";
        return;
    }

    acompanante2Select.disabled = false;
    acompanante2Select.querySelectorAll('option').forEach(option => {
        option.disabled = option.value === selectedValue1;
    });

    if (acompanantes && acompanantes.length === 2) {
       acompanante2Select.disabled = acompanantes[0].Nombre !== selectedValue1 && acompanantes[1].Nombre !== selectedValue1;
    }

    showAcompananteDetails(event, document.getElementById('acompananteNombre1'), document.getElementById('acompananteApellido1_1'), document.getElementById('acompananteApellido2_1'),  document.getElementById('acompananteTelefono1_1'), document.getElementById('acompananteParentesco1'));
}

function handleAcompanante2Change(event) {
    const acompanante1Select = document.getElementById('acompananteNombre1');
    const selectedValue2 = event.target.value;

    if (selectedValue2 === "") {
        limpiarCamposAcompanantes();
        acompanante1Select.disabled = false;
        return;
    }

    acompanante1Select.disabled = true;
    acompanante1Select.querySelectorAll('option').forEach(option => {
        option.disabled = option.value === selectedValue2;
    });

    if (acompanantes.length === 2) {
        acompanante1Select.disabled = acompanantes[0].Nombre !== selectedValue2 && acompanantes[1].Nombre !== selectedValue2;
    }

    showAcompananteDetails(event, document.getElementById('acompananteNombre2'), document.getElementById('acompananteApellido1_2'), document.getElementById('acompananteApellido2_2'), document.getElementById('acompananteTelefono1_2'),  document.getElementById('acompananteParentesco2'));
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
    document.getElementById('identificacion').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('primerApellido').value = '';
    document.getElementById('segundoApellido').value = '';
    document.getElementById('telefono1').value = '';
    document.getElementById('telefono2').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('camilla').checked = false;
    document.getElementById('prelacion').checked = false;
    document.getElementById('diagnostico').value = '';
    document.getElementById('fechaCita').value = '';
    document.getElementById('horaCita').value = '';

    limpiarCamposAcompanantes();
}


document.getElementById('btnGuardar').addEventListener('click', async function (event) {

    event.preventDefault();
    this.disabled = true; 
    
 const guardarCita = async () => {
        if (!idPaciente) {
            showToast('Error', 'No se ha obtenido el IdPaciente.');
            this.disabled = false;
            return;
        }

    const diagnostico = document.getElementById('diagnostico').value;
    const fechaCita = document.getElementById('fechaCita').value;
    const horaCitaInput = document.getElementById('horaCita').value;
    const horaCita = `${horaCitaInput}:00`;
    const idUbicacionDestino = document.getElementById('destino').value; 

    if (!diagnostico || !fechaCita || !horaCitaInput || !idUbicacionDestino) {
        showToast('Error', 'Por favor, complete todos los campos requeridos.');
        document.getElementById('btnGuardar').disabled = false;
        return;
    }

    const acompanante1Nombre = document.getElementById('acompananteNombre1').value;
    const acompanante2Nombre = document.getElementById('acompananteNombre2').value;

    const idAcompanante1 = acompanante1Nombre ? acompanantes.find(acompanante => acompanante.Nombre === acompanante1Nombre)?.IdAcompanante : null;
    const idAcompanante2 = acompanante2Nombre ? acompanantes.find(acompanante => acompanante.Nombre === acompanante2Nombre)?.IdAcompanante : null;

    const idEspecialidad = 805;          
    const ubicacionOrigen = document.getElementById('traslado').value;
    const camillaCheckbox = document.getElementById('camilla');
    const prioridadCheckbox = document.getElementById('prelacion');
    const camilla = camillaCheckbox.checked ? 'Requerido' : 'No requerido';
    const prioridad = prioridadCheckbox.checked ? 'Alta' : 'Baja';
    const condicionCita = document.getElementById('condicion').value;
    const salida = document.getElementById('origen').value;
 
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
        "horaCita": horaCita,
        "transladoCita": salida
    };

    try {
        const response = await axios.post('https://backend-transporteccss.onrender.com/api/cita', citaData);
        showToast('Cita', 'Cita guardada correctamente.');
        limpiarCampos();
        setTimeout(() => {
            loadContent('formAppointment.html', 'mainContent');
        }, 1450);
    } catch (error) {
        console.error('Error saving appointment:', error);
        document.getElementById('btnGuardar').disabled = false;
        showToast('Error', 'Error al guardar la cita.');
    }
}
await guardarCita();
    
});

  function populateDestinos() {
    const selectDestino = document.getElementById('destino');

    axios.get('https://backend-transporteccss.onrender.com/api/destinos')
        .then(response => {
            const destinos = response.data;
            destinos.forEach(destino => {
                const option = document.createElement('option');
                option.value = destino.IdDestino;
                option.textContent = destino.Descripcion;
                selectDestino.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching destinos:', error);
        });
}

});

