"use strict";

document.addEventListener('DOMContentLoaded', function() {
    loadUnidades();
});

document.getElementById('7').addEventListener('submit', function(event) {
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

document.getElementById('status').addEventListener('change', function() {
    const maintenanceFields = document.getElementById('maintenanceFields');
    if (parseInt(this.value, 10) === 3) {
        maintenanceFields.style.display = 'block';
    } else {
        maintenanceFields.style.display = 'none';
    }
});

document.getElementById('maintenanceType').addEventListener('change', function() {
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
            console.log('Unidades:', response.data);
            const unidades = response.data.unidades;
            const tableBody = document.getElementById('unitTableBody');
            tableBody.innerHTML = ''; 

            unidades.forEach(unidad => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${unidad.id}</td>
                    <td>${unidad.capacidadTotal}</td>
                    <td>${unidad.idTipoRecurso}</td>
                    <td>${unidad.kilometrajeInicial}</td>
                    <td>${unidad.kilometrajeActual}</td>
                    <td>${unidad.idEstado}</td>
                    <td>${unidad.idFrecuenciaCambio}</td>
                    <td>${unidad.capacidadCamas}</td>
                    <td>${unidad.capacidadSillas}</td>
                    <td>${unidad.adelanto}</td>
                `;
                tableBody.appendChild(newRow);
            });
        })
        .catch(error => {
            console.error('Error al obtener las unidades:', error);
            showToast('Error', 'Error al obtener las unidades.');
        });
}