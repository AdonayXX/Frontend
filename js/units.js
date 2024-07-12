"use strict";

document.getElementById('unitsForm').addEventListener('submit', function (event) {
    event.preventDefault();
    postUnidad();
});

document.getElementById('btnSaveResource').addEventListener('click', function (event) {
    event.preventDefault();
    postTipoRecurso();
});

document.getElementById('btnSaveUnit').addEventListener('click', function (event) {
    event.preventDefault();
    postTipoUnidad();
});

document.getElementById('update-unit-button').addEventListener('click', function (event) {
    event.preventDefault();
    putUnidad();
});

document.getElementById('clearFormButton').addEventListener('click', function () {
    clearForm();
});

document.getElementById('loadUnit').addEventListener('click', function (event) {
    event.preventDefault();
    getUnidad();
});

function clearForm() {
    document.getElementById('unitsForm').reset();
    document.getElementById('unitNumber').disabled = false;
    document.getElementById('unitType').disabled = false;
    document.getElementById('resourceType').disabled = false;
    document.getElementById('initialMileage').disabled = false;
    document.getElementById('clearFormButton').style.display = 'none';
    document.getElementById('update-unit-button').disabled = true;
    document.getElementById('submit-unit-button').disabled = false;
    document.getElementById('capacityBeds').disabled = false;
    getChoferesSelect();
    getTiposRecursoSelect();
    getTiposUnidadSelect();
}

async function actualizarCapacidad() {
    const unitTypes = await getTiposUnidad();
    const unitTypeSelect = document.getElementById('unitType');
    const selectedOption = unitTypeSelect.options[unitTypeSelect.selectedIndex].text;
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10) || 0;
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10) || 0;

    let totalCapacity = 0;

    const selectedUnitType = unitTypes.find(unit => unit.tipo === selectedOption);

    if (selectedUnitType) {
        totalCapacity = capacityChairs + (capacityBeds * 2);
    }

    document.getElementById('totalCapacity').value = totalCapacity;
}

document.getElementById('unitType').addEventListener('change', actualizarCapacidad);
document.getElementById('capacityChairs').addEventListener('input', actualizarCapacidad);
document.getElementById('capacityBeds').addEventListener('input', actualizarCapacidad);

async function getChoferesSelect() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer');
        const choferes = response.data.choferes;

        const assignedDriver = document.getElementById('assignedDriver');
        assignedDriver.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione el chófer...';
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

async function getTiposRecursoSelect() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/tiporecurso');
        const tiposRecurso = response.data.tiporecurso;

        const resourceType = document.getElementById('resourceType');
        resourceType.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione el tipo de recurso...';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        resourceType.appendChild(defaultOption);

        let counter = 1;

        tiposRecurso.forEach(recurso => {
            const option = document.createElement('option');
            option.value = counter++;
            option.textContent = recurso.recurso;
            resourceType.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los tipos de recurso:', error);
    }
}

async function getTiposUnidadSelect() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/tipounidad');
        const tiposUnidad = response.data.tipounidad;

        const unitType = document.getElementById('unitType');
        unitType.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione el tipo de unidad...';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        unitType.appendChild(defaultOption);

        let counter = 1;

        tiposUnidad.forEach(unidad => {
            const option = document.createElement('option');
            option.value = counter++;
            option.textContent = unidad.tipo;
            unitType.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los tipos de unidad:', error);
    }
}


async function getEstadosUnidad() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/estadoUnidad');
        const estadosUnidad = response.data.estadosUnidad;
        const estadoMap = {};

        estadosUnidad.forEach(estado => {
            estadoMap[estado.idEstado] = estado.estado;
        });

        return estadoMap;
    } catch (error) {
        console.error('Error al obtener los estados de las unidades:', error);
        return {};
    }
}

async function getTiposUnidad() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/tipoUnidad');
        return response.data.tipounidad;
    } catch (error) {
        console.error('Error al obtener el tipo de unidad:', error);
        return [];
    }
}

async function getUnidad() {
    const unitNumber = document.getElementById('unitNumber').value;

    if (unitNumber === '') {
        showToast('Error', 'El número de unidad no puede estar vacío.');
        return;
    }

    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/unidades/${unitNumber}`);
        const unidad = response.data.unidades;

        if (unidad.length === 0) {
            showToast('Error', 'La unidad con el número ' + unitNumber + ' no se encuentra registrada.');
            return;
        }

        unidad.forEach(unidad => {
            document.getElementById('unitNumber').value = unidad.numeroUnidad;
            document.getElementById('unitType').value = unidad.idTipoUnidad;
            document.getElementById('resourceType').value = unidad.idTipoRecurso;
            document.getElementById('initialMileage').value = unidad.kilometrajeInicial;
            document.getElementById('currentMileage').value = unidad.kilometrajeActual;
            document.getElementById('status').value = unidad.idEstado;
            document.getElementById('dekraDate').value = new Date(unidad.fechaDekra).toISOString().split('T')[0];
            document.getElementById('maintenanceMileage').value = unidad.ultimoMantenimientoKilometraje;
            document.getElementById('assignedDriver').value = unidad.choferDesignado;
            document.getElementById('capacityChairs').value = unidad.capacidadSillas;
            document.getElementById('capacityBeds').value = unidad.capacidadCamas;
            document.getElementById('totalCapacity').value = unidad.capacidadTotal;
            document.getElementById('advance').value = unidad.adelanto;
            document.getElementById('periodicity').value = unidad.valorFrecuenciaC;
        });

        document.getElementById('unitNumber').disabled = true;
        document.getElementById('unitType').disabled = true;
        document.getElementById('resourceType').disabled = true;
        document.getElementById('initialMileage').disabled = true;
        const event = new Event('change');
        document.getElementById('status').dispatchEvent(event);
        document.getElementById('clearFormButton').style.display = 'inline-block';
        document.getElementById('update-unit-button').disabled = false;
        document.getElementById('submit-unit-button').disabled = true;

    } catch (error) {
        console.error('Error al obtener la unidad:', error);
        showToast('Error', 'Error al obtener la unidad.');
    }
}

function postTipoRecurso() {
    const recurso = document.getElementById('addResource').value;

    if (recurso === '') {
        showToast('Error', 'El campo no puede estar vacío.');
        return;
    }

    const recursoData = {
        recurso: recurso
    };

    console.log('Datos a enviar:', recursoData);

    axios.post('https://backend-transporteccss.onrender.com/api/tipoRecurso', recursoData)
        .then(response => {
            console.log('Tipo de recurso creado:', response.data);
            showToast('Registro exitoso', 'El registro se ha realizado exitosamente.');
            getTiposRecursoSelect();
        })
        .catch(error => {
            console.error('Error al crear el tipo de recurso:', error);
            showToast('Error', 'Error al crear el tipo de recurso.');
        });

}

function postTipoUnidad() {
    const tipo = document.getElementById('addUnit').value;
    const capacidad = parseInt(document.getElementById('addCapacity').value, 10);

    if (tipo === '' && capacidad === '') {
        showToast('Error', 'Los campos no pueden estar vacíos.');
        return;
    }

    const unidadData = {
        tipo: tipo,
        capacidad: capacidad
    };

    console.log('Datos a enviar:', unidadData);

    axios.post('https://backend-transporteccss.onrender.com/api/tipoUnidad', unidadData)
        .then(response => {
            console.log('Tipo de unidad creado:', response.data);
            showToast('Registro exitoso', 'El registro se ha realizado exitosamente.');
            getTiposUnidadSelect();
        })
        .catch(error => {
            console.error('Error al crear el tipo de unidad:', error);
            showToast('Error', 'Error al crear el tipo de unidad.');
        });

}

async function postUnidad() {
    const unitTypes = await getTiposUnidad();
    const unitTypeSelect = document.getElementById('unitType');
    const selectedOption = unitTypeSelect.options[unitTypeSelect.selectedIndex].text;
    const selectedUnitType = unitTypes.find(unit => unit.tipo === selectedOption);

    const unitNumber = document.getElementById('unitNumber').value.toUpperCase();
    const unitType = parseInt(document.getElementById('unitType').value, 10);
    const resourceType = parseInt(document.getElementById('resourceType').value, 10);
    const initialMileage = parseInt(document.getElementById('initialMileage').value, 10);
    const currentMileage = parseInt(document.getElementById('currentMileage').value, 10);
    const status = parseInt(document.getElementById('status').value, 10);
    const dekraDate = new Date(document.getElementById('dekraDate').value).toISOString().split('T')[0];
    const driver = parseInt(document.getElementById('assignedDriver').value, 10);
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value, 10);
    const advance = parseInt(document.getElementById('advance').value, 10);
    const periodicity = parseInt(document.getElementById('periodicity').value, 10);
    const maintenanceMileage = parseInt(document.getElementById('maintenanceMileage').value, 10) || null;

    if (initialMileage < 0 || currentMileage < 0 || advance < 0 || periodicity < 0 || capacityChairs < 0 || capacityBeds < 0 || totalCapacity < 0 || maintenanceMileage < 0) {
        showToast('Error', 'No se pueden ingresar valores negativos.');
        return;
    }

    if (advance < 20) {
        showToast('Error', 'El adelanto de mantenimiento no puede ser menor de 10%.');
        return;
    }

    if (currentMileage < initialMileage) {
        showToast('Error', 'El kilometraje actual no puede ser menor al kilometraje inicial.');
        return;
    }

    if (maintenanceMileage !== null && maintenanceMileage > currentMileage) {
        showToast('Error', 'El último kilometraje de mantenimiento no puede ser mayor al kilometraje actual.');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(dekraDate) < today) {
        showToast('Error', 'La fecha DEKRA no puede ser menor que la fecha de hoy.');
        return;
    }

    if (selectedUnitType && totalCapacity > selectedUnitType.capacidad) {
        showToast('Capacidad excedida', `La capacidad total de la unidad no puede ser mayor de ${selectedUnitType.capacidad}.`);
        return;
    }

    const unidadData = {
        idTipoUnidad: unitType,
        idTipoRecurso: resourceType,
        tipoFrecuenciaCambio: null,
        ultimoMantenimientoFecha: null,
        ultimoMantenimientoKilometraje: maintenanceMileage,
        numeroUnidad: unitNumber,
        choferDesignado: driver,
        fechaDekra: dekraDate,
        capacidadTotal: totalCapacity,
        capacidadCamas: capacityBeds,
        capacidadSillas: capacityChairs,
        kilometrajeInicial: initialMileage,
        kilometrajeActual: currentMileage,
        adelanto: advance,
        idEstado: status,
        valorFrecuenciaC: periodicity,
    };

    console.log('Datos a enviar:', unidadData);

    axios.post('https://backend-transporteccss.onrender.com/api/unidades', unidadData)
        .then(response => {
            clearForm();
            console.log('Unidad creada:', response.data);
            showToast('Registro exitoso', 'El registro de la unidad ' + unitNumber + ' se ha realizado exitosamente.');
            document.getElementById('unitsForm').reset();
        })
        .catch(error => {
            console.error('Error al crear la unidad:', error);
            showToast('Error', 'Error al crear la unidad.');
        });
}

async function putUnidad() {
    const unitTypes = await getTiposUnidad();
    const unitTypeSelect = document.getElementById('unitType');
    const selectedOption = unitTypeSelect.options[unitTypeSelect.selectedIndex].text;
    const selectedUnitType = unitTypes.find(unit => unit.tipo === selectedOption);
    const unitNumber = document.getElementById('unitNumber').value.toUpperCase();
    const unitType = parseInt(document.getElementById('unitType').value, 10);
    const resourceType = parseInt(document.getElementById('resourceType').value, 10);
    const initialMileage = parseInt(document.getElementById('initialMileage').value, 10);
    const currentMileage = parseInt(document.getElementById('currentMileage').value, 10);
    const status = parseInt(document.getElementById('status').value, 10);
    const dekraDate = new Date(document.getElementById('dekraDate').value).toISOString().split('T')[0];
    const driver = parseInt(document.getElementById('assignedDriver').value, 10);
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value, 10);
    const advance = parseInt(document.getElementById('advance').value, 10);
    const periodicity = parseInt(document.getElementById('periodicity').value, 10);
    const maintenanceMileage = parseInt(document.getElementById('maintenanceMileage').value, 10) || null;


    if (initialMileage < 0 || currentMileage < 0 || advance < 0 || periodicity < 0 || capacityChairs < 0 || capacityBeds < 0 || totalCapacity < 0 || maintenanceMileage < 0) {
        showToast('Error', 'No se pueden ingresar valores negativos.');
        return;
    }

    if (advance < 10) {
        showToast('Error', 'El adelanto de mantenimiento no puede ser menor de 10%.');
        return;
    }

    if (currentMileage < initialMileage) {
        showToast('Error', 'El kilometraje actual no puede ser menor al kilometraje inicial.');
        return;
    }

    if (maintenanceMileage !== null && maintenanceMileage > currentMileage) {
        showToast('Error', 'El último kilometraje de mantenimiento no puede ser mayor al kilometraje actual.');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(dekraDate) < today) {
        showToast('Error', 'La fecha DEKRA no puede ser menor que la fecha de hoy.');
        return;
    }

    if (selectedUnitType && totalCapacity > selectedUnitType.capacidad) {
        showToast('Capacidad excedida', `La capacidad total de una unidad de tipo ${selectedOption} no puede ser mayor de ${selectedUnitType.capacidad}.`);
        return;
    }

    const unidadData = {
        idTipoUnidad: unitType,
        idTipoRecurso: resourceType,
        tipoFrecuenciaCambio: null,
        ultimoMantenimientoFecha: null,
        ultimoMantenimientoKilometraje: maintenanceMileage,
        numeroUnidad: unitNumber,
        choferDesignado: driver,
        fechaDekra: dekraDate,
        capacidadTotal: totalCapacity,
        capacidadCamas: capacityBeds,
        capacidadSillas: capacityChairs,
        kilometrajeInicial: initialMileage,
        kilometrajeActual: currentMileage,
        adelanto: advance,
        idEstado: status,
        valorFrecuenciaC: periodicity,
    };

    console.log('Datos a enviar para actualizar:', unidadData);

    axios.put(`https://backend-transporteccss.onrender.com/api/unidades/${unitNumber}`, unidadData)
        .then(response => {
            clearForm();
            console.log('Unidad actualizada:', response.data);
            showToast('Actualización exitosa', 'La unidad ' + unitNumber + ' se ha actualizado exitosamente.');
            document.getElementById('unitsForm').reset();
        })
        .catch(error => {
            console.error('Error al actualizar la unidad:', error);
            showToast('Error', 'Error al actualizar la unidad.');
        });
}

getTiposUnidad();
getTiposRecursoSelect();
getTiposUnidadSelect();
getChoferesSelect();
getChoferesSelect();
