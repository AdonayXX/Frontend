//getUserPermission();
mostrarSpinner();
// Simular una carga o tarea que toma tiempo
setTimeout(function() {
  // Ocultar el spinner después de un tiempo simulado (por ejemplo, después de 3 segundos)
  ocultarSpinner();
}, 4000); 
 
 async function getUserPermission() {
    try {
        const Api_Url= 'http://localhost:18026/';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${Api_Url}api/rolesCatalogo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const permission = response.data.roles;
      
        
      
        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#tablePermission')) {
              $('#tablePermission').DataTable().destroy();
            }
            fillTableUPermission(permission);
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
            $('#searchUsers').on('keyup', function () {
              let inputValue = $(this).val().toLowerCase();
              table.search(inputValue).draw();
            });
          });
      
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
    }
}
function fillTablePermission(permission){
    try {
        const tableBody = document.querySelector('#permission-body');
    
          tableBody.innerHTML = '';
          const fragment = document.createDocumentFragment();
    
          permission.forEach(permission => {
            const roleDescription = getRoleUser(usuario.Rol);
            const row = document.createElement('tr');
            const nombreCompleto = `${usuario.Nombre} ${usuario.Apellido1} ${usuario.Apellido2}`;
            row.innerHTML = `
              <tr>
                <td class="text-start">${permission.Rol}</td>
                <td>${nombreCompleto}</td>
                <td>${usuario.Correo}</td>
                <td>${roleDescription}</td>
                <td>${usuario.Estado}</td>
                <td class="actions">
                <button class="btn btn-outline-primary btn-sm"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>            
                </td>
              </tr>
            `;
            fragment.appendChild(row);
    
          });
    
          tableBody.appendChild(fragment);
    
    
    
    
        
    
      } catch (error) {
    
        console.error('There has been a problem:', error);
    
    
      }

};
function getRoleUser(rol){
    switch(rol) {
        case 1: return 'Admin';
        case 2: return 'Chofer';
        case 3: return 'Consulta';
        case 4: return 'Coordinador';
        default: return 'Desconocido';
    }

}
//Spiner
// Mostrar el spinner
function mostrarSpinner() {
    document.getElementById('spinnerContainer').style.display='flex';
  }
  
  // Ocultar el spinner
  function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
  }