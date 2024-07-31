function openAccomp(cedula) {
    const token = localStorage.getItem('token');
    const API_URL = `https://backend-transporteccss.onrender.com/api/chofer/cedula/${cedula}`;
    axios.get(API_URL,{
        headers: {
             'Authorization': `Bearer ${token}`
        }

    })
        .then(response => {
            const chofer = response.data.chofer[0]; 

            const tableBody = document.querySelector('#emergencyContactTableBody');
            if (chofer.nombreCE1 === null || chofer.nombreCE1 === undefined) {
                tableBody.innerHTML = '<tr><td colspan="4">No hay acompañantes registrados</td></tr>';
            } else {
                tableBody.innerHTML = `
                    <tr>
                        <td>${chofer.nombreCE1} ${chofer.apellido1CE1} ${chofer.apellido2CE1}</td>
                        <td>${chofer.contactoEmergencia1}</td>
                    </tr>
                   ${chofer.nombreCE2 !== null ? `
                    <tr>
                        <td>${chofer.nombreCE2} ${chofer.apellido1CE2} ${chofer.apellido2CE2}</td>
                        <td>${chofer.contactoEmergencia2}</td>
                    </tr>` : ''}
                `;
            }

            const modal = new bootstrap.Modal(document.getElementById('emergencyContactModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error fetching driver emergency contact data:', error);
            showToast('Error', 'Error al obtener los datos de contacto de emergencia.');
        });
}

getChoferes();


async function getChoferes() {
    try {

        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const choferes = response.data.choferes;

        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#driverTable')) {
                $('#driverTable').DataTable().destroy();
            }
            fillChoferTable(choferes);

            $('#driverTable').DataTable({
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

            $('#searchDrivers').on('keyup', function () {
                let inputValue = $(this).val().toLowerCase();
                $('#driverTable').DataTable().search(inputValue).draw();
            });

            ocultarSpinner();
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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}</td>
            <td>${chofer.cedula}</td>
            <td>${chofer.contacto}</td>
            <td>${chofer.tipoSangre}</td>
            <td>${chofer.tipoLicencia}</td>
            <td class="text-center">${new Date(chofer.vencimientoLicencia).toISOString().split('T')[0]}</td>
            <td>${chofer.estadoChofer}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm" onclick="openAccomp('${chofer.cedula}')">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
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


function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}
