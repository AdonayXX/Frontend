
getUserPermission();
//Funcion para obtener los roles y formularios
async function getUserPermission() {
    try {
        const Api_Url = 'https://backend-transporteccss.onrender.com/';
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
                url: './assets/json/Spanish.json'
            },
              caseInsensitive: true,
              smart: true
      
            });
            $('#searchPermission').on('keyup', function () {
              let inputValue = $(this).val().toLowerCase();
              table.search(inputValue).draw();
            });

        });
        



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
    ocultarSpinner();
    } catch (error) {
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.error;
          showToast('Error',errorMessage);
        }  else {
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
                        ${roleName !== 'Admin' ? `<button class="btn btn-outline-danger btn-sm" onclick="DeletePermiso(${role.IdRol})"><i class="bi bi-trash"></i></button>` : ''}
                    </td>
                `;
                fragment.appendChild(row);
            }
        });

        tableBody.appendChild(fragment);

    } catch (error) {
      showToast('Error','Inesperado')
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
        case 5: return 'Atap';
        default: return 'Desconocido';
    }
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
     
        const Api_Url = 'https://backend-transporteccss.onrender.com/';
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
        showToast('Éxito',' Permiso asignado correctamente.');
        getUserPermission();
      
      document.querySelector('#formAddPermission').reset();
    }catch(error){
        showToast('Error','No se logro asignar el permiso')

    }
}

async function DeletePermiso(Idrol){
    let modal = new bootstrap.Modal(document.getElementById('confirmDeletePermission'), {
        backdrop: 'static',
        keyboard: false
      });
      let bodyConfirm = document.querySelector('#bodyConfirmPermission');
    
      bodyConfirm.innerHTML = `
        <p>¿Estás seguro de que deseas eliminar el Permiso?</p>
    `;
    
    
      modal.show();
    
    
      let confirmBtn = document.getElementById('confirmDeleteBtnPermission');
    
    
      confirmBtn.onclick = function () {
    
        deletePer(Idrol);
    
    
        modal.hide();
      };
    
    };

    async function deletePer(Idrol){
        try {
            const token = localStorage.getItem('token');
            const API_URL = `https://backend-transporteccss.onrender.com/api/rolesCatalogo/${Idrol}`;
            const response = await axios.delete(API_URL,{
                headers: {
                    'Authorization': `Bearer ${token}`
                }

            });
            showToast('Exito','Permiso eliminado.')
            setTimeout(function () {
              loadContent('dataTableRoles.html', 'mainContent');
            }, 1000);
            
        
          } catch (error) {
            showToast('Ups!','Error al eliminar el permiso.')
          }

    }


