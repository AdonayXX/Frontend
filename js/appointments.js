
getRutas();
getEspecialidadesByDestino();
applyMaskBasedOnType();


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
        loadContent('formAppointment.html', 'mainContent');
        limpiarCampos();
    }


    async function getPacienteCita(identificacion) {
        try {

            const token = localStorage.getItem('token');
            const API_URL = `https://backend-transporteccss.onrender.com/api/paciente`;
            const response = await axios.get(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            pacientes = response.data.pacientes;
            const pacienteEncontrado = pacientes.find(paciente => paciente.Identificacion === identificacion && paciente.Estado === 'Activo');

            if (pacienteEncontrado) {
                idPaciente = pacienteEncontrado.IdPaciente;
                document.getElementById('nombre').value = pacienteEncontrado.Nombre || '';
                document.getElementById('primerApellido').value = pacienteEncontrado.Apellido1 || '';
                document.getElementById('segundoApellido').value = pacienteEncontrado.Apellido2 || '';
                document.getElementById('telefonos').value = pacienteEncontrado.Telefono2 ? `${pacienteEncontrado.Telefono1 || ''} / ${pacienteEncontrado.Telefono2}` : pacienteEncontrado.Telefono1 || '';  document.getElementById('direccion').value = pacienteEncontrado.Direccion || '';
                document.getElementById('direccion').value = pacienteEncontrado.Direccion || '';

                const prioridadCheckbox = document.getElementById('prelacion');
                prioridadCheckbox.checked = pacienteEncontrado.Prioridad === 1;

                const origenSelect = document.getElementById('origen');
                origenSelect.value = pacienteEncontrado.LugarSalida;


                showToast('Datos del paciente', 'Datos del paciente cargados correctamente.');
                return true;
            } else {
                showToast('Error', 'No se encontró ningún paciente con esa identificación.');
                loadContent('formAppointment.html', 'mainContent');
                return false;
            }
        } catch (error) {
            console.error('Error fetching patient data:', error);
            showToast('Error', 'Error al obtener los datos del paciente.');
            loadContent('formAppointment.html', 'mainContent');
            return false;
        }
    }

    async function getAcompanantes(identificacion) {
        try {


            const token = localStorage.getItem('token');
            const API_URL_ACOMPANANTE = `https://backend-transporteccss.onrender.com/api/paciente/acompanantes/${identificacion}`;
            const response = await axios.get(API_URL_ACOMPANANTE, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            acompanantes = response.data.acompanantes;

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

            console.log(acompanantes)
        }
    }

    function showAcompananteDetails(event, nombreField, apellido1Field, telefonoField, parentescoField) {
        const selectedOption = event.target.value;
        if (!acompanantes || acompanantes.length === 0) {
            showToast('Acompañantes', 'No se encontraron acompañantes para este paciente.');
            return;
        }

        const acompanante = acompanantes.find(acompanante => acompanante.Nombre === selectedOption);
        if (acompanante) {
            nombreField.value = acompanante.Nombre || '';
            apellido1Field.value = acompanante.Apellido1 || '';
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

        showAcompananteDetails(event, document.getElementById('acompananteNombre1'), document.getElementById('acompananteApellido1_1'), document.getElementById('acompananteTelefono1_1'), document.getElementById('acompananteParentesco1'));
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

        showAcompananteDetails(event, document.getElementById('acompananteNombre2'), document.getElementById('acompananteApellido1_2'), document.getElementById('acompananteTelefono1_2'), document.getElementById('acompananteParentesco2'));
    }

    document.getElementById('acompananteNombre1').addEventListener('change', handleAcompanante1Change);
    document.getElementById('acompananteNombre2').addEventListener('change', handleAcompanante2Change);


    function limpiarCamposAcompanantes() {
        document.getElementById('acompananteNombre1').value = '';
        document.getElementById('acompananteApellido1_1').value = '';
        document.getElementById('acompananteTelefono1_1').value = '';
        document.getElementById('acompananteParentesco1').value = '';

        document.getElementById('acompananteNombre2').value = '';
        document.getElementById('acompananteApellido1_2').value = '';
        document.getElementById('acompananteTelefono1_2').value = '';
        document.getElementById('acompananteParentesco2').value = '';
    }
    function limpiarCampos() {
        document.getElementById('identificacion').value = '';
        document.getElementById('nombre').value = '';
        document.getElementById('primerApellido').value = '';
        document.getElementById('segundoApellido').value = '';
        document.getElementById('telefonos').value = '';
        document.getElementById('direccion').value = '';
        document.getElementById('camilla').checked = false;
        document.getElementById('prelacion').checked = false;
        document.getElementById('diagnostico').value = '';
        document.getElementById('fechaCita').value = '';
        document.getElementById('horaCita').value = '';
        document.getElementById('especialidad').value = '';
        document.getElementById('destino').value = '';
        document.getElementById('origen').value = '';
        // document.getElementById('condicion').value = '';


        limpiarCamposAcompanantes();
    }


    document.getElementById('btnGuardar').addEventListener('click', async function (event) {

        event.preventDefault();
        this.disabled = true;

        const guardarCita = async () => {
            if (!idPaciente) {
                console.log('Error', 'No se ha obtenido el IdPaciente.');
                this.disabled = false;
                return;
            }

            const diagnostico = document.getElementById('diagnostico').value;
            const fechaCita = document.getElementById('fechaCita').value;
            const horaCitaInput = document.getElementById('horaCita').value;
            const horaCita = `${horaCitaInput}:00`;
            const idUbicacionDestino = document.getElementById('destino').value;
            const idEspecialidad = document.getElementById('especialidad').value;
            const tipoSeguro = document.getElementById('tipoSeguro').value;

            if (!diagnostico || !fechaCita || !horaCitaInput || !idUbicacionDestino || !tipoSeguro || !idEspecialidad) {
                const camposFaltantes = [];
                if (!diagnostico) camposFaltantes.push('Diagnóstico');
                if (!fechaCita) camposFaltantes.push('Fecha de cita');
                if (!horaCitaInput) camposFaltantes.push('Hora de cita');
                if (!idUbicacionDestino) camposFaltantes.push('Destino');
                if (!tipoSeguro) camposFaltantes.push('Tipo de seguro');
                if(!idEspecialidad) camposFaltantes.push('Especialidad');

                const mensaje = `Por favor, complete los siguientes campos requeridos: ${camposFaltantes.join(', ')}.`;
                showToast('Aviso', mensaje);
                document.getElementById('btnGuardar').disabled = false;
                return;
            }

            const acompanante1Nombre = document.getElementById('acompananteNombre1').value;
            const acompanante2Nombre = document.getElementById('acompananteNombre2').value;

            const idAcompanante1 = acompanante1Nombre ? acompanantes.find(acompanante => acompanante.Nombre === acompanante1Nombre)?.IdAcompanante : null;
            const idAcompanante2 = acompanante2Nombre ? acompanantes.find(acompanante => acompanante.Nombre === acompanante2Nombre)?.IdAcompanante : null;

            const ubicacionOrigen = document.getElementById('traslado').value;
            const camillaCheckbox = document.getElementById('camilla');
            const prioridadCheckbox = document.getElementById('prelacion');
            const camilla = camillaCheckbox.checked ? 'Requerido' : 'No requerido';
            const prioridad = prioridadCheckbox.checked ? 'Alta' : 'Baja';
            const condicionCita = document.getElementById('condicion').value;
            const salida = document.getElementById('origen').value;

            const citaData = {
                "idPaciente": idPaciente,
                "idAcompanante1": idAcompanante1,
                "idAcompanante2": idAcompanante2,
                "idUbicacionDestino": idUbicacionDestino,
                "idEspecialidad": idEspecialidad,
                "ubicacionOrigen": ubicacionOrigen,
                "camilla": camilla,
                "prioridad": prioridad,
                "condicionCita": condicionCita,
                "tipoSeguro": tipoSeguro,
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



});
function getRutas() {
    const selectDestino = document.getElementById('destino');

    axios.get('https://backend-transporteccss.onrender.com/api/rutaEspecialidad')
        .then(response => {
            const rutas = response.data;
            rutas.forEach(ruta => {
                const option = document.createElement('option');
                option.value = ruta.IdRuta;
                option.textContent = ruta.DescripcionRuta;
                selectDestino.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching destinos:', error);
        });
}

function getEspecialidadesByDestino(IdRuta) {
    const selectEspecialidad = document.getElementById('especialidad');
    selectEspecialidad.innerHTML = ''; // Limpiar las opciones existentes

    const defaultOption = document.createElement('option');
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.value = '';
    defaultOption.textContent = '-- Seleccione una especialidad --';
    selectEspecialidad.appendChild(defaultOption);

    axios.get(`https://backend-transporteccss.onrender.com/api/rutaEspecialidad/${IdRuta}`)
        .then(response => {
            const especialidades = response.data;
            especialidades.forEach(especialidad => {
                const option = document.createElement('option');
                option.value = especialidad.idEspecialidad;
                option.textContent = especialidad.Especialidad;
                selectEspecialidad.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching especialidades:', error);
        });
}

document.getElementById('destino').addEventListener('change', function () {
    const IdRuta = this.value;
    getEspecialidadesByDestino(IdRuta);
});

document.getElementById('tipoIdentificacion').addEventListener('change', () => {
    applyMaskBasedOnType();
});

function applyMaskBasedOnType() {
    let tipoIdentificacion = document.getElementById('tipoIdentificacion').value;
    let identificacionInput = document.getElementById('identificacion');
    let mask = '';

    switch (tipoIdentificacion) {
        case 'Cedula de Identidad':
            mask = '0-0000-0000';
            break;
        case 'Número de Asegurado':
            mask = '00000000000000000000';
            break;
        case 'Interno':
            mask = '2536-00000000000000000000';
            break;
        default:
            mask = '';
            break;
    }

    applyIdentificationMask('identificacion', mask);
}

function applyIdentificationMask(elementId, mask) {
    let inputElement = document.getElementById(elementId);
    if (!inputElement) return;

    inputElement.addEventListener('input', () => {
        let rawValue = inputElement.value.replace(/\D/g, ''); // Eliminar caracteres no numéricos
        let maskedValue = maskIt(mask, rawValue);
        let cursorPosition = getCursorPosition(rawValue.length, mask);

        inputElement.value = maskedValue;
        setCursorPosition(inputElement, cursorPosition);
    });

    inputElement.addEventListener('keydown', (e) => {
        if (e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Backspace" || e.key === "Delete") {
            return;
        }

        if (!isNumeric(e.key)) {
            e.preventDefault();
        }
    });
}

function maskIt(pattern, value) {
    let maskedValue = '';
    let valueIndex = 0;

    for (let patternIndex = 0; patternIndex < pattern.length; patternIndex++) {
        if (valueIndex >= value.length) {
            break;
        }

        if (pattern[patternIndex] === '0') {
            maskedValue += value[valueIndex];
            valueIndex++;
        } else {
            maskedValue += pattern[patternIndex];
        }
    }

    return maskedValue;
}

function isNumeric(char) {
    return !isNaN(char - parseInt(char));
}

function getCursorPosition(rawLength, mask) {
    let cursorPosition = 0;
    let numDigits = 0;

    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === '0') {
            numDigits++;
        }
        if (numDigits >= rawLength) {
            cursorPosition = i + 1;
            break;
        }
    }

    return cursorPosition;
}

function setCursorPosition(inputElement, position) {
    if (inputElement.setSelectionRange) {
        inputElement.focus();
        inputElement.setSelectionRange(position, position);
    } else if (inputElement.createTextRange) {
        let range = inputElement.createTextRange();
        range.collapse(true);
        range.moveEnd('character', position);
        range.moveStart('character', position);
        range.select();
    }
}

applyMaskBasedOnType();

function refreshPageIfIdentificationExists() {
    const tipoIdentificacion = document.getElementById('tipoIdentificacion').value;
    const identificacion = document.getElementById('identificacion').value;

    // Check if the identification exists and the type has changed
    if (identificacion && tipoIdentificacion !== 'Cedula de Identidad' || identificacion && tipoIdentificacion !== 'Número de Asegurado' || identificacion && tipoIdentificacion !== 'Interno') {
        document.getElementById('identificacion').value = '';
        loadContent('formAppointment.html', 'mainContent');
    }
}


document.getElementById('tipoIdentificacion').addEventListener('change', refreshPageIfIdentificationExists);