document.getElementById('btnConsultar').addEventListener('click', async function () {
    const unidad = document.getElementById('unidad').value.trim(); 
    if (!unidad) {
        showToast('Advertencia', 'Ingrese un número de unidad válido.');
        return;
    }

    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registroCombustible?numeroUnidad=${unidad}`);
        const registroCombustible = response.data.registros;

    
        document.getElementById('usuario').value = registroCombustible.usuario || '';
        document.getElementById('unidad').value = registroCombustible.numeroUnidad || '';
        document.getElementById('kilometraje').value = registroCombustible.kilometraje || '';
        document.getElementById('litros').value = registroCombustible.litrosAproximados || '';
        document.getElementById('monto').value = registroCombustible.montoColones || '';
        document.getElementById('lugar').value = registroCombustible.lugar || '';
        document.getElementById('fecha').value = registroCombustible.fecha ? new Date(registroCombustible.fecha).toISOString().split('T')[0] : '';
        document.getElementById('hora').value = registroCombustible.hora || '';

        showToast('Éxito', 'Datos del registro de combustible cargados correctamente.');
    } catch (error) {
        console.error('Error al obtener datos del registro de combustible:', error);
        showToast('Error', 'No se pudo obtener los datos del registro de combustible.');
    }
});

