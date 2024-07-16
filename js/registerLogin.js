const sessionExpired = localStorage.getItem('sessionExpired');
if (sessionExpired === 'true') {
    localStorage.removeItem('sessionExpired');
}
const Api_Url = 'https://backend-transporteccss.onrender.com/';
document.querySelector('#formLogin').addEventListener('submit', function(event){
    event.preventDefault();
    handleLogin();
});

async function handleLogin() {
    const userEmail = document.querySelector('#userEmail').value.trim();
    const userPassword = document.getElementById('userPassword').value.trim();

    try {
        const token = await loginUser(userEmail, userPassword);
        saveTokenLS(token);
        window.location.href = 'index.html'; // Redirigir al usuario
    } catch (error) {
        showToast('Error', 'Usuario o Contraseña incorrectos')
    }
};

async function loginUser(identificador, Contrasena) {
    try {
        const response = await axios.post(`${Api_Url}api/usuario/login`, {
            IdentificacionCorreo: identificador,
            Contrasena: Contrasena
        });
         return response.data.usuario.token; 
    } catch (error) {
        showToast('Ups!','Error inesperado.');

    }
};

function saveTokenLS(token){
    try {
    localStorage.removeItem('token');
    localStorage.setItem('token', token);

    } catch (error) {
        showToast('Ups!','Error inesperado.');

            
    }
    
}

//Registro Usuario

document.querySelector('#formUserRegister').addEventListener('submit', function (event) {
    event.preventDefault();
    
    getUserData();
});

//Funcion para obtener datos ingresados del usuario
function getUserData() {
    const userIdentification = document.querySelector('#userIdentification').value.trim();
    const userName = document.querySelector('#userName').value.trim();
    const userFirstLastName = document.querySelector('#userFirstlastname').value.trim();
    const userSecondLastName = document.querySelector('#userSecondlastname').value.trim();
    const userPassword = document.querySelector('#userPassword1').value.trim();
    const userRegisterEmail = document.querySelector('#userRegisterEmail').value.trim();

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
        const API_URL = 'https://backend-transporteccss.onrender.com/api/usuario';
        const response = await axios.post(API_URL, userData);
        const userExist = response.data.usuario;
    
        showToast('Éxito!', 'Usuario registrado correctamente');
        const modalElement = document.querySelector('#addNewUser');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
       if (modalInstance) {
           modalInstance.hide();
         } else {
       const newModalInstance = new bootstrap.Modal(modalElement);
       newModalInstance.hide();
     }
        document.querySelector('#formUserRegister').reset();
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
        showToast('Ups!','Error inesperado.');
    }
}

//Funcion para validar las contraseñas
function initializePasswordValidations() {
    const passwordField1 = document.getElementById('userPassword1');
    const passwordField2 = document.getElementById('userPassword2');
    const submitButton = document.getElementById('saveUser');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/;
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
document.getElementById('addNewUser').addEventListener('shown.bs.modal', function () {
    initializePasswordValidations();
});

// Función para consultar la cédula cuando se pierde el foco del input de identificación
async function consultarCedulaOnBlur() {
    const userIdentification = document.querySelector('#userIdentification').value.trim(); // Trim para eliminar espacios en blanco al inicio y final
  
    if (userIdentification === '') {
      return;
    }
  
    const apiUrl = `https://apis.gometa.org/cedulas/${userIdentification}`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        const persona = data.results[0];
  
        const nombreFormateado = formatNombre(persona.firstname);
        const primerApellidoFormateado = formatNombre(persona.lastname1);
        const segundoApellidoFormateado = persona.lastname2 ? formatNombre(persona.lastname2) : '';
     
  
        document.querySelector('#userName').value = nombreFormateado;
        document.querySelector('#userFirstlastname').value = primerApellidoFormateado;
        document.querySelector('#userSecondlastname').value = segundoApellidoFormateado;
      } else {
       // showToast('Ups!', 'No se encontraron resultados para la cédula ingresada.');
       document.querySelector('#userName').value  = '';
       document.querySelector('#userFirstlastname').value = '';
       document.querySelector('#userSecondlastname').value = '';
      }
    } catch (error) {
      /* console.error('Error al consultar la API:', error);
      showToast('Ups!', 'Ocurrió un error al consultar la información. Por favor, inténtalo nuevamente.'); */
    }
  }
  
  function formatNombre(nombre) {
    const partesNombre = nombre.toLowerCase().split(' ');
    const nombreFormateado = partesNombre.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    return nombreFormateado;
  }
  
  // Agregar el evento blur al input de identificación
  document.querySelector('#userIdentification').addEventListener('blur', consultarCedulaOnBlur);


