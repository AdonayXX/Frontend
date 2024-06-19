
document.getElementById('formDriver').addEventListener('submit', function(event) {
    event.preventDefault();
    addDriver();
});

async function addDriver() {
    try {
        const cedula = document.getElementById('cedula').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const apellido1 = document.getElementById('apellido1').value.trim();
        const apellido2 = document.getElementById('apellido2').value.trim();
        const contacto = document.getElementById('contacto').value.trim();
        const tipoSangre = document.getElementById('tipoSangre').value.trim();
        const tipoLicencia = document.getElementById('tipoLicencia').value.trim();
        const fechaVencimientoLicencia = document.getElementById('fechaVencimientoLicencia').value.trim();

        if (!cedula || !nombre || !apellido1 || !apellido2 || !contacto || !tipoSangre || !tipoLicencia || !fechaVencimientoLicencia) {
            alert("Por favor, rellena todos los campos solicitados.");
            return;
        }

        const driverData = {
            "cedula": cedula,
            "nombre": nombre,
            "apellido1": apellido1,
            "apellido2": apellido2,
            "contacto": contacto,
            "tipoSangre": tipoSangre,
            "tipoLicencia": tipoLicencia,
            "vencimientoLicencia": fechaVencimientoLicencia
        };

        const API_URL = 'https://backend-transporteccss.onrender.com/api/chofer/';
        const response = await axios.post(API_URL, driverData);

        if (response.status === 200) {
            alert('Chofer registrado exitosamente.');
            document.getElementById('formDriver').reset();
        } else {
            alert('Ocurrió un problema al registrar el chofer.');
        }
    } catch (error) {
        console.error(error);
        alert('Ocurrió un problema durante el envío de los datos.');
    }
}


alert('formDriver.js loaded');
