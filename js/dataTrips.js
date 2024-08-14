"use strict";

(function () {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirigir al usuario a la página de inicio de sesión
    window.location.href = 'index.html';
  }

  document.getElementById('searchTrips').addEventListener('keyup', debounce(handleSearchTrips, 300));
  document.getElementById('fechaInicio').addEventListener('change', aplicarFiltros);
  document.getElementById('unidades').addEventListener('change', function () {
    actualizarChofer();
    aplicarFiltros();
  });

  let citasCombinadas = [];
  let citasSeleccionadasGlobal = new Set();
  let citasConfirmadas = new Set();

  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      }
      return Promise.reject(error);
    }
  );

  async function obtenerCitas() {
    try {
      const [citas, viajes, relacionesViajesCitas] = await Promise.all([
        cargarCitas(),
        cargarViajes(),
        cargarRelacionesViajesCitas()
      ]);
      ocultarSpinner();

      citasCombinadas = combinarCitasYViajes(citas, viajes, relacionesViajesCitas);
      mostrarCitas(citasCombinadas);
    } catch (error) {
      showToast('Error', 'Ocurrió un problema al obtener las citas');
    }
  }

  async function cargarCitas() {
    try {
      const URL_CITAS = 'http://10.30.153.34:3366/api/viajeCita';
      const respuesta = await axios.get(URL_CITAS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return respuesta.data.citas || [];
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      showToast('Error', 'Ocurrió un problema al obtener las citas');
    }
  }

  async function cargarViajes() {
    try {
      const URL_VIAJES = 'http://10.30.153.34:3366/api/viaje';
      const respuesta = await axios.get(URL_VIAJES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return respuesta.data.viaje || [];
    } catch (error) {
      console.error('Error al obtener los viajes:', error);
      showToast('Error', 'Ocurrió un problema al obtener los viajes');
    }
  }

  async function cargarRelacionesViajesCitas() {
    try {
      const URL_RELACIONES = 'http://10.30.153.34:3366/api/viaje/relaciones';
      const respuesta = await axios.get(URL_RELACIONES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return respuesta.data.ViajesCitas.ViajesCitas || [];
    } catch (error) {
      console.error('Error al obtener las relaciones entre viajes y citas:', error);
      showToast('Error', 'Ocurrió un problema al obtener las relaciones entre viajes y citas');
    }
  }

  function combinarCitasYViajes(citas, viajes, relaciones) {
    const mapaCitas = new Map();
    citas.forEach(cita => {
      mapaCitas.set(cita.idCita, cita);
    });

    if (relaciones !== undefined) {
      relaciones.forEach(relacion => {
        if (mapaCitas.has(relacion.idCita)) {
          const cita = mapaCitas.get(relacion.idCita);
          const viaje = viajes.find(v => v.idViaje === relacion.idViaje);
          if (viaje) {
            cita.idUnidad = viaje.idUnidad;
            cita.idViaje = relacion.idViaje;
          }
        }
      });
    }

    return Array.from(mapaCitas.values());
  }

  function aplicarFiltros() {
    const fechaFiltro = document.getElementById('fechaInicio').value;
    const unidadFiltro = document.getElementById('unidades').value;

    let citasFiltradas = citasCombinadas.filter(cita => {
      const citaDate = new Date(cita.fechaCita);
      const cumpleFecha = !fechaFiltro || formatISODate(citaDate) === fechaFiltro;
      return cumpleFecha;
    });

    if (unidadFiltro) {
      citasFiltradas = citasFiltradas.filter(cita => {
        return cita.idUnidad == unidadFiltro || cita.estadoCita === 'Iniciada';
      });
    }

    citasFiltradas.sort((a, b) => {
      if (a.idUnidad == unidadFiltro && a.estadoCita === 'Asignada') return -1;
      if (b.idUnidad == unidadFiltro && b.estadoCita === 'Asignada') return 1;
      return 0;
    });

    mostrarCitas(citasFiltradas);
  }

  function mostrarCitas(citas) {
    $(document).ready(function () {
      if ($('#tableTrips').length) {
        if ($.fn.DataTable.isDataTable('#tableTrips')) {
          $('#tableTrips').DataTable().destroy();
        }
      }

      const tableBody = document.querySelector('#viajesTableBody');
      tableBody.innerHTML = '';

      let rows = '';
      citas.forEach(cita => {
        const formattedFechaCita = formatISODate(cita.fechaCita);
        rows += `
              <tr data-paciente="${cita.idPaciente}" data-nombrepaciente="${cita.Paciente}" data-idcita="${cita.idCita}" data-ubicaciondestino="${cita.idUbicacionDestino}"  data-fechacita="${formattedFechaCita}" data-horacita="${cita.horaCita}" data-traslado="${cita.Traslado}" data-camilla="${cita.camilla}" data-lugarsalida="${cita.ubicacionOrigen}" data-estado="${cita.estadoCita}" data-idviaje="${cita.idViaje || ''}">
                <td><input type="checkbox" class="cita-checkbox" value="${cita.idCita}" ${cita.estadoCita === 'Asignada' ? 'checked' : ''} ${cita.estadoCita === 'En curso' || cita.estadoCita === 'Finalizada' || cita.estadoCita === "Cancelada" ? 'checked disabled' : ''}></td>
                <td class="text-center">${cita.Paciente}</td>
                <td class="text-center">${cita.ubicacionOrigen}</td>
                <td class="text-center">${cita.idUbicacionDestino}</td>
                <td class="text-center">${cita.horaCita}</td>
                <td class="text-center">${formattedFechaCita}</td>
                <td class="text-center">${cita.camilla}</td>
                <td class="text-center">
                  <button class="btn btn-warning ausenteBtn" data-bs-toggle="modal" data-bs-target="#ausenteModal" data-idcita="${cita.idCita}">Ausente</button>
                </td>
              </tr>
            `;
      });
      tableBody.innerHTML = rows;

      $('#tableTrips').DataTable({
        dom: "<'row'<'col-md-6'l><'col-md-12't><'row justify-content-between'<'col-md-6'i><'col-md-6'p>>",
        ordering: false,
        searching: true,
        paging: true,
        language: {
          url: './assets/json/Spanish.json'
      },
      });

      $('#searchPatient').on('keyup', function () {
        $('#tableTrips').DataTable().search($(this).val()).draw();
      });

      document.querySelectorAll('.ausenteBtn').forEach(button => {
        button.addEventListener('click', function () {
          const idCita = this.dataset.idcita;
          document.getElementById('ausenteCitaId').value = idCita;
        });
      });

      addCheckboxEventListeners();
    });
  }

  function addCheckboxEventListeners() {
    document.querySelectorAll('.cita-checkbox').forEach(checkbox => {
      checkbox.removeEventListener('change', handleCheckboxChange);
      checkbox.addEventListener('change', handleCheckboxChange);
    });
  }

  async function handleCheckboxChange() {
    const isValid = checkcamilla();
    if (!isValid) {
      this.checked = !this.checked;
      return;
    }

    const row = this.closest('tr');
    const idCita = this.value;
    const idViaje = row.dataset.idviaje;

    if (this.checked) {
      citasSeleccionadasGlobal.add(idCita);
    } else {
      citasSeleccionadasGlobal.delete(idCita);
      if (idViaje) {
        try {
          await desasociarCitaDelViaje(idCita);
          row.dataset.idviaje = '';
          this.disabled = false;
          obtenerCitas();
        } catch (error) {
          console.error('Error al desasociar la cita del viaje:', error);
          showToast('Error', 'No se pudo desasociar la cita del viaje');
          this.checked = true;
        }
      }
    }
  }

  async function desasociarCitaDelViaje(idCita) {
    const url = `http://10.30.153.34:3366/api/viaje/cita/${idCita}`;

    try {
      await axios.delete(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast('Éxito', 'Cita desasociada del viaje exitosamente');
    } catch (error) {
      console.error('Error al desasociar la cita del viaje:', error.response.data);
      throw error;
    }
  }

  function checkcamilla() {
    const checkboxes = document.querySelectorAll('.cita-checkbox:checked:not(:disabled)');
    let camilla = 0;
    let totalCitas = 0;

    checkboxes.forEach(checkbox => {
      totalCitas++;
      const row = checkbox.closest('tr');
      if (row.dataset.camilla === 'Requerido') {
        camilla++;
      }
    });

    if (camilla > 1) {
      showToast('Advertencia', 'Ya hay una o más citas que requieren camilla');
    }

    return true;
  }

  async function cargarUnidades() {
    try {
      const URL_UNIDADES = 'http://10.30.153.34:3366/api/ViajeUnidades/ambulancia';
      const respuesta = await axios.get(URL_UNIDADES, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const unidades = respuesta.data.unidades;
      const selectBody = document.querySelector('#unidades');
      const choferesSelect = document.querySelector('#choferes');

      selectBody.innerHTML = '';

      const opcionDefault = document.createElement('option');
      opcionDefault.textContent = 'Seleccionar Unidad...';
      opcionDefault.selected = true;
      opcionDefault.disabled = false;
      selectBody.appendChild(opcionDefault);

      unidades.forEach(unidad => {
        const option = document.createElement('option');
        option.value = unidad.id;
        option.dataset.choferId = unidad.idChofer;
        option.dataset.choferNombre = `${unidad.nombreChofer} ${unidad.apellido1Chofer}`;
        option.textContent = `Ambulancia ${unidad.numeroUnidad}`;
        selectBody.appendChild(option);
      });

      choferesSelect.innerHTML = opcionDefault.outerHTML;
    } catch (error) {
      console.error('Error al obtener las unidades:', error);
    }
  }

  function actualizarChofer() {
    const selectUnidades = document.getElementById('unidades');
    const choferesSelect = document.getElementById('choferes');
    const unidadSeleccionada = selectUnidades.options[selectUnidades.selectedIndex];

    if (unidadSeleccionada && unidadSeleccionada.dataset.choferId) {
      const choferOption = document.createElement('option');
      choferOption.value = unidadSeleccionada.dataset.choferId;
      choferOption.textContent = unidadSeleccionada.dataset.choferNombre;
      choferesSelect.innerHTML = '';
      choferesSelect.appendChild(choferOption);
    } else {
      choferesSelect.innerHTML = '<option selected>Seleccionar Chófer...</option>';
    }
  }

  function formatISODate(isoDate) {
    const date = new Date(isoDate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function obtenerCitasSeleccionadas() {
    return Array.from(citasSeleccionadasGlobal).map(idCita => {
      const checkbox = document.querySelector(`.cita-checkbox[value="${idCita}"]`);
      if (checkbox) {
        const row = checkbox.closest('tr');
        return {
          idCita: idCita,
          idPaciente: row.dataset.paciente,
          nombrePaciente: row.dataset.nombrepaciente,
          idUbicacionDestino: row.dataset.ubicaciondestino,
          fechaCita: row.dataset.fechacita,
          horaCita: row.dataset.horacita,
          camilla: row.dataset.camilla,
          lugarSalida: row.dataset.lugarsalida
        };
      }
      return null;
    }).filter(cita => cita !== null);
  }

  async function crearViajes() {
    const citasSeleccionadas = obtenerCitasSeleccionadas();
    if (citasSeleccionadas.length === 0) {
      showToast('Error', 'Por favor, seleccione al menos una cita');
      return;
    }

    const idUnidadElement = document.getElementById('unidades');
    const fechaInicioElement = document.getElementById('fechaInicio');
    const idChoferElement = document.getElementById('choferes');
    const idChofer = idChoferElement.value;

    if (!idUnidadElement || !fechaInicioElement || !idChofer) {
      console.error('Algunos elementos del formulario no se encontraron.');
      showToast('Error', 'Por favor, complete todos los campos');
      return;
    }

    const unidadSeleccionadaTexto = idUnidadElement.options[idUnidadElement.selectedIndex].textContent;
    document.getElementById('unidadSeleccionadaModal').textContent = unidadSeleccionadaTexto;

    const citasSeleccionadasList = document.getElementById('citasSeleccionadasList');
    citasSeleccionadasList.innerHTML = '';
    citasSeleccionadas.forEach(cita => {
      const listItem = document.createElement('li');
      listItem.textContent = `Cita ID: ${cita.idCita}, Paciente: ${cita.nombrePaciente}`;
      citasSeleccionadasList.appendChild(listItem);
    });

    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModal.show();
  }

  document.getElementById('confirmarViajesBtn').addEventListener('click', crearViajes);

  async function enviarViajesConfirmados() {
    const citasSeleccionadas = obtenerCitasSeleccionadas();
    const idUnidadElement = document.getElementById('unidades');
    const fechaInicioElement = document.getElementById('fechaInicio');
    const idChoferElement = document.getElementById('choferes');
    const idChofer = idChoferElement.value;

    const idUnidad = idUnidadElement.value;
    const fechaInicio = fechaInicioElement.value;

    const nuevoViaje = {
      idUnidad: idUnidad,
      IdChofer: idChofer,
      EstadoViaje: "Iniciado",
      fechaInicioViaje: fechaInicio,
      idUsuario: idUsuario,
      Citas: citasSeleccionadas.map(cita => ({ Idcita: cita.idCita }))
    };

    const getIdViaje = `http://10.30.153.34:3366/api/viaje/unidades/${idUnidad}/${fechaInicio}`;
    const idViaje = await returnIdViaje(getIdViaje);

    if (idViaje === "Error") {
      try {
        await axios.post('http://10.30.153.34:3366/api/viaje', nuevoViaje, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        showToast('Éxito', 'Viaje creado exitosamente');
        citasSeleccionadas.forEach(cita => citasConfirmadas.add(cita.idCita));
      } catch (error) {
        showToast('Error', 'Error al crear el viaje');
        console.error(error);
      }
    } else {
      const asignarCita = {
        idViaje: idViaje,
        Citas: citasSeleccionadas.map(cita => ({ Idcita: cita.idCita }))
      };
      try {
        await axios.put(`http://10.30.153.34:3366/api/viaje/actualizar/viajeCita`, asignarCita, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        showToast('Éxito', 'Citas asignadas al viaje exitosamente');
        citasSeleccionadas.forEach(cita => citasConfirmadas.add(cita.idCita));
      } catch (error) {
        showToast('Error', 'Error al asignar las citas al viaje');
        console.error(error);
      }
    }

    resetFilters();
    obtenerCitas();
  }

  document.getElementById('confirmarViajesBtnModal').addEventListener('click', enviarViajesConfirmados);

  function resetFilters() {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('unidades').selectedIndex = 0;
    document.getElementById('choferes').innerHTML = '<option selected>Seleccionar Chófer...</option>';
    mostrarCitas(citasCombinadas);
  }

  async function marcarCitaComoAusente() {
    const idCita = document.getElementById('ausenteCitaId').value;
    const motivoAusencia = document.getElementById('motivoAusencia').value;

    const url = `http://10.30.153.34:3366/api/cita/${idCita}`;
    const urlDesasociarCita = `http://10.30.153.34:3366/api/viaje/cita/${idCita}`;

    const datosAusencia = {
      ausente: motivoAusencia,
      estadoCita: "Cancelada"
    };

    try {
      await axios.put(url, datosAusencia, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showToast('Éxito', 'Cita marcada como ausente exitosamente');
      obtenerCitas();
    } catch (error) {
      console.error('Error al marcar la cita como ausente:', error.response.data);
    }
  }

  document.getElementById('guardarAusenciaBtn').addEventListener('click', marcarCitaComoAusente);

  obtenerCitas();
  cargarUnidades();

  async function returnIdViaje(url) {
    try {
      const respuesta = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = respuesta.data || [];
      const viajes = data.IdViajeData.viaje || [];
      const idViaje = viajes.length > 0 ? viajes[0].idViaje : null;
      return idViaje;
    } catch (error) {
      return "Error";
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function handleSearchTrips() {
    let input = document.getElementById('searchTrips').value.toLowerCase();
    let rows = Array.from(document.getElementById('tableTrips').getElementsByTagName('tr'));

    rows.forEach((row, index) => {
      if (index === 0) return;
      let cells = Array.from(row.getElementsByTagName('td'));
      let match = cells.some(cell => cell.innerText.toLowerCase().includes(input));
      row.style.display = match ? '' : 'none';
    });
  }

  function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
  }

  function infoUser() {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwt_decode(token);
      return decodedToken;
    } catch (error) {
      console.error(error);
      showToast('Error', 'Ocurrió un problema al obtener los datos del usuario');
    }
  }

  const infoUsuario = infoUser();
  const idUsuario = infoUsuario.usuario.IdUsuario;
})();
