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
    const toastElement = document.getElementById('common-toast');
    if (toastElement) {
        document.getElementById('common-toast-title').innerText = title;
        document.getElementById('common-toast-body').innerText = message;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    } else {
        console.error('Toast element not found');
    }
}

//Parte de Generar Solicitud de Vales. 
let acompananteCount = 0;

document.getElementById('addCompanion').addEventListener('click', function () {
    if (acompananteCount < 5) {
        acompananteCount++;
        const acompDiv = document.getElementById('acompanante' + acompananteCount);
        if (acompDiv) {
            acompDiv.style.display = 'block';
        }
    } else {
        alert("No se pueden agregar mas de 5 acompañantes");
    }
});

document.getElementById('removeCompanion').addEventListener('click', function () {
    if (acompananteCount > 0) {
        const acompDiv = document.getElementById('acompanante' + acompananteCount);
        if (acompDiv) {
            acompDiv.style.display = 'none';
        }
        acompananteCount--;
    }
});
//funcion para obtener la fecha y hora
document.addEventListener("DOMContentLoaded", function () {
    var today = new Date();
    var formattedDate = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    document.getElementById('date').textContent = formattedDate;
});




//Funciones para cargar API
var url = 'http://localhost:56336/';
AxiosData();
function AxiosData() {
    axios.get(`${url}api/acompanantes`)
        .then(response => {
            console.log(response.data);
            LlenarAcompanante(response.data);
            LlenarUP(response.data);
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
function LlenarUP(data) {
    let body = '';
    for (let index = 0; index < array.length; index++) {
        body += `<option value = ${data[index].id}>${data[index].UnidadProgramatica}</option>`;
    }
    document.getElementById('Up').innerHTML = body;
}