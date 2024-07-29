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
        limpiarCamposFormulario();
      } catch (error) {
        console.error("Error al guardar el registro de combustible:", error);
        showToast('Error', 'Ocurrió un problema al guardar el registro de combustible');
      }
    }
    
  
    setUnidadYChofer();

  
  document.getElementById('search-fuel-button').addEventListener('click', async function(event) {
    event.preventDefault();
    await getUltimoRegistroCombustible();
  });



  async function getUltimoRegistroCombustible() {
    const unidad = document.getElementById('unitSelect').value;

    if (!unidad) {
      showToast('Error', 'Por favor, ingrese una unidad.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Error', 'Token de autenticación no encontrado.');
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
        fuelLog.sort((a, b) => b.idCombustibleATAP - a.idCombustibleATAP);

        const latestLog = fuelLog[0];
        window.idCombustibleATAP = latestLog.idCombustibleATAP;

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

        document.getElementById('submit-fuel-button').disabled = true;
        document.getElementById('update-fuel-button').disabled = false;
        document.getElementById('delete-fuel-button').disabled = false;
      }


      showToast('Éxito', 'Registro de combustible encontrado exitosamente');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        showToast('Error', 'Acceso denegado. Verifique su token de autenticación.');
      } else {
        showToast('Error', 'Error al obtener el registro de combustible.');
      }
    }
  }

  async function putRegistroCombustible() {
    const idCombustibleATAP = window.idCombustibleATAP; 
    if (!idCombustibleATAP) {
        showToast('Error', 'No se encontró el id del registro de combustible.');
  
        return;
    }

    console.log(idCombustibleATAP);
    const data = {
        montoColones: parseInt(document.getElementById('totalAmount').value),
        litrosAproximados: parseInt(document.getElementById('approxLiters').value),
        kilometraje: parseInt(document.getElementById('currentMileage').value),
        fecha: document.getElementById('date').value,
        hora: document.getElementById('time').value,
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
        const response = await axios.put(`https://backend-transporteccss.onrender.com/api/combustibleATAP/${idCombustibleATAP}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        showToast('Éxito', 'Registro de combustible actualizado exitosamente');
        limpiarCamposFormulario();
    } catch (error) {
        console.error("Error al actualizar el registro de combustible:", error);
        showToast('Error', 'Ocurrió un problema al actualizar el registro de combustible');
    }
  }
  
    async function deleteRegistroCombustible() {
    const idCombustibleATAP = window.idCombustibleATAP; 
    if (!idCombustibleATAP) {
        showToast('Error', 'No se encontró el id del registro de combustible.');
        return;
    }

    try {
        const response = await axios.delete(`https://backend-transporteccss.onrender.com/api/combustibleATAP/${idCombustibleATAP}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        showToast('Éxito', 'Registro de combustible eliminado exitosamente');
        limpiarCamposFormulario();
    } catch (error) {
        console.error("Error al eliminar el registro de combustible:", error);
        showToast('Error', 'Ocurrió un problema al eliminar el registro de combustible');
    }
}
  

function limpiarCamposFormulario() {
  const unidadInput = document.getElementById('unitSelect');
  const choferInput = document.getElementById('driverSelect');
  
  const unidadValue = unidadInput.value;
  const choferValue = choferInput.value;
  
  document.getElementById('fuelFormAtap').reset();
  
  unidadInput.value = unidadValue;
  choferInput.value = choferValue;
  
  document.getElementById('update-fuel-button').disabled = true;
  document.getElementById('delete-fuel-button').disabled = true;
  document.getElementById('submit-fuel-button').disabled = false;
}

  })();
  