function openAccomp(acompanante1, acompanante2) {
  console.log('Acompañante 1:', acompanante1);
  console.log('Acompañante 2:', acompanante2);
  const acompTableBody = document.getElementById('acompTableBody');
  const messageNoComp = document.getElementById('messageNoComp');

  acompTableBody.innerHTML = '';

  if (acompanante1 === 'N/A' && acompanante2 === 'N/A') {
    messageNoComp.style.display = 'block';
  } else {
    messageNoComp.style.display = 'none';

    if (acompanante1 !== 'N/A') {
      const row1 = document.createElement('tr');
      row1.innerHTML = `<td>${acompanante1}</td>`;
      acompTableBody.appendChild(row1);
    }

    if (acompanante2 !== 'N/A') {
      const row2 = document.createElement('tr');
      row2.innerHTML = `<td>${acompanante2}</td>`;
      acompTableBody.appendChild(row2);
    }
  }
}

(async function () {

  async function infoUser() {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwt_decode(token);
      return decodedToken;
    } catch (error) {
      console.error(error);
      showToast('Error', 'Ocurrió un problema al obtener los datos del usuario');
    }
  }

  async function obtenerUnidadAsignada(identificacion) {
    const API_CHOFERES_CON_UNIDADES = 'https://backend-transporteccss.onrender.com/api/chofer/unidades';
    try {
      const response = await axios.get(API_CHOFERES_CON_UNIDADES);
      const choferesConUnidades = response.data.choferesConUnidades;
      return choferesConUnidades.find(chofer => chofer.cedula === identificacion);
    } catch (error) {
      console.error('Error al obtener la unidad asignada:', error);
    }
  }

  async function obtenerIdUnidad(numeroUnidad) {
    const API_UNIDADES = 'https://backend-transporteccss.onrender.com/api/unidades';
    try {
      const response = await axios.get(API_UNIDADES);
      const unidades = response.data.unidades;
      const unidad = unidades.find(unidad => unidad.numeroUnidad === numeroUnidad);
      return unidad.id;
    } catch (error) {
      console.error('Error al obtener el id de la unidad:', error);
    }
  }

  async function obtenerViajes(idUnidad, fechaValue, descripcionDestino = '') {
    let apiURLViajes = `https://backend-transporteccss.onrender.com/api/viajeChofer/${idUnidad}/${fechaValue}`;
    if (descripcionDestino) {
      apiURLViajes += `?destino=${descripcionDestino}`;
    }
    try {
      const responseViajes = await axios.get(apiURLViajes);
      const viajes = responseViajes.data.Data?.Data || [];
      console.log('Viajes:', viajes);

      if (!Array.isArray(viajes)) {
        throw new Error('La respuesta no contiene un array de viajes');
      }

      if (viajes.length > 0) {
        showToast('Información', 'Hay viajes asignados');
      } else {
        showToast('Información', 'No hay viajes asignados, vuelve pronto');
      }

      const viajesTableBody = document.getElementById('viajesTableBody');
      viajesTableBody.innerHTML = '';
      const fragment = document.createDocumentFragment();

      actualizarSelectDestinos(viajes);

      viajes.forEach(data => {
        const acompanante1 = data.Acompanante1 || 'N/A';
        const acompanante2 = data.Acompanante2 || 'N/A';
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="text-center">${data.NombrePaciente}</td>
          <td class="text-center">${data.ubicacionOrigen}</td>
          <td class="text-center">${data.ubicacionDestino}</td>
          <td class="text-center">${data.horaCita}</td>
          <td class="text-center">
            <button class="btn btn-outline-primary btn-sm full-width mx-auto" data-bs-toggle="modal"
              data-bs-target="#acompModal" onclick="openAccomp('${acompanante1}', '${acompanante2}')">
              <i class="bi bi-eye"></i>
            </button>
          </td>
        `;
        fragment.appendChild(row);
      });

      viajesTableBody.appendChild(fragment);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  async function updateInitTrip(idUnidad, fechaValue, hourInitTrip) {
    console.log("idUnidad en updateInitTrip:", idUnidad);
    console.log("fechaValue en updateInitTrip:", fechaValue);
    console.log("hora en updateInitTrip:", hourInitTrip);
    const API_INIT_TRIP = `https://backend-transporteccss.onrender.com/api/viajeChofer/start`;
    try {
      await axios.put(API_INIT_TRIP, {
        idUnidad,
        fechaInicioViaje: fechaValue,
        horaInicioViaje: hourInitTrip
      });
      localStorage.setItem('viajeIniciado', JSON.stringify({ idUnidad, fechaValue }));
      showToast('Éxito', 'El viaje ha sido iniciado correctamente');
    } catch (error) {
      showToast('Error', 'Ocurrió un problema al iniciar el viaje');
    }
  }

  async function finishTrip() {
    const kilometrajeFinal = parseInt(document.getElementById('kilometrajeFinal').value);
    const horasExtras = document.getElementById('horasExtras').value;
    const viaticos = document.getElementById('viaticos').value; 
    const hourFinishTrip = obtenerHoraActual();
    const idUnidad = await obtenerIdUnidad(document.getElementById('unidadAsignada').value);

    console.log("Datos a enviar en finishTrip:", idUnidad, hourFinishTrip, kilometrajeFinal, horasExtras, viaticos);

    const API_FINISH_TRIP = `https://backend-transporteccss.onrender.com/api/viajeChofer/end`;
    try {
      const response = await axios.put(API_FINISH_TRIP, {
        idUnidad,
        horaFinViaje: hourFinishTrip,
        kilometrajeFinal,
        horasExtras,
        viaticos
      });
      showToast('Éxito', 'El viaje ha sido finalizado correctamente');
      localStorage.removeItem('viajeIniciado');
      console.log('Respuesta del servidor:', response);
    } catch (error) {
      showToast('Error', 'Ocurrió un problema al finalizar el viaje');
    }
  }

  document.getElementById('btnFinalizarViaje').addEventListener('click', finishTrip);

  function obtenerHoraActual() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  async function inicializarPagina() {
    try {
      const infoUsuario = await infoUser();
      const Identificacion = infoUsuario?.usuario?.Identificacion;
      console.log('IdUsuario:', Identificacion);

      const unidadAsignada = await obtenerUnidadAsignada(Identificacion);
      if (unidadAsignada) {
        console.log('Unidad Asignada:', unidadAsignada.numeroUnidad);
        document.getElementById('unidadAsignada').value = unidadAsignada.numeroUnidad;

        const idUnidad = await obtenerIdUnidad(unidadAsignada.numeroUnidad);
        if (idUnidad) {
          console.log('IdUnidad:', idUnidad);

          const today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();
          const fechaValue = `${yyyy}-${mm}-${dd}`;
          document.getElementById('fecha').value = fechaValue;

          const hourInitTrip = obtenerHoraActual();
          console.log('Hora de inicio de viaje:', hourInitTrip);

          const viajeIniciado = JSON.parse(localStorage.getItem('viajeIniciado'));
          if (viajeIniciado && viajeIniciado.idUnidad === idUnidad) {
            await obtenerViajes(idUnidad, viajeIniciado.fechaValue);
          } else {
            await obtenerViajes(idUnidad, fechaValue);
          }

          document.getElementById('btnIniciarViaje').addEventListener('click', async () => {
            await updateInitTrip(idUnidad, fechaValue, hourInitTrip);
            await obtenerViajes(idUnidad, fechaValue);
          });

          document.getElementById('destino').addEventListener('change', async (event) => {
            const descripcionDestino = event.target.value;
            await obtenerViajes(idUnidad, fechaValue, descripcionDestino);
          });

        } else {
          console.log('No se encontró la unidad asignada para el chófer logueado');
        }
      }
    } catch (error) {
      console.error('Error en la inicialización de la página:', error);
    }
  }

  async function actualizarSelectDestinos(viajes) {
    const destinosSet = new Set(viajes.map(viaje => viaje.ubicacionDestino));
    const destinoSelect = document.getElementById('destino');
    destinoSelect.innerHTML = '<option value="">Seleccionar destino...</option>';
    destinosSet.forEach(destino => {
      const option = document.createElement('option');
      option.value = destino;
      option.textContent = destino;
      destinoSelect.appendChild(option);
    });
  }


  await inicializarPagina();
})();
