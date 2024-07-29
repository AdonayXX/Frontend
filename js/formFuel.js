"use strict";

(async function () {

    function obtainHourandDate() {
        const fechaInput = document.getElementById('fecha');
        const horaInput = document.getElementById('hora');

        const now = new Date();
        const fechaActual = now.toISOString().split('T')[0];
        const horaActual = now.toTimeString().split(' ')[0].slice(0, 5); 

        fechaInput.value = fechaActual;
        horaInput.value = horaActual;
    }
    obtainHourandDate();


    document.getElementById('fuelForm').addEventListener('submit', function (event) {
        if (event.submitter.id === 'btnGuardar') {
            showToast('Cargando', 'Guardando registro de combustible...');
            event.preventDefault();
            postRegistroCombustible();
        } else if (event.submitter.id === 'btnActualizar') {
            showToast('Cargando', 'Actualizando registro de combustible...');
            event.preventDefault();
            putRegistroCombustible();
        } else if (event.submitter.id === 'btnEliminar') {
            event.preventDefault();
            deleteRegistroCombustible();
        }
    });

    document.getElementById('btnBuscar').addEventListener('click', function (event) {
        event.preventDefault();
        getRegistroCombustible();
    });

    document.getElementById('btnLimpiar').addEventListener('click', function (event) {
        event.preventDefault();
        limpiar();
    });

    function limpiar() {
        const unidadInput = document.getElementById('unidad');
        const choferInput = document.getElementById('chofer');

        const unidadValue = unidadInput.value;
        const choferValue = choferInput.value;

        document.getElementById('fuelForm').reset();

        unidadInput.value = unidadValue;
        choferInput.value = choferValue;

        document.getElementById('btnLimpiar').style.display = 'none';
        document.getElementById('btnActualizar').disabled = true;
        document.getElementById('btnEliminar').disabled = true;
        document.getElementById('btnGuardar').disabled = false;
    }

    function infoUser() {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwt_decode(token);
            return (decodedToken);
        } catch (error) {
            showToast('Error', 'Ocurrio un problema al obtener los datos del usuario')
        }
    }

    const infoUsuario = infoUser();
    const idUsuario = infoUsuario.usuario.IdUsuario;

    async function obtenerUnidadAsignada(identificacion) {
        const API_CHOFERES_CON_UNIDADES = 'https://backend-transporteccss.onrender.com/api/chofer/unidades';
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_CHOFERES_CON_UNIDADES, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.choferesConUnidades.find(chofer => chofer.cedula === identificacion);
        } catch (error) {
            showToast('Error', 'Error al obtener la unidad asignada.');
        }
    }

    async function setUnidadYChofer() {
        const infoUsuario = await infoUser();
        const identificacion = infoUsuario.usuario.Identificacion;
        const unidadYChofer = await obtenerUnidadAsignada(identificacion);

        if (unidadYChofer) {
            document.getElementById('chofer').value = `${unidadYChofer.nombre} ${unidadYChofer.apellido1} ${unidadYChofer.apellido2}`;
            document.getElementById('unidad').value = unidadYChofer.numeroUnidad;
        }
    }

    setUnidadYChofer();

    async function autorizacionDuplicado(numeroAutorizacion, idRegistro = null) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://backend-transporteccss.onrender.com/api/registroCombustible', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const registros = response.data.registros;
            const duplicado = registros.some(registro => registro.numeroAutorizacion === numeroAutorizacion && registro.id !== idRegistro);

            return duplicado;
        } catch (error) {
            showToast('Error', 'Error al obtener los registros de combustible.');
            return false;
        }
    }

    async function facturaDuplicado(numeroFactura, idRegistro = null) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://backend-transporteccss.onrender.com/api/registroCombustible', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const registros = response.data.registros;
            const duplicado = registros.some(registro => registro.numeroFactura === numeroFactura && registro.id !== idRegistro);
            
            return duplicado;
        } catch (error) {
            showToast('Error', 'Error al obtener los registros de combustible.');
            return false;
        }
    }

    async function getIdRegistroCombustible(unidad) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${unidad}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const registros = response.data.registro;
            const fuelLog = registros.filter(log => log.estado === 'activo');

            if (fuelLog.length > 0) {
                fuelLog.sort((a, b) => {
                    const dateComparison = new Date(b.fecha) - new Date(a.fecha);
                    if (dateComparison === 0) {
                        const timeComparison = b.hora.localeCompare(a.hora);
                        if (timeComparison === 0) {
                            return b.id - a.id;
                        }
                        return timeComparison;
                    }
                    return dateComparison;
                });

                const latestLog = fuelLog[0];

                return latestLog.id;
            }

        } catch (error) {
            showToast('Error', 'Error al obtener el registro de combustible.');
        }
    }

    async function getRegistroCombustible() {
        const unidad = document.getElementById('unidad').value;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${unidad}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const registros = response.data.registro;

            if (registros.length === 0) {
                showToast('Error', `No hay registros de combustible de la unidad ${unidad}.`);
                return;
            }

            const fuelLog = registros.filter(log => log.estado === 'activo');

            if (fuelLog.length > 0) {
                fuelLog.sort((a, b) => {
                    const dateComparison = new Date(b.fecha) - new Date(a.fecha);
                    if (dateComparison === 0) {
                        const timeComparison = b.hora.localeCompare(a.hora);
                        if (timeComparison === 0) {
                            return b.id - a.id;
                        }
                        return timeComparison;
                    }
                    return dateComparison;
                });

                const latestLog = fuelLog[0];
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

                document.getElementById('btnGuardar').disabled = true;
                document.getElementById('btnLimpiar').style.display = 'inline-block';
                document.getElementById('btnActualizar').disabled = false;
                document.getElementById('btnEliminar').disabled = false;
            }

        } catch (error) {
            showToast('Error', 'Error al obtener el registro de combustible.');
        }
    }



    async function postRegistroCombustible() {
        const unidad = document.getElementById('unidad').value;
        const chofer = document.getElementById('chofer').value;
        const litros = document.getElementById('litros').value;
        const kilometraje = document.getElementById('kilometraje').value;
        const monto = document.getElementById('monto').value;
        const lugar = document.getElementById('lugar').value;
        const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
        const horaCitaInput = document.getElementById('hora').value;
        const hora = `${horaCitaInput}`;
        const tipoCombustibleSelect = document.getElementById('tipoCombustible');
        const tipoCombustible = tipoCombustibleSelect.options[tipoCombustibleSelect.selectedIndex].text
        const numeroFactura = document.getElementById('numeroFactura').value;
        const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;

        const idRegistro = await getIdRegistroCombustible(unidad);
        if (await facturaDuplicado(numeroFactura, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de factura ${numeroFactura}.`);
            return;
        } else if (await autorizacionDuplicado(numeroAutorizacion, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de autorización ${numeroAutorizacion}.`);
            return;
        }
        if (fecha > new Date().toISOString().split('T')[0]) {
            showToast('Error', 'La fecha del registro de combustible no puede ser posterior a la fecha de hoy.');
            return;
        }

        const horaActual = new Date().toLocaleTimeString('en-US', { hour12: false });
        if (hora > horaActual && fecha === new Date().toISOString().split('T')[0]) {
            showToast('Error', 'La hora del registro de combustible no puede ser posterior a la hora actual.');
            return;
        }

        const fuelLogData = {
            numeroUnidad: unidad,
            montoColones: monto,
            litrosAproximados: litros,
            kilometraje: kilometraje,
            fecha: fecha,
            hora: hora,
            lugar: lugar,
            chofer: chofer,
            usuario: idUsuario,
            tipoCombustible: tipoCombustible,
            numeroFactura: numeroFactura,
            numeroAutorizacion: numeroAutorizacion,
            estado: "activo"
        };

        const token = localStorage.getItem('token');
        axios.post('https://backend-transporteccss.onrender.com/api/registroCombustible', fuelLogData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                limpiar();
                showToast('Éxito', `El registro de combustible de la unidad "${unidad}" se ha realizado exitosamente.`);
            })
            .catch(() => {
                showToast('Error', 'Error al guardar el registro de combustible.');
            });
    }

    async function putRegistroCombustible() {
        const unidad = document.getElementById('unidad').value;
        const chofer = document.getElementById('chofer').value;
        const litros = document.getElementById('litros').value;
        const kilometraje = document.getElementById('kilometraje').value;
        const monto = document.getElementById('monto').value;
        const lugar = document.getElementById('lugar').value;
        const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
        const horaCitaInput = document.getElementById('hora').value;
        const hora = `${horaCitaInput}`;
        const tipoCombustibleSelect = document.getElementById('tipoCombustible');
        const tipoCombustible = tipoCombustibleSelect.options[tipoCombustibleSelect.selectedIndex].text
        const numeroFactura = document.getElementById('numeroFactura').value;
        const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;

        const idRegistro = await getIdRegistroCombustible(unidad);
        if (await facturaDuplicado(numeroFactura, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de factura ${numeroFactura}.`);
            return;
        } else if (await autorizacionDuplicado(numeroAutorizacion, idRegistro)) {
            showToast('Error', `Ya existe un registro de combustible con el número de autorización ${numeroAutorizacion}.`);
            return;
        }

        if (fecha > new Date().toISOString().split('T')[0]) {
            showToast('Error', 'La fecha del registro de combustible no puede ser porterior a la fecha de hoy.');
            return;
        }

        const horaActual = new Date().toLocaleTimeString('en-US', { hour12: false });
        if (hora > horaActual && fecha === new Date().toISOString().split('T')[0]) {
            showToast('Error', 'La hora del registro de combustible no puede ser posterior a la hora actual.');
            return;
        }

        const fuelLogData = {
            numeroUnidad: unidad,
            montoColones: monto,
            litrosAproximados: litros,
            kilometraje: kilometraje,
            fecha: fecha,
            hora: hora,
            lugar: lugar,
            chofer: chofer,
            usuario: idUsuario,
            tipoCombustible: tipoCombustible,
            numeroFactura: numeroFactura,
            numeroAutorizacion: numeroAutorizacion,
            estado: "activo"
        };

        const token = localStorage.getItem('token');
        axios.put(`https://backend-transporteccss.onrender.com/api/registroCombustible/${idRegistro}`, fuelLogData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                limpiar();
                showToast('Éxito', `El registro de combustible de la unidad "${unidad}" se ha actualizado exitosamente.`);
            })
            .catch(error => {
                console.error('Error al actualizar el registro de combustible:', error);
                showToast('Error', 'Error al actualizar el registro de combustible.');
            });
    }

    async function deleteRegistroCombustible() {
        const unidad = document.getElementById('unidad').value;
        const chofer = document.getElementById('chofer').value;
        const litros = document.getElementById('litros').value;
        const kilometraje = document.getElementById('kilometraje').value;
        const monto = document.getElementById('monto').value;
        const lugar = document.getElementById('lugar').value;
        const fecha = new Date(document.getElementById('fecha').value).toISOString().split('T')[0] || null;
        const horaCitaInput = document.getElementById('hora').value;
        const hora = `${horaCitaInput}`;
        const tipoCombustibleSelect = document.getElementById('tipoCombustible');
        const tipoCombustible = tipoCombustibleSelect.options[tipoCombustibleSelect.selectedIndex].text
        const numeroFactura = document.getElementById('numeroFactura').value;
        const numeroAutorizacion = document.getElementById('numeroAutorizacion').value;

        const idRegistro = await getIdRegistroCombustible(unidad);
        if (await facturaDuplicado(numeroFactura, idRegistro)) {
            showToast('Error', `El número de factura ${numeroFactura} ya existe.`);
            return;
        } else if (await autorizacionDuplicado(numeroAutorizacion, idRegistro)) {
            showToast('Error', `El número de autorización ${numeroAutorizacion} ya existe.`);
            return;
        }

        const confirmationMessage = document.getElementById('deleteConfirmationMessage');

        confirmationMessage.innerText = `¿Está seguro que desea eliminar este registro de combustible de la unidad ${unidad}?`;

        const deleteModal = new bootstrap.Modal(document.getElementById('deleteFuelLogModal'));
        deleteModal.show();

        const fuelLogData = {
            numeroUnidad: unidad,
            montoColones: monto,
            litrosAproximados: litros,
            kilometraje: kilometraje,
            fecha: fecha,
            hora: hora,
            lugar: lugar,
            chofer: chofer,
            usuario: idUsuario,
            tipoCombustible: tipoCombustible,
            numeroFactura: numeroFactura,
            numeroAutorizacion: numeroAutorizacion,
            estado: "inactivo"
        };

        document.getElementById('confirmDelete').onclick = function () {
            showToast('Cargando', 'Eliminando registro de combustible...');
            const token = localStorage.getItem('token');
            axios.put(`https://backend-transporteccss.onrender.com/api/registroCombustible/${idRegistro}`, fuelLogData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(() => {
                    limpiar();
                    showToast('Éxito', `El registro de combustible de la unidad ${unidad} se ha eliminado exitosamente.`);
                })
                .catch(() => {
                    showToast('Error', 'Error al eliminar el registro de combustible.');
                });

            deleteModal.hide()
        }
    }

})();
