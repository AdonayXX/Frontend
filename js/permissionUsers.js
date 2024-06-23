getUserPermission();
//Funcion para obtener los roles y formularios
async function getUserPermission() {
    try {
        mostrarSpinner();
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

        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#tablePermission')) {
              $('#tablePermission').DataTable().destroy();
            }
            fillPermissionsTable(roles, forms);
            let table = $('#tablePermission').DataTable({
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
            $('#searchPermission').on('keyup', function () {
              let inputValue = $(this).val().toLowerCase();
              table.search(inputValue).draw();
            });

        });
        setTimeout(function () {
            ocultarSpinner();
          }, 500);



        document.querySelector('#addNewPermission').addEventListener('click',()=>{
          const roleExclusions = {};
          roles.forEach(entry => {
          if (!roleExclusions[entry.Rol]) {
              roleExclusions[entry.Rol] = new Set();
          }
          roleExclusions[entry.Rol].add(entry.Formulario);
          });

       document.querySelector('#rolSelect').addEventListener('change', () => {

        const selectedRol = parseInt(rolSelect.value, 10);
        document.querySelector('#item').innerHTML = '<option selected disabled value="">Seleccionar...</option>';
        const excludedForms = roleExclusions[selectedRol] || new Set();
        const filteredForms = forms.filter(form => !excludedForms.has(form.Formulario));
        llenarSelectPermisos(filteredForms);

        });

    });
    } catch (error) {
        console.error('Error al obtener datos de permisos:', error);
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.error;
          showToast('Error',errorMessage);
        }  else {
          console.error('Ha ocurrido un problema:', error);
          showToast('Error','Ocurrio un problema al cargar los datos.')
        } 
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
                    <td class="text-center">
                        <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                fragment.appendChild(row);
            }
        });

        tableBody.appendChild(fragment);

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


function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}

function llenarSelectPermisos(forms){
    const itemSelect = document.getElementById('item');
    forms.forEach(form => {
        const option = document.createElement('option');
        option.value = form.Formulario;
        option.textContent = form.NombreFormulario;
        itemSelect.appendChild(option);
      });
}

  function mostrarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'flex';
 }
  // Ocultar el spinner
function ocultarSpinner() {
   document.getElementById('spinnerContainer').style.display = 'none';
}
document.querySelector('#formAddPermission').addEventListener('submit',function(event){
    event.preventDefault();
    const rol = parseInt(document.querySelector('#rolSelect').value.trim(), 10);
    const permission = parseInt(document.querySelector('#item').value.trim(), 10);

    DataRolPermission = {
        Rol: rol,
        Formulario: permission
    }
    addNewPermission(DataRolPermission);
});
//post agregar permiso
async function addNewPermission(DataRolPermission) {
    try {
     
        const Api_Url = 'http://localhost:18026/';
        const token = localStorage.getItem('token');

        const response = await axios.post(`${Api_Url}api/rolesCatalogo`,DataRolPermission, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const modalesAbiertos = document.querySelectorAll('.modal.show');
        modalesAbiertos.forEach(modal => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
        modalInstance.hide();
        }
  });
        console.log(response);
        showToast('Éxito',' Permiso asignado correctamente.');
        getUserPermission();
      
      document.querySelector('#formAddPermission').reset();
    }catch(error){
        console.error(error);
        showToast('Error','No se logro asignar el permiso')

    }
}