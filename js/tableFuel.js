"use strict";

function mostrarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'flex';
}

function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}

async function getRegistrosCombustble() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://10.30.153.34:3366/api/registroCombustible', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const registros = response.data.registros;

        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#fuelTable')) {
                $('#fuelTable').DataTable().destroy();
            }

            const tableBody = document.getElementById('fuelTableBody');
            tableBody.innerHTML = '';

            registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            registros.forEach(record => {
                if (record.estado === 'activo') {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                    <td class="text-center">${record.chofer || 'N/A'}</td>
                    <td class="text-center">${record.numeroUnidad || 'N/A'}</td>
                    <td class="text-center">${record.numeroFactura || 'N/A'}</td>
                    <td class="text-center">${record.numeroAutorizacion || 'N/A'}</td>
                    <td class="text-center">${record.kilometraje || 'N/A'}</td>
                    <td class="text-center">${new Date(record.fecha).toISOString().split('T')[0] || 'N/A'}</td>
                    <td class="text-center">${record.litrosAproximados || 'N/A'}</td>
                    <td class="text-center">${record.montoColones || 'N/A'}</td>
                `;

                    tableBody.appendChild(row);
                }
            });

            $('#fuelTable').DataTable({
                dom: "<'row'<'col-sm-6'l>" +
                    "<'row'<'col-sm-12't>>" +
                    "<'row'<'col-sm-6'i><'col-sm-6'p>>",
                ordering: false,
                searching: true,
                pageLength: 25, 
                lengthMenu: [ [25, 50, 100, -1], [25, 50, 100, "Todo"] ],
                paging: true,
                language: {
                    url: './assets/json/Spanish.json'
                },
                caseInsensitive: true,
                smart: true
            });

            $('#searchFuel').on('keyup', function () {
                let inputValue = $(this).val().toLowerCase();
                $('#fuelTable').DataTable().search(inputValue).draw();
            });

        });
        ocultarSpinner();
    } catch (error) {
        showToast('Error', 'No se pudo cargar la información de los registros de combustible');
        ocultarSpinner();
    }
}

getRegistrosCombustble();
