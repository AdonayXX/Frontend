//funciones dinamicas

// Función para mostrar los campos según el motivo seleccionado
function mostrarCampos() {
    var motivoSeleccionado = document.getElementById('motivo').value;
    var contenedorSelectSalida = document.getElementById('contenedorSelectSalida');
    var contenedorSelectDestino = document.getElementById('contenedorSelectDestino');
    var contenedorEscribirSalida = document.getElementById('contenedorEscribirSalida');
    var contenedorEscribirDestino = document.getElementById('contenedorEscribirDestino');

    
    if (motivoSeleccionado === '1') {
        contenedorSelectSalida.style.display = 'block';
        contenedorSelectDestino.style.display = 'block';
        contenedorEscribirSalida.style.display = 'none';
        contenedorEscribirDestino.style.display = 'none';
        document.getElementById('nameSali').setAttribute('disabled', 'disabled');
        document.getElementById('nameDestino').setAttribute('disabled', 'disabled');
    } else {
        
        contenedorSelectSalida.style.display = 'none';
        contenedorSelectDestino.style.display = 'none';
        contenedorEscribirSalida.style.display = 'block';
        contenedorEscribirDestino.style.display = 'block';
        document.getElementById('nameSali').removeAttribute('disabled');
        document.getElementById('nameDestino').removeAttribute('disabled');
    }
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
            const inputs = acompDiv.getElementsByTagName('input');
            for (let input of inputs) {
                input.value = '';
            }
            acompDiv.style.display = 'none';
        }
        acompananteCount--;
    }
});


//Funcion para obtener los datos de la solicitud
function SolicitarVale() {
    ObtenerUnidades();
    ObtenerServicios();
    ObtenerMotivos();
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
function ObtenerMotivos() {
    axios.get(`${url}api/motivoVale`)
        .then(response => {
            llenarMotivos(response.data);
        })
        .catch(error => {
            console.error('Hubo un problema al obtener los datos:', error);
        });
}

// Función para llenar las opciones del select de motivo
function llenarMotivos(data) {
    let options = '<option selected disabled value="">Seleccione una opción</option>';
    data.forEach(motivo => {
        options += `<option value="${motivo.id}">${motivo.descripcion}</option>`;
    });
    document.getElementById('motivo').innerHTML = options;
}

//Obtener Lugar de Salida
function ObtenerSalida() {
    axios.get(`${url}api/ebais`)
        .then(response => {
            LlenarSalida(response.data.ebais);
        })
        .catch(error => {
            console.error('Hubo un problema con la operación de obtención:', error);
        });
}

// Llenar selector de lugar de salida con EBAIS
function LlenarSalida(data) {
    let body = '<option selected disabled value="">Seleccione una opción</option>';
    data.forEach(ebai => {
        body += `<option value="${ebai.id}">${ebai.nombre}</option>`;
    });
    document.getElementById('lugarSa').innerHTML = body;
}

// Obtener EBAIS para lugar de destino
function ObtenerDestino() {
    axios.get(`${url}api/ebais`)
        .then(response => {
            LlenarDestino(response.data.ebais); // Asumiendo que "ebais" es el arreglo de EBAIS
        })
        .catch(error => {
            console.error('Hubo un problema con la operación de obtención:', error);
        });
}

// Llenar selector de lugar de destino con EBAIS
function LlenarDestino(data) {
    let body = '<option selected disabled value="">Seleccione una opción</option>';
    data.forEach(ebai => {
        body += `<option value="${ebai.id}">${ebai.nombre}</option>`;
    });
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
        if (input.offsetParent === null) return;
        if (input.value.trim() === '' || input.value === null) {
            isValid = false;
        }
    });

    return isValid;
}

function GuardarDatos() {
    if (!validateModalForm()) {
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
    const Chofer = document.getElementById('chofer').checked ? 1 : 0;
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
        Acompanante5: Acompanante5,
        Chofer: Chofer
    };

    axios.post(`${url}api/vales`, datos)
        .then(response => {
            showToast("", "Se generó la solicitud exitosamente");

        })
        .catch(error => {
            if (error.response) {
                console.error('Hubo un problema al guardar los datos:', error.response.data);
            } else {
                console.error('Error desconocido:', error);
            }
        });

}
//Limpia los campos del modal 
document.getElementById('btn-mostrar').addEventListener('click', function () {
    document.getElementById('acompananteNombre1').value = '';
    document.getElementById('acompananteNombre2').value = '';
    document.getElementById('acompananteNombre3').value = '';
    document.getElementById('acompananteNombre4').value = '';
    document.getElementById('acompananteNombre5').value = '';
    document.getElementById('Up').value = '';
    document.getElementById('lugarSa').value = '';
    document.getElementById('service').value = '';
    document.getElementById('motivo').value = '';
    document.getElementById('lugarDes').value = '';
    document.getElementById('detalle').value = '';
    document.getElementById('nameSoli').value = '';
    document.getElementById('hora_salida').value = '';
    document.getElementById('b_date').value = '';
    document.addEventListener('DOMContentLoaded', getVales);
});

var error;

//Mostrar ID de Vale
async function getVales() {
    try {
        const response = await axios.get(`${url}api/vales`);
        const data = response.data;
        const vales = data.vales;

        if (vales.length > 0) {
            const ids = vales.map(vale => vale.IdVale);
            const lastId = ids.sort().reverse()[0];
            const [year, number] = lastId.split('-');
            const newNumber = String(parseInt(number) + 1).padStart(3, '0');
            const nuevoId = `${year}-${newNumber}`;
            document.getElementById('valeId').textContent = nuevoId;
        } else {
            document.getElementById('valeId').textContent = '2024-001';
        }
    } catch (error) {
        console.error('Hubo un problema con la operación de obtención:', error);
        document.getElementById('valeId').textContent = 'Error al obtener vales';
    }
}

document.addEventListener('DOMContentLoaded', getVales);
