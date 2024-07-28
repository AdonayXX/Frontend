(async function () {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Token no encontrado en localStorage");
      return;
    }
  
    async function infoUser() {
      try {
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
      if (!infoUsuario) return;
  
      const identificacion = infoUsuario.usuario.Identificacion;
      const unidadYChofer = await obtenerUnidadAsignada(identificacion);
  
      if (unidadYChofer) {
        document.getElementById('driverSelect').value = `${unidadYChofer.nombre} ${unidadYChofer.apellido1} ${unidadYChofer.apellido2}`;
        document.getElementById('unitSelect').value = unidadYChofer.numeroUnidad;
      }
    }

    const now = new Date();
    const date = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const time = now.toTimeString().split(' ')[0].slice(0, 5);

document.getElementById('date').value = date;
document.getElementById('time').value = time;

  
    document.getElementById('fuelFormAtap').addEventListener('submit', function (event) {
      if (event.submitter.id === 'submit-fuel-button') {
        showToast('Cargando', 'Guardando registro de combustible...');
        event.preventDefault();
        postRegistroCombustible();
      } else if (event.submitter.id === 'update-fuel-button') {
        showToast('Cargando', 'Actualizando registro de combustible...');
        event.preventDefault();
        putRegistroCombustible();
      } else if (event.submitter.id === 'delete-fuel-button') {
        event.preventDefault();
        deleteRegistroCombustible();
      }
    });
  
    document.getElementById('clean-button').addEventListener('click', function (event) {
      event.preventDefault();
      limpiar();
    });
  
    function limpiar() {
      const unidadInput = document.getElementById('unitSelect');
      const choferInput = document.getElementById('driverSelect');
  
      const unidadValue = unidadInput.value;
      const choferValue = choferInput.value;
  
      document.getElementById('fuelForm').reset();
  
      unidadInput.value = unidadValue;
      choferInput.value = choferValue;
  
      document.getElementById('clean-button').style.display = 'none';
      document.getElementById('update-fuel-button').disabled = true;
      document.getElementById('delete-fuel-button').disabled = true;
      document.getElementById('submit-fuel-button').disabled = false;
    }
  
    async function postRegistroCombustible() {
     const data = {
        numeroUnidad: document.getElementById('unitSelect').value,
        montoColones: parseInt(document.getElementById('totalAmount').value),
        litrosAproximados: parseInt(document.getElementById('approxLiters').value),
        kilometraje: parseInt(document.getElementById('currentMileage').value),
        fecha: document.getElementById('date').value,
        hora: document.getElementById('time').value + ':00',
        lugar: document.getElementById('location').value,
        chofer: document.getElementById('driverSelect').value,
        tipoCombustible: document.getElementById('fuelType').value,
        numeroFactura: document.getElementById('invoiceNumber').value,
        numeroAutorizacion: document.getElementById('authorizationNumber').value,
        idUsuario: (await infoUser()).usuario.IdUsuario,
        estado: "Activo"
    };

      console.log(data);
  
      try {
        const response = await axios.post('https://backend-transporteccss.onrender.com/api/combustibleATAP', data, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        showToast('Éxito', 'Registro de combustible guardado exitosamente');
        // limpiar();
      } catch (error) {
        console.error("Error al guardar el registro de combustible:", error);
        showToast('Error', 'Ocurrió un problema al guardar el registro de combustible');
      }
    }
    
  
    setUnidadYChofer();
    
    document.getElementById('search-fuel-button').addEventListener('click', async function(event) {
        event.preventDefault();
        await getRegistroCombustible();
    });
    
    async function getRegistroCombustible() {
        const unidad = document.getElementById('unitSelect').value;
    
        if (!unidad) {
            showToast('Error', 'Por favor, ingrese una unidad.');
            return;
        }
    
        try {
    
            const response = await axios.get(`https://backend-transporteccss.onrender.com/api/combustibleATAP/numeroUnidad/${unidad}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const registros = response.data.registro;
    
            if (registros.length === 0) {
                showToast('Error', `No hay registros de combustible para la unidad ${unidad}.`);
                return;
            }
    
            const fuelLog = registros.filter(log => log.estado === 'Activo');
    
            if (fuelLog.length > 0) {
                fuelLog.sort((a, b) => {
                    const dateComparison = new Date(b.fecha) - new Date(a.fecha);
                    if (dateComparison === 0) {
                        const timeComparison = b.hora.localeCompare(a.hora);
                        if (timeComparison === 0) {
                            return b.idCombustibleATAP - a.idCombustibleATAP;
                        }
                        return timeComparison;
                    }
                    return dateComparison;
                });
    
                const latestLog = fuelLog[0];
    
                document.getElementById('unitSelect').value = latestLog.numeroUnidad;
                document.getElementById('driverSelect').value = latestLog.chofer;
                document.getElementById('invoiceNumber').value = latestLog.numeroFactura;
                document.getElementById('authorizationNumber').value = latestLog.numeroAutorizacion;
                document.getElementById('fuelType').value = latestLog.tipoCombustible;
                document.getElementById('approxLiters').value = latestLog.litrosAproximados;
                document.getElementById('totalAmount').value = latestLog.montoColones;
                document.getElementById('currentMileage').value = latestLog.kilometraje;
                document.getElementById('location').value = latestLog.lugar;
                document.getElementById('date').value = new Date(latestLog.fecha).toISOString().split('T')[0];
                document.getElementById('time').value = latestLog.hora;
    
                // document.getElementById('submit-fuel-button').disabled = true;
                // document.getElementById('clean-button').style.display = 'inline-block';
                // document.getElementById('update-fuel-button').disabled = false;
                // document.getElementById('delete-fuel-button').disabled = false;
            }
    
        } catch (error) {
            if (error.response && error.response.status === 403) {
                showToast('Error', 'Acceso denegado. Verifique su token de autenticación.');
            } else {
                showToast('Error', 'Error al obtener el registro de combustible.');
            }
        }
    }
    
  })();
  