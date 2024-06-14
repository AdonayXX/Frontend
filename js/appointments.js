document.getElementById('identificacion').addEventListener('blur', async function (event) {
    const identificacion = this.value.trim();

    if (identificacion) {
        await getPacienteCita(identificacion);
        await getAcompanantes(identificacion);
    } else {
        limpiarCampos();
    }
});

async function getPacienteCita(identificacion) {
    try {
        const API_URL = `http://localhost:18026/api/paciente`;
        const response = await axios.get(API_URL);
        const pacientes = response.data.pacientes;

        const pacienteEncontrado = pacientes.find(paciente => paciente.Identificacion === identificacion && paciente.Estado === 'Activo');

        if (pacienteEncontrado) {
            document.getElementById('nombre').value = pacienteEncontrado.Nombre || '';
            document.getElementById('primerApellido').value = pacienteEncontrado.Apellido1 || '';
            document.getElementById('segundoApellido').value = pacienteEncontrado.Apellido2 || '';
            document.getElementById('telefono1').value = pacienteEncontrado.Telefono1 || '';
            document.getElementById('telefono2').value = pacienteEncontrado.Telefono2 || '';
            document.getElementById('direccion').value = pacienteEncontrado.Direccion || '';

            showToast('Datos del paciente', 'Datos del paciente cargados correctamente.');
        } else {
            showToast('Error', 'No se encontró ningún paciente con esa identificación.');
        }
    } catch (error) {
        console.error('Error fetching patient data:', error);
        showToast('Error', 'Error al obtener los datos del paciente.');
    }
}

async function getAcompanantes(identificacion) {
    try {
        const API_URL_PACIENTE = `http://localhost:18026/api/paciente`;
        const responsePaciente = await axios.get(API_URL_PACIENTE);
        const pacientes = responsePaciente.data.pacientes;

        const pacienteEncontrado = pacientes.find(paciente => paciente.Identificacion === identificacion && paciente.Estado === 'Activo');

        if (!pacienteEncontrado) {
            showToast('Error', 'No se encontró ningún paciente con esa identificación.');
            return;
        }

        const idPaciente = pacienteEncontrado.IdPaciente;
        const API_URL_ACOMPANANTE = `http://localhost:18026/api/acompanante`;
        const responseAcompanante = await axios.get(API_URL_ACOMPANANTE);
        acompanantes = responseAcompanante.data.acompanantes;

        const acompanantesDelPaciente = acompanantes.filter(acompanante => acompanante.IdPaciente === idPaciente);

        const acompanante1Select = document.getElementById('acompananteNombre1');
        const acompanante2Select = document.getElementById('acompananteNombre2');

        acompanante1Select.innerHTML = '<option value="">Seleccionar Acompañante</option>';
        acompanante2Select.innerHTML = '<option value="">Seleccionar Acompañante</option>';

        acompanantesDelPaciente.forEach(acompanante => {
            const option = document.createElement('option');
            option.text = acompanante.Nombre;
            option.value = acompanante.Nombre;
            acompanante1Select.add(option);
            acompanante2Select.add(option.cloneNode(true));
        });

        acompanante2Select.disabled = true;

        if (acompanantesDelPaciente.length > 0) {
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
            nombreField.value = acompanante.Nombre;
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
        acompanante2Select.disabled = true;
        acompanante2Select.value = "";
        return;
    }

    acompanante2Select.disabled = false;

    Array.from(acompanante2Select.options).forEach(option => {
        option.disabled = option.value === selectedValue1;
    });

    showAcompananteDetails(event, document.getElementById('acompananteNombre1'), document.getElementById('acompananteApellido1_1'), document.getElementById('acompananteApellido2_1'), document.getElementById('acompananteTelefono1_1'),document.getElementById('acompananteParentesco1'));
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

    Array.from(acompanante1Select.options).forEach(option => {
        option.disabled = option.value === selectedValue2;
    });

    showAcompananteDetails(event, document.getElementById('acompananteNombre2'), document.getElementById('acompananteApellido1_2'), document.getElementById('acompananteApellido2_2'), document.getElementById('acompananteTelefono1_2'), document.getElementById('acompananteParentesco2'));
}

document.getElementById('acompananteNombre1').addEventListener('change', handleAcompanante1Change);
document.getElementById('acompananteNombre2').addEventListener('change', handleAcompanante2Change);



function limpiarCampos() {
    document.getElementById('nombre').value = '';
    document.getElementById('primerApellido').value = '';
    document.getElementById('segundoApellido').value = '';
    document.getElementById('telefono1').value = '';
    document.getElementById('telefono2').value = '';
    document.getElementById('direccion').value = '';

    limpiarCamposAcompanantes();
}

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

document.getElementById('acompananteNombre1').addEventListener('change', (event) => {

});

document.getElementById('acompananteNombre2').addEventListener('change', (event) => {

});

