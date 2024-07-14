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


(async function() {
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

  async function obtenerViajes(idUnidad, fechaValue) {
    const apiURLViajes = `https://backend-transporteccss.onrender.com/api/viajeChofer/${idUnidad}/${fechaValue}`;
    try {
      const responseViajes = await axios.get(apiURLViajes);
      const viajes = responseViajes.data.Data?.Data || [];
      if (!Array.isArray(viajes)) {
        throw new Error('La respuesta no contiene un array de viajes');
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
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
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

          await obtenerViajes(idUnidad, fechaValue);
        } else {
          console.log('No se encontró el id de la unidad asignada para el chófer logueado');
        }
      } else {
        console.log('No se encontró la unidad asignada para el chófer logueado');
      }
    } catch (error) {
      console.error('Error en la inicialización de la página:', error);
    }
  }

  inicializarPagina();
})();
