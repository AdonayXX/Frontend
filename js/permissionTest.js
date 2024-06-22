getUserPermission();
//Funcion para obtener los roles y formularios
async function getUserPermission() {
    mostrarSpinner();
    try {
        const Api_Url = 'http://localhost:18026/';
        const token = localStorage.getItem('token');

        const rolesResponse = await axios.get(`${Api_Url}api/rolesCatalogo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const formsResponse = await axios.get(`${Api_Url}api/catalogoFrms/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const roles = rolesResponse.data.roles || [];
        const forms = formsResponse.data.forms || [];

        fillPermissionsTable(roles, forms);

    } catch (error) {
        console.error('Error al obtener datos de permisos:', error);
    } finally {
        ocultarSpinner();
    }
}

//Funcion para llenar la tabla de permisos
function fillPermissionsTable(roles, forms) {
    try {
        const tableBody = document.querySelector('#permission-body');
        tableBody.innerHTML = '';

        const fragment = document.createDocumentFragment();

        roles.forEach(role => {
            const roleName = getRoleDescription(role.Rol);
            const form = forms.find(form => form.Formulario === role.Formulario);

            if (form) {
                const row = document.createElement('tr');
                // Formatear la fecha en formato dd/mm/aaaa
                const formattedDate = formatDate(form.FechaCreacionFrm);
                row.innerHTML = `
                    <td>${roleName}</td>
                    <td>${form.NombreFormulario}</td>
                    <td>${formattedDate}</td>
                    <td class="actions">
                        <button class="btn btn-outline-primary btn-sm"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                fragment.appendChild(row);
            }
        });

        tableBody.appendChild(fragment);

        if ($.fn.DataTable.isDataTable('#tablePermission')) {
            $('#tablePermission').DataTable().destroy();
        }
        $('#tablePermission').DataTable({
            dom: "<'row'<'col-md-6'l>" +
                "<'row'<'col-md-12't>>" +
                "<'row justify-content-between'<'col-md-6'i><'col-md-6'p>>",
            ordering: false,
            searching: true,
            paging: true,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
            },
            caseInsensitive: true,
            smart: true
        });

    } catch (error) {
        console.error('Error al llenar la tabla de permisos:', error);
    }
}

//Funcion para formatear la fecha
function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


function getRoleDescription(rol) {
    switch (rol) {
        case 1: return 'Admin';
        case 2: return 'Chofer';
        case 3: return 'Consulta';
        case 4: return 'Coordinador';
        default: return 'Desconocido';
    }
}

function mostrarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'flex';
}

function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}
