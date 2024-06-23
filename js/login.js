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
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
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
    ObtenerUnidades();
    ObtenerServicios();
    ObtenerMotivo();
    ObtenerDestino();
    ObtenerSalida();
}

var url = 'https://backend-transporteccss.onrender.com/';
//Obtener Unidades
function ObtenerUnidades() {
    axios.get(`${url}api/unidadProgramatica`)
        .then(response => {

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
function ObtenerSalida() {
    axios.get(`${url}api/rutas`)
        .then(response => {

            LlenarSalida(response.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function LlenarSalida(data) {
    let body = '<option selected disabled value="">Seleccione una opción</option>';
    for (let index = 0; index < data.length; index++) {
        body += `<option value="${data[index].IdRuta}">${data[index].IdRuta} - ${data[index].Descripcion}</option>`;
    }
    document.getElementById('lugarSa').innerHTML = body;
}

//Obtener Lugar Destino
function ObtenerDestino() {
    axios.get(`${url}api/rutas`)
        .then(response => {
            LlenarDestino(response.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function LlenarDestino(data) {
    let body = '<option selected disabled value="">Seleccione una opción</option>';
    for (let index = 0; index < data.length; index++) {
        body += `<option value="${data[index].IdRuta}">${data[index].IdRuta} - ${data[index].Descripcion}</option>`;
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

        if (input.id.startsWith('acompananteNombre')) return;

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
    const SalidaId = document.getElementById('lugarSa').value;
    const ServicioID = document.getElementById('service').value;
    const MotivoID = document.getElementById('motivo').value;
    const DestinoId = document.getElementById('lugarDes').value;
    const Detalle = document.getElementById('detalle').value;
    const NombreSolicitante = document.getElementById('nameSoli').value;
    const Estado = 1;
    const Hora_Salida = document.getElementById('hora_salida').value;
    const Fecha_Solicitud = document.getElementById('b_date').value;

    function adjustToNullIfEmpty(value) {
        if (typeof value === 'string' && value.trim() === '') {
            value = null;
        }
        return value;
    }

    Acompanante1 = adjustToNullIfEmpty(Acompanante1);
    Acompanante2 = adjustToNullIfEmpty(Acompanante2);
    Acompanante3 = adjustToNullIfEmpty(Acompanante3);
    Acompanante4 = adjustToNullIfEmpty(Acompanante4);
    Acompanante5 = adjustToNullIfEmpty(Acompanante5);

    const datos = {
        NombreSolicitante: NombreSolicitante,
        SalidaId: SalidaId,
        DestinoId: DestinoId,
        MotivoId: MotivoID,
        ServicioId: ServicioID,
        Fecha_Solicitud: Fecha_Solicitud,
        Hora_Salida: Hora_Salida,
        Detalle: Detalle,
        EstadoId: Estado,
        IdUnidadProgramatica: IdUnidadProgramatica,
        Acompanante1: Acompanante1,
        Acompanante2: Acompanante2,
        Acompanante3: Acompanante3,
        Acompanante4: Acompanante4,
        Acompanante5: Acompanante5
    };

    axios.post(`${url}api/vales`, datos)
        .then(response => {
            showToast("", "Se generó la solicitud exitosamente");
            location.reload();
        })
        .catch(error => {
            if (error.response) {
                console.error('Hubo un problema al guardar los datos:', error.response.data);
            } else {
                console.error('Error desconocido:', error);
            }
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

const handleLogin = async () => {
    const userEmail = document.getElementById('userEmail').value;
    const userPassword = document.getElementById('userPassword').value;
    try {
        const token = await loginUser(userEmail, userPassword);
        console.log('Token:', token);
        window.location.href = 'Index.html';
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showToast("Error", "Usuario o Contraseña incorrectos", () => {
            setTimeout(() => {
                location.reload();
            }, 0);
        });
    }
};
document.getElementById('loginButton').addEventListener('click', handleLogin);

//Mostrar ultimo acompañante
async function getUltimate() {
    try {
        const response = await axios.get(`${url}api/vales`);
        const vales = response.data.vales;
        const ultimo = vales.length - 1;
        console.log(vales);

        if (ultimo >= 0) {
            const vale = vales[ultimo];
            const fechaSolicitud = new Date(vale.Fecha_Solicitud);
            const fechaFormateada = fechaSolicitud.toISOString().split('T')[0];
            document.getElementById('Up').value = vale.IdUnidadProgramatica;
            document.getElementById('lugarSa').value = vale.SalidaId;
            document.getElementById('service').value = vale.ServicioId;
            document.getElementById('motivo').value = vale.MotivoId;
            document.getElementById('lugarDes').value = vale.DestinoId;
            document.getElementById('detalle').value = vale.Detalle;
            document.getElementById('nameSoli').value = vale.NombreSolicitante;
            document.getElementById('hora_salida').value = vale.Hora_Salida;
            document.getElementById('b_date').value = fechaFormateada;
            getAcompanantes(vale);
            showToast("Ultimo Vale", "Se cargó el último vale exitosamente");
        } else {
            console.error('No hay vales disponibles.');
        }
    } catch (error) {
        console.error('No se cargaron los datos', error);
    }
}

function getAcompanantes(vale) {
    if (vale.Acompanante1 != null) {
        const acompDiv1 = document.getElementById('acompananteNombre1');
        const div1 = document.getElementById('acompanante1');
        div1.style.display = 'block';
        acompDiv1.value = vale.Acompanante1;
    }
    if (vale.Acompanante2 != null) {
        const acompDiv1 = document.getElementById('acompananteNombre2');
        const div1 = document.getElementById('acompanante2');
        div1.style.display = 'block';
        acompDiv1.value = vale.Acompanante2;
    }
    if (vale.Acompanante3 != null) {
        const acompDiv1 = document.getElementById('acompananteNombre3');
        const div1 = document.getElementById('acompanante3');
        div1.style.display = 'block';
        acompDiv1.value = vale.Acompanante3;
    }
    if (vale.Acompanante4 != null) {
        const acompDiv1 = document.getElementById('acompananteNombre4');
        const div1 = document.getElementById('acompanante4');
        div1.style.display = 'block';
        acompDiv1.value = vale.Acompanante4;
    }
    if (vale.Acompanante5 != null) {
        const acompDiv1 = document.getElementById('acompananteNombre5');
        const div1 = document.getElementById('acompanante5');
        div1.style.display = 'block';
        acompDiv1.value = vale.Acompanante5;
    }
}

document.getElementById('btn-mostrar').addEventListener('click', function (event) {
    getUltimate();
});