async function getChoferes() {
    try {
        const API_URL = 'https://backend-transporteccss.onrender.com/api/chofer';
        const response = await axios.get(API_URL);
        const choferes = response.data.choferes;

        $(document).ready(function () {
            fillChoferTable(choferes);
            $('#choferTable').DataTable({
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
        });

    } catch (error) {
        console.error('Error fetching driver data:', error);
        showToast('Error', 'Error al obtener los datos del chofer.');
    }
}

function fillChoferTable(choferes) {
    const tableBody = document.getElementById('choferTableBody');
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
                <td>${chofer.nombreCE1}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

getChoferes();