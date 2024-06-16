'use strict';

document.addEventListener('DOMContentLoaded', function () {
    showTotalCapacity();
});

document.getElementById('7').addEventListener('submit', function (event) {
    event.preventDefault();

    const unitNumber = document.getElementById('unitNumber').value.toUpperCase();
    const unitType = parseInt(document.getElementById('unitType').value, 10);
    const resourceType = parseInt(document.getElementById('resourceType').value, 10);
    const initialMileage = parseInt(document.getElementById('initialMileage').value, 10);
    const currentMileage = parseInt(document.getElementById('currentMileage').value, 10);
    const status = parseInt(document.getElementById('status').value, 10);
    const dekraDate = new Date(document.getElementById('dekraDate').value).toISOString().split('T')[0];
    const maintenanceType = status === 10 ? parseInt(document.getElementById('maintenanceType').value, 10) : null;
    const driver = parseInt(document.getElementById('assignedDriver').value, 10);
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value);
    const totalCapacity = capacityChairs + capacityBeds;

    if (initialMileage < 0 || currentMileage < 0 || driver === '') {
        showToast('Error', 'Los campos no pueden tener valores negativos o vacíos.');
        return;
    }

    if (currentMileage < initialMileage) {
        showToast('Error', 'El kilometraje actual no puede ser menor al kilometraje inicial.');
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
        adelanto: 0,
        idEstado: status
    };

    console.log('Datos a enviar:', unidadData);

    axios.post('https://backend-transporteccss.onrender.com/api/unidades', unidadData)
        .then(response => {
            console.log('Unidad creada:', response.data);
            showToast('Registro exitoso', 'El registro se ha realizado exitosamente.');
            document.getElementById('7').reset();
            loadUnidades();
        })
        .catch(error => {
            console.error('Error al crear la unidad:', error);
            showToast('Error', 'Error al crear la unidad.');
        });
});

document.getElementById('maintenanceType').addEventListener('change', function () {
    const mileageField = document.getElementById('mileageField');
    const dateField = document.getElementById('dateField');
    mileageField.style.display = this.value === '5' ? 'block' : 'none';
    dateField.style.display = this.value === '2' ? 'block' : 'none';
});

document.getElementById('status').addEventListener('change', function () {
    const maintenanceFields = document.getElementById('maintenanceFields');
    maintenanceFields.style.display = this.value === '10' ? 'block' : 'none';
});

function validateCapacity(capacity, resourceType) {
    if ((resourceType === 1 || resourceType === 2 || resourceType === 3) && capacity > 8) {
        showToast('Error', 'La capacidad de una ambulancia, CruzRoja o Privada no puede ser mayor a 8.');
        return false;
    }
    if (resourceType === 4 && capacity > 5) {
        showToast('Error', 'La capacidad de una pickup no puede ser mayor a 5.');
        return false;
    }
    if (resourceType === 5 && capacity > 2) {
        showToast('Error', 'La capacidad de una moto no puede ser mayor a 2.');
        return false;
    }
    return true;
}

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

async function loadTiposRecurso() {
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

async function loadEstadosUnidad() {
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

async function loadFrecuenciaCambio() {
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

async function loadUnidades() {
    try {
        const [recursoMap, estadoMap, frecuenciaMap] = await Promise.all([
            loadTiposRecurso(),
            loadEstadosUnidad(),
            loadFrecuenciaCambio()
        ]);

        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades');
        const unidades = response.data.unidades;
        const tableBody = document.getElementById('unitTableBody');
        tableBody.innerHTML = '';

        unidades.forEach(unidad => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${unidad.numeroUnidad}</td>
                <td>${unidad.capacidadTotal}</td>
                <td>${recursoMap[unidad.idTipoRecurso] || 'Desconocido'}</td>
                <td>${unidad.kilometrajeInicial}</td>
                <td>${unidad.kilometrajeActual}</td>
                <td>${(estadoMap[unidad.idEstado] || 'Desconocido').toUpperCase()}</td>
                <td>${new Date(unidad.fechaDekra).toLocaleDateString()}</td>
                <td>${frecuenciaMap[unidad.idFrecuenciaCambio] || 'N/A'}</td>
                <td>${unidad.choferDesignado}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

loadUnidades();
