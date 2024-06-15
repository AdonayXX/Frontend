
function loadToastTemplate(callback) {
    fetch('toast-template.html')
        .then(response => response.text())
        .then(data => {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = data;
                if (callback) callback();
            } else {
                console.error('Toast container not found' );
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
        } else {
            console.error('Toast element not found');
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var today = new Date();
    var formattedDate = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    document.getElementById('date').textContent = formattedDate;
});

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
    let body = '';
    for (let index = 0; index < data.length; index++) {
        body += `<option value = ${data[index].id}>${data[index].Nombre}</option>`;
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
    let body = '';
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
    let body = '';
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
    let body = '';
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
//     let body = '';
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
    let body = '';
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




