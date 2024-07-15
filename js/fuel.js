"use strict";

document.getElementById('fuelForm').addEventListener('submit', function (event) {
    if (event.submitter.id === 'btnGuardar') {
        mostrarSpinner();
        event.preventDefault();
        postRegistroCombustible();
    } else if (event.submitter.id === 'btnActualizar') {
        mostrarSpinner();
        event.preventDefault();
        putRegistroCombustible();
    } else if (event.submitter.id === 'btnEliminar') {
        mostrarSpinner();
        event.preventDefault();
        deleteRegistroCombustible();
    }
});

document.getElementById('btnBuscar').addEventListener('click', function (event) {
    event.preventDefault();
    getRegistroCombustible();
});

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

function limpiar() {
    document.getElementById('fuelForm').reset();
    document.getElementById('chofer').selectedIndex = 0;
    document.getElementById('unidad').selectedIndex = 0;
    document.getElementById('btnLimpiar').style.display = 'none';
    document.getElementById('btnActualizar').disabled = true;
    document.getElementById('btnEliminar').disabled = true;
}

async function autorizacionDuplicado(numeroAutorizacion, idRegistro = null) {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/registroCombustible');
        const registros = response.data.registros;

        const duplicado = registros.some(registro => registro.numeroAutorizacion === numeroAutorizacion && registro.id !== idRegistro);

        return duplicado;
    } catch (error) {
        console.error('Error al obtener los registros de combustible:', error);
        showToast('Error', 'Error al obtener los registros de combustible.');
        return false;
    }
}

async function facturaDuplicado(numeroFactura, idRegistro = null) {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/registroCombustible');
        const registros = response.data.registros;

        const duplicado = registros.some(registro => registro.numeroFactura === numeroFactura && registro.id !== idRegistro);

        return duplicado;
    } catch (error) {
        console.error('Error al obtener los registros de combustible:', error);
        showToast('Error', 'Error al obtener los registros de combustible.');
        return false;
    }
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
    const unidadSelect = document.getElementById('unidad');
    const unidad = unidadSelect.options[unidadSelect.selectedIndex].text;

    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${unidad}`);
        const registros = response.data.registro;

        if (registros.length === 0 && unidad !== 'Seleccione la unidad...') {
            showToast('Error', `No hay registros de combustible de la unidad ${unidad}.`);
            return;
        }

        const fuelLog = registros.filter(log => log.estado === 'activo');

        if (fuelLog.length > 0) {
            fuelLog.sort((a, b) => {
                const dateComparison = new Date(b.fecha) - new Date(a.fecha);
                if (dateComparison === 0) {
                    const timeComparison = b.hora.localeCompare(a.hora);
                    if (timeComparison === 0) {
                        return b.id - a.id;
                    }
                    return timeComparison;
                }
                return dateComparison;
            });

            const latestLog = fuelLog[0];

            const choferSelect = document.getElementById('chofer');
            const tipoCombustibleSelect = document.getElementById('tipoCombustible');

            for (let i = 0; i < choferSelect.options.length; i++) {
                if (choferSelect.options[i].text === latestLog.chofer) {
                    choferSelect.selectedIndex = i;
                    break;
                }
            }

            for (let i = 0; i < unidadSelect.options.length; i++) {
                if (unidadSelect.options[i].text === latestLog.numeroUnidad) {
                    unidadSelect.selectedIndex = i;
                    break;
                }
            }

            for (let i = 0; i < tipoCombustibleSelect.options.length; i++) {
                if (tipoCombustibleSelect.options[i].text === latestLog.tipoCombustible) {
                    tipoCombustibleSelect.selectedIndex = i;
                    break;
                }
            }

            document.getElementById('numeroFactura').value = latestLog.numeroFactura;
            document.getElementById('numeroAutorizacion').value = latestLog.numeroAutorizacion;
            document.getElementById('litros').value = latestLog.litrosAproximados;
            document.getElementById('kilometraje').value = latestLog.kilometraje;
            document.getElementById('monto').value = latestLog.montoColones;
            document.getElementById('lugar').value = latestLog.lugar;
            document.getElementById('fecha').value = new Date(latestLog.fecha).toISOString().split('T')[0];
            document.getElementById('hora').value = latestLog.hora;

            document.getElementById('btnLimpiar').style.display = 'inline-block';
            document.getElementById('btnActualizar').disabled = false;
            document.getElementById('btnEliminar').disabled = false;
        }

    } catch (error) {
        console.error('Error al obtener el registro de combustible:', error);
        showToast('Error', 'Error al obtener el registro de combustible.');
    }
}

async function getIdRegistroCombustible(unidad) {
    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${unidad}`);
        const registros = response.data.registro;

        if (!registros.length) {
            showToast('Error', 'No hay registros de combustible para esta unidad.');
            return;
        }

        const fuelLog = registros.filter(log => log.estado === 'activo');

        if (fuelLog.length > 0) {
            fuelLog.sort((a, b) => {
                const dateComparison = new Date(b.fecha) - new Date(a.fecha);
                if (dateComparison === 0) {
                    const timeComparison = b.hora.localeCompare(a.hora);
                    if (timeComparison === 0) {
                        return b.id - a.id;
                    }
                    return timeComparison;
                }
                return dateComparison;
            });

            const latestLog = fuelLog[0];

            return latestLog.id;
        }

    } catch (error) {
        console.error('Error al obtener el registro de combustible:', error);
        showToast('Error', 'Error al obtener el registro de combustible.');
    }
}

async function postRegistroCombustible() {
    const chofer = document.getElementById('chofer');
    const unidadSelect = document.getElementById('unidad');
    const unidad = unidadSelect.options[unidadSelect.selectedIndex].text;
    const litros = document.getElementById('litros').value;
    const kilometraje = document.getElementById('kilometraje').value;
    const monto = document.getElementById('monto').value;
    const lugar = document.getElementById('lugar').value;
    const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
    const horaCitaInput = document.getElementById('hora').value;
    const hora = `${horaCitaInput}`;
    const tipoCombustibleSelect = document.getElementById('tipoCombustible');
    const tipoCombustible = tipoCombustibleSelect.options[tipoCombustibleSelect.selectedIndex].text
    const numeroFactura = document.getElementById('numeroFactura').value;
    const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;

    const response = await axios.get(`https://backend-transporteccss.onrender.com/api/unidades/${unidad}`)
    const unidadData = response.data.unidades;
    const kilometrajeActual = unidadData[0].kilometrajeActual;

    if (kilometraje < kilometrajeActual) {
        showToast('Error', `El kilometraje de recarga de la unidad ${unidad} no puede ser menor que su kilometraje actual.`);
        return;
    }

    const idRegistro = await getIdRegistroCombustible(unidad);
    if (await facturaDuplicado(numeroFactura, idRegistro)) {
        showToast('Error', `El número de factura ${numeroFactura} ya existe.`);
        return;
    } else if (await autorizacionDuplicado(numeroAutorizacion, idRegistro)) {
        showToast('Error', `El número de autorización ${numeroAutorizacion} ya existe.`);
        return;
    }

    const fuelLogData = {
        numeroUnidad: unidad,
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

    axios.post('https://backend-transporteccss.onrender.com/api/registroCombustible', fuelLogData)
        .then(response => {
            limpiar();
            ocultarSpinner();
            showToast('Registro exitoso', `El registro de combustible de la unidad ${unidad} se ha realizado exitosamente.`);
        })
        .catch(error => {
            ocultarSpinner();
            console.error('Error al crear el registro de combustible:', error);
            showToast('Error', 'Error al guardar el registro de combustible.');
        });
}

async function putRegistroCombustible() {
    const unidadSelect = document.getElementById('unidad');
    const unidad = unidadSelect.options[unidadSelect.selectedIndex].text;
    const chofer = document.getElementById('chofer');
    const litros = document.getElementById('litros').value;
    const kilometraje = document.getElementById('kilometraje').value;
    const monto = document.getElementById('monto').value;
    const lugar = document.getElementById('lugar').value;
    const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
    const horaCitaInput = document.getElementById('hora').value;
    const hora = `${horaCitaInput}`;
    const tipoCombustibleSelect = document.getElementById('tipoCombustible');
    const tipoCombustible = tipoCombustibleSelect.options[tipoCombustibleSelect.selectedIndex].text
    const numeroFactura = document.getElementById('numeroFactura').value;
    const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;

    const response = await axios.get(`https://backend-transporteccss.onrender.com/api/unidades/${unidad}`)
    const unidadData = response.data.unidades;
    const kilometrajeActual = unidadData[0].kilometrajeActual;

    if (kilometraje < kilometrajeActual) {
        showToast('Error', `El kilometraje de recarga de la unidad ${unidad} no puede ser menor que su kilometraje actual.`);
        return;
    }

    const idRegistro = await getIdRegistroCombustible(unidad);
    if (await facturaDuplicado(numeroFactura, idRegistro)) {
        showToast('Error', `El número de factura ${numeroFactura} ya existe.`);
        return;
    } else if (await autorizacionDuplicado(numeroAutorizacion, idRegistro)) {
        showToast('Error', `El número de autorización ${numeroAutorizacion} ya existe.`);
        return;
    }

    const fuelLogData = {
        numeroUnidad: unidad,
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

    axios.put(`https://backend-transporteccss.onrender.com/api/registroCombustible/${idRegistro}`, fuelLogData)
        .then(response => {
            limpiar();
            ocultarSpinner();
            showToast('Actualización exitosa', 'El registro de combustible se ha actualizado exitosamente.');
        })
        .catch(error => {
            ocultarSpinner();
            console.error('Error al actualizar el registro de combustible:', error);
            showToast('Error', 'Error al actualizar el registro de combustible.');
        });
}

async function deleteRegistroCombustible() {
    const unidadSelect = document.getElementById('unidad');
    const unidad = unidadSelect.options[unidadSelect.selectedIndex].text;
    const chofer = document.getElementById('chofer');
    const litros = document.getElementById('litros').value;
    const kilometraje = document.getElementById('kilometraje').value;
    const monto = document.getElementById('monto').value;
    const lugar = document.getElementById('lugar').value;
    const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
    const horaCitaInput = document.getElementById('hora').value;
    const hora = `${horaCitaInput}`;
    const tipoCombustibleSelect = document.getElementById('tipoCombustible');
    const tipoCombustible = tipoCombustibleSelect.options[tipoCombustibleSelect.selectedIndex].text
    const numeroFactura = document.getElementById('numeroFactura').value;
    const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;

    const response = await axios.get(`https://backend-transporteccss.onrender.com/api/unidades/${unidad}`)
    const unidadData = response.data.unidades;
    const kilometrajeActual = unidadData[0].kilometrajeActual;

    if (kilometraje < kilometrajeActual) {
        showToast('Error', `El kilometraje de recarga de la unidad ${unidad} no puede ser menor que su kilometraje actual.`);
        return;
    }

    const idRegistro = await getIdRegistroCombustible(unidad);
    if (await facturaDuplicado(numeroFactura, idRegistro)) {
        showToast('Error', `El número de factura ${numeroFactura} ya existe.`);
        return;
    } else if (await autorizacionDuplicado(numeroAutorizacion, idRegistro)) {
        showToast('Error', `El número de autorización ${numeroAutorizacion} ya existe.`);
        return;
    }

    const confirmationMessage = document.getElementById('deleteConfirmationMessage');
    ocultarSpinner();
    
    confirmationMessage.innerText = `¿Está seguro que desea eliminar este registro de combustible de la unidad ${unidad}?`;

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteFuelLogModal'));
    deleteModal.show();

    const fuelLogData = {
        numeroUnidad: unidad,
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
        estado: "inactivo"
    };

    document.getElementById('confirmDelete').onclick = function () {
        mostrarSpinner();
        axios.put(`https://backend-transporteccss.onrender.com/api/registroCombustible/${idRegistro}`, fuelLogData)
            .then(response => {
                limpiar();
                ocultarSpinner();
                showToast('Eliminación exitosa', `El registro de combustible de la unidad ${unidad} se ha eliminado exitosamente.`);
            })
            .catch(error => {
                ocultarSpinner();
                console.error('Error al eliminar el registro de combustible:', error);
                showToast('Error', 'Error al eliminar el registro de combustible.');
            });

        deleteModal.hide();
    }
}

getChoferes();
getUnidades();