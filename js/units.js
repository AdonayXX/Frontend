"use strict";

document.addEventListener('DOMContentLoaded', function() {
    loadUnidades();
});

document.getElementById('unitForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const unitNumber = document.getElementById('unitNumber').value;
    const capacity = parseInt(document.getElementById('capacity').value, 10);
    const resourceType = Array.from(document.getElementById('resourceType').selectedOptions).map(option => option.value).join(', ');
    const initialMileage = parseInt(document.getElementById('initialMileage').value, 10);
    const currentMileage = parseInt(document.getElementById('currentMileage').value, 10);
    const status = document.getElementById('status').value;
    const dekraDate = document.getElementById('dekraDate').value;
    const maintenanceType = status === 'En Mantenimiento' ? document.getElementById('maintenanceType').value : '';
    const driver = document.getElementById('assignedDriver').value;
    const mileage = maintenanceType === 'Kilometraje' ? document.getElementById('maintenanceMileage').value : '';

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

    // Datos para enviar a la API
    const unidadData = {
        idTipoUnidad: 1, // Asegúrate de obtener este valor de un campo adecuado
        idTipoRecurso: 1, // Asegúrate de obtener este valor de un campo adecuado
        idFrecuenciaCambio: 1, // Asegúrate de obtener este valor de un campo adecuado
        capacidadTotal: capacity,
        capacidadCamas: 2, // Actualiza según sea necesario
        capacidadSillas: 4, // Actualiza según sea necesario
        kilometrajeInicial: initialMileage,
        kilometrajeActual: currentMileage,
        adelanto: 0, // Actualiza según sea necesario
        idEstado: 1 // Asegúrate de obtener este valor de un campo adecuado
    };

    // Enviar los datos a la API
    axios.post('https://backend-transporteccss.onrender.com/api/unidades/ingresar', unidadData)
        .then(response => {
            console.log('Unidad creada:', response.data);
            showToast('Registro exitoso', 'El registro se ha realizado exitosamente.');
            document.getElementById('unitForm').reset();
            loadUnidades(); // Recargar las unidades después de agregar una nueva
        })
        .catch(error => {
            console.error('Error al crear la unidad:', error);
            showToast('Error', 'Error al crear la unidad.');
        });
});

document.getElementById('status').addEventListener('change', function() {
    const maintenanceFields = document.getElementById('maintenanceFields');
    if (this.value === 'En Mantenimiento') {
        maintenanceFields.style.display = 'block';
    } else {
        maintenanceFields.style.display = 'none';
    }
});

document.getElementById('maintenanceType').addEventListener('change', function() {
    const mileageField = document.getElementById('mileageField');
    mileageField.style.display = this.value === 'Kilometraje' ? 'block' : 'none';
});

function validateCapacity(capacity, resourceType) {
    if ((resourceType.includes('Ambulancia') || resourceType.includes('CruzRoja') || resourceType.includes('Privado')) && capacity > 8) {
        showToast('Error', 'La capacidad de una ambulancia, CruzRoja o Privada no puede ser mayor a 8.');
        return false;
    }
    if (resourceType.includes('Pickup') && capacity > 5) {
        showToast('Error', 'La capacidad de una pickup no puede ser mayor a 5.');
        return false;
    }
    if (resourceType.includes('Moto') && capacity > 2) {
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
            tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar las unidades

            unidades.forEach(unidad => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${unidad.unitNumber}</td>
                    <td>${unidad.capacidadTotal}</td>
                    <td>${unidad.resourceType}</td>
                    <td>${unidad.kilometrajeInicial}</td>
                    <td>${unidad.kilometrajeActual}</td>
                    <td>${unidad.status}</td>
                    <td>${unidad.dekraDate}</td>
                    <td>${unidad.maintenanceType}</td>
                    <td>${unidad.driver}</td>
                    <td>${unidad.mileage}</td>
                `;
                tableBody.appendChild(newRow);
            });
        })
        .catch(error => {
            console.error('Error al obtener las unidades:', error);
            showToast('Error', 'Error al obtener las unidades.');
        });
}
