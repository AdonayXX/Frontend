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
            alert('Registro exitoso');
        })
        .catch(error => {
            console.error('Error en el registro:', error);
            alert('Error en el registro');
        });
});

function save() {
    showToast('Registro exitoso', 'Se ha registrado el viaje exitosamente.');
}


function cancelar() {
    document.getElementById('registroViajesForm').reset();
}

// function actualizar() {
// }

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
document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('estadoViaje').addEventListener('change', handleEstadoChange);
    document.getElementById('horaInicio').addEventListener('change', handleEstadoChange);
    document.getElementById('horaFin').addEventListener('change', handleEstadoChange);
    document.getElementById('cancelar').addEventListener('click', cancelar);
    document.getElementById('actualizar').addEventListener('click', actualizar);
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

function cancelar() {
}

document.addEventListener('DOMContentLoaded', function () {
    loadToastTemplate();
});

