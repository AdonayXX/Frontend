getUserData();
mostrarSpinner();
// Simular una carga o tarea que toma tiempo
setTimeout(function() {
  // Ocultar el spinner después de un tiempo simulado (por ejemplo, después de 3 segundos)
  ocultarSpinner();
}, 4000); 
document.getElementById("addUserButton").addEventListener("click", function () {
    getUserData()
});

//Funcion para obtener datos ingresados del usuario
function getUserData() {
    const userIdentification = document.querySelector('#userRegisterIdentification').value;
    const userName = document.querySelector('#userRegisterName').value;
    const userFirstLastName = document.querySelector('#userRegisterFirstlastname').value;
    const userSecondLastName = document.querySelector('#userRegisterSecondlastname').value;
    const userPassword = document.querySelector('#userRegisterPassword1').value;
    const userRegisterEmail = document.querySelector('#userRegisterEmail').value;

    const userData = {
        "Identificacion": userIdentification,
        "Nombre": userName,
        "Apellido1": userFirstLastName,
        "Apellido2": userSecondLastName,
        "Contrasena": userPassword,
        "Correo": userRegisterEmail,
        "Estado": "Activo"
    }
    saveUser(userData)
}

//Funcion para guardar el usuario
async function saveUser(userData) {
    try {
        const API_URL = 'http://localhost:18026/api/usuario/';
        const response = await axios.post(API_URL, userData);
        const userExist = response.data.usuario;
        showToast('Éxito!', 'Usuario registrado correctamente');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errorMessage = error.response.data.error;
            if (errorMessage.includes('Ya existe un usuario con esa identificación')) {
                showToast('Ups!', 'La identificación del usuario ya existe.');
            } else if (errorMessage.includes('Ya existe un usuario con ese correo')) {
                showToast('Ups!', 'El correo del usuario ya existe.');
            } else {
                showToast('Ups!', 'Ocurrió un problema durante el envío de los datos.');
            }
        } else {
            showToast('Ups!', 'Ocurrió un problema durante el envío de los datos.');
        }
        console.error(error);
    }
}


 async function getUserData() {
    try {
        const Api_Url= 'http://localhost:18026/';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${Api_Url}api/usuario`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(response.data);
        const usuarios= response.data.usuarios;
        
      
        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#tableUsers')) {
              $('#tableUsers').DataTable().destroy();
            }
            fillTableUsuarios(usuarios);
            let table = $('#tableUsers').DataTable({
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
function fillTableUsuarios(usuarios){
    try {
        const tableBody = document.querySelector('#users-body');
    
          tableBody.innerHTML = '';
          const fragment = document.createDocumentFragment();
    
          usuarios.forEach(usuario => {
            const roleDescription = getRoleDescription(usuario.Rol);
            const row = document.createElement('tr');
            const nombreCompleto = `${usuario.Nombre} ${usuario.Apellido1} ${usuario.Apellido2}`;
            row.innerHTML = `
              <tr>
                <td class="text-start">${usuario.Identificacion}</td>
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
function getRoleDescription(rol){
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