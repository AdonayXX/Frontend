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
    updateUnidad();
});

document.getElementById('clearFormButton').addEventListener('click', function () {
    clearForm();
});

document.getElementById('loadUnit').addEventListener('click', function (event) {
    event.preventDefault();
    getUnidad();
});

document.getElementById('maintenanceType').addEventListener('change', function () {
    const mileageField = document.getElementById('mileageField');
    const dateField = document.getElementById('dateField');
    const advanceField = document.getElementById('advanceField');
    const periodicityField = document.getElementById('periodicityField');

    if (this.value === '2') {
        mileageField.style.display = 'block';
        dateField.style.display = 'none';
    } else if (this.value === '1') {
        dateField.style.display = 'block';
        mileageField.style.display = 'none';
    } else {
        mileageField.style.display = 'none';
        dateField.style.display = 'none';
    }

    advanceField.style.display = (this.value === '1' || this.value === '2') ? 'block' : 'none';
    periodicityField.style.display = (this.value === '1' || this.value === '2') ? 'block' : 'none';
});

async function fetchUnitTypes() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/tipoUnidad');
        return response.data.tipounidad;
    } catch (error) {
        console.error('Error fetching unit types:', error);
        return [];
    }
}

async function updateCapacity() {
    const unitTypes = await fetchUnitTypes();
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

document.getElementById('unitType').addEventListener('change', updateCapacity);
document.getElementById('capacityChairs').addEventListener('input', updateCapacity);
document.getElementById('capacityBeds').addEventListener('input', updateCapacity);

function loadToastTemplate(callback) {
    fetch('toast-template.html')
        .then(response => response.text())
        .then(data => {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = data;
                if (callback) callback();
            } else {
                console.error('Toast container not found');
            }
        })
        .catch(error => console.error('Error loading toast template:', error));
}

function showToast(title, message) {
    loadToastTemplate(() => {
        const toastElement = document.getElementById('common-toast');
        if (toastElement) {
            document.getElementById('common-toast-title').innerText = title;
            document.getElementById('common-toast-body').innerText = message;
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        } else {
            console.error('Toast element not found');
        }
    });
}

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

async function getNombreChofer() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer');
        const choferes = response.data.choferes;
        const choferMap = {};

        choferes.forEach(chofer => {
            choferMap[chofer.idChofer] = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
        });

        return choferMap;
    } catch (error) {
        console.error('Error al obtener los nombres de los choferes:', error);
        return {};
    }
}

async function getTiposRecurso() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/tipoRecurso');
        const tiposRecurso = response.data.tiporecurso;
        const recursoMap = {};

        tiposRecurso.forEach(recurso => {
            recursoMap[recurso.idTipoRecurso] = recurso.recurso;
        });

        return recursoMap;
    } catch (error) {
        console.error('Error al obtener los tipos de recurso:', error);
        return {};
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

async function getUnidades() {
    try {
        const [recursoMap, estadoMap, choferMap] = await Promise.all([
            getTiposRecurso(),
            getEstadosUnidad(),
            getNombreChofer()
        ]);

        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades');
        const unidades = response.data.unidades;

        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#unitTable')) {
                $('#unitTable').DataTable().destroy();
            }

            const tableBody = document.getElementById('unitTableBody');
            tableBody.innerHTML = '';

            unidades.forEach(unidad => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td class="text-center">${unidad.numeroUnidad || 'N/A'}</td>
                    <td class="text-center">${unidad.capacidadTotal || 'N/A'}</td>
                    <td class="text-center">${(recursoMap[unidad.idTipoRecurso] || 'N/A').toUpperCase()}</td>
                    <td class="text-center">${unidad.kilometrajeInicial || 'N/A'}</td>
                    <td class="text-center">${unidad.kilometrajeActual || 'N/A'}</td>
                    <td class="text-center">${(estadoMap[unidad.idEstado] || 'N/A').toUpperCase()}</td>
                    <td class="text-center">${new Date(unidad.fechaDekra).toLocaleDateString() || 'N/A'}</td>
                    <td class="text-center">${(unidad.tipoFrecuenciaCambio || 'N/A').toUpperCase()}</td>
                    <td class="text-center">${choferMap[unidad.choferDesignado] || 'N/A'}</td>
                `;

                row.addEventListener('click', function () {
                    loadFormData(unidad);
                });

                tableBody.appendChild(row);
            });

            $('#unitTable').DataTable({
                dom: "<'row'<'col-sm-6'l>" +
                    "<'row'<'col-sm-12't>>" +
                    "<'row'<'col-sm-6'i><'col-sm-6'p>>",
                ordering: false,
                searching: true,
                paging: true,
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
                },
                caseInsensitive: true,
                smart: true
            });

            $('#searchUnit').on('keyup', function () {
                let inputValue = $(this).val().toLowerCase();
                $('#unitTable').DataTable().search(inputValue).draw();
            });

        });
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
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
        
            if (unidad.ultimoMantenimientoFecha) {
                document.getElementById('maintenanceDate').value = new Date(unidad.ultimoMantenimientoFecha).toISOString().split('T')[0];
            } else {
                document.getElementById('maintenanceDate').value = '';
            }
        
            document.getElementById('maintenanceMileage').value = unidad.ultimoMantenimientoKilometraje;
            document.getElementById('assignedDriver').value = unidad.choferDesignado;
            document.getElementById('capacityChairs').value = unidad.capacidadSillas;
            document.getElementById('capacityBeds').value = unidad.capacidadCamas;
            document.getElementById('totalCapacity').value = unidad.capacidadTotal;
            document.getElementById('advance').value = unidad.adelanto;
            document.getElementById('periodicity').value = unidad.valorFrecuenciaC;
        
            const maintenanceTypeSelect = document.getElementById('maintenanceType');
            const tipoFrecuenciaCambio = unidad.tipoFrecuenciaCambio;
            const selectedIndex = Array.from(maintenanceTypeSelect.options).findIndex(option => option.text === tipoFrecuenciaCambio);
        
            if (selectedIndex !== -1) {
                maintenanceTypeSelect.selectedIndex = selectedIndex;
            }
        });

        document.getElementById('unitNumber').disabled = true;
        document.getElementById('unitType').disabled = true;
        document.getElementById('resourceType').disabled = true;
        document.getElementById('initialMileage').disabled = true;
        const event = new Event('change');
        document.getElementById('status').dispatchEvent(event);
        document.getElementById('maintenanceType').dispatchEvent(event);
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
    const unitTypes = await fetchUnitTypes();
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
    const maintenanceTypeSelect = document.getElementById('maintenanceType');
    const maintenanceType = maintenanceTypeSelect.options[maintenanceTypeSelect.selectedIndex].text;
    const driver = parseInt(document.getElementById('assignedDriver').value, 10);
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value, 10);
    const advance = parseInt(document.getElementById('advance').value, 10);
    const periodicity = parseInt(document.getElementById('periodicity').value, 10);
    const maintenanceDateValue = document.getElementById('maintenanceDate').value;
    const maintenanceDate = maintenanceDateValue ? new Date(maintenanceDateValue).toISOString().split('T')[0] : null;
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
        showToast('Capacidad excedida', `La capacidad total de la unidad no puede ser mayor de ${selectedUnitType.capacidad}.`);
        return;
    }

    let ultimoMantenimientoFecha = maintenanceDate;
    let ultimoMantenimientoKilometraje = maintenanceMileage;

    if (maintenanceType === 'Kilometraje') {
        ultimoMantenimientoFecha = null;
    } else if (maintenanceType === 'Fecha') {
        ultimoMantenimientoKilometraje = null;
    }

    if (maintenanceType === 'Kilometraje' && ultimoMantenimientoKilometraje === null) {
        showToast('Error', 'El kilometraje del último mantenimiento no puede estar vacío.');
        return;
    }

    if (maintenanceType === 'Fecha' && ultimoMantenimientoFecha === null) {
        showToast('Error', 'La fecha del último mantenimiento no puede estar vacío.');
        return;
    }

    const unidadData = {
        idTipoUnidad: unitType,
        idTipoRecurso: resourceType,
        tipoFrecuenciaCambio: maintenanceType,
        ultimoMantenimientoFecha: ultimoMantenimientoFecha,
        ultimoMantenimientoKilometraje: ultimoMantenimientoKilometraje,
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
            getUnidades();
        })
        .catch(error => {
            console.error('Error al crear la unidad:', error);
            showToast('Error', 'Error al crear la unidad.');
        });
}

async function updateUnidad() {
    const unitTypes = await fetchUnitTypes();
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
    const maintenanceTypeSelect = document.getElementById('maintenanceType');
    const maintenanceType = maintenanceTypeSelect.options[maintenanceTypeSelect.selectedIndex].text;
    const driver = parseInt(document.getElementById('assignedDriver').value, 10);
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value, 10);
    const advance = parseInt(document.getElementById('advance').value, 10);
    const periodicity = parseInt(document.getElementById('periodicity').value, 10);
    const maintenanceDateValue = document.getElementById('maintenanceDate').value;
    const maintenanceDate = maintenanceDateValue ? new Date(maintenanceDateValue).toISOString().split('T')[0] : null;
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

    let ultimoMantenimientoFecha = maintenanceDate;
    let ultimoMantenimientoKilometraje = maintenanceMileage;

    if (maintenanceType === 'Kilometraje') {
        ultimoMantenimientoFecha = null;
    } else if (maintenanceType === 'Fecha') {
        ultimoMantenimientoKilometraje = null;
    }

    if (maintenanceType === 'Kilometraje' && ultimoMantenimientoKilometraje === null) {
        showToast('Error', 'El kilometraje del último mantenimiento no puede estar vacío.');
        return;
    }

    if (maintenanceType === 'Fecha' && ultimoMantenimientoFecha === null) {
        showToast('Error', 'La fecha del último mantenimiento no puede estar vacío.');
        return;
    }

    const unidadData = {
        idTipoUnidad: unitType,
        idTipoRecurso: resourceType,
        tipoFrecuenciaCambio: maintenanceType,
        ultimoMantenimientoFecha: ultimoMantenimientoFecha,
        ultimoMantenimientoKilometraje: ultimoMantenimientoKilometraje,
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
            getUnidades();
        })
        .catch(error => {
            console.error('Error al actualizar la unidad:', error);
            showToast('Error', 'Error al actualizar la unidad.');
        });
}

function loadFormData(unidad) {
    document.getElementById('unitNumber').value = unidad.numeroUnidad;
    document.getElementById('unitType').value = unidad.idTipoUnidad;
    document.getElementById('resourceType').value = unidad.idTipoRecurso;
    document.getElementById('initialMileage').value = unidad.kilometrajeInicial;
    document.getElementById('currentMileage').value = unidad.kilometrajeActual;
    document.getElementById('status').value = unidad.idEstado;
    document.getElementById('dekraDate').value = new Date(unidad.fechaDekra).toISOString().split('T')[0];

    if (unidad.ultimoMantenimientoFecha) {
        document.getElementById('maintenanceDate').value = new Date(unidad.ultimoMantenimientoFecha).toISOString().split('T')[0];
    } else {
        document.getElementById('maintenanceDate').value = '';
    }

    document.getElementById('maintenanceMileage').value = unidad.ultimoMantenimientoKilometraje;
    document.getElementById('assignedDriver').value = unidad.choferDesignado;
    document.getElementById('capacityChairs').value = unidad.capacidadSillas;
    document.getElementById('capacityBeds').value = unidad.capacidadCamas;
    document.getElementById('totalCapacity').value = unidad.capacidadTotal;
    document.getElementById('advance').value = unidad.adelanto;
    document.getElementById('periodicity').value = unidad.valorFrecuenciaC;

    const maintenanceTypeSelect = document.getElementById('maintenanceType');
    const tipoFrecuenciaCambio = unidad.tipoFrecuenciaCambio;
    const selectedIndex = Array.from(maintenanceTypeSelect.options).findIndex(option => option.text === tipoFrecuenciaCambio);

    if (selectedIndex !== -1) {
        maintenanceTypeSelect.selectedIndex = selectedIndex;
    }

    const event = new Event('change');
    document.getElementById('unitNumber').disabled = true;
    document.getElementById('unitType').disabled = true;
    document.getElementById('resourceType').disabled = true;
    document.getElementById('initialMileage').disabled = true;
    document.getElementById('status').dispatchEvent(event);
    document.getElementById('maintenanceType').dispatchEvent(event);
    document.getElementById('clearFormButton').style.display = 'inline-block';
    document.getElementById('update-unit-button').disabled = false;
    document.getElementById('submit-unit-button').disabled = true;
}


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
    document.getElementById('mileageField').style.display = 'none';
    document.getElementById('dateField').style.display = 'none';
    document.getElementById('advanceField').style.display = 'none';
    document.getElementById('periodicityField').style.display = 'none';
    getChoferesSelect();
    getTiposRecursoSelect();
    getTiposUnidadSelect();
}

fetchUnitTypes();
getTiposRecursoSelect();
getTiposUnidadSelect();
getChoferesSelect();
getUnidades();