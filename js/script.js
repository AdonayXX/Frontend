document.addEventListener('DOMContentLoaded', function () {
     //Verificar token
   /*  const token = localStorage.getItem('token');
    if (token) {
        setupAutoLogout(token);
        const rolUser=  tokenrol(token);
        getCatForm(rolUser);
        

    }  */
    //Cerrar Sesión
    document.querySelector('#logoutLink').addEventListener('click', ()=> {
        logout(); 
    });
    loadToastTemplate();
    loadModalTemplate();
    //Cargar desde el incio el home.html
    // loadContent('home.html', 'mainContent');

    document.getElementById('estadoViaje').addEventListener('change', handleEstadoChange);
    document.getElementById('horaInicio').addEventListener('change', handleEstadoChange);
    document.getElementById('horaFin').addEventListener('change', handleEstadoChange);
    document.getElementById('cancelar').addEventListener('click', cancelar);
    document.getElementById('actualizar').addEventListener('click', actualizar);
    document.getElementById('')
});

document.getElementById('registroViajesForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const datosDelFormulario = {
        citasAsociadas: document.getElementById('citasAsociadas').value,
        choferAsignado: document.getElementById('choferAsignado').value,
        capacidadRestante: document.getElementById('capacidadRestante').value,
        estadoViaje: document.getElementById('estadoViaje').value,
        kilometrajeInicial: document.getElementById('kilometrajeInicial').value,
        kilometrajeFinal: document.getElementById('kilometrajeFinal').value,
        duracionViaje: document.getElementById('duracionViaje').value,
        consumoCombustible: document.getElementById('consumoCombustible').value,
    };
    axios.post('URL', datosDelFormulario)
        .then(response => {
            showToast('Registro exitoso', 'El registro se ha realizado exitosamente.');
        })
        .catch(error => {
            console.error('Error en el registro:', error);
            alert('Error en el registro');
        });
});

function cancelar() {
    showModal('¿Cancelar?', '¿Está seguro que desea cancelar el registro?', function () {
        document.getElementById('registroViajesForm').reset();
        showToast('Cancelación exitosa', 'Se ha cancelado el registro exitosamente.');
    });
}

function handleEstadoChange() {
    const estado = document.getElementById('estadoViaje').value;
    const horaInicio = document.getElementById('horaInicio');
    const horaFin = document.getElementById('horaFin');

    if (estado === 'En curso' && !horaInicio.value) {
        horaInicio.value = getCurrentTimeFormatted();
        horaInicio.setAttribute('readonly', true);
    } else if (estado === 'Cerrado' && !horaFin.value) {
        horaFin.value = getCurrentTimeFormatted();
        calcularDuracion();
    }
}

function calcularDuracion() {
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFin = document.getElementById('horaFin').value;
    const inicio = new Date();
    const fin = new Date();
    const [horasInicio, minutosInicio] = horaInicio.split(':').map(Number);
    const [horasFin, minutosFin] = horaFin.split(':').map(Number);

    inicio.setHours(horasInicio, minutosInicio, 0);
    fin.setHours(horasFin, minutosFin, 0);

    const diferencia = (fin - inicio) / 1000 / 60;
    const horas = Math.floor(diferencia / 60);
    const minutos = diferencia % 60;

    showToast('Duración del viaje', `Duración del viaje: ${horas} horas y ${minutos} minutos.`);
}

function getCurrentTimeFormatted() {
    const ahora = new Date();
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    return `${horas < 10 ? '0' + horas : horas}:${minutos < 10 ? '0' + minutos : minutos}`;
}

function loadToastTemplate(callback) {
    fetch('toast-template.html')
        .then(response => response.text())
        .then(data => {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = data;
                if (callback) callback();
            } else {
                console.error('Toast container not found');
            }
        })
        .catch(error => console.error('Error loading toast template:', error));
}
function showToast(title, message) {
    loadToastTemplate(() => {
        const toastElement = document.getElementById('common-toast');
        if (toastElement) {
            document.getElementById('common-toast-title').innerText = title;
            document.getElementById('common-toast-body').innerText = message;
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            setTimeout(() => {
                toast.hide();
            }, 3000);
        } else {
            console.error('Toast element not found');
        }
    });
}

function loadModalTemplate(callback) {
    fetch('modal-template.html')
        .then(response => response.text())
        .then(data => {
            const modalContainer = document.getElementById('modal-container');
            if (modalContainer) {
                modalContainer.innerHTML = data;
                if (callback) callback();
            } else {
                console.error('Modal container not found');
            }
        })
        .catch(error => console.error('Error loading modal template:', error));
}

function showModal(title, message, confirmCallback) {
    const modalElement = document.getElementById('common-modal');
    if (modalElement) {
        document.getElementById('common-modal-label').innerText = title;
        document.getElementById('common-modal-body').innerText = message;
        document.getElementById('common-modal-confirm-button').onclick = function () {
            confirmCallback();
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        };
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } else {
        console.error('Modal element not found');
    }
}
//DecodificarToken
function decodeToken(token) {
    try {
        const decodedToken = jwt_decode(token);
        return decodedToken.exp; 
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        throw new Error('Error al decodificar el token');
    }
}
// cierre de sesión automático
function setupAutoLogout(token) {
    try {
        const expirationTime = decodeToken(token);
        if (expirationTime) {
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiration = (expirationTime - currentTime) * 1000;

            setTimeout(() => {
                localStorage.setItem('sessionExpired', 'true');
                
                alert('Tu sesión ha expirado. Serás redirigido al login.');
                localStorage.removeItem('token');
                history.replaceState(null, '', 'login.html');
                window.location.href = 'login.html';
            }, timeUntilExpiration);
        }
    } catch (error) {
        console.error('Error al configurar el cierre de sesión automático:', error);
    }
}



// Función para cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.setItem('sessionExpired', 'true');
    history.replaceState(null, '', 'login.html');
    window.location.href = 'login.html';
}

function tokenrol(token) {
    try {
        const decodedToken = jwt_decode(token);
        return (decodedToken.usuario); // Muestra todo el contenido del token decodificado
        // Si solo quieres el payload:
        // console.log(decodedToken.payload);
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        throw new Error('Error al decodificar el token');
    }
}
async function getCatForm(rolUser) {
    console.log(rolUser);
    try {
      const Api_Url = 'http://localhost:18026/';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Api_Url}api/rolesCatalogo/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const rolesFr = response.data.roles;
      const Rol = rolUser.Rol;
      console.log(response.data);
      obtenerFormulariosPorRol(rolesFr, Rol);
    } catch (error) {
      console.error('Error al obtener datos :', error);
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        showToast('Error','Inicie Sesión de nuevo');
      }  else {
        console.error('Ha ocurrido un problema:', error);
        showToast('Atención','No tienes permisos, contacte al administrador.');
        const allItems = document.querySelectorAll('.items');
        allItems.forEach(item => {
            if (item.classList.contains('no-hide')) {
                item.classList.remove('hidden');
            }
        });

      } 
    }
  }

  function obtenerFormulariosPorRol(roles, rolBuscado) {
    const formularios = roles
        .filter(role => role.Rol === rolBuscado)
        .map(role => role.Formulario);
        console.log(formularios);
        const allItems = document.querySelectorAll('.items');
        if (formularios.length > 0){
            allItems.forEach(item => {
                if (item.classList.contains('no-hide')) {
                    item.classList.remove('hidden');
                }
            });
        
            formularios.forEach(formulario => {
                const item = document.getElementById(formulario.toString());
                if (item) {
                    item.classList.remove('hidden');
                }
            });

        }
       
}


 