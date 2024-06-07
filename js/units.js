document.getElementById('unitForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const unitNumber = document.getElementById('unitNumber').value;
    const capacity = document.getElementById('capacity').value;
    const resourceType = Array.from(document.getElementById('resourceType').selectedOptions).map(option => option.value).join(', ');
    const initialMileage = document.getElementById('initialMileage').value;
    const currentMileage = document.getElementById('currentMileage').value;
    const status = document.getElementById('status').value;

    console.log('Número de Unidad:', unitNumber);
    console.log('Capacidad:', capacity);
    console.log('Tipo de Recurso:', resourceType);
    console.log('Kilometraje Inicial:', initialMileage);
    console.log('Kilometraje Actual:', currentMileage);
    console.log('Estado:', status);

    if (initialMileage < 0 || currentMileage < 0 || capacity <= 0) {
        alert('Por favor, ingrese valores válidos.');
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
    `;

    tableBody.appendChild(newRow);

    document.getElementById('unitForm').reset();
});