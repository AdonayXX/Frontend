"use strict";

(async function () {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Token no encontrado en localStorage");
    window.location.href = 'login.html';
    return;
  }

  async function infoUser() {
    try {
      const userInfo = jwt_decode(token);
      return userInfo;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      showToast('Error', 'Ocurrió un problema al obtener los datos del usuario');
      throw error;
    }
  }

  async function obtenerUnidadAsignada(identificacion) {
    const API_CHOFERES_CON_UNIDADES = 'https://backend-transporteccss.onrender.com/api/chofer/unidades';
    try {
      const response = await axios.get(API_CHOFERES_CON_UNIDADES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data.choferesConUnidades.find(chofer => chofer.cedula === identificacion);
    } catch (error) {
      console.error("Error al obtener la unidad asignada:", error);
      showToast('Error', 'Ocurrió un problema al obtener la unidad asignada');
      throw error;
    }
  }

  async function obtenerIdUnidad(numeroUnidad) {
    const API_UNIDADES = 'https://backend-transporteccss.onrender.com/api/unidades';
    try {
      const response = await axios.get(API_UNIDADES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const unidad = response.data.unidades.find(unidad => unidad.numeroUnidad === numeroUnidad);
      return unidad.id;
    } catch (error) {
      console.error("Error al obtener el id de la unidad asignada:", error);
      showToast('Error', 'Ocurrió un problema al obtener el id de la unidad asignada');
      throw error;
    }
  }

  async function obtenerVales(idUnidad, fecha) {
    const API_VALES = `https://backend-transporteccss.onrender.com/api/viajeVale/${idUnidad}/${fecha}`;
    console.log(API_VALES);
    try {
      const response = await axios.get(API_VALES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vales = response.data.Data?.Data || [];

      if (!Array.isArray(vales)) {
        throw new Error('La respuesta no contiene un array de vales');
      }

      if (vales.length > 0) {
        const infoUsuario = await infoUser();
        const Nombre = infoUsuario?.usuario?.Nombre;
        showToast('Información', `Hola ${Nombre}, tienes ${vales.length} vales asignados para hoy.`);
      }

      mostrarVales(vales);
    } catch (error) {
      console.error('Error al obtener los vales:', error);
      showToast('Error', 'Ocurrió un problema al obtener los vales');
      throw error;
    }
  }

  function mostrarVales(vales) {
    const valesTableBody = document.getElementById('valesTableBody');
    if (!valesTableBody) {
      console.error("Elemento 'valesTableBody' no encontrado");
      return;
    }
    console.log(vales);

    valesTableBody.innerHTML = '';
    const valeIniciado = JSON.parse(localStorage.getItem('valeIniciado'));

    vales.forEach(vale => {
      const isValeIniciado = valeIniciado && valeIniciado.IdVale === vale.IdVale;
      const row = document.createElement('tr');
      
      let destino = '';
      let salida = '';
      if (vale.MotivoId === 3) {
        destino = vale.DestinoEbaisId;
        salida = vale.SalidaEbaisId;
      } else {
        destino = vale.DestinoId;
        salida = vale.SalidaId;
      }

      const acompanantes = [vale.Acompanante1, vale.Acompanante2, vale.Acompanante3, vale.Acompanante4].filter(a => a).join(', ') || 'No hay acompañantes';

      row.innerHTML = `
        <td>${vale.Motivo}</td>
        <td>${salida || 'N/A'}</td>
        <td>${destino || 'N/A'}</td>
        <td>${vale.Fecha_Solicitud.split('T')[0]}</td>
        <td>${vale.Hora_Salida}</td>
        <td>
          <button class="btn btn-outline-info btn-sm" onclick="mostrarAcompanantes('${acompanantes}')">
            <i class="bi bi-eye"></i>
          </button>
        </td>
        <td>
          <button class="btn btn-outline-primary btn-sm" ${isValeIniciado ? 'disabled' : ''} onclick="iniciarVale('${vale.IdVale}', '${vale.idRevisionValeViaje}')">Iniciar</button>
          <button class="btn btn-outline-danger btn-sm" ${isValeIniciado ? '' : 'disabled'} onclick="finalizarVale('${vale.IdVale}', '${vale.idRevisionValeViaje}')">Finalizar</button>
        </td>
      `;
      valesTableBody.appendChild(row);
    });
  }

  window.mostrarAcompanantes = function (acompanantes) {
    const acompanantesContenido = document.getElementById('acompanantesContenido');
    if (acompanantesContenido) {
      acompanantesContenido.innerText = acompanantes;
      const modal = new bootstrap.Modal(document.getElementById('acompanantesModal'));
      modal.show();
    }
  };

  async function inicializarPagina() {
    try {
      const infoUsuario = await infoUser();
      const Identificacion = infoUsuario?.usuario?.Identificacion;
      const rol = infoUsuario?.usuario?.Rol;

      if (rol !== 2) {
        showToast('Error', 'Acceso denegado: Solo los chóferes pueden usar este módulo.');
        return;
      }

      const unidadAsignada = await obtenerUnidadAsignada(Identificacion);
      if (unidadAsignada) {
        const unidadAsignadaElement = document.getElementById('unidadAsignadaVale');
        if (unidadAsignadaElement) {
          unidadAsignadaElement.value = unidadAsignada.numeroUnidad;
        } else {
          console.error("Elemento 'unidadAsignadaVale' no encontrado");
        }

        const idUnidad = await obtenerIdUnidad(unidadAsignada.numeroUnidad);
        if (idUnidad) {
          const today = new Date();
          const fechaValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          const fechaElement = document.getElementById('fechaVale');
          if (fechaElement) {
            fechaElement.value = fechaValue;
          } else {
            console.error("Elemento 'fechaVale' no encontrado");
          }

          await obtenerVales(idUnidad, fechaValue);
        } else {
          showToast('Error', 'No se encontró la unidad asignada para el chófer logueado');
        }
      }
    } catch (error) {
      console.error("Error al inicializar la página:", error);
      showToast('Error', 'Ocurrió un problema al cargar la página');
    }
  }

  window.iniciarVale = async function (IdVale, IdRevisionValeViaje) {
    const valeIniciado = JSON.parse(localStorage.getItem('valeIniciado'));
    if (valeIniciado) {
      showToast('Error', 'Ya hay un vale en curso. Finaliza el vale antes de iniciar uno nuevo.');
      return;
    }

    const fechaInicio = new Date().toISOString().split('T')[0];
    const horaInicio = new Date().toISOString().split('T')[1].split('.')[0];
    const idUnidad = document.getElementById('unidadAsignadaVale').value;

    try {
      await axios.put('https://backend-transporteccss.onrender.com/api/viajeVale/viaje/revisionvale', {
        Indicador: 2,  //  para "En curso"
        idRevisionValeViaje: IdRevisionValeViaje,
        Estado: 'En curso',
        HoraFinVale: '',
        Observacion: ''
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      localStorage.setItem('valeIniciado', JSON.stringify({ IdVale, IdRevisionValeViaje }));

      inicializarPagina();
      showToast('Éxito', 'Vale iniciado correctamente');
    } catch (error) {
      console.error('Error al iniciar el vale:', error);
      showToast('Error', 'Ocurrió un problema al iniciar el vale');
    }
  };

  window.finalizarVale = async function (IdVale, IdRevisionValeViaje) {
    const valeIniciado = JSON.parse(localStorage.getItem('valeIniciado'));
    if (!valeIniciado || valeIniciado.IdVale !== IdVale) {
      showToast('Error', 'No se puede finalizar este vale porque no está en curso.');
      return;
    }

    const horaFinVale = new Date().toISOString().split('T')[1].split('.')[0];

    try {
      await axios.put('https://backend-transporteccss.onrender.com/api/viajeVale/viaje/revisionvale', {
        Indicador: 3,  //  para "Finalizado"
        idRevisionValeViaje: IdRevisionValeViaje,
        Estado: 'Finalizado',
        HoraFinVale: horaFinVale,
        Observacion: 'Ninguna'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      localStorage.removeItem('valeIniciado');

      inicializarPagina();
      showToast('Éxito', 'Vale finalizado correctamente');
    } catch (error) {
      console.error('Error al finalizar el vale:', error);
      showToast('Error', 'Ocurrió un problema al finalizar el vale');
    }
  };

  await inicializarPagina();
})();
