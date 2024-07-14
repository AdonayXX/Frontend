"use strict";

document.getElementById('fuelForm').addEventListener('submit', function (event) {
    if (event.submitter.id === 'btnGuardar') {
        event.preventDefault();
        postRegistroCombustible();
    } else if (event.submitter.id === 'btnActualizar') {
        event.preventDefault();
        putRegistroCombustible();
    }
});

document.getElementById('unidad').addEventListener('change', manejarCambioUnidad);
document.getElementById('btnLimpiar').addEventListener('click', function (event) {
    event.preventDefault();
    limpiar();
});

function mostrarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'flex';
}

function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}

function manejarCambioUnidad(event) {
    event.preventDefault();
    getRegistroCombustible();
}

function limpiar() {
    document.getElementById('fuelForm').reset();
    document.getElementById('chofer').selectedIndex = 0;
    document.getElementById('unidad').selectedIndex = 0;
    document.getElementById('btnLimpiar').style.display = 'none';
    document.getElementById('btnActualizar').disabled = true;
    document.getElementById('btnEliminar').disabled = true;
    // document.getElementById('unidad').disabled = false;
}

async function getUnidades() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades');
        const unidades = response.data.unidades.filter(unidad => unidad.idEstado !== 5);

        const unit = document.getElementById('unidad');
        unit.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione la unidad...';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        unit.appendChild(defaultOption);

        unidades.forEach(unidad => {
            const option = document.createElement('option');
            option.value = unidad.id;
            option.textContent = unidad.numeroUnidad;
            unit.appendChild(option);
        });
        ocultarSpinner();

    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

async function getChoferes() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer');
        const choferes = response.data.choferes;

        const assignedDriver = document.getElementById('chofer');
        assignedDriver.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione el chofer...';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        assignedDriver.appendChild(defaultOption);

        choferes.forEach(chofer => {
            const option = document.createElement('option');
            option.value = chofer.idChofer;
            option.textContent = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
            assignedDriver.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los choferes:', error);
    }
}

async function getRegistroCombustible() {
    const unitSelect = document.getElementById('unidad');
    const unitNumber = unitSelect.options[unitSelect.selectedIndex].text;

    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${unitNumber}`);
        const fuelLog = response.data.registro.filter(log => log.estado === 'activo');

        unitSelect.removeEventListener('change', manejarCambioUnidad);
        const choferSelect = document.getElementById('chofer');

        fuelLog.forEach(log => {
            for (let i = 0; i < choferSelect.options.length; i++) {
                if (choferSelect.options[i].text === log.chofer) {
                    choferSelect.selectedIndex = i;
                    break;
                }
            }

            for (let i = 0; i < unitSelect.options.length; i++) {
                if (unitSelect.options[i].text === log.numeroUnidad) {
                    unitSelect.selectedIndex = i;
                    break;
                }
            }

            document.getElementById('numeroFactura').value = log.numeroFactura;
            document.getElementById('numeroAutorizacion').value = log.numeroAutorizacion;
            document.getElementById('tipoCombustible').value = log.tipoCombustible;
            document.getElementById('litros').value = log.litrosAproximados;
            document.getElementById('kilometraje').value = log.kilometraje;
            document.getElementById('monto').value = log.montoColones;
            document.getElementById('lugar').value = log.lugar;
            document.getElementById('fecha').value = new Date(log.fecha).toISOString().split('T')[0];
            document.getElementById('hora').value = log.hora;

            document.getElementById('btnLimpiar').style.display = 'inline-block';
            document.getElementById('btnActualizar').disabled = false;
            document.getElementById('btnEliminar').disabled = false;
            // document.getElementById('unidad').disabled = true;
        });

        unitSelect.addEventListener('change', manejarCambioUnidad);

    } catch (error) {
        console.error('Error al obtener el registro de combustible:', error);
        showToast('Error', 'Error al obtener el registro de combustible.');
    }
}

function postRegistroCombustible() {
    const chofer = document.getElementById('chofer');
    const unidadSelect = document.getElementById('unidad');
    const unidadContent = unidadSelect.options[unidadSelect.selectedIndex].text;
    const litros = parseFloat(document.getElementById('litros').value).toFixed(2);
    const kilometraje = parseInt(document.getElementById('kilometraje').value, 10);
    const monto = parseFloat(document.getElementById('monto').value).toFixed(2);
    const lugar = document.getElementById('lugar').value;
    const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
    const horaCitaInput = document.getElementById('hora').value;
    const hora = `${horaCitaInput}:00`;
    const tipoCombustible = document.getElementById('tipoCombustible').value;
    const numeroFactura = document.getElementById('numeroFactura').value;
    const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;

    const fuelLogData = {
        numeroUnidad: unidadContent,
        montoColones: monto,
        litrosAproximados: litros,
        kilometraje: kilometraje,
        fecha: fecha,
        hora: hora,
        lugar: lugar,
        chofer: chofer.options[chofer.selectedIndex].text,
        usuario: null,
        tipoCombustible: tipoCombustible,
        numeroFactura: numeroFactura,
        numeroAutorizacion: numeroAutorizacion,
        estado: "activo"
    };

    console.log('Datos a enviar:', fuelLogData);

    axios.post('https://backend-transporteccss.onrender.com/api/registroCombustible', fuelLogData)
        .then(response => {
            limpiar();
            console.log('Registro de combustible realizado:', response.data);
            showToast('Registro exitoso', 'El registro de combustible se ha realizado exitosamente.');
        })
        .catch(error => {
            console.error('Error al crear el registro de combustible:', error);
            showToast('Error', 'Error al guardar el registro de combustible.');
        });
}

async function getIdRegistroCombustible(numeroUnidad) {
    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${numeroUnidad}`);
        const fuelLog = response.data.registro.find(log => log.estado === 'activo');
        return fuelLog.id;
    } catch (error) {
        console.error('Error al obtener el ID del registro de combustible:', error);
        showToast('Error', 'Error al obtener el ID del registro de combustible.');
    }
}


async function putRegistroCombustible() {
    const unidadSelect = document.getElementById('unidad');
    const unidadContent = unidadSelect.options[unidadSelect.selectedIndex].text;

    try {
        const idRegistro = await getIdRegistroCombustible(unidadContent);
        const chofer = document.getElementById('chofer');
        const litros = parseFloat(document.getElementById('litros').value).toFixed(2);
        const kilometraje = parseInt(document.getElementById('kilometraje').value, 10);
        const monto = parseFloat(document.getElementById('monto').value).toFixed(2);
        const lugar = document.getElementById('lugar').value;
        const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
        const horaCitaInput = document.getElementById('hora').value;
        const hora = `${horaCitaInput}:00`;
        const tipoCombustible = document.getElementById('tipoCombustible').value;
        const numeroFactura = document.getElementById('numeroFactura').value;
        const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;

        const fuelLogData = {
            id: idRegistro,
            numeroUnidad: unidadContent,
            montoColones: monto,
            litrosAproximados: litros,
            kilometraje: kilometraje,
            fecha: fecha,
            hora: hora,
            lugar: lugar,
            chofer: chofer.options[chofer.selectedIndex].text,
            usuario: "",
            tipoCombustible: tipoCombustible,
            numeroFactura: numeroFactura,
            numeroAutorizacion: numeroAutorizacion,
            estado: "activo"
        };

        console.log('Datos a enviar para actualizar:', fuelLogData);

        axios.put(`https://backend-transporteccss.onrender.com/api/registroCombustible/${idRegistro}`, fuelLogData)
            .then(response => {
                limpiar();
                console.log('Actualización de registro de combustible realizada:', response.data);
                showToast('Actualización exitosa', 'El registro de combustible se ha actualizado exitosamente.');
            })
            .catch(error => {
                console.error('Error al actualizar el registro de combustible:', error);
                showToast('Error', 'Error al actualizar el registro de combustible.');
            });

    } catch (error) {
        console.error('Error al obtener ID del registro de combustible:', error);
        showToast('Error', 'Error al obtener ID del registro de combustible.');
    }
}

getChoferes();
getUnidades();