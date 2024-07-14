async function getFuelRecords() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/registroCombustible');
        const registros = response.data.registros;

        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#fuelTable')) {
                $('#fuelTable').DataTable().destroy();
            }

            const tableBody = document.getElementById('fuelTableBody');
            tableBody.innerHTML = '';

            registros.forEach(record => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td class="text-center">${record.chofer || 'N/A'}</td>
                    <td class="text-center">${record.numeroUnidad || 'N/A'}</td>
                    <td class="text-center">${record.numeroFactura || 'N/A'}</td>
                    <td class="text-center">${record.numeroAutorizacion || 'N/A'}</td>
                    <td class="text-center">${record.kilometraje || 'N/A'}</td>
                    <td class="text-center">${new Date(record.fecha).toLocaleDateString() || 'N/A'}</td>
                    <td class="text-center">${record.litrosAproximados || 'N/A'}</td>
                    <td class="text-center">${record.montoColones || 'N/A'}</td>
                `;

                tableBody.appendChild(row);
            });

            $('#fuelTable').DataTable({
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

            $('#searchFuel').on('keyup', function () {
                let inputValue = $(this).val().toLowerCase();
                $('#fuelTable').DataTable().search(inputValue).draw();
            });

        });
    } catch (error) {
        console.error('Error al obtener los registros de combustible:', error);
    }
}

getFuelRecords();

