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
            console.error("Error al obtener la unidad asignada:", error);
            showToast('Error', 'Ocurrió un problema al obtener la unidad asignada');
        }
    }

    async function setUnidadYChofer() {
        const infoUsuario = await infoUser();
        const identificacion = infoUsuario.usuario.Identificacion;

        const unidadYChofer = await obtenerUnidadAsignada(identificacion);

        if (unidadYChofer) {
            document.getElementById('chofer').value = unidadYChofer.nombre;
            document.getElementById('unidad').value = unidadYChofer.numeroUnidad;
        }
    }

    setUnidadYChofer();

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

    document.getElementById('unidad').addEventListener('change', function () {
        const unidadSelect = document.getElementById('unidad').textContent;

        if (unidadSelect !== 'Seleccionar la unidad') {
            document.getElementById('btnBuscar').disabled = false;
        }

        document.getElementById('btnActualizar').disabled = true;
        document.getElementById('btnEliminar').disabled = true;
        document.getElementById('btnGuardar').disabled = false;
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
        document.getElementById('fuelForm').reset();
        document.getElementById('chofer').selectedIndex = 0;
        document.getElementById('unidad').selectedIndex = 0;
        document.getElementById('btnLimpiar').style.display = 'none';
        document.getElementById('btnActualizar').disabled = true;
        document.getElementById('btnEliminar').disabled = true;
        document.getElementById('btnGuardar').disabled = false;
        document.getElementById('btnBuscar').disabled = true;
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
        const unidad = document.getElementById('unidad').value;

        if (!unidad) {
            showToast('Error', 'Por favor seleccione una unidad');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const idRegistro = await getIdRegistroCombustible(unidad);

            if (idRegistro) {
                const response = await axios.get(`https://backend-transporteccss.onrender.com/api/registrocombustible/${idRegistro}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const registro = response.data.registro;
                document.getElementById('litrosAproximados').value = registro.litrosAproximados;
                document.getElementById('kilometraje').value = registro.kilometraje;
                document.getElementById('montoColones').value = registro.montoColones;
                document.getElementById('lugar').value = registro.lugar;
                document.getElementById('fecha').value = registro.fecha;
                document.getElementById('hora').value = registro.hora;
                document.getElementById('numeroFactura').value = registro.numeroFactura;
                document.getElementById('numeroAutorizacion').value = registro.numeroAutorizacion;
                document.getElementById('estado').value = registro.estado;

                document.getElementById('btnActualizar').disabled = false;
                document.getElementById('btnEliminar').disabled = false;
                document.getElementById('btnGuardar').disabled = true;
            } else {
                showToast('Error', 'No se encontró un registro de combustible para la unidad seleccionada');
            }
        } catch (error) {
            showToast('Error', 'Error al obtener el registro de combustible.');
        }
    }

    async function postRegistroCombustible() {
        const token = localStorage.getItem('token');

        const registro = {
            usuario: document.getElementById('chofer').value,
            numeroUnidad: document.getElementById('unidad').value,
            litrosAproximados: document.getElementById('litrosAproximados').value,
            kilometraje: document.getElementById('kilometraje').value,
            montoColones: document.getElementById('montoColones').value,
            lugar: document.getElementById('lugar').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            tipoCombustible: document.getElementById('tipoCombustible').value,
            numeroFactura: document.getElementById('numeroFactura').value,
            numeroAutorizacion: document.getElementById('numeroAutorizacion').value,
            estado: document.getElementById('estado').value
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
            const response = await axios.post('https://backend-transporteccss.onrender.com/api/registrocombustible', registro, {
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
        const idRegistro = await getIdRegistroCombustible(document.getElementById('unidad').value);

        if (!idRegistro) {
            showToast('Error', 'No se encontró un registro de combustible para la unidad seleccionada');
            return;
        }

        const registro = {
            usuario: document.getElementById('chofer').value,
            numeroUnidad: document.getElementById('unidad').value,
            litrosAproximados: document.getElementById('litrosAproximados').value,
            kilometraje: document.getElementById('kilometraje').value,
            montoColones: document.getElementById('montoColones').value,
            lugar: document.getElementById('lugar').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            tipoCombustible: document.getElementById('tipoCombustible').value,
            numeroFactura: document.getElementById('numeroFactura').value,
            numeroAutorizacion: document.getElementById('numeroAutorizacion').value,
            estado: document.getElementById('estado').value
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
            const response = await axios.put(`https://backend-transporteccss.onrender.com/api/registrocombustible/${idRegistro}`, registro, {
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
        const idRegistro = await getIdRegistroCombustible(document.getElementById('unidad').value);

        if (!idRegistro) {
            showToast('Error', 'No se encontró un registro de combustible para la unidad seleccionada');
            return;
        }

        try {
            const response = await axios.delete(`https://backend-transporteccss.onrender.com/api/registrocombustible/${idRegistro}`, {
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

})();
