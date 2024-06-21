document.getElementById("saveUser").addEventListener("click", function () {
    getUserData()
});

//Funcion para obtener datos ingresados del usuario
function getUserData() {
    const userIdentification = document.querySelector('#userIdentification').value;
    const userName = document.querySelector('#userName').value;
    const userFirstLastName = document.querySelector('#userFirstlastname').value;
    const userSecondLastName = document.querySelector('#userSecondlastname').value;
    const userPassword = document.querySelector('#userPassword1').value;
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

