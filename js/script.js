"use strict";   
document.addEventListener('DOMContentLoaded', function () {
    //Verificar token Descomentar para probar
     const token = localStorage.getItem('token');
     if (token) {
         setupAutoLogout(token);
         const rolUser=  tokenrol(token);
         getCatForm(rolUser);
         const userInfoSpan =   infoUser();
         navbarUsername(userInfoSpan.usuario);
     } 
    //Cerrar Sesión
    document.querySelector('#logoutLink').addEventListener('click', () => {
        logout();
    });
    loadToastTemplate();
    loadModalTemplate();
  


});



function loadToastTemplate(callback) {
    fetch('toast-template.html')
        .then(response => response.text())
        .then(data => {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = data;
                if (callback) callback();
            } else {
            }
        })
        .catch(

        );
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
            }
        })
        .catch();
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
    }
}
//DecodificarToken
function decodeToken(token) {
    try {
        const decodedToken = jwt_decode(token);
        return decodedToken.exp;
    } catch (error) {
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
                createSessionExpiredModal();
            }, timeUntilExpiration);
        }
    } catch (error) {
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
        return (decodedToken.usuario); 
    } catch (error) {
        throw new Error('Error al decodificar el token');
    }
}
async function getCatForm(rolUser) {
    try {
        const Api_Url = 'https://backend-transporteccss.onrender.com/';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${Api_Url}api/rolesCatalogo/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const rolesFr = response.data.roles;
        const Rol = rolUser.Rol;
        obtenerFormulariosPorRol(rolesFr, Rol);
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errorMessage = error.response.data.error;
            showToast('Error', 'Inicie Sesión de nuevo');
        } else {
            showToast('Atención', 'No tienes permisos, contacte al administrador.');
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
    
    
    const allItems = document.querySelectorAll('.items');
    if (formularios.length > 0) {
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
    const home= document.querySelector('#homeClick');
    if(rolBuscado === 1 || rolBuscado === 3 || rolBuscado === 4)
     { loadContent('home.html', 'mainContent');
        home.classList.remove('hidden');  
    }

}
function infoUser(){
    try {
        const token = localStorage.getItem('token');
        const decodedToken = jwt_decode(token);
        return (decodedToken);
    } catch (error) {
        showToast('Error','Ocurrio un problema al obtener loss datos del usuario')
        
    }

}

function navbarUsername(usuario){
try {

     const userNameSpan = document.querySelector('#user-name');
     userNameSpan.textContent='';
     const nombreCompleto = `${usuario.Nombre} ${usuario.Apellido1} ${usuario.Apellido2}`   
     userNameSpan.textContent = nombreCompleto;
} catch (error) {
    
}
}
function createSessionExpiredModal() {
    const modalHTML = `
    <div class="modal fade" id="sessionExpiredModal" tabindex="-1" aria-labelledby="sessionExpiredModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header" style="background-color:#094079; color: white;">
                     <img src="img/LogoCCSS.png" class="img-fluid p-md-1" alt="" width="50px" height="50px">
                    <h5 class="modal-title" id="a5ModalLabel" style="text-align: center;">Sesión
                        Expirada</h5>
                </div>
                <div class="modal-body">
                    Tu sesión ha expirado. Serás redirigido en <span id="countdown">5</span> segundos.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="redirectToLogin()">Iniciar Sesión</button>
                </div>
            </div>
        </div>
    </div>`;

    document.querySelector('.main-content').insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar el modal
    let sessionExpiredModal = new bootstrap.Modal(document.getElementById('sessionExpiredModal'));
    sessionExpiredModal.show();

    // Iniciar el contador
    let countdown = 5;
    const countdownElement = document.getElementById('countdown');
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            redirectToLogin();
        }
    }, 1000);
}

function redirectToLogin() {
    localStorage.removeItem('token');
    localStorage.setItem('sessionExpired', 'true');
    window.location.href = 'login.html';
    history.replaceState(null, '', 'login.html');
}





