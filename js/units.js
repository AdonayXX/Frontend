"use strict";

document.getElementById('unitsForm').addEventListener('submit', function (event) {
    event.preventDefault();
    postUnidad();
});

document.getElementById('btnResourceType').addEventListener('click', function (event) {
    event.preventDefault();
    postTipoRecurso();
});

document.getElementById('cerrarResourceType1').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('addResource').value = '';
});

document.getElementById('cerrarResourceType2').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('addResource').value = '';
});

document.getElementById('btnUnitType').addEventListener('click', function (event) {
    event.preventDefault();
    postTipoUnidad();
});

document.getElementById('cerrarUnitType1').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('addUnit').value = '';
    document.getElementById('addCapacity').value = '';
});

document.getElementById('cerrarUnitType2').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('addUnit').value = '';
    document.getElementById('addCapacity').value = '';
});

document.getElementById('update-unit-button').addEventListener('click', function (event) {
    event.preventDefault();
    putUnidad();
});

document.getElementById('delete-unit-button').addEventListener('click', function (event) {
    event.preventDefault();
    deleteUnidad();
});

document.getElementById('clean-button').addEventListener('click', function (event) {
    event.preventDefault();
    limpiar();
});

document.getElementById('unitNumber').addEventListener('blur', function (event) {
    event.preventDefault();
    getUnidad();
});

function mostrarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'flex';
}

function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}

function limpiar() {
    document.getElementById('unitsForm').reset();
    document.getElementById('unitNumber').disabled = false;
    document.getElementById('unitType').disabled = false;
    document.getElementById('resourceType').disabled = false;
    document.getElementById('initialMileage').disabled = false;
    document.getElementById('clean-button').style.display = 'none';
    document.getElementById('update-unit-button').disabled = true;
    document.getElementById('submit-unit-button').disabled = false;
    document.getElementById('delete-unit-button').disabled = true
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
        ocultarSpinner();

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

async function getUnidades() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades');
        return response.data.unidades;
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
        return [];
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
    const unitNumber = document.getElementById('unitNumber').value.toUpperCase();

    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/unidades/${unitNumber}`);
        const unidad = response.data.unidades;

        if (unitNumber !== '') {
            unidad.forEach(unidad => {
                if (unidad.idEstado !== 5) {
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
                    document.getElementById('periodicity').value = unidad.valorFrecuenciaC;

                    document.getElementById('unitNumber').disabled = true;
                    document.getElementById('unitType').disabled = true;
                    document.getElementById('resourceType').disabled = true;
                    document.getElementById('initialMileage').disabled = true;
                    const event = new Event('change');
                    document.getElementById('status').dispatchEvent(event);
                    document.getElementById('clean-button').style.display = 'inline-block';
                    document.getElementById('update-unit-button').disabled = false;
                    document.getElementById('delete-unit-button').disabled = false;
                    document.getElementById('submit-unit-button').disabled = true;
                }
            });
        }

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
            document.getElementById('addResource').value = '';
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

    if (capacidad < 0) {
        showToast('Error', 'La capacidad no puede ser menor a 0.');
        return;
    }

    const unidadData = {
        tipo: tipo,
        capacidad: capacidad
    };

    console.log('Datos a enviar:', unidadData);

    axios.post('https://backend-transporteccss.onrender.com/api/tipoUnidad', unidadData)
        .then(response => {
            document.getElementById('addUnit').value = '';
            document.getElementById('addCapacity').value = '';
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
    const periodicity = parseInt(document.getElementById('periodicity').value, 10);
    const maintenanceMileage = parseInt(document.getElementById('maintenanceMileage').value, 10) || null;

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

    const unitTypes = await getTiposUnidad();
    const unitTypeSelect = document.getElementById('unitType');
    const selectedOption = unitTypeSelect.options[unitTypeSelect.selectedIndex].text;
    const selectedUnitType = unitTypes.find(unit => unit.tipo === selectedOption);

    if (selectedUnitType && totalCapacity > selectedUnitType.capacidad) {
        showToast('Error', `La capacidad total de la unidad (${selectedUnitType.tipo}) no puede ser mayor que ${selectedUnitType.capacidad}.`);
        return;
    }

    const unidades = await getUnidades();
    const assignedDriverUnits = unidades.find(unidad => unidad.choferDesignado === driver);
    const unitAlreadyExists = unidades.find(unidad => unidad.numeroUnidad === unitNumber);

    if (assignedDriverUnits) {
        showToast('Error', `El chofer seleccionado ya está asignado a otra unidad.`);
        return;
    }

    if (unitAlreadyExists) {
        showToast('Error', `La unidad ${unitNumber} ya se encuentra registrada.`);
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
        adelanto: 20,
        idEstado: status,
        valorFrecuenciaC: periodicity,
    };

    console.log('Datos a enviar:', unidadData);

    axios.post('https://backend-transporteccss.onrender.com/api/unidades', unidadData)
        .then(response => {
            limpiar();
            console.log('Unidad creada:', response.data);
            showToast('Registro exitoso', 'El registro de la unidad ' + unitNumber + ' se ha realizado exitosamente.');
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
    const driverName = document.getElementById('assignedDriver').options[document.getElementById('assignedDriver').selectedIndex].text;
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value, 10);
    const periodicity = parseInt(document.getElementById('periodicity').value, 10);
    const maintenanceMileage = parseInt(document.getElementById('maintenanceMileage').value, 10) || null;

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
        showToast('Error', `La capacidad total de la unidad (${selectedUnitType.tipo}) no puede ser mayor que ${selectedUnitType.capacidad}.`);
        return;
    }

    const unidades = await getUnidades();
    const assignedDriverUnits = unidades.find(unidad => unidad.choferDesignado === driver);

    if (assignedDriverUnits && assignedDriverUnits.numeroUnidad !== unitNumber) {
        showToast('Error', `El chofer ${driverName} ya está asignado a otra unidad.`);
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
        adelanto: 20,
        idEstado: status,
        valorFrecuenciaC: periodicity,
    };

    console.log('Datos a enviar para actualizar:', unidadData);

    axios.put(`https://backend-transporteccss.onrender.com/api/unidades/${unitNumber}`, unidadData)
        .then(response => {
            limpiar();
            console.log('Unidad actualizada:', response.data);
            showToast('Actualización exitosa', 'La unidad ' + unitNumber + ' se ha actualizado exitosamente.');
        })
        .catch(error => {
            console.error('Error al actualizar la unidad:', error);
            showToast('Error', 'Error al actualizar la unidad.');
        });
}

async function deleteUnidad() {
    const unitNumber = document.getElementById('unitNumber').value.toUpperCase();
    const unitType = parseInt(document.getElementById('unitType').value, 10);
    const resourceType = parseInt(document.getElementById('resourceType').value, 10);
    const initialMileage = parseInt(document.getElementById('initialMileage').value, 10);
    const currentMileage = parseInt(document.getElementById('currentMileage').value, 10);
    const dekraDate = new Date(document.getElementById('dekraDate').value).toISOString().split('T')[0];
    const driver = parseInt(document.getElementById('assignedDriver').value, 10);
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value, 10);
    const periodicity = parseInt(document.getElementById('periodicity').value, 10);
    const maintenanceMileage = parseInt(document.getElementById('maintenanceMileage').value, 10) || null;

    const confirmationMessage = document.getElementById('deleteConfirmationMessage');
    confirmationMessage.innerText = `¿Está seguro que desea eliminar la unidad ${unitNumber}?`;

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteUnitModal'));
    deleteModal.show();

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
        adelanto: 20,
        idEstado: 5,
        valorFrecuenciaC: periodicity,
    };

    document.getElementById('confirmDelete').onclick = function () {
        axios.put(`https://backend-transporteccss.onrender.com/api/unidades/${unitNumber}`, unidadData)
            .then(response => {
                limpiar();
                console.log('Unidad eliminada:', response.data);
                showToast('Eliminación exitosa', 'La unidad ' + unitNumber + ' se ha eliminado exitosamente.');
            })
            .catch(error => {
                console.error('Error al eliminar la unidad:', error);
                showToast('Error', 'Error al eliminar la unidad.');
            });

        deleteModal.hide();
    };
}

getTiposUnidad();
getTiposRecursoSelect();
getTiposUnidadSelect();
getChoferesSelect();
getChoferesSelect();
