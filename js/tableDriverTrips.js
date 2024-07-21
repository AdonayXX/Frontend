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
      showToast('Error', 'Ocurrió un problema al obtener la unidad asignada');
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
      showToast('Error', 'Ocurrió un problema al obtener el id de la unidad asignada');
    }
  }

  async function obtenerViajes(idUnidad, fechaValue) {
    const apiURLViajes = `https://backend-transporteccss.onrender.com/api/viajeChofer/${idUnidad}/${fechaValue}`;
    try {
      const responseViajes = await axios.get(apiURLViajes);
      const viajes = responseViajes.data.Data?.Data || [];

      if (!Array.isArray(viajes)) {
        throw new Error('La respuesta no contiene un array de viajes');
      }

      if (viajes.length > 0) {
        const infoUsuario = await infoUser();
      const Nombre = infoUsuario?.usuario?.Nombre;
        showToast('Información', `Hola ${Nombre}, tienes ${viajes.length} viajes asignados para hoy.`);
      }

      const viajesTableBody = document.getElementById('viajesTableBody');
      viajesTableBody.innerHTML = '';
      const fragment = document.createDocumentFragment();

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
      haveTrips(); 

    } catch (error) {
      showToast('Información', 'No hay viajes asignados, vuelve pronto.');
      haveTrips(); 
    }
  }

  async function updateInitTrip(idUnidad, fechaValue, hourInitTrip) {
    const API_INIT_TRIP = `https://backend-transporteccss.onrender.com/api/viajeChofer/start`;
    try {
      const response = await axios.put(API_INIT_TRIP, {
        idUnidad,
        fechaInicioViaje: fechaValue,
        horaInicioViaje: hourInitTrip
      });
      localStorage.setItem('viajeIniciado', JSON.stringify({ idUnidad, fechaValue, hourInitTrip }));
      showToast('Éxito', 'El viaje ha sido iniciado correctamente');
      mostrarEstadoViaje(); 
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
      loadContent('tableDriverTrip.html', 'mainContent');
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

  function mostrarEstadoViaje() {
    const viajeIniciado = JSON.parse(localStorage.getItem('viajeIniciado'));
    const btnIniciarViaje = document.getElementById('btnIniciarViaje');
    const btnInitTripDriver = document.getElementById('btnInitTripDriver');
    const tiempoTranscurrido = document.getElementById('tiempoTranscurrido');

    if (viajeIniciado) {
      btnIniciarViaje.disabled = true;
      btnInitTripDriver.disabled = true;
      btnInitTripDriver.innerText = 'Viaje en tránsito';
      mostrarTiempoTranscurrido(viajeIniciado.hourInitTrip);
    } else {
      btnIniciarViaje.disabled = false;
      btnInitTripDriver.disabled = false;
      btnInitTripDriver.innerText = 'Iniciar Viaje';
      clearInterval(tiempoTranscurrido.interval);
      tiempoTranscurrido.innerText = '';
    }
  }

  function mostrarTiempoTranscurrido(horaInicio) {
    const tiempoTranscurrido = document.getElementById('tiempoTranscurrido');
    clearInterval(tiempoTranscurrido.interval);

    function actualizarTiempo() {
      const ahora = new Date();
      const [h, m, s] = horaInicio.split(':').map(Number);
      const inicio = new Date(ahora);
      inicio.setHours(h, m, s, 0);
      const diferencia = ahora - inicio;

      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

      tiempoTranscurrido.value = `Tiempo transcurrido: ${horas}h ${minutos}m ${segundos}s`;
    }

    actualizarTiempo();
    tiempoTranscurrido.interval = setInterval(actualizarTiempo, 1000);
  }

  async function inicializarPagina() {
    try {
      const infoUsuario = await infoUser();
      const Identificacion = infoUsuario?.usuario?.Identificacion;
      const rol = infoUsuario?.usuario?.Rol;

      if (rol !== 2) {
        showToast('Error', 'Acceso denegado: Solo los chóferes pueden usar este módulo.');
        document.getElementById('btnIniciarViaje').disabled = true;
        document.getElementById('btnFinalizarViaje').disabled = true;
        document.getElementById('btnInitTripDriver').disabled
        return;
      }
      const unidadAsignada = await obtenerUnidadAsignada(Identificacion);
      if (unidadAsignada) {
        document.getElementById('unidadAsignada').value = unidadAsignada.numeroUnidad;

        const idUnidad = await obtenerIdUnidad(unidadAsignada.numeroUnidad);
        if (idUnidad) {
          const today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();
          const fechaValue = `${yyyy}-${mm}-${dd}`;
          document.getElementById('fecha').value = fechaValue;

          const hourInitTrip = obtenerHoraActual();

          const viajeIniciado = JSON.parse(localStorage.getItem('viajeIniciado'));
          if (viajeIniciado && viajeIniciado.idUnidad === idUnidad) {
            await obtenerViajes(idUnidad, viajeIniciado.fechaValue);
            mostrarEstadoViaje();
          } else {
            await obtenerViajes(idUnidad, fechaValue);
          }

          document.getElementById('btnIniciarViaje').addEventListener('click', async () => {
            await updateInitTrip(idUnidad, fechaValue, hourInitTrip);
            await obtenerViajes(idUnidad, fechaValue);
          });

        } else {
          showToast('Error', 'No se encontró la unidad asignada para el chófer logueado');
        }
      }
    } catch (error) {
      showToast('Error', 'Ocurrió un problema al cargar la página');
    }
  }

  function haveTrips() {
    const table = document.getElementById('tablePatient');
    const btnInitTripDriver = document.getElementById('btnInitTripDriver');

    if (table.rows.length <= 1) {
      btnInitTripDriver.disabled = true;
    } else {
      btnInitTripDriver.disabled = false;
    }
  }

  await inicializarPagina();
})();
