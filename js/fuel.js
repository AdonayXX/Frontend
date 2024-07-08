document.getElementById('formFuel').addEventListener('submit', function (event) {
    event.preventDefault();
    postFuelLog();
});

document.getElementById('btnActualizar').addEventListener('click', function (event) {
    event.preventDefault();
    getLastFuelLog();
});

function getChoferes() {
    axios.get('https://backend-transporteccss.onrender.com/api/chofer')
        .then(response => {

            const choferes = response.data.choferes;
            const usuarioSelect = document.getElementById('usuario');
        
            usuarioSelect.innerHTML = '';

            choferes.forEach(chofer => {
                const option = document.createElement('option');
                option.value = chofer.idChofer;
                option.textContent = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
                usuarioSelect.appendChild(option);
            });

        })
        .catch(error => {
            console.error('Error al obtener los choferes:', error); 
        });
}

getChoferes();

async function getUnidades() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades');
        const unidades = response.data.unidades;

        const unit = document.getElementById('unidad');
        unit.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione la unidad...';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        unit.appendChild(defaultOption);

        let counter = 1;

        unidades.forEach(unidad => {
            const option = document.createElement('option');
            option.value = counter++;
            option.textContent = unidad.numeroUnidad;
            unit.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

getUnidades();

async function getLastFuelLog() {
    const unidadSelect = document.getElementById('unidad');
    const unidadContent = unidadSelect.options[unidadSelect.selectedIndex].text;

    if (unidadContent === '') {
        showToast('Error', 'Debe seleccionar una unidad.');
        return;
    }

    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/ultimo?unidad=${unidadContent}`);
        const lastFuelLog = response.data;

        if (!lastFuelLog) {
            showToast('Error', 'No se encontró un registro de combustible para la unidad seleccionada.');
            return;
        }

        document.getElementById('litros').value = lastFuelLog.litrosAproximados || '';
        document.getElementById('kilometraje').value = lastFuelLog.kilometraje || '';
        document.getElementById('monto').value = lastFuelLog.montoColones || '';
        document.getElementById('lugar').value = lastFuelLog.lugar || '';
        document.getElementById('fecha').value = lastFuelLog.fecha ? new Date(lastFuelLog.fecha).toISOString().split('T')[0] : '';
        document.getElementById('hora').value = lastFuelLog.hora ? lastFuelLog.hora.split(':00')[0] : '';

    } catch (error) {
        console.error('Error al obtener el último registro de combustible:', error);
        showToast('Error', 'Error al obtener el último registro de combustible.');
    }
}

function postFuelLog() {
    const usuarioSelect = document.getElementById('usuario');
    const usuarioContent = usuarioSelect.options[usuarioSelect.selectedIndex].text;
    const unidadSelect = document.getElementById('unidad');
    const unidadContent = unidadSelect.options[unidadSelect.selectedIndex].text;
    const litros = parseFloat(document.getElementById('litros').value).toFixed(2);
    const kilometraje = parseInt(document.getElementById('kilometraje').value, 10);
    const monto = parseFloat(document.getElementById('monto').value).toFixed(2);
    const lugar = document.getElementById('lugar').value;
    const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
    const horaInput = document.getElementById('hora').value;
    const hora = `${horaInput}:00` || null;

    const fuelLogData = {
        usuario: usuarioContent,
        numeroUnidad: unidadContent,
        litrosAproximados: litros,
        kilometraje: kilometraje,
        montoColones: monto,
        lugar: lugar,
        fecha: fecha,
        hora: hora
    };

    console.log('Datos a enviar:', fuelLogData);

    axios.post('https://backend-transporteccss.onrender.com/api/registrocombustible', fuelLogData)
        .then(response => {
            clearForm();
            console.log('Registro de combustible realizado:', response.data);
            showToast('Registro exitoso', 'El registro de combustible se ha realizado exitosamente.');
            document.getElementById('formFuel').reset();
        })
        .catch(error => {
            console.error('Error al crear el registro de combustible:', error);
            showToast('Error', 'Error al guardar el registro de combustible.');
        });
}