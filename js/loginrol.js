// Verificar si la sesión ha expirado al cargar la página de login
const sessionExpired = localStorage.getItem('sessionExpired');
if (sessionExpired === 'true') {
    // Limpiar el estado de sesión expirada
    localStorage.removeItem('sessionExpired');
    // Mostrar un mensaje de error o realizar alguna acción adicional
    alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
}
const Api_Url = 'http://localhost:18026/';
document.querySelector('#formLogin').addEventListener('submit', function(event){
    event.preventDefault();
    handleLogin();
});

async function handleLogin() {
    const userEmail = document.querySelector('#userEmail').value.trim();
    const userPassword = document.getElementById('userPassword').value.trim();

    try {
        const token = await loginUser(userEmail, userPassword);
        //console.log('Token:', token);
        saveTokenLS(token);
        window.location.href = 'Index.html'; // Redirigir al usuario
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
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
        console.error('Error al iniciar sesión:', error);
        throw new Error('Error al iniciar sesión');
    }
};

function saveTokenLS(token){
    try {
    localStorage.removeItem('token');
    localStorage.setItem('token', token);
   // console.log('Token:', token);
    } catch (error) {
        console.error(error);
            
    }
    
}