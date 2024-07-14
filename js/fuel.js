"use strict";

document.getElementById('fuelForm').addEventListener('submit', function (event) {
    event.preventDefault();
    postRegistroCombustible();
});

document.getElementById('btnActualizar').addEventListener('click', function (event) {
    event.preventDefault();
    putRegistroCombustible();
});

document.getElementById('unidad').addEventListener('change', manejarCambioUnidad);
document.getElementById('btnLimpiar').addEventListener('click', function (event) {
    event.preventDefault();
    limpiar();
});

function manejarCambioUnidad(event) {
    event.preventDefault();
    getRegistroCombustible();
}

function limpiar() {
    document.getElementById('fuelForm').reset();
    document.getElementById('chofer').selectedIndex = 0;
    document.getElementById('unidad').selectedIndex = 0;
    document.getElementById('btnLimpiar').style.display = 'none';
}

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

async function getRegistroCombustible() {
    const unitSelect = document.getElementById('unidad');
    const unitNumber = unitSelect.options[unitSelect.selectedIndex].text;

    try {
        const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${unitNumber}`);
        const fuelLog = response.data.registro;

        // Remover event listener temporalmente
        unitSelect.removeEventListener('change', manejarCambioUnidad);
        const choferSelect = document.getElementById('chofer');

        fuelLog.forEach(log => {
            for (let i = 0; i < choferSelect.options.length; i++) {
                if (choferSelect.options[i].text === log.chofer) {
                    choferSelect.selectedIndex = i;
                    break;
                }
            }

            for (let i = 0; i < unitSelect.options.length; i++) {
                if (unitSelect.options[i].text === log.numeroUnidad) {
                    unitSelect.selectedIndex = i;
                    break;
                }
            }

            document.getElementById('litros').value = log.litrosAproximados;
            document.getElementById('kilometraje').value = log.kilometraje;
            document.getElementById('monto').value = log.montoColones;
            document.getElementById('lugar').value = log.lugar;
            document.getElementById('fecha').value = new Date(log.fecha).toISOString().split('T')[0];
            document.getElementById('hora').value = log.hora;

            document.getElementById('btnLimpiar').style.display = 'inline-block';
        });

        // Volver a agregar event listener después de actualizar los selects
        unitSelect.addEventListener('change', manejarCambioUnidad);

    } catch (error) {
        console.error('Error al obtener el registro de combustible:', error);
        showToast('Error', 'Error al obtener el registro de combustible.');
    }
}
function postRegistroCombustible() {
    const usuarioSelect = document.getElementById('chofer');
    // const usuarioContent = usuarioSelect.options[usuarioSelect.selectedIndex].text;
    
    const unidadSelect = document.getElementById('unidad');
    const unidadContent = unidadSelect.options[unidadSelect.selectedIndex].text;
    
    const litros = parseFloat(document.getElementById('litros').value).toFixed(2);
    const kilometraje = parseInt(document.getElementById('kilometraje').value, 10);
    const monto = parseFloat(document.getElementById('monto').value).toFixed(2);
    const lugar = document.getElementById('lugar').value;
    
    const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
    const horaInput = document.getElementById('hora').value;
    const hora = `${horaInput}:00` || null;
    
    const tipoCombustible = document.getElementById('tipoCombustible').value;
    const numeroFactura = document.getElementById('numeroFactura').value;
    const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;
    
    const estado = 'activo'; // Aquí se asigna el valor fijo 'activo' al estado
    
    const fuelLogData = {
        usuario: null,
        numeroUnidad: unidadContent,
        litrosAproximados: litros,
        kilometraje: kilometraje,
        montoColones: monto,
        lugar: lugar,
        fecha: fecha,
        hora: hora,
        tipoCombustible: tipoCombustible,
        numeroFactura: numeroFactura,
        numeroAutorizacion: numeroAutorizacion,
        estado: estado // Se asigna directamente el valor de 'estado'
    };

    console.log('Datos a enviar:', fuelLogData);

    axios.post('https://backend-transporteccss.onrender.com/api/registroCombustible', fuelLogData)
        .then(response => {
            limpiar(); // Suponiendo que limpiar() limpia los datos del formulario o reinicia el estado
            console.log('Registro de combustible realizado:', response.data);
            showToast('Registro exitoso', 'El registro de combustible se ha realizado exitosamente.');
            document.getElementById('fuelForm').reset(); // Resetea el formulario después de una solicitud exitosa
        })
        .catch(error => {
            console.error('Error al crear el registro de combustible:', error);
            showToast('Error', 'Error al guardar el registro de combustible.');
        });
}

function putRegistroCombustible() {
    const unitSelect = document.getElementById('unidad');
    const unitNumber = unitSelect.options[unitSelect.selectedIndex].text;
    const usuarioSelect = document.getElementById('chofer');
    const usuarioContent = usuarioSelect.options[usuarioSelect.selectedIndex].text;
    const litros = parseFloat(document.getElementById('litros').value).toFixed(2);
    const kilometraje = parseInt(document.getElementById('kilometraje').value, 10);
    const monto = parseFloat(document.getElementById('monto').value).toFixed(2);
    const lugar = document.getElementById('lugar').value;
    const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
    const horaInput = document.getElementById('hora').value;
    const hora = `${horaInput}:00` || null;

    const fuelLogData = {
        usuario: usuarioContent,
        numeroUnidad: unitNumber,
        litrosAproximados: litros,
        kilometraje: kilometraje,
        montoColones: monto,
        lugar: lugar,
        fecha: fecha,
        hora: hora
    };

    console.log('Datos a enviar:', fuelLogData);

    axios.put(`https://backend-transporteccss.onrender.com/api/registrocombustible/${unitNumber}`, fuelLogData)
        .then(response => {
            limpiar();
            console.log('Registro de combustible actualizado:', response.data);
            showToast('Actualización exitosa', 'El registro de combustible se ha actualizado exitosamente.');
            document.getElementById('fuelForm').reset();
        })
        .catch(error => {
            console.error('Error al actualizar el registro de combustible:', error);
            showToast('Error', 'Error al actualizar el registro de combustible.');
        });
}

getChoferes();
getUnidades();
