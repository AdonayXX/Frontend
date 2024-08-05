"use strict";

(async function () {

    const infoUsuario = infoUser();
    const idUsuario = infoUsuario.usuario.IdUsuario;
    const form = document.getElementById('fuelForm');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnclearForm = document.getElementById('btnLimpiar');
    const token = localStorage.getItem('token');
    const rol = infoUsuario?.usuario?.Rol;
    const apiUrl = 'https://backend-transporteccss.onrender.com/api/';

    if (!token) {
        window.location.href = 'login.html';
    }

    if (rol !== 2) {
        document.getElementById('btnBuscar').disabled = true;
        document.getElementById('btnGuardar').disabled = true;
        showToast('Acceso denegado', 'Solo los chóferes pueden usar este módulo.');
        return;
    }

    form.addEventListener('submit', handleSubmit);
    btnBuscar.addEventListener('click', handleBuscar);
    btnclearForm.addEventListener('click', handleclearForm);

    async function handleSubmit(event) {
        event.preventDefault();
        const submitterId = event.submitter.id;

        switch (submitterId) {
            case 'btnGuardar':
                await postFuelLog();
                break;
            case 'btnActualizar':
                await putFuelLog();
                break;
            case 'btnEliminar':
                await deleteFuelLog();
                break;
        }
    }

    async function handleBuscar(event) {
        event.preventDefault();
        await getFuelLog();
    }

    async function handleclearForm(event) {
        event.preventDefault();
        clearForm();
    }

    function clearForm() {
        const unidadInput = document.getElementById('unidad');
        const choferInput = document.getElementById('chofer');
        const unidadValue = unidadInput.value;
        const choferValue = choferInput.value;

        form.reset();

        unidadInput.value = unidadValue;
        choferInput.value = choferValue;

        btnclearForm.style.display = 'none';
        document.getElementById('btnActualizar').disabled = true;
        document.getElementById('btnEliminar').disabled = true;
        document.getElementById('btnGuardar').disabled = false;
    }

    async function getAssignedUnit(identificacion) {
        try {
            const response = await axios.get(`${apiUrl}chofer/unidades`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.choferesConUnidades.find(chofer => chofer.cedula === identificacion);
        } catch (error) {
            showToast('Error', 'Error al obtener la unidad asignada.');
        }
    }

    async function setUnitDriver() {
        const infoUsuario = await infoUser();
        const identificacion = infoUsuario.usuario.Identificacion;
        const unidadYChofer = await getAssignedUnit(identificacion);

        if (unidadYChofer && unidadYChofer.idEstado === 1) {
            document.getElementById('chofer').value = `${unidadYChofer.nombre} ${unidadYChofer.apellido1} ${unidadYChofer.apellido2}`;
            document.getElementById('unidad').value = unidadYChofer.numeroUnidad;
        }
    }

    setUnitDriver();

    function obtainHourandDate() {
        const now = new Date();
        const fechaActual = now.toISOString().split('T')[0];
        const horaActual = now.toTimeString().split(' ')[0].slice(0, 5);

        document.getElementById('fecha').value = fechaActual;
        document.getElementById('hora').value = horaActual;
    }

    obtainHourandDate();

    async function checkDuplicateBill(numeroFactura, idRegistro = null) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}registroCombustible`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const registros = response.data.registros;
            return registros.some(registro => registro.numeroFactura === numeroFactura && registro.id !== idRegistro);
        } catch (error) {
            showToast('Error', 'Error al obtener los registros de combustible.');
            return false;
        }
    }

    async function checkDuplicateAutorization(numeroAutorizacion, idRegistro = null) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}registroCombustible`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const registros = response.data.registros;
            return registros.some(registro => registro.numeroAutorizacion === numeroAutorizacion && registro.id !== idRegistro);
        } catch (error) {
            showToast('Error', 'Error al obtener los registros de combustible.');
            return false;
        }
    }

    async function getUnitData(unidad) {
        try {
            const response = await axios.get(`${apiUrl}unidades/${unidad}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.unidades[0];
        } catch (error) {
            showToast('Error', 'Error al obtener los datos de la unidad.');
        }
    }

    async function getCurrentMileage(unidad) {
        try {
            const response = await axios.get(`${apiUrl}unidades/${unidad}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.unidades[0].kilometrajeActual;
        } catch (error) {
            showToast('Error', 'Error al obtener el kilometraje actual de la unidad.');
        }
    }

    async function updateCurrentMileage(unidad, kilometraje) {
        try {
            const unitData = await getUnitData(unidad);

            const data = {
                idTipoUnidad: unitData.idTipoUnidad,
                idTipoRecurso: unitData.idTipoRecurso,
                tipoFrecuenciaCambio: unitData.tipoFrecuenciaCambio,
                valorFrecuenciaC: unitData.valorFrecuenciaC,
                ultimoMantenimientoFecha: unitData.ultimoMantenimientoFecha,
                ultimoMantenimientoKilometraje: unitData.ultimoMantenimientoKilometraje,
                numeroUnidad: unidad,
                choferDesignado: unitData.choferDesignado,
                fechaDekra: new Date(unitData.fechaDekra).toISOString().split('T')[0],
                capacidadTotal: unitData.capacidadTotal,
                capacidadCamas: unitData.capacidadCamas,
                capacidadSillas: unitData.capacidadSillas,
                kilometrajeInicial: unitData.kilometrajeInicial,
                kilometrajeActual: kilometraje,
                adelanto: unitData.adelanto,
                idEstado: unitData.idEstado,
                usuario: idUsuario
            };

            await axios.put(`${apiUrl}unidades/${unidad}`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            showToast('Error', 'Error al actualizar el kilometraje actual de la unidad.');
        }
    }

    async function getIdRegistroCombustible(unidad) {
        try {
            const response = await axios.get(`${apiUrl}registrocombustible/${unidad}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const registros = response.data.registro.filter(log => log.estado === 'activo');

            if (registros.length > 0) {
                registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.hora.localeCompare(a.hora) || b.id - a.id);
                return registros[0].id;
            }
        } catch (error) {
            showToast('Error', 'Error al obtener el registro de combustible.');
        }
    }

    async function getFuelLog() {
        const unidad = document.getElementById('unidad').value;

        try {
            const response = await axios.get(`${apiUrl}registrocombustible/${unidad}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const registros = response.data.registro.filter(log => log.estado === 'activo');

            if (registros.length === 0) {
                showToast('Error', `No hay registros de combustible de la unidad ${unidad}.`);
                return;
            }

            registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha) || b.hora.localeCompare(a.hora) || b.id - a.id);

            const latestLog = registros[0];
            const tipoCombustibleSelect = document.getElementById('tipoCombustible');

            for (let i = 0; i < tipoCombustibleSelect.options.length; i++) {
                if (tipoCombustibleSelect.options[i].text === latestLog.tipoCombustible) {
                    tipoCombustibleSelect.selectedIndex = i;
                    break;
                }
            }

            document.getElementById('numeroFactura').value = latestLog.numeroFactura;
            document.getElementById('numeroAutorizacion').value = latestLog.numeroAutorizacion;
            document.getElementById('litros').value = latestLog.litrosAproximados;
            document.getElementById('kilometraje').value = latestLog.kilometraje;
            document.getElementById('monto').value = latestLog.montoColones;
            document.getElementById('lugar').value = latestLog.lugar;
            document.getElementById('fecha').value = new Date(latestLog.fecha).toISOString().split('T')[0];
            document.getElementById('hora').value = latestLog.hora;

            btnclearForm.style.display = 'inline-block';
            document.getElementById('btnActualizar').disabled = false;
            document.getElementById('btnEliminar').disabled = false;
            document.getElementById('btnGuardar').disabled = true;
        } catch (error) {
            showToast('Error', 'Error al obtener el registro de combustible.');
        }
    }

    async function postFuelLog() {
        const fuelLogData = getFormData();
        const idRegistro = await getIdRegistroCombustible(fuelLogData.numeroUnidad);

        if (await checkDuplicateBill(fuelLogData.numeroFactura, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de factura ${fuelLogData.numeroFactura}.`);
            return;
        } else if (await checkDuplicateAutorization(fuelLogData.numeroAutorizacion, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de autorización ${fuelLogData.numeroAutorizacion}.`);
            return;
        }

        if (await validateFormData(fuelLogData)) {
            await axios.post(`${apiUrl}registroCombustible`, fuelLogData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            updateCurrentMileage(fuelLogData.numeroUnidad, fuelLogData.kilometraje);
            clearForm();
            showToast('Éxito', `El registro de combustible de la unidad "${fuelLogData.numeroUnidad}" se ha realizado exitosamente.`);
        }
    }

    async function putFuelLog() {
        const fuelLogData = getFormData();
        const idRegistro = await getIdRegistroCombustible(fuelLogData.numeroUnidad);

        if (await checkDuplicateBill(fuelLogData.numeroFactura, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de factura ${fuelLogData.numeroFactura}.`);
            return;
        } else if (await checkDuplicateAutorization(fuelLogData.numeroAutorizacion, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de autorización ${fuelLogData.numeroAutorizacion}.`);
            return;
        }

        if (await validateFormData(fuelLogData)) {
            await axios.put(`${apiUrl}registroCombustible/${idRegistro}`, fuelLogData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            updateCurrentMileage(fuelLogData.numeroUnidad, fuelLogData.kilometraje);
            clearForm();
            showToast('Éxito', `El registro de combustible de la unidad "${fuelLogData.numeroUnidad}" se ha actualizado exitosamente.`);
        }
    }

    async function deleteFuelLog() {
        const fuelLogData = getFormData();
        const idRegistro = await getIdRegistroCombustible(fuelLogData.numeroUnidad);
        fuelLogData.estado = 'inactivo';

        if (await checkDuplicateBill(fuelLogData.numeroFactura, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de factura ${fuelLogData.numeroFactura}.`);
            return;
        } else if (await checkDuplicateAutorization(fuelLogData.numeroAutorizacion, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de autorización ${fuelLogData.numeroAutorizacion}.`);
            return;
        }

        const confirmationMessage = document.getElementById('deleteConfirmationMessage');
        confirmationMessage.innerText = `¿Está seguro que desea eliminar este registro de combustible de la unidad ${fuelLogData.numeroUnidad}?`;

        const deleteModal = new bootstrap.Modal(document.getElementById('deleteFuelLogModal'));
        deleteModal.show();

        document.getElementById('confirmDelete').onclick = function () {
            axios.put(`${apiUrl}registroCombustible/${idRegistro}`, fuelLogData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(() => {
                    clearForm();
                    showToast('Éxito', `El registro de combustible de la unidad se ha eliminado exitosamente.`);
                })
                .catch(() => {
                    showToast('Error', 'Error al eliminar el registro de combustible.');
                });

            deleteModal.hide()
        }
    }

    function getFormData() {
        const horaCitaInput = document.getElementById('hora').value;
        const tipoCombustibleSelect = document.getElementById('tipoCombustible');
        return {
            numeroUnidad: document.getElementById('unidad').value,
            numeroFactura: document.getElementById('numeroFactura').value,
            numeroAutorizacion: document.getElementById('numeroAutorizacion').value,
            chofer: document.getElementById('chofer').value,
            tipoCombustible: tipoCombustibleSelect.options[tipoCombustibleSelect.selectedIndex].text,
            litrosAproximados: document.getElementById('litros').value,
            kilometraje: parseInt(document.getElementById('kilometraje').value),
            montoColones: document.getElementById('monto').value,
            lugar: document.getElementById('lugar').value,
            fecha: document.getElementById('fecha').value,
            hora: `${horaCitaInput}`,
            estado: 'activo',
            usuario: idUsuario
        };
    }

    async function validateFormData(fuelLogData) {
        const kilometrajeActual = await getCurrentMileage(fuelLogData.numeroUnidad);

        if (fuelLogData.kilometraje < kilometrajeActual) {
            showToast('Error', `El kilometraje de recarga no puede ser inferior al kilometraje actual de la unidad (${kilometrajeActual} km).`);
            return false;
        }

        if (fuelLogData.fecha > new Date().toISOString().split('T')[0]) {
            showToast('Error', 'La fecha del registro de combustible no puede ser posterior a la fecha de hoy.');
            return;
        }

        const horaActual = new Date().toLocaleTimeString('en-US', { hour12: false });

        if (fuelLogData.hora > horaActual && fuelLogData.fecha === new Date().toISOString().split('T')[0]) {
            showToast('Error', 'La hora del registro de combustible no puede ser posterior a la hora actual.');
            return;
        }

        return true;
    }

})();