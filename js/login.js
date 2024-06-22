//funciones dinamicas
function loadToastTemplate(callback) {
    fetch('toast-template.html')
        .then(response => response.text())
        .then(data => {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = data;
                if (callback) callback();
            } else {
                console.error('Toast container no encontrado');
            }
        })
        .catch(error => console.error('Error al cargar la plantilla de toast:', error));
}

function showToast(title, message, reloadCallback) {
    loadToastTemplate(() => {
        const toastElement = document.getElementById('common-toast');
        if (toastElement) {
            document.getElementById('common-toast-title').innerText = title;
            document.getElementById('common-toast-body').innerText = message;
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            setTimeout(() => {
                toast.hide();
                if (reloadCallback) {
                    reloadCallback();
                }
            }, 2000);
        } else {
            console.error('Toast element no encontrado');
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    var today = new Date();
    var formattedDate = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    document.getElementById('date').textContent = formattedDate;
});
//establece que no se puedan elegir fechas anteriores 
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');  // Meses son 0-indexados, por eso se suma 1
const day = String(today.getDate()).padStart(2, '0');  // Obtener día del mes

const formattedDate = `${year}-${month}-${day}`;
document.getElementById('b_date').min = formattedDate;
//Añadir Acompañantes
let acompananteCount = 0;
document.getElementById('addCompanion').addEventListener('click', function () {
    if (acompananteCount < 5) {
        acompananteCount++;
        const acompDiv = document.getElementById('acompanante' + acompananteCount);
        if (acompDiv) {
            acompDiv.style.display = 'block';
        }
    } else {
        showToast("Error", "No se pueden agregar mas de 5 acompañantes");
    }
});
//Eliminar Acompañantes
document.getElementById('removeCompanion').addEventListener('click', function () {
    if (acompananteCount > 0) {
        const acompDiv = document.getElementById('acompanante' + acompananteCount);
        if (acompDiv) {
            acompDiv.style.display = 'none';
        }
        acompananteCount--;
    }
});

function SolicitarVale() {
    ObtenerFuncionarios();
    ObtenerUnidades();
    ObtenerServicios();
    ObtenerMotivo();
    ObtenerDestino();
    // ObtenerSalida();
}

var url = 'https://backend-transporteccss.onrender.com/';
//Obtener Funcionarios
function ObtenerFuncionarios() {
    axios.get(`${url}api/funcionarios`)
        .then(response => {
            console.log(response.data);
            LlenarAcompanante(response.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function LlenarAcompanante(data) {
    let body = '<option selected disabled value="null">Seleccione una opción</option>';
    for (let index = 0; index < data.length; index++) {
        body += `<option value = ${data[index].IdFuncionario}>${data[index].Nombre}</option>`;
    }
    document.getElementById('acompananteNombre1').innerHTML = body;
    document.getElementById('acompananteNombre2').innerHTML = body;
    document.getElementById('acompananteNombre3').innerHTML = body;
    document.getElementById('acompananteNombre4').innerHTML = body;
    document.getElementById('acompananteNombre5').innerHTML = body;
}

//Obtener Unidades
function ObtenerUnidades() {
    axios.get(`${url}api/unidadProgramatica`)
        .then(response => {
            console.log(response.data);
            LlenarUnidadesProgramaticas(response.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function LlenarUnidadesProgramaticas(data) {
    let body = '<option selected disabled value="">Seleccione una opción</option>';
    for (let index = 0; index < data.length; index++) {
        body += `<option value="${data[index].IdUnidadProgramatica}">${data[index].IdUnidadProgramatica} - ${data[index].NombreUnidad}</option>`;
    }
    document.getElementById('Up').innerHTML = body;
}

//Obtener servicios
function ObtenerServicios() {
    axios.get(`${url}api/servicios`)
        .then(response => {
            console.log(response.data);
            LlenarServicios(response.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function LlenarServicios(data) {
    let body = '<option selected disabled value="">Seleccione una opción</option>';
    for (let index = 0; index < data.length; index++) {
        body += `<option value = ${data[index].ServicioID}>${data[index].Descripcion}</option>`;
    }
    document.getElementById('service').innerHTML = body;
}

//Obtener los Motivos
function ObtenerMotivo() {
    axios.get(`${url}api/motivoVale`)
        .then(response => {
            console.log(response.data);
            LlenarMotivo(response.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function LlenarMotivo(data) {
    let body = '<option selected disabled value="">Seleccione una opción</option>';
    for (let index = 0; index < data.length; index++) {
        body += `<option value = ${data[index].id}>${data[index].descripcion}</option>`;
    }
    document.getElementById('motivo').innerHTML = body;
}

//Obtener Lugar de Salida
// function ObtenerSalida() {
//     axios.get(`${url}api/destinos`)
//         .then(response => {
//             console.log(response.data);
//             LlenarSalida(response.data);
//         })
//         .catch(error => {
//             console.error('There was a problem with the fetch operation:', error);
//         });
// }

// function LlenarSalida(data) {
//     let body = '<option selected disabled value="">Seleccione una opción</option>';
//     for (let index = 0; index < data.length; index++) {
//         body += `<option value="${data[index].IdDestino}">${data[index].IdDestino} - ${data[index].Descripcion}</option>`;
//     }
//     document.getElementById('lugarSa').innerHTML = body;
// }

//Obtener Lugar Destino
function ObtenerDestino() {
    axios.get(`${url}api/destinos`)
        .then(response => {
            console.log(response.data);
            LlenarDestino(response.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function LlenarDestino(data) {
    let body = '<option selected disabled value="">Seleccione una opción</option>';
    for (let index = 0; index < data.length; index++) {
        body += `<option value="${data[index].IdDestino}">${data[index].IdDestino} - ${data[index].Descripcion}</option>`;
    }
    document.getElementById('lugarDes').innerHTML = body;
}

//Valida que los campos se deban llenar
//guarda los datos
document.getElementById('btn_Guardar').addEventListener('click', function (event) {
    event.preventDefault();

    GuardarDatos();
});

function validateModalForm() {
    const inputs = document.querySelectorAll('#form-request input, #form-request textarea, #form-request select');
    let isValid = true;

    inputs.forEach(input => {
        if (input.value.trim() === '' || input.value === null) {
            isValid = false;
        }
    });

    return isValid;
}

function GuardarDatos() {
    if (!validateModalForm()) {
        console.error('Formulario no válido');
        showToast("Error", "Se deben llenar todos los campos");
        return;
    }
    let Acompanante1 = document.getElementById('acompananteNombre1').value;
    let Acompanante2 = document.getElementById('acompananteNombre2').value;
    let Acompanante3 = document.getElementById('acompananteNombre3').value;
    let Acompanante4 = document.getElementById('acompananteNombre4').value;
    let Acompanante5 = document.getElementById('acompananteNombre5').value;
    const IdUnidadProgramatica = document.getElementById('Up').value;
    const ServicioID = document.getElementById('service').value;
    const MotivoID = document.getElementById('motivo').value;
    const DestinoId = document.getElementById('lugarDes').value;
    const Detalle = document.getElementById('detalle').value;
    const NombreSolicitante = document.getElementById('nameSoli').value;
    const Estado = 1;
    const Hora_Salida = document.getElementById('hora_salida').value;
    const Fecha_Solicitud = document.getElementById('b_date').value;
    const Unidad = document.getElementById('uni').value;


    function adjustToNullIfContainsNull(value) {
        if (typeof value === 'string' && value.toLowerCase().includes('null')) {
            value = null;
        }
        return value;
    }

    Acompanante1 = adjustToNullIfContainsNull(Acompanante1);
    Acompanante2 = adjustToNullIfContainsNull(Acompanante2);
    Acompanante3 = adjustToNullIfContainsNull(Acompanante3);
    Acompanante4 = adjustToNullIfContainsNull(Acompanante4);
    Acompanante5 = adjustToNullIfContainsNull(Acompanante5);

    const datos = {
        NombreSolicitante: NombreSolicitante,
        Unidad: Unidad,
        DestinoId: DestinoId,
        MotivoID: MotivoID,
        ServicioID: ServicioID,
        Fecha_Solicitud: Fecha_Solicitud,
        Hora_Salida: Hora_Salida,
        Detalle: Detalle,
        EstadoValeID: Estado,
        IdUnidadProgramatica: IdUnidadProgramatica,
        Acompanante1: Acompanante1,
        Acompanante2: Acompanante2,
        Acompanante3: Acompanante3,
        Acompanante4: Acompanante4,
        Acompanante5: Acompanante5
    };
    axios.post(`${url}api/vales`, datos)
        .then(response => {
            console.log('Datos guardados exitosamente:', response.data);
            location.reload();
        })
        .catch(error => {
            console.error('Hubo un problema al guardar los datos:', error);
        });
}


var error;
//Login
// fetchLogin.js
const loginUser = async (identificador, Contrasena) => {
    try {
        const response = await axios.post(`${url}api/user/login`, {
            identificador,
            Contrasena
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data.token; // Supón que el token viene en la propiedad token
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw new Error('Error al iniciar sesión');
    }
};
// // Llama a la función y almacena el token
// loginUser()
//     .then(token => {
//         localStorage.setItem('token', token); // Guarda el token en localStorage para usarlo en solicitudes protegidas
//         console.log('Token guardado:', token);
//     })
//     .catch(error => {
//         console.error('Error al obtener el token:', error);
//     });

const handleLogin = async () => {
    const userEmail = document.getElementById('userEmail').value;
    const userPassword = document.getElementById('userPassword').value;

    try {
        const token = await loginUser(userEmail, userPassword);
        localStorage.setItem('token', token); // Guarda el token en localStorage para usarlo en solicitudes protegidas
        console.log('Token:', token);
        window.location.href = 'Index.html'; // Redirigir al usuario
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showToast("Error", "Usuario o Contraseña incorrectos", () => {
            setTimeout(() => {
                location.reload();
            }, 0); // Ajusta el tiempo de espera según sea necesario (3000 ms = 3 segundos)
        });
    }
};
document.getElementById('loginButton').addEventListener('click', handleLogin);