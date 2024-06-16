'use strict';

document.addEventListener('DOMContentLoaded', function () {
    showTotalCapacity();
});

document.getElementById('7').addEventListener('submit', function (event) {
    event.preventDefault();

    const unitNumber = document.getElementById('unitNumber').value;
    const capacity = parseInt(document.getElementById('capacity').value, 10);
    const resourceType = parseInt(document.getElementById('resourceType').value, 10);
    const initialMileage = parseInt(document.getElementById('initialMileage').value, 10);
    const currentMileage = parseInt(document.getElementById('currentMileage').value, 10);
    const status = parseInt(document.getElementById('status').value, 10);
    const dekraDate = document.getElementById('dekraDate').value;
    const maintenanceType = status === 3 ? parseInt(document.getElementById('maintenanceType').value, 10) : null;
    const driver = document.getElementById('assignedDriver').value;
    const mileage = maintenanceType === 2 ? parseInt(document.getElementById('maintenanceMileage').value, 10) : null;
    const capacityChairs = parseInt(document.getElementById('capacityChairs').value, 10);
    const capacityBeds = parseInt(document.getElementById('capacityBeds').value, 10);
    const capacityTotal = capacityChairs + capacityBeds;

    
    if (initialMileage < 0 || currentMileage < 0 || capacity <= 0 || driver === '') {
        showToast('Error', 'Los campos no pueden tener valores negativos o vacíos.');
        return;
    }

    if (currentMileage < initialMileage) {
        showToast('Error', 'El kilometraje actual no puede ser menor al kilometraje inicial.');
        return;
    }

    if (!validateCapacity(capacity, resourceType)) {
        return;
    }

    const unidadData = {
        idTipoUnidad: 1,
        idTipoRecurso: resourceType,
        idFrecuenciaCambio: maintenanceType,
        capacidadTotal: capacity,
        capacidadCamas: 2,
        capacidadSillas: 4,
        kilometrajeInicial: initialMileage,
        kilometrajeActual: currentMileage,
        adelanto: 0,
        idEstado: status
    };

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

document.getElementById('status').addEventListener('change', function () {
    const maintenanceFields = document.getElementById('maintenanceFields');
    if (parseInt(this.value, 10) === 3) {
        maintenanceFields.style.display = 'block';
    } else {
        maintenanceFields.style.display = 'none';
    }
});

document.getElementById('maintenanceType').addEventListener('change', function () {
    const mileageField = document.getElementById('mileageField');
    const dateField = document.getElementById('dateField');
    mileageField.style.display = this.value === '2' ? 'block' : 'none';
    dateField.style.display = this.value === '1' ? 'block' : 'none';
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

function loadUnidades() {
    axios.get('https://backend-transporteccss.onrender.com/api/unidades')
        .then(response => {
            const unidades = response.data.unidades;
            const tableBody = document.getElementById('unitTableBody');
            tableBody.innerHTML = ''; 

            unidades.forEach(unidad => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${unidad.numeroUnidad}</td>
                    <td>${unidad.capacidadTotal}</td>
                    <td>${getNombreRecurso(unidad.idTipoRecurso)}</td>
                    <td>${unidad.kilometrajeInicial}</td>
                    <td>${unidad.kilometrajeActual}</td>
                    <td>${getNombreEstado(unidad.idEstado)}</td>
                    <td>${unidad.fechaDekra ? new Date(unidad.fechaDekra).toLocaleDateString() : 'N/A'}</td>
                    <td>${getNombreFrecuenciaCambio(unidad.idFrecuenciaCambio)}</td>
                    <td>${getNombreChofer(unidad.choferDesignado)}</td>
                    <td>${unidad.kilometrajeMantenimiento || 'N/A'}</td>
                `;
                tableBody.appendChild(newRow);
            });
        })
        .catch(error => {
            console.error('Error al obtener las unidades:', error);
            showToast('Error', 'Error al cargar las unidades: ' + error.message);
        });
}
/////// GET
//FUNCIONN PARA JALAR LOS DATITOS DE EL TIPO DE RECURSO
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

//FUNCION PARA JALAR  EL ESTADOOO DE LA UNIDAD
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

//CARGAAA Y ACTUALIZA
async function loadUnidades() {
    try {
        const [recursoMap, estadoMap] = await Promise.all([
            loadTiposRecurso(),
            loadEstadosUnidad()
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
                <td>${estadoMap[unidad.idEstado] || 'Desconocido'}</td>
                <td>${new Date(unidad.fechaDekra).toLocaleDateString()}</td>
                <td>N/A</td>
                <td>${unidad.choferDesignado}</td>
                <td>${unidad.adelanto}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

 loadUnidades();
