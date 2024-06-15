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
        } else {
            console.error('Toast element not found');
        }
    });
}


let acompananteCount = 0;
//Funcion para cargar API
var url = 'https://backend-transporteccss.onrender.com/';
AxiosData();
function AxiosData() {
    axios.get(`${url}api/funcionarios`)
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
            unidadProgramaticaSelect.innerHTML = '<option selected disabled value="">Seleccione una opción</option>';
            unidades.forEach(function (unidad) {
                const option = document.createElement('option');
                option.value = unidad.id;
                option.textContent = unidad.IdUnidadProgramatica;
                unidadProgramaticaSelect.appendChild(option);
            });
        })
        .catch(function (error) {
            console.error('Error al obtener los datos:', error);
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
        showToast("Error", "No se pueden agregar mas de 5 acompañantes");
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
        showToast("Error", "Debe llenar todos los campos antes de hacer la solicitud");
    }
});

//Token para el Login
const loginUser = async () => {
    const response = await fetch(`${url}api/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            identificador: '223456789', // Puede ser el correo o la identificación
            Contrasena: 'securePassword1'
        })
    });

    if (!response.ok) {
        throw new Error('Error al iniciar sesión');
    }

    const data = await response.json();
    return data.token; // Supón que el token viene en la propiedad token
};

// Llama a la función y almacena el token
loginUser()
    .then(token => {
        localStorage.setItem('token', token); // Guarda el token en localStorage para usarlo en solicitudes protegidas
        console.log('Token guardado:', token);
    })
    .catch(error => {
        console.error('Error al obtener el token:', error);
    });

//mandar el token
const fetchProtectedData = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('Token no disponible');
        return;
    }

    try {
        const response = await fetch(`${url}api/vales`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Acceso no autorizado');
        }

        const data = await response.json();
        console.log('Datos protegidos:', data);
    } catch (error) {
        console.error('Error al acceder a la ruta protegida:', error);
    }
};

fetchProtectedData();



