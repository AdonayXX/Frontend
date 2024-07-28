"use strict";

(async function () {
    async function infoUser() {
        try {
            const token = localStorage.getItem('token');
            const userInfo = jwt_decode(token);
            return userInfo;
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            showToast('Error', 'Ocurrió un problema al obtener los datos del usuario');
        }
    }

    async function setUnidadYChofer() {
        const infoUsuario = await infoUser();
        const identificacion = infoUsuario.usuario.Identificacion;

        const unidadYChofer = await obtenerUnidadAsignada(identificacion);

        if (unidadYChofer) {
            document.getElementById('driverSelect').value = `${unidadYChofer.nombre} ${unidadYChofer.apellido1}`;
            document.getElementById('unitSelect').value = unidadYChofer.numeroUnidad;
        }
    }

    setUnidadYChofer();

    document.getElementById('fuelForm').addEventListener('submit', function (event) {
        event.preventDefault();
        if (event.submitter.id === 'submit-fuel-button') {
            showToast('Cargando', 'Guardando registro de combustible...');
            postRegistroCombustible();
        } else if (event.submitter.id === 'update-fuel-button') {
            showToast('Cargando', 'Actualizando registro de combustible...');
            putRegistroCombustible();
        } else if (event.submitter.id === 'delete-fuel-button') {
            deleteRegistroCombustible();
        }
    });

    async function postRegistroCombustible() {
        const token = localStorage.getItem('token');

        const registro = {
            usuario: document.getElementById('driverSelect').value,
            numeroUnidad: document.getElementById('unitSelect').value,
            litrosAproximados: document.getElementById('approxLiters').value,
            kilometraje: document.getElementById('currentMileage').value,
            montoColones: document.getElementById('totalAmount').value,
            lugar: document.getElementById('location').value,
            fecha: document.getElementById('date').value,
            hora: document.getElementById('time').value,
            tipoCombustible: document.getElementById('fuelType').value,
            numeroFactura: document.getElementById('invoiceNumber').value,
            numeroAutorizacion: document.getElementById('authorizationNumber').value,
            estado: 'Activo' // Assuming 'Activo' is a constant value
        };

        if (await facturaDuplicado(registro.numeroFactura)) {
            showToast('Error', 'El número de factura ya existe.');
            return;
        }

        if (await autorizacionDuplicado(registro.numeroAutorizacion)) {
            showToast('Error', 'El número de autorización ya existe.');
            return;
        }

        try {
            const response = await axios.post('https://backend-transporteccss.onrender.com/api/combustibleATAP', { registros: [registro] }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            showToast('Éxito', 'Registro de combustible guardado exitosamente.');
            limpiar();
        } catch (error) {
            showToast('Error', 'Error al guardar el registro de combustible.');
        }
    }

    async function putRegistroCombustible() {
        const token = localStorage.getItem('token');
        const idRegistro = await getIdRegistroCombustible(document.getElementById('unitSelect').value);

        if (!idRegistro) {
            showToast('Error', 'No se encontró un registro de combustible para la unidad seleccionada');
            return;
        }

        const registro = {
            usuario: document.getElementById('driverSelect').value,
            numeroUnidad: document.getElementById('unitSelect').value,
            litrosAproximados: document.getElementById('approxLiters').value,
            kilometraje: document.getElementById('currentMileage').value,
            montoColones: document.getElementById('totalAmount').value,
            lugar: document.getElementById('location').value,
            fecha: document.getElementById('date').value,
            hora: document.getElementById('time').value,
            tipoCombustible: document.getElementById('fuelType').value,
            numeroFactura: document.getElementById('invoiceNumber').value,
            numeroAutorizacion: document.getElementById('authorizationNumber').value,
            estado: 'Activo'
        };

        if (await facturaDuplicado(registro.numeroFactura, idRegistro)) {
            showToast('Error', 'El número de factura ya existe.');
            return;
        }

        if (await autorizacionDuplicado(registro.numeroAutorizacion, idRegistro)) {
            showToast('Error', 'El número de autorización ya existe.');
            return;
        }

        try {
            const response = await axios.put(`https://backend-transporteccss.onrender.com/api/combustibleATAP/${idRegistro}`, { registros: [registro] }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            showToast('Éxito', 'Registro de combustible actualizado exitosamente.');
            limpiar();
        } catch (error) {
            showToast('Error', 'Error al actualizar el registro de combustible.');
        }
    }

    async function deleteRegistroCombustible() {
        const token = localStorage.getItem('token');
        const idRegistro = await getIdRegistroCombustible(document.getElementById('unitSelect').value);

        if (!idRegistro) {
            showToast('Error', 'No se encontró un registro de combustible para la unidad seleccionada');
            return;
        }

        try {
            const response = await axios.delete(`https://backend-transporteccss.onrender.com/api/combustibleATAP/${idRegistro}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            showToast('Éxito', 'Registro de combustible eliminado exitosamente.');
            limpiar();
        } catch (error) {
            showToast('Error', 'Error al eliminar el registro de combustible.');
        }
    }

    function limpiar() {
        document.getElementById('fuelForm').reset();
        document.getElementById('unitSelect').selectedIndex = 0;
        document.getElementById('driverSelect').selectedIndex = 0;
        document.getElementById('submit-fuel-button').disabled = false;
        document.getElementById('update-fuel-button').disabled = true;
        document.getElementById('delete-fuel-button').disabled = true;
        document.getElementById('clean-button').style.display = 'none';
    }

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
        const unidad = document.getElementById('unitSelect').value;

        if (!unidad) {
            showToast('Error', 'Por favor seleccione una unidad');
            return;
        }

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

                document.getElementById('driverSelect').value = latestLog.usuario;
                document.getElementById('approxLiters').value = latestLog.litrosAproximados;
                document.getElementById('currentMileage').value = latestLog.kilometraje;
                document.getElementById('totalAmount').value = latestLog.montoColones;
                document.getElementById('location').value = latestLog.lugar;
                document.getElementById('date').value = latestLog.fecha;
                document.getElementById('time').value = latestLog.hora;
                document.getElementById('fuelType').value = latestLog.tipoCombustible;
                document.getElementById('invoiceNumber').value = latestLog.numeroFactura;
                document.getElementById('authorizationNumber').value = latestLog.numeroAutorizacion;
                document.getElementById('estado').value = latestLog.estado;

                document.getElementById('submit-fuel-button').disabled = true;
                document.getElementById('update-fuel-button').disabled = false;
                document.getElementById('delete-fuel-button').disabled = false;
                document.getElementById('clean-button').style.display = 'block';
            } else {
                showToast('Info', 'No hay registros de combustible activos para la unidad seleccionada');
            }

        } catch (error) {
            showToast('Error', 'Error al obtener el registro de combustible.');
        }
    }

    document.getElementById('unitSelect').addEventListener('change', getRegistroCombustible);
})();
