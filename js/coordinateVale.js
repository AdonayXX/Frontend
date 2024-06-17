const idVale = sessionStorage.getItem('selectedIdVale');
var url = 'https://backend-transporteccss.onrender.com/';

if (idVale) {

    readVale(idVale);

    sessionStorage.removeItem('selectedIdVale');

} else {
    console.error('No se encontró el ID del vale en sessionStorage.');
}


async function readVale(id) {
    try {
        const response = await axios.get(`${url}api/vales`);
        vales = response.data.vales;

        vales.forEach(vale => {
            if (id === vale.IdVale) {
                document.getElementById('input-id').value = id;
                document.getElementById('input-up').value = vale.UnidadProgramatica;
                document.getElementById('input-unidad').value = vale.Unidad;
                document.getElementById('input-solicitante').value = vale.NombreSolicitante;
                document.getElementById('input-servicio').value = vale.Servicio;
                document.getElementById('input-motivo').value = vale.Motivo;
                document.getElementById('input-horaSalida').value = vale.Hora_Salida;
                document.getElementById('input-fechaReq').value = vale.Fecha_Solicitud;
                document.getElementById('txa-detalle').value = vale.Detalle;
                acompanantes(vale);
            }
        });

    } catch (error) {
        console.error('Error fetching patient data:', error);
        showToast('Error', 'Error al obtener los datos del paciente.');
        return false;
    }
}

function acompanantes(vale) {
    if (vale.Acompanante1 != "null") {
        const acompDiv1 = document.getElementById('input-acompanante1');
        acompDiv1.style.display = 'block';
        acompDiv1.value = vale.NombreAcompanante1;
    }
    if (vale.Acompanante2 != "null") {
        const acompDiv1 = document.getElementById('input-acompanante2');
        acompDiv1.style.display = 'block';
        acompDiv1.value = vale.NombreAcompanante1;
    }
    if (vale.Acompanante3 != "null") {
        const acompDiv1 = document.getElementById('input-acompanante3');
        acompDiv1.style.display = 'block';
        acompDiv1.value = vale.NombreAcompanante1;
    }
    if (vale.Acompanante4 != "null") {
        const acompDiv1 = document.getElementById('input-acompanante4');
        acompDiv1.style.display = 'block';
        acompDiv1.value = vale.NombreAcompanante1;
    }
    if (vale.Acompanante5 != "null") {
        const acompDiv1 = document.getElementById('input-acompanante5');
        acompDiv1.style.display = 'block';
        acompDiv1.value = vale.NombreAcompanante1;
    }
}