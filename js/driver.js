(function() {
    var acompananteCount = 0;

    document.getElementById('btnAddAcompanante').addEventListener('click', function() {
        if (acompananteCount < 2) {
            acompananteCount++;
            document.getElementById('acompanante' + acompananteCount).style.display = 'block';
        }
    });

    document.getElementById('btnRemoveAcompanante').addEventListener('click', function() {
        if (acompananteCount > 0) {
            document.getElementById('acompanante' + acompananteCount).style.display = 'none';
            acompananteCount--;
        }
    });
})();

// ---------------------------------POST------------------------------------------------ //

document.getElementById('btnActualizar').disabled = true;

document.getElementById('btnGuardar').addEventListener('click', async function (event) {
    event.preventDefault();
    this.disabled = true;

    const guardarChofer = async () => {
        const cedula =  document.getElementById('cedula').value;
        const nombre = document.getElementById('nombre').value;
        const apellido1 = document.getElementById('apellido1').value;
        const apellido2 = document.getElementById('apellido2').value;
        const contacto = document.getElementById('contacto').value;
        const tipoSangre = document.getElementById('tipoSangre').value;
        const tipoLicencia = document.getElementById('tipoLicencia').value;
        const fechaVencimientoLicencia = document.getElementById('fechaVencimientoLicencia').value;
        const estadoChofer = document.getElementById('estado').value;

        //A1
        const contactoEmergencia = document.getElementById('contactoEmergencia').value || null;
        const nombreCE = document.getElementById('acompananteNombreN1').value || null;
        const apellido1CE = document.getElementById('apellido1CE1').value || null;
        const apellido2CE = document.getElementById('apellido2CE1').value || null;

        //A2
        const contactoEmergencia2 = document.getElementById('contactoEmergencia2').value || null;
        const nombreCE2 = document.getElementById('acompananteNombreN2').value || null;
        const apellido1CE2 = document.getElementById('apellido1CE2').value || null;
        const apellido2CE2 = document.getElementById('apellido2CE2').value || null;


        if (!cedula || !nombre || !apellido1 || !apellido2 || !tipoSangre || !tipoLicencia || !fechaVencimientoLicencia) {
            const camposFaltantes = [];
            if (!cedula) camposFaltantes.push('Cédula');
            if (!nombre) camposFaltantes.push('Nombre');
            if (!apellido1) camposFaltantes.push('Primer apellido');
            if (!apellido2) camposFaltantes.push('Segundo apellido');
            if (!tipoSangre) camposFaltantes.push('Tipo de sangre');
            if (!tipoLicencia) camposFaltantes.push('Tipo de licencia');
            if (!fechaVencimientoLicencia) camposFaltantes.push('Fecha de vencimiento de la licencia');
            
            const mensaje = `Por favor, complete los siguientes campos requeridos: ${camposFaltantes.join(', ')}.`;
            showToast('Aviso', mensaje);
            this.disabled = false;
            return;
        }

        const choferData = {
            "cedula": cedula,
            "nombre": nombre,
            "apellido1": apellido1,
            "apellido2": apellido2,
            "contacto": contacto,
            "tipoSangre": tipoSangre,
            "tipoLicencia": tipoLicencia,
            "vencimientoLicencia": fechaVencimientoLicencia,
            "contactoEmergencia1": contactoEmergencia,
            "nombreCE1": nombreCE,
            "apellido1CE1": apellido1CE,
            "apellido2CE1": apellido2CE,
            "contactoEmergencia2": contactoEmergencia2,
            "nombreCE2": nombreCE2,
            "apellido1CE2": apellido1CE2,
            "apellido2CE2": apellido2CE2,
            "estadoChofer": estadoChofer,
            "usuario": 1
        };

        try {
            const response = await axios.post('https://backend-transporteccss.onrender.com/api/chofer',choferData);

            if (response.status === 201) {
                showToast('Éxito', 'Chofer registrado exitosamente.');
                setTimeout(() => {
                    loadContent('formdriver.html', 'mainContent');
                }, 2000);
            }
        } catch (error) {
            console.error('Error al registrar el chofer:', error);
            showToast('Error', 'Error al registrar el chofer.');
            this.disabled = false;
        }
    }

    await guardarChofer();
});

document.getElementById('contacto').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
        value = value.slice(0, 4) + '-' + value.slice(4);
    }
    e.target.value = value;
});

document.getElementById('contactoEmergencia').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
        value = value.slice(0, 4) + '-' + value.slice(4);
    }
    e.target.value = value;
});

document.getElementById('contactoEmergencia2').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
        value = value.slice(0, 4) + '-' + value.slice(4);
    }
    e.target.value = value;
});


// ---------------------------------GET------------------------------------------------ //

document.getElementById('cedula').addEventListener('blur', async function (event) {
    const cedula = this.value.trim();
    if (cedula === '') {
        limpiarCampos();
        document.getElementById('btnGuardar').disabled = false;
        document.getElementById('btnActualizar').disabled = true;
        return;
    }
    await getChofer(cedula);
});

async function getChofer(cedula) {
    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/chofer/cedula/${cedula}`);
        const choferes = response.data.chofer;

        const choferEncontrado = choferes[0]; // como la cedula es unica, solo se espera un chofer	
        if (choferEncontrado) {
            document.getElementById('nombre').value = choferEncontrado.nombre || '';
            document.getElementById('apellido1').value = choferEncontrado.apellido1 || '';
            document.getElementById('apellido2').value = choferEncontrado.apellido2 || '';
            document.getElementById('contacto').value = choferEncontrado.contacto || '';
            document.getElementById('tipoSangre').value = choferEncontrado.tipoSangre || '';
            document.getElementById('tipoLicencia').value = choferEncontrado.tipoLicencia || '';
            document.getElementById('fechaVencimientoLicencia').value = choferEncontrado.vencimientoLicencia ? new Date(choferEncontrado.vencimientoLicencia).toISOString().split('T')[0] : '';
            document.getElementById('estado').value = choferEncontrado.estadoChofer || '';
            document.getElementById('acompananteNombreN1').value = choferEncontrado.nombreCE1 || ''; 
            document.getElementById('apellido1CE1').value = choferEncontrado.apellido1CE1 || '';
            document.getElementById('apellido2CE1').value = choferEncontrado.apellido2CE1 || '';
            document.getElementById('contactoEmergencia').value = choferEncontrado.contactoEmergencia1 || '';
            document.getElementById('acompananteNombreN2').value = choferEncontrado.nombreCE2 || ''; 
            document.getElementById('apellido1CE2').value = choferEncontrado.apellido1CE2 || '';
            document.getElementById('apellido2CE2').value = choferEncontrado.apellido2CE2 || '';
            document.getElementById('contactoEmergencia2').value = choferEncontrado.contactoEmergencia2 || '';

            document.getElementById('nombre').disabled = false;
            document.getElementById('apellido1').disabled = false;
            document.getElementById('apellido2').disabled = false;
            document.getElementById('contacto').disabled = false;
            document.getElementById('tipoLicencia').disabled = false;
            document.getElementById('fechaVencimientoLicencia').disabled = false;
            document.getElementById('estado').disabled = false;
            document.getElementById('acompananteNombreN1').disabled = false;
            document.getElementById('apellido1CE1').disabled = false;
            document.getElementById('apellido2CE1').disabled = false;
            document.getElementById('contactoEmergencia').disabled = false;

            document.getElementById('acompananteNombreN2').disabled = false;
            document.getElementById('apellido1CE2').disabled = false;
            document.getElementById('apellido2CE2').disabled = false;
            document.getElementById('contactoEmergencia2').disabled = false;

            showToast('Datos del chofer', 'Datos del chofer cargados correctamente.');
            document.getElementById('btnGuardar').disabled = true;
            document.getElementById('btnActualizar').disabled = false;
            return true;



        } else {
            setTimeout(() => {
            showToast('Error', 'No se encuentra ningun chofer registrado con la cédula ingresada.');
            document.getElementById('btnGuardar').disabled = false;
            document.getElementById('btnActualizar').disabled = true;
            }
            , 0);
            return false;
        }
    } catch (error) {
        showToast('Error', 'Error al obtener los datos del chofer.');
        return false;
    }
}
// ---------------------------------PUT------------------------------------------------ //

document.getElementById('btnActualizar').addEventListener('click', function (event) {
    event.preventDefault();
    this.disabled = true;

    const cedula = document.getElementById('cedula').value;
    const nombre = document.getElementById('nombre').value;
    const apellido1 = document.getElementById('apellido1').value;
    const apellido2 = document.getElementById('apellido2').value;
    const contacto = document.getElementById('contacto').value;
    const tipoLicencia = document.getElementById('tipoLicencia').value;
    const tipoSangre = document.getElementById('tipoSangre').value;
    const fechaVencimientoLicencia = document.getElementById('fechaVencimientoLicencia').value;
    const estadoChofer = document.getElementById('estado').value;
    const contactoEmergencia1 = document.getElementById('contactoEmergencia').value || null;
    const nombreCE1 = document.getElementById('acompananteNombreN1').value || null;
    const apellido1CE1 = document.getElementById('apellido1CE1').value || null;
    const apellido2CE1 = document.getElementById('apellido2CE1').value || null;
    const contactoEmergencia2 = document.getElementById('contactoEmergencia2').value || null;
    const nombreCE2 = document.getElementById('acompananteNombreN2').value || null;
    const apellido1CE2 = document.getElementById('apellido1CE2').value || null;
    const apellido2CE2 = document.getElementById('apellido2CE2').value || null;

    if (!cedula || !nombre || !apellido1 || !apellido2 || !tipoLicencia || !fechaVencimientoLicencia) {
        showToast('Error', 'Por favor, complete todos los campos requeridos.');
        this.disabled = false;
        return;
    }

    const updatedDataChofer = {
        "nombre": nombre,
        "apellido1": apellido1,
        "apellido2": apellido2,
        "contacto": contacto ? parseInt(contacto) : null,
        "tipoSangre": tipoSangre,
        "tipoLicencia": tipoLicencia,
        "vencimientoLicencia": fechaVencimientoLicencia,
        "contactoEmergencia1": contactoEmergencia1 ? parseInt(contactoEmergencia1) : null,
        "nombreCE1": nombreCE1,
        "apellido1CE1": apellido1CE1,
        "apellido2CE1": apellido2CE1,
        "contactoEmergencia2": contactoEmergencia2 ? parseInt(contactoEmergencia2) : null,
        "nombreCE2": nombreCE2,
        "apellido1CE2": apellido1CE2,
        "apellido2CE2": apellido2CE2,
        "estadoChofer": estadoChofer,
        "usuario": 1
    };

    console.log(updatedDataChofer);

    axios.put(`https://backend-transporteccss.onrender.com/api/chofer/${cedula}`, updatedDataChofer, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log(response.data);
        showToast('Éxito', 'Chofer actualizado exitosamente.');
        setTimeout(() => {
            loadContent('formdriver.html', 'mainContent');
        }, 2000);
    })
    .catch(error => {
        console.error('Error al actualizar el chofer:', error.message);
        showToast('Error', 'Error al actualizar el chofer.');
    })
   
});

// ---------------------------------LIMPIAR CAMPOS------------------------------------------------ //
function limpiarCampos() {
    // document.getElementById('cedula').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('apellido1').value = '';
    document.getElementById('apellido2').value = '';
    document.getElementById('contacto').value = '';
    document.getElementById('tipoSangre').value = 'A+';
    document.getElementById('tipoLicencia').value = '';
    document.getElementById('fechaVencimientoLicencia').value = '';
    document.getElementById('estado').value = 'Activo';
    document.getElementById('acompananteNombreN1').value = '';
    document.getElementById('apellido1CE1').value = '';
    document.getElementById('apellido2CE1').value = '';
    document.getElementById('contactoEmergencia').value = '';
    document.getElementById('acompananteNombreN2').value = '';
    document.getElementById('apellido1CE2').value = '';
    document.getElementById('apellido2CE2').value = '';
    document.getElementById('contactoEmergencia2').value = '';
}


