
    document.getElementById('unitForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const unitNumber = document.getElementById('unitNumber').value;
        const capacity = document.getElementById('capacity').value;
        const resourceType = Array.from(document.getElementById('resourceType').selectedOptions).map(option => option.value).join(', ');
        const initialMileage = document.getElementById('initialMileage').value;
        const currentMileage =document.getElementById('currentMileage').value;
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

        const tableBody = document.getElementById('unitTableBody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${unitNumber}</td>
            <td>${capacity}</td>
            <td>${resourceType}</td>
            <td>${initialMileage}</td>
            <td>${currentMileage}</td>
            <td>${status}</td>
            <td>${dekraDate}</td>
            <td>${maintenanceType}</td>
            <td>${driver}</td>
            <td>${mileage}</td>
        `;
        tableBody.appendChild(newRow);

        document.getElementById('unitForm').reset();
        showToast('Registro exitoso', 'El registro se ha realizado exitosamente.');
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

