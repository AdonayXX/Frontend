'use strict';

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

function updateCapacity() {
    const unitType = document.getElementById('unitType').value;
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10) || 0;
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10) || 0;
    let totalCapacity = 0;

    if (unitType === '5') {
        totalCapacity = capacityChairs + (capacityBeds * 2);
        document.getElementById('capacityBeds').disabled = false;
    } else if (unitType === '3') {
        document.getElementById('capacityBeds').value = 0;
        document.getElementById('capacityBeds').disabled = true;
        totalCapacity = capacityChairs;
    }
    document.getElementById('totalCapacity').value = totalCapacity;
}

document.getElementById('unitType').addEventListener('change', updateCapacity);
document.getElementById('capacityChairs').addEventListener('input', updateCapacity);
document.getElementById('capacityBeds').addEventListener('input', updateCapacity);

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
}

document.getElementById('maintenanceType').addEventListener('change', function () {
    const mileageField = document.getElementById('mileageField');
    const dateField = document.getElementById('dateField');
    const advanceField = document.getElementById('advanceField');
    const periodicityField = document.getElementById('periodicityField');
    const maintenanceMileage = document.getElementById('maintenanceMileage');
    const maintenanceDate = document.getElementById('maintenanceDate');

    if (this.value === '2') {
        mileageField.style.display = 'block';
        maintenanceMileage.setAttribute('required', 'required');
        dateField.style.display = 'none';
        maintenanceDate.removeAttribute('required');
    } else if (this.value === '5') {
        dateField.style.display = 'block';
        maintenanceDate.setAttribute('required', 'required');
        mileageField.style.display = 'none';
        maintenanceMileage.removeAttribute('required');
    } else {
        mileageField.style.display = 'none';
        maintenanceMileage.removeAttribute('required');
        dateField.style.display = 'none';
        maintenanceDate.removeAttribute('required');
    }

    advanceField.style.display = (this.value === '5' || this.value === '2') ? 'block' : 'none';
    periodicityField.style.display = (this.value === '5' || this.value === '2') ? 'block' : 'none';
});


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

// async function getChoferes() {
//     try {
//         const API_URL = 'https://backend-transporteccss.onrender.com/api/unidadChofer';
//         const response = await axios.get(API_URL);
//         const choferes = response.data.choferes;
//         const selectBody = document.querySelector('#assignedDriver');

//         selectBody.innerHTML = '';

//         const defaultOption = document.createElement('option');
//         defaultOption.textContent = 'Seleccione el chófer...';
//         defaultOption.selected = true;
//         defaultOption.disabled = true;
//         selectBody.appendChild(defaultOption);

//         choferes.forEach(chofer => {
//             const option = document.createElement('option');
//             option.value = chofer.id;
//             option.textContent = `Unidad ${chofer.nombreChofer}`;
//             selectBody.appendChild(option);
//         });
//     } catch (error) {
//         console.error('Error al obtener las unidades:', error);
//     }
// }

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
        console.error('Error al obtener los estados de unidad:', error);
        return {};
    }
}

async function getFrecuenciaCambio() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/frecuenciaCambio');
        const frecuenciaCambio = response.data.frecuenciacambios;
        const frecuenciaMap = {};

        frecuenciaCambio.forEach(tipo => {
            frecuenciaMap[tipo.idFrecuenciaCambio] = tipo.tipo;
        });

        return frecuenciaMap;
    } catch (error) {
        console.error('Error al obtener los estados de unidad:', error);
        return {};
    }
}

async function getUnidades() {
    try {
        const [recursoMap, estadoMap, frecuenciaMap] = await Promise.all([
            loadTiposRecurso(),
            loadEstadosUnidad(),
            loadFrecuenciaCambio()
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
                    <td class="text-center">${unidad.numeroUnidad}</td>
                    <td class="text-center">${unidad.capacidadTotal}</td>
                    <td class="text-center">${recursoMap[unidad.idTipoRecurso] || 'Desconocido'}</td>
                    <td class="text-center">${unidad.kilometrajeInicial}</td>
                    <td class="text-center">${unidad.kilometrajeActual}</td>
                    <td class="text-center">${(estadoMap[unidad.idEstado] || 'Desconocido').toUpperCase()}</td>
                    <td class="text-center">${new Date(unidad.fechaDekra).toLocaleDateString()}</td>
                    <td class="text-center">${frecuenciaMap[unidad.idFrecuenciaCambio] || 'N/A'}</td>
                    <td class="text-center">${unidad.choferDesignado}</td>
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

loadUnidades();

function postUnidad() {
    const unitNumber = document.getElementById('unitNumber').value.toUpperCase();
    const unitType = parseInt(document.getElementById('unitType').value, 10);
    const resourceType = parseInt(document.getElementById('resourceType').value, 10);
    const initialMileage = parseInt(document.getElementById('initialMileage').value, 10);
    const currentMileage = parseInt(document.getElementById('currentMileage').value, 10);
    const status = parseInt(document.getElementById('status').value, 10);
    const dekraDate = new Date(document.getElementById('dekraDate').value).toISOString().split('T')[0];
    const maintenanceType = parseInt(document.getElementById('maintenanceType').value, 10);
    const driver = parseInt(document.getElementById('assignedDriver').value, 10);
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value, 10);;
    const advance = parseInt(document.getElementById('advance').value, 10);

    if (initialMileage < 0 || currentMileage < 0 || driver === '') {
        showToast('Error', 'Los campos no pueden tener valores negativos o vacíos.');
        return;
    }

    if (currentMileage < initialMileage) {
        showToast('Error', 'El kilometraje actual no puede ser menor al kilometraje inicial.');
        return;
    }

    if (unitType == '5' && totalCapacity > 8) {
        showToast('Error', 'La capacidad total de una ambulancia no puede ser mayor a 8.');
        return;
    }

    if (unitType == '3' && totalCapacity > 5) {
        showToast('Error', 'La capacidad total de una pickup 4x4 no puede ser mayor a 5.');
        return;
    }

    const unidadData = {
        idTipoUnidad: unitType,
        idTipoRecurso: resourceType,
        idFrecuenciaCambio: maintenanceType,
        numeroUnidad: unitNumber,
        choferDesignado: driver,
        fechaDekra: dekraDate,
        capacidadTotal: totalCapacity,
        capacidadCamas: capacityBeds,
        capacidadSillas: capacityChairs,
        kilometrajeInicial: initialMileage,
        kilometrajeActual: currentMileage,
        adelanto: advance,
        idEstado: status
    };

    console.log('Datos a enviar:', unidadData);

    axios.post('https://backend-transporteccss.onrender.com/api/unidades', unidadData)
        .then(response => {
            clearForm();
            console.log('Unidad creada:', response.data);
            showToast('Registro exitoso', 'El registro se ha realizado exitosamente.');
            document.getElementById('unitsForm').reset();
            loadUnidades();
        })
        .catch(error => {
            console.error('Error al crear la unidad:', error);
            showToast('Error', 'Error al crear la unidad.');
        });
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
            document.getElementById('resourceForm').reset();
        })
        .catch(error => {
            console.error('Error al crear el tipo de recurso:', error);
            showToast('Error', 'Error al crear el tipo de recurso.');
        });

}

function postTipoUnidad() {
    const unidad = document.getElementById('addUnit').value;

    if (unidad === '') {
        showToast('Error', 'El campo no puede estar vacío.');
        return;
    }

    const unidadData = {
        unidad: unidad
    };

    console.log('Datos a enviar:', unidadData);

    axios.post('https://backend-transporteccss.onrender.com/api/tipoUnidad', unidadData)
        .then(response => {
            console.log('Tipo de unidad creado:', response.data);
            showToast('Registro exitoso', 'El registro se ha realizado exitosamente.');
            document.getElementById('unitForm').reset();
        })
        .catch(error => {
            console.error('Error al crear el tipo de unidad:', error);
            showToast('Error', 'Error al crear el tipo de unidad.');
        });

}

function loadFormData(unidad) {
    document.getElementById('unitNumber').value = unidad.numeroUnidad;
    document.getElementById('unitNumber').disabled = true;
    document.getElementById('unitType').value = unidad.idTipoUnidad;
    document.getElementById('unitType').disabled = true;
    document.getElementById('resourceType').value = unidad.idTipoRecurso;
    document.getElementById('resourceType').disabled = true;
    document.getElementById('initialMileage').value = unidad.kilometrajeInicial;
    document.getElementById('initialMileage').disabled = true;
    document.getElementById('currentMileage').value = unidad.kilometrajeActual;
    document.getElementById('status').value = unidad.idEstado;
    document.getElementById('dekraDate').value = new Date(unidad.fechaDekra).toISOString().split('T')[0];
    document.getElementById('maintenanceType').value = unidad.idFrecuenciaCambio;
    document.getElementById('assignedDriver').value = unidad.choferDesignado;
    document.getElementById('capacityChairs').value = unidad.capacidadSillas;
    document.getElementById('capacityBeds').value = unidad.capacidadCamas;
    document.getElementById('totalCapacity').value = unidad.capacidadTotal;
    document.getElementById('advance').value = unidad.adelanto;

    const event = new Event('change');
    document.getElementById('status').dispatchEvent(event);
    document.getElementById('maintenanceType').dispatchEvent(event);
    document.getElementById('clearFormButton').style.display = 'inline-block';
    document.getElementById('update-unit-button').disabled = false;
    document.getElementById('submit-unit-button').disabled = true;
}

function updateUnidad() {
    const unitNumber = document.getElementById('unitNumber').value.toUpperCase();
    const unitType = parseInt(document.getElementById('unitType').value, 10);
    const resourceType = parseInt(document.getElementById('resourceType').value, 10);
    const initialMileage = parseInt(document.getElementById('initialMileage').value, 10);
    const currentMileage = parseInt(document.getElementById('currentMileage').value, 10);
    const status = parseInt(document.getElementById('status').value, 10);
    const dekraDate = new Date(document.getElementById('dekraDate').value).toISOString().split('T')[0];
    const maintenanceType = parseInt(document.getElementById('maintenanceType').value, 10);
    const driver = parseInt(document.getElementById('assignedDriver').value, 10);
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const totalCapacity = parseInt(document.getElementById('totalCapacity').value, 10);
    const advance = parseInt(document.getElementById('advance').value, 10);

    if (initialMileage < 0 || currentMileage < 0 || driver === '') {
        showToast('Error', 'Los campos no pueden tener valores negativos o vacíos.');
        return;
    }

    if (currentMileage < initialMileage) {
        showToast('Error', 'El kilometraje actual no puede ser menor al kilometraje inicial.');
        return;
    }

    if (unitType == '5' && totalCapacity > 8) {
        showToast('Error', 'La capacidad total de una ambulancia no puede ser mayor a 8.');
        return;
    }

    if (unitType == '3' && totalCapacity > 5) {
        showToast('Error', 'La capacidad total de una pickup 4x4 no puede ser mayor a 5.');
        return;
    }

    const unidadData = {
        idTipoUnidad: unitType,
        idTipoRecurso: resourceType,
        idFrecuenciaCambio: maintenanceType,
        numeroUnidad: unitNumber,
        choferDesignado: driver,
        fechaDekra: dekraDate,
        capacidadTotal: totalCapacity,
        capacidadCamas: capacityBeds,
        capacidadSillas: capacityChairs,
        kilometrajeInicial: initialMileage,
        kilometrajeActual: currentMileage,
        adelanto: advance,
        idEstado: status
    };

    console.log('Datos a enviar para actualizar:', unidadData);

    axios.put(`https://backend-transporteccss.onrender.com/api/unidades/${unitNumber}`, unidadData)
        .then(response => {
            clearForm();
            console.log('Unidad actualizada:', response.data);
            showToast('Actualización exitosa', 'La unidad se ha actualizado exitosamente.');
            document.getElementById('unitsForm').reset();
            document.getElementById('unitNumber').disabled = false;
            loadUnidades();
        })
        .catch(error => {
            console.error('Error al actualizar la unidad:', error);
            showToast('Error', 'Error al actualizar la unidad.');
        });
}