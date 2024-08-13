getUserData();


document.getElementById("addUserButton").addEventListener("click", function () {
  getUserRegisterData()
});

//Funcion para obtener datos ingresados del usuario
function getUserRegisterData() {

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
    const API_URL = 'https://backend-transporteccss.onrender.com/api/usuario/';
    const response = await axios.post(API_URL, userData);
    const userExist = response.data.usuario;
    showToast('Éxito!', 'Usuario registrado correctamente');
    getUserData();
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
 
  }
}

//Funcion para el boton de borrar usuarios
async function deleteButton(userId, nombreCompleto, identificacion) {
  let modal = new bootstrap.Modal(document.getElementById('confirmDeleteModalUser'), {
    backdrop: 'static',
    keyboard: false
  });
  let bodyConfirm = document.querySelector('#bodyConfirm');

  bodyConfirm.innerHTML = `
        <p>¿Estás seguro de que deseas eliminar al usuario:</p>
        <p><strong>Nombre:</strong> ${nombreCompleto}</p>
        <p><strong>Identificación:</strong> ${identificacion}</p>
        <p>Esta acción no se puede deshacer.</p>`;

  modal.show();

  let confirmBtn = document.getElementById('confirmDeleteBtn');

  confirmBtn.onclick = function () {
    deleteUser(userId)
    modal.hide();
  };

}

// Función para eliminar usuarios
async function deleteUser(userId) {
  try {
    const API_URL = `https://backend-transporteccss.onrender.com/api/usuario/${userId}`;
    const token = localStorage.getItem('token'); // Obtén el token de autenticación del almacenamiento local

    if (!token) {
      showToast('Ups!', 'No se encontró el token de autenticación.');
      return;
    }

    const response = await axios.delete(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}` // Incluye el token en los encabezados
      }
    });

    showToast('Éxito!', 'Usuario eliminado correctamente');
    getUserData();
  } catch (error) {
    showToast('Ups!', 'Ocurrió un problema durante la eliminación del usuario.');
  }
}

async function getUserData() {
  mostrarSpinner();
  try {
    const Api_Url = 'https://backend-transporteccss.onrender.com/';
    const token = localStorage.getItem('token');
    const response = await axios.get(`${Api_Url}api/usuario`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const usuarios = response.data.usuarios;


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
        pageLength: 25, 
        lengthMenu: [ [25, 50, 100, -1], [25, 50, 100, "Todo"] ],
        language: {
          url: '/assets/json/Spanish.json'
      },
        caseInsensitive: true,
        smart: true

      });
      $('#searchUsers').on('keyup', function () {
        let inputValue = $(this).val().toLowerCase();
        table.search(inputValue).draw();
      });
    });


    ocultarSpinner();

  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      showToast('Error', errorMessage);
    } else {
      showToast('Error', 'Ocurrio un problema al cargar los datos.')
    }
  }
}
function fillTableUsuarios(usuarios) {
  try {
    const tableBody = document.querySelector('#users-body');

    tableBody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    usuarios.forEach(usuario => {
      const roleDescription = getRoleDescription(usuario.Rol);
      const row = document.createElement('tr');
      const nombreCompleto = `${usuario.Nombre} ${usuario.Apellido1} ${usuario.Apellido2}`;
      const isActive = usuario.Rol === 1 && usuario.Estado === 'Activo';
      row.innerHTML = `
              <tr>
                <td class="text-center">${usuario.Identificacion}</td>
                <td>${nombreCompleto}</td>
                <td>${usuario.Correo}</td>
                <td>${roleDescription}</td>
                <td>${usuario.Estado}</td>
                <td class="text-center">
                 ${!isActive ? `
                <button class="btn btn-outline-primary btn-sm" data-user='${JSON.stringify(usuario)}' onclick='sendUserData(this)'>
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteButton('${usuario.IdUsuario}', '${nombreCompleto}', '${usuario.Identificacion}')">
                    <i class="bi bi-trash"></i>
                </button>` : '-'}
                </td>
              </tr>
            `;
      fragment.appendChild(row);

    });

    tableBody.appendChild(fragment);






  } catch (error) {
    showToast('Error','Inesperado.')
  }

};
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

window.sendUserData = function (button) {
  let user = JSON.parse(button.getAttribute('data-user'));
  let modal = new bootstrap.Modal(document.getElementById('editUserAdmin'), {
    backdrop: 'static',
    keyboard: false
  });
  modal.show();

  document.getElementById("formUserEdit").reset();
  fillUserFields(user);
  const userIdentification = user.Identificacion;

  const form = document.querySelector("#formUserEdit");
  form.onsubmit = function (event) {
    event.preventDefault();
    showLoaderModalUser();
    getEditUserData(userIdentification);
  };

  function getEditUserData(userIdentification) {
    const userData = {
      Rol: parseInt(document.getElementById('rol').value.trim()),
      Estado: document.getElementById('userState').value.trim()
    };
    editUserData(userData, userIdentification);
  }

  async function editUserData(userData, userIdentification) {
    try {
      const API_URL = `https://backend-transporteccss.onrender.com/api/usuario/identificacion/${userIdentification}`;
      const token = localStorage.getItem('token');
      const response = await axios.put(API_URL, userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      modal.hide();
      showToast('Éxito!', 'Usuario actualizado correctamente');
      hideLoaderModalUser();
      setTimeout(function () {
        loadContent('dataTableUsers.html', 'mainContent');
      }, 1000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
          showToast('Ups!', errorMessage);
      } else {
        showToast('Error','Inesperado.')
      }
      hideLoaderModalUser();
    }
  }

  function fillUserFields(user) {
    document.getElementById('userIdentificationEdit').value = user.Identificacion;
    document.getElementById('userNameEdit').value = user.Nombre;
    document.getElementById('userFirstlastnameEdit').value = user.Apellido1;
    document.getElementById('userSecondlastnameEdit').value = user.Apellido2;
    document.getElementById('userEmailEdit').value = user.Correo;

    const rolSelect = document.getElementById('rol');
    if (user.Rol === 0) {
      const unknownOption = rolSelect.querySelector('option[value="0"]');
      unknownOption.hidden = false; // Mostrar la opción temporalmente
      rolSelect.value = user.Rol;
      unknownOption.hidden = true; // Ocultar la opción de nuevo
    } else {
      rolSelect.value = user.Rol;
    }

    document.getElementById('userState').value = user.Estado;
  }
}


//Spiner
// Mostrar el spinner
function mostrarSpinner() {
  document.getElementById('spinnerContainer').style.display = 'flex';
}

// Ocultar el spinner
function ocultarSpinner() {
  document.getElementById('spinnerContainer').style.display = 'none';
}

//Funcion para validar las contraseñas
function initializePasswordValidations() {
  const passwordField1 = document.getElementById('userRegisterPassword1');
  const passwordField2 = document.getElementById('userRegisterPassword2');
  const submitButton = document.getElementById('addUserButton');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  let isPasswordValid = false;
  let arePasswordsMatching = false;

  //Validar la contraseña
  function validatePassword() {
    const password = passwordField1.value.trim();
    if (!password) {
      passwordField1.setCustomValidity('Por favor ingresa una contraseña.');
      isPasswordValid = false;
    } else if (!passwordRegex.test(password)) {
      passwordField1.setCustomValidity('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.');
      isPasswordValid = false;
    } else {
      passwordField1.setCustomValidity('');
      isPasswordValid = true;
    }
    passwordField1.reportValidity();
    updateSubmitButtonState();
  }

  //Validar que las contraseñas coincidan
  function validateConfirmPassword() {
    const confirmPassword = passwordField2.value.trim();
    if (!confirmPassword) {
      passwordField2.setCustomValidity('Por favor confirma la contraseña.');
      arePasswordsMatching = false;
    } else if (passwordField1.value !== confirmPassword) {
      passwordField2.setCustomValidity('Las contraseñas no coinciden.');
      arePasswordsMatching = false;
    } else {
      passwordField2.setCustomValidity('');
      arePasswordsMatching = true;
    }
    passwordField2.reportValidity();
    updateSubmitButtonState();
  }

  //Habilitar o deshabilitar el botón de envío
  function updateSubmitButtonState() {
    if (isPasswordValid && arePasswordsMatching) {
      submitButton.disabled = false; // Habilitar el botón
    } else {
      submitButton.disabled = true; // Deshabilitar el botón
    }
  }

  // Evento blur para vaciar el campo si no cumple con la validación
  passwordField1.addEventListener('blur', function () {
    if (!isPasswordValid) {
      passwordField1.value = '';
    }
    passwordField1.setCustomValidity('');
  });

  passwordField2.addEventListener('blur', function () {
    if (!arePasswordsMatching) {
      passwordField2.value = '';
    }
    passwordField2.setCustomValidity('');
  });

  // Evento input para validar en tiempo real
  passwordField1.addEventListener('input', validatePassword);
  passwordField2.addEventListener('input', validateConfirmPassword);

  // Al inicio, deshabilitar el botón hasta que las validaciones pasen
  submitButton.disabled = true;
}

// Evento cuando el modal se muestra
document.getElementById('addUserAdmin').addEventListener('shown.bs.modal', function () {
  initializePasswordValidations();
});

function showLoaderModalUser() {
  document.querySelector('#loaderModalUserEdit').style.display = 'flex';
}

function hideLoaderModalUser() {
  document.querySelector('#loaderModalUserEdit').style.display = 'none';
}

