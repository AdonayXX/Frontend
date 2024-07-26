/////FUNCIONES PARA EL POST
// Evento click en el botón guardar
document.getElementById("saveFormControlKm").addEventListener("click", function () {
    getDataControlKm();
});

// Función para obtener los valores de los campos del formulario
function getDataControlKm() {
    // Obtener el id del chofer y la unidad seleccionados del select
    const idChofer = parseInt(document.getElementById("driverControlKm").value);
    const idUnidad = parseInt(document.getElementById("choferControlKm").value);
    const fechaMantenimiento = formatDate(document.getElementById("dateControlKm").value);
    const kilometrosEntrada = parseInt(document.getElementById("KmE").value);
    const kilometrosSalida = parseInt(document.getElementById("KmS").value);
    const lugarVisitado = document.getElementById("LugarVisitado").value;

    // Verificar que todos los campos estén llenos
    if (isNaN(idChofer) || isNaN(idUnidad) || !fechaMantenimiento || isNaN(kilometrosEntrada) || isNaN(kilometrosSalida) || !lugarVisitado) {
        showToast("Ups!", "Por favor llene todos los campos");
        return;
    }

    // Verificar que los kilómetros de entrada no sean menores que los kilómetros de salida
    if (kilometrosEntrada < kilometrosSalida) {
        showToast("Error", "Los kilómetros de entrada no pueden ser menores que los kilómetros de salida");
        return;
    }

    const dataControlKm = {
        IdChofer: idChofer,
        IdUnidad: idUnidad,
        FechaMantenimiento: fechaMantenimiento,
        KilometrosSalida: kilometrosSalida,
        KilometrosEntrada: kilometrosEntrada,
        LugarVisitado: lugarVisitado
    }
    console.log(dataControlKm);
    // postDataControlKm(dataControlKm);
}

//Funcion post 
async function postDataControlKm(dataControlKm) {
    try {
        const token = localStorage.getItem("token");
        const API_URL = "http://localhost:18026/api/mantenimientoATAP/";
        const response = await axios.post(API_URL, dataControlKm, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        console.log(response.data);
        showToast("Éxito", "Mantenimiento guardado correctamente");
    } catch (error) {
        console.log(error);
        showToast("Error", "Hubo un error al guardar el mantenimiento");
    }
}

//////FUNCIONALIDADES
// Función para formatear la fecha
function formatDate(date) {
    const d = new Date(date + 'T00:00:00');
    let month = '' + (d.getUTCMonth() + 1);
    let day = '' + d.getUTCDate();
    const year = d.getUTCFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// Función para calcular los kilómetros recorridos
function calcularKilometrosRecorridos(kilometrosEntrada, kilometrosSalida) {
    if (kilometrosEntrada >= kilometrosSalida) {
        return kilometrosEntrada - kilometrosSalida;
    } else {
        return null;
    }
}

// Actualizar el campo de kilómetros recorridos automáticamente
document.getElementById("KmE").addEventListener("input", actualizarKilometrosRecorridos);
document.getElementById("KmS").addEventListener("input", actualizarKilometrosRecorridos);

function actualizarKilometrosRecorridos() {
    const kilometrosEntradaField = document.getElementById("KmE");
    const kilometrosEntrada = parseInt(kilometrosEntradaField.value);
    const kilometrosSalida = parseInt(document.getElementById("KmS").value);
    const kilometrosRecorridosField = document.getElementById("KmC");

    if (kilometrosEntrada < kilometrosSalida) {
        kilometrosEntradaField.setCustomValidity("Los kilómetros de entrada no pueden ser menores que los kilómetros de salida");
        kilometrosRecorridosField.value = '';
    } else {
        kilometrosEntradaField.setCustomValidity("");
        const kilometrosRecorridos = calcularKilometrosRecorridos(kilometrosEntrada, kilometrosSalida);
        if (kilometrosRecorridos !== null) {
            kilometrosRecorridosField.value = kilometrosRecorridos;
        } else {
            kilometrosRecorridosField.value = '';
        }
    }
    kilometrosEntradaField.reportValidity();
}

// Cargar unidades de tipo 3 (Motos) en el select
cargarUnidades();
async function cargarUnidades() {
    try {
        const API_URL = "https://backend-transporteccss.onrender.com/api/unidades";
        const token = localStorage.getItem("token");

        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const unidades = response.data.unidades;

        // Filtrar unidades de tipo id 3 (Motos)
        const motos = unidades.filter(unidad => unidad.idTipoUnidad === 3);

        // Obtener el elemento select
        const selectUnidades = document.getElementById("choferControlKm");

        // Limpiar el select
        selectUnidades.innerHTML = '';

        // Agregar una opción por defecto (opcional)
        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.text = "Seleccione una unidad";
        selectUnidades.appendChild(optionDefault);

        // Agregar las unidades filtradas al select
        motos.forEach(moto => {
            const option = document.createElement("option");
            option.value = moto.id;
            option.text = moto.numeroUnidad;
            selectUnidades.appendChild(option);
        });
    } catch (error) {
        console.log(error);
        showToast("Error", "Hubo un error al cargar las unidades");
    }
}

// Cargar choferes en el select
cargarChoferes();
async function cargarChoferes() {
    try {
        const token = localStorage.getItem("token");
        const API_URL = "https://backend-transporteccss.onrender.com/api/chofer";

        // Hacer la solicitud con el token de autorización
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const choferes = response.data.choferes;

        // Obtener el elemento select
        const selectChoferes = document.getElementById("driverControlKm");

        // Limpiar el select
        selectChoferes.innerHTML = '';

        // Agregar una opción por defecto (opcional)
        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.text = "Seleccione un chofer";
        selectChoferes.appendChild(optionDefault);

        // Agregar los choferes al select
        choferes.forEach(chofer => {
            const option = document.createElement("option");
            option.value = chofer.idChofer;
            option.text = chofer.nombre; 
            selectChoferes.appendChild(option);
        });
    } catch (error) {
        console.log(error);
        showToast("Error", "Hubo un error al cargar los choferes");
    }
}
