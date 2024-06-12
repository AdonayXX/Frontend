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

let acompananteCount = 0;

//Funcion para cargar API
var url = 'http://localhost:56336/';
AxiosData();
function AxiosData() {
    axios.get(`${url}api/acompanantes`)
        .then(response => {
            console.log(response.data);
            LlenarAcompanante(response.data);

        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    axios.get(`${url}api/unidadProgramaticas`)
        .then(function (response) {
            const unidades = response.data;
            const unidadProgramaticaSelect = document.getElementById('Up');
            // Clear existing options except the first one
            unidadProgramaticaSelect.innerHTML = '<option selected disabled value="">Seleccione una opción</option>';

            // Populate the select with options from the API response
            unidades.forEach(function (unidad) {
                const option = document.createElement('option');
                option.value = unidad.id; // Adjust according to your data structure
                option.textContent = unidad.IdUnidadProgramatica; // Adjust according to your data structure
                unidadProgramaticaSelect.appendChild(option);
            });
        })
        .catch(function (error) {
            console.error('Error al obtener los datos:', error);
            alert('Hubo un error al cargar las opciones de unidad programática.');
        });
});


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

function validateModalForm() {
    // Get all input and select elements within the modal form
    const inputs = document.querySelectorAll('#form-request input, #form-request textarea, #form-request select');
    let isValid = true;

    // Loop through each input element
    inputs.forEach(input => {
        // Check if the input is empty
        if (input.value.trim() === '' || input.value === null) {
            // If empty, set isValid to false and highlight the input
            isValid = false;
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
        } else {
            // If not empty, remove any previous highlight
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });

    return isValid;
}

document.getElementById('btn_Guardar').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission
    if (validateModalForm()) {
        var selectElement = document.getElementById("Up");

        // Obtener el índice del elemento seleccionado
        var selectedIndex = selectElement.selectedIndex;

        // Obtener el texto del elemento seleccionado
        var selectedOptionText = selectElement.options[selectedIndex].text;
        const formData = {
            IdUnidadProgramatica: selectedOptionText,
            Unidad: document.getElementById('unidad').value,
            NombreSolicitante: document.getElementById('nameSoli').value,
            Servicios: document.getElementById('service').value,
            LugarSalida: document.getElementById('lugarSa').value,
            Destino: document.getElementById('lugarDes').value,
            Fecha_Solicitud: document.getElementById('b_date').value,
            Hora_Salida: document.getElementById('hora_salida').value,
            Motivo_Solicitud: document.getElementById('motivo').value,
            Detalle: document.getElementById('tbxdireccion').value,
            Acompanante1: 1,
            Acompanante2: 2,
            Acompanante3: null,
            Acompanante4: null,
            Acompanante5: null,
            Estado: 'P' // Example value for Estado
        };
        // Send data to the API using Axios
        axios.post(`${url}api/vales`, formData)
            .then(function (response) {
                // Handle successful response
                alert('Solicitud enviada correctamente.');
                console.log(response.data);
                // Optionally, close the modal and reset the form

            })
            .catch(function (error) {
                // Handle error
                // alert('Hubo un error al enviar la solicitud.');
                console.error(error);
            });
    } else {
        alert('Por favor, complete todos los campos requeridos.');
    }
});
