document.getElementById('formFuel').addEventListener('submit', function (event) {
    event.preventDefault();
    postFuelLog();
});

document.getElementById('btnActualizar').addEventListener('click', function (event) {
    event.preventDefault();
    updateFuelLog();
});

document.getElementById('btnCargar').addEventListener('click', function (event) {
    event.preventDefault();
    getFuelLog();
});

async function getChoferes() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer');
        const choferes = response.data.choferes;

        const assignedDriver = document.getElementById('chofer');
        assignedDriver.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione el chófer...';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        assignedDriver.appendChild(defaultOption);

        choferes.forEach(chofer => {
            const option = document.createElement('option');
            option.value = chofer.idChofer;
            option.textContent = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
            assignedDriver.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los choferes:', error);
    }
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

        unidades.forEach(unidad => {
            const option = document.createElement('option');
            option.value = unidad.id;
            option.textContent = unidad.numeroUnidad;
            unit.appendChild(option);
        });

    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

getUnidades();

// async function getFuelLog() {
//     const unitSelect = document.getElementById('unidad');
//     const unitNumber = unitSelect.options[unitSelect.selectedIndex].text;

//     if (unitNumber === '') {
//         showToast('Error', 'El número de unidad no puede estar vacío.');
//         return;
//     }

//     try {
//         const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${unitNumber}`);
//         const fuelLog = response.data.registros;

//         if (fuelLog.length === 0) {
//             showToast('Error', 'No se encuentran registros de combustible de la unidad ' + unitNumber + '.');
//             return;
//         }

//         fuelLog.forEach(fuelLog => {
//             document.getElementById('chofer').value = fuelLog.usuario;
//             document.getElementById('unidad').value = fuelLog.numeroUnidad;
//             document.getElementById('litros').value = fuelLog.litrosAproximados;
//             document.getElementById('kilometraje').value = fuelLog.kilometraje;
//             document.getElementById('monto').value = fuelLog.montoColones;
//             document.getElementById('lugar').value = fuelLog.lugar;
//             document.getElementById('fecha').value = new Date(fuelLog.fecha).toISOString().split('T')[0];
//             document.getElementById('hora').value = fuelLog.hora;
//         });

//         const event = new Event('change');
//         document.getElementById('chofer').dispatchEvent(event);
//         document.getElementById('unidad').dispatchEvent(event);

//     } catch (error) {
//         console.error('Error al obtener el registro de combustible:', error);
//         showToast('Error', 'Error al obtener el registro de combustible.');
//     }
// }

function postFuelLog() {
    const usuarioSelect = document.getElementById('chofer');
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
            // clearForm();
            console.log('Registro de combustible realizado:', response.data);
            showToast('Registro exitoso', 'El registro de combustible se ha realizado exitosamente.');
            document.getElementById('formFuel').reset();
        })
        .catch(error => {
            console.error('Error al crear el registro de combustible:', error);
            showToast('Error', 'Error al guardar el registro de combustible.');
        });
}

function updateFuelLog() {
    const usuarioSelect = document.getElementById('chofer');
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

    axios.put('https://backend-transporteccss.onrender.com/api/registrocombustible', fuelLogData)
        .then(response => {
            // clearForm();
            console.log('Registro de combustible realizado:', response.data);
            showToast('Registro exitoso', 'El registro de combustible se ha realizado exitosamente.');
            document.getElementById('formFuel').reset();
        })
        .catch(error => {
            console.error('Error al crear el registro de combustible:', error);
            showToast('Error', 'Error al guardar el registro de combustible.');
        });
}