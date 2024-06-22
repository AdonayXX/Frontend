const sessionExpired = localStorage.getItem('sessionExpired');
if (sessionExpired === 'true') {
    localStorage.removeItem('sessionExpired');
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

    } catch (error) {
        console.error(error);
            
    }
    
}