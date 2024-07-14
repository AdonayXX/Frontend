    getChoferes();

    document.getElementById('searchDrivers').addEventListener('keyup', debounce(handleSearchDrivers, 300));

async function getChoferes() {
    try {
        const API_URL = 'https://backend-transporteccss.onrender.com/api/chofer';
        const response = await axios.get(API_URL);
        const choferes = response.data.choferes;

        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#driverTable')) {
                $('#driverTable').DataTable().destroy();
            }
            fillChoferTable(choferes);
            $('#driverTable').DataTable({
                dom: "<'row'<'col-md-6'l><'col-md-6'f>>" +
                     "<'row'<'col-md-12't>>" +
                     "<'row justify-content-between'<'col-md-5'i><'col-md-5'p>>",
                ordering: false,
                searching: false,
                paging: true,
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
                },
                caseInsensitive: true,
                smart: true
            });

            $('#searchDrivers').on('keyup', function () {
                let inputValue = $(this).val().toLowerCase();
                $('#driverTable').DataTable().search(inputValue).draw();
            });
        });

    } catch (error) {
        console.error('Error fetching driver data:', error);
        showToast('Error', 'Error al obtener los datos del chofer.');
    }
}

function fillChoferTable(choferes) {
    const tableBody = document.querySelector('#choferTableBody');
    tableBody.innerHTML = '';

    choferes.forEach(chofer => {
        const row = `
            <tr>
                <td>${chofer.nombre}</td>
                <td>${chofer.cedula}</td>
                <td>${chofer.apellido1}</td>
                <td>${chofer.apellido2}</td>
                <td>${chofer.contacto}</td>
                <td>${chofer.tipoSangre}</td>
                <td>${chofer.tipoLicencia}</td>
                <td>${new Date(chofer.vencimientoLicencia).toISOString().split('T')[0]}</td>
                <td>${chofer.estadoChofer}</td>
                <td>
                    <button class="btn btn-secondary" onclick="showEmergencyContact(${chofer.idChofer})" data-bs-toggle="tooltip" data-bs-placement="top" title="Ver Contacto de Emergencia">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function handleSearchDrivers() {
    let input = document.getElementById('searchDrivers').value.toLowerCase();
    let rows = Array.from(document.getElementById('driverTable').getElementsByTagName('tr'));

    rows.forEach((row, index) => {
        if (index === 0) return;
        let cells = Array.from(row.getElementsByTagName('td'));
        let match = cells.some(cell => cell.innerText.toLowerCase().includes(input));
        row.style.display = match ? '' : 'none';
    });
}

// async function showEmergencyContact(idChofer) {
//     try {
//         const response = await axios.get(`https://backend-transporteccss.onrender.com/api/chofer/${idChofer}}`);
//         if (response.status !== 200 || !response.data) {
//             throw new Error('No data returned');
//         }
//         const chofer = response.data;

//         const emergencyContactTableBody = document.getElementById('emergencyContactTableBody');
//         emergencyContactTableBody.innerHTML = '';

//         const contact1 = chofer.nombreCE1 ? `
//             <tr>
//                 <td>${chofer.nombreCE1}</td>
//                 <td>${chofer.apellido1CE1}</td>
//                 <td>${chofer.apellido2CE1}</td>
//                 <td>${chofer.contactoEmergencia1}</td>
//             </tr>
//         ` : '';
//         const contact2 = chofer.nombreCE2 ? `
//             <tr>
//                 <td>${chofer.nombreCE2}</td>
//                 <td>${chofer.apellido1CE2}</td>
//                 <td>${chofer.apellido2CE2}</td>
//                 <td>${chofer.contactoEmergencia2}</td>
//             </tr>
//         ` : '';

//         emergencyContactTableBody.innerHTML = contact1 + contact2;

//         const emergencyContactModal = new bootstrap.Modal(document.getElementById('emergencyContactModal'));
//         emergencyContactModal.show();

//     } catch (error) {
//         console.error('Error fetching emergency contact data:', error);
//         showToast('Error', 'Error al obtener los datos de contacto de emergencia.');
//     }
// }
