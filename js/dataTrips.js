"use strict";

(function () {
  document.getElementById('searchTrips').addEventListener('keyup', function () {
    let input = document.getElementById('searchTrips').value.toLowerCase();
    let rows = Array.from(document.getElementById('tableTrips').getElementsByTagName('tr'));

    rows.forEach((row, index) => {
      if (index === 0) return;
      let cells = Array.from(row.getElementsByTagName('td'));
      let match = cells.some(cell => cell.innerText.toLowerCase().includes(input));
      row.style.display = match ? '' : 'none';
    });
  });

  document.getElementById('fechaInicio').addEventListener('change', function () {
    aplicarFiltros();
  });

  document.getElementById('unidades').addEventListener('change', function () {
    actualizarChofer();
    aplicarFiltros();
  });


  let citasCombinadas = []; // Array de citas combinadas con los datos de los viajes
  let citasSeleccionadasGlobal = new Set(); 
  let citasConfirmadas = new Set();

  async function getCitas() {
    try {
      const API_URL_CITAS = 'https://backend-transporteccss.onrender.com/api/viajeCita';
      const API_URL_VIAJES = 'https://backend-transporteccss.onrender.com/api/viaje';

      const [responseCitas, responseViajes] = await Promise.all([
        axios.get(API_URL_CITAS),
        axios.get(API_URL_VIAJES)
      ]);

      const citas = responseCitas.data.citas || [];
      const viajes = responseViajes.data.viaje || [];

      console.log("Citas:", citas);
      console.log("Viajes:", viajes);

      const citasMap = new Map();
      citas.forEach(cita => {
        citasMap.set(cita.idCita, cita);
      });
      viajes.forEach(viaje => {
        if (citasMap.has(viaje.idCita)) {
          citasMap.get(viaje.idCita).idUnidad = viaje.idUnidad;
          citasMap.get(viaje.idCita).idViaje = viaje.idViaje;
        }
      });

      citasCombinadas = Array.from(citasMap.values());
      console.log("Citas combinadas:", citasCombinadas);
      mostrarCitas(citasCombinadas);
    } catch (error) {
      console.error('Error al obtener las citas:', error);
    }
  }

  function aplicarFiltros() {
    const fechaFiltro = document.getElementById('fechaInicio').value;
    const unidadFiltro = document.getElementById('unidades').value;

    let filteredCitas = citasCombinadas.filter(cita => {
      const citaDate = new Date(cita.fechaCita);
      const fechaCondicion = !fechaFiltro || formatISODate(citaDate) === fechaFiltro;
      return fechaCondicion;
    });

    if (unidadFiltro) {
      filteredCitas.sort((a, b) => {
        if (a.idUnidad == unidadFiltro && a.estadoCita === 'Asignada') return -1;
        if (b.idUnidad == unidadFiltro && b.estadoCita === 'Asignada') return 1;
        return 0;
      });

      filteredCitas = filteredCitas.filter(cita => {
        return !cita.idUnidad || cita.idUnidad == unidadFiltro || cita.estadoCita === 'Iniciada';
      });
    }

    console.log("Citas filtradas:", filteredCitas);
    mostrarCitas(filteredCitas);
  }

  function mostrarCitas(citas) {
    const tableBody = document.querySelector('#viajesTableBody');
    tableBody.innerHTML = '';

    citas.forEach(cita => {
      const formattedFechaCita = formatISODate(cita.fechaCita);
      const row = `
        <tr data-paciente="${cita.idPaciente}" data-nombrepaciente="${cita.Paciente}" data-idcita="${cita.idCita}" data-ubicaciondestino="${cita.idUbicacionDestino}" data-condicion="${cita.condicionCita}" data-fechacita="${formattedFechaCita}" data-horacita="${cita.horaCita}" data-traslado="${cita.Traslado}" data-camilla="${cita.camilla}" data-lugarsalida="${cita.ubicacionOrigen}" data-estado="${cita.estadoCita}" data-idviaje="${cita.idViaje || ''}">
          <td><input type="checkbox" class="cita-checkbox" value="${cita.idCita}" ${cita.estadoCita === 'Asignada' ? 'checked' : ''} ${cita.estadoCita === 'En Curso' || cita.estadoCita === 'Finalizada' ? 'checked disabled' : ''}></td>
          <td>${cita.Paciente}</td>
          <td>${cita.ubicacionOrigen}</td>
          <td>${cita.idUbicacionDestino}</td>
          <td>${cita.condicionCita}</td>
          <td>${cita.horaCita}</td>
          <td>${formattedFechaCita}</td>
          <td>${cita.Traslado}</td>
          <td>${cita.camilla}</td>
          <td>
            <button class="btn btn-warning ausenteBtn" data-bs-toggle="modal" data-bs-target="#ausenteModal" data-idcita="${cita.idCita}">Ausente</button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

    document.querySelectorAll('.ausenteBtn').forEach(button => {
      button.addEventListener('click', function () {
        const idCita = this.dataset.idcita;
        document.getElementById('ausenteCitaId').value = idCita;
      });
    });

    addCheckboxEventListeners();
  }

  function addCheckboxEventListeners() {
    document.querySelectorAll('.cita-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        const isValid = checkcamilla();
        if (!isValid) {
          this.checked = !this.checked;
        } else {
          const row = this.closest('tr');
          const idCita = this.value;
          const idViaje = row.dataset.idviaje;

          if (this.checked) {
            citasSeleccionadasGlobal.add(idCita);
          } else {
            citasSeleccionadasGlobal.delete(idCita);
            actualizarEstadoCita(idCita, 'Iniciada');
            if (idViaje) {
              eliminarViaje(idViaje);
            }
          }
        }
      });
    });
  }

  async function actualizarEstadoCita(idCita, nuevoEstado) {
    const url = `https://backend-transporteccss.onrender.com/api/cita/${idCita}`;
    const datosActualizados = {
      estadoCita: nuevoEstado
    };

    try {
      const response = await axios.put(url, datosActualizados);
      console.log('Estado de la cita actualizado:', response.data);
      getCitas();
    } catch (error) {
      console.error('Error al actualizar el estado de la cita:', error.response.data);
    }
  }

  async function eliminarViaje(idViaje) {
    const url = `https://backend-transporteccss.onrender.com/api/viaje/${idViaje}`;

    try {
      const response = await axios.delete(url);
      console.log('Viaje eliminado:', response.data);
    } catch (error) {
      console.error('Error al eliminar el viaje:', error.response.data);
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

    console.log('Camilla:', camilla);
    console.log('Total Citas:', totalCitas);

    if (camilla > 1) {
      showToast('Error', 'Solo puede seleccionar una cita con camilla');
      return false;
    } else if (camilla === 1 && totalCitas > 7) {
      showToast('Error', 'No se pueden seleccionar más de 6 citas adicionales sin camilla');
      return false;
    } else if (camilla === 0 && totalCitas > 8) {
      showToast('Error', 'No se pueden seleccionar más de 8 citas');
      return false;
    }
    return true;
  }

  async function getUnidades() {
    try {
      const API_URL = 'https://backend-transporteccss.onrender.com/api/viajeUnidades';
      const response = await axios.get(API_URL);
      const unidades = response.data.unidades;
      const selectBody = document.querySelector('#unidades');
      const choferesSelect = document.querySelector('#choferes');

      selectBody.innerHTML = '';

      const defaultOption = document.createElement('option');
      defaultOption.textContent = 'Seleccionar Unidad...';
      defaultOption.selected = true;
      defaultOption.disabled = false;
      selectBody.appendChild(defaultOption);

      unidades.forEach(unidad => {
        const option = document.createElement('option');
        option.value = unidad.id;
        option.dataset.choferId = unidad.idChofer;
        option.dataset.choferNombre = `${unidad.nombreChofer} ${unidad.apellido1Chofer}`;
        option.textContent = `Unidad ${unidad.numeroUnidad}`;
        selectBody.appendChild(option);
      });

      choferesSelect.innerHTML = defaultOption.outerHTML;
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

  function getCitasSeleccionadas() {
    const citasSeleccionadas = Array.from(citasSeleccionadasGlobal).map(idCita => {
      const row = document.querySelector(`.cita-checkbox[value="${idCita}"]`).closest('tr');
      return {
        idCita: idCita,
        idPaciente: row.dataset.paciente,
        nombrePaciente: row.dataset.nombrepaciente,
        idUbicacionDestino: row.dataset.ubicaciondestino,
        condicion: row.dataset.condicion,
        fechaCita: row.dataset.fechacita,
        horaCita: row.dataset.horacita,
        traslado: row.dataset.traslado,
        camilla: row.dataset.camilla,
        lugarSalida: row.dataset.lugarsalida
      };
    });
    return citasSeleccionadas;
  }

  async function crearViajes() {
    const citasSeleccionadas = getCitasSeleccionadas();
    if (citasSeleccionadas.length === 0) {
      showToast('Error', 'Seleccione al menos una cita para crear un viaje');
      return;
    }
    if(unidades.selectedIndex === 0 | unidades === 'Seleccionar Unidad...'){
      showToast('Error', 'Seleccione una unidad para crear un viaje');
      return;
    }
    if(fechaInicio.value === ''){
      showToast('Error', 'Seleccione una fecha de inicio para crear un viaje');
      return;
    }

    const idUnidadElement = document.getElementById('unidades');
    const fechaInicioElement = document.getElementById('fechaInicio');
    const idChoferElement = document.getElementById('choferes');
    const idChofer = idChoferElement.value;

    if (!idUnidadElement || !fechaInicioElement || !idChofer) {
      showToast('Error', 'Complete todos los campos para crear un viaje');
      return;
    }

    // Obtener el número de la unidad seleccionada y mostrarlo en el modal
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
    const citasSeleccionadas = getCitasSeleccionadas();
    const idUnidadElement = document.getElementById('unidades');
    const fechaInicioElement = document.getElementById('fechaInicio');
    const idChoferElement = document.getElementById('choferes');
    const idChofer = idChoferElement.value;

    const idUnidad = idUnidadElement.value;
    const fechaInicio = fechaInicioElement.value;

    for (const cita of citasSeleccionadas) {
      if (!citasConfirmadas.has(cita.idCita)) {
        const nuevoViaje = {
          idUnidad: idUnidad,
          idChofer: idChofer,
          FechaInicio: fechaInicio,
          idCita: cita.idCita,
          idPaciente: cita.idPaciente,
          LugarSalida: cita.lugarSalida,
          idUbicacionDestino: cita.idUbicacionDestino,
          EstadoViaje: "Iniciado",
          Condicion: cita.condicion,
          EstadoCita: "Asignada",
          FechaCita: cita.fechaCita,
          HoraCita: cita.horaCita,
          Traslado: cita.traslado,
          Camilla: cita.camilla,
          horaInicioViaje: null,
          fechaInicioViaje: null,
          horaFinViaje: null,
          kilometrajeFinal: null,
          horasExtras: null,
          viaticos: null
        };

        const url = 'https://backend-transporteccss.onrender.com/api/viaje';

        console.log('Datos que se enviarán en la solicitud POST:', JSON.stringify(nuevoViaje, null, 2));

        try {
          const response = await axios.post(url, nuevoViaje);
          showToast('Éxito', 'Viaje creado exitosamente');
          citasConfirmadas.add(cita.idCita);
        } catch (error) {
          if (error.response) {
            showToast('Error', 'Error al crear el viaje');
            console.error('Código de estado:', error.response.status);
            console.error('Headers:', error.response.headers);
          } else if (error.request) {
            console.error('No se recibió respuesta del servidor:', error.request);
          } else {
            console.error('Error al configurar la solicitud:', error.message);
          }
        }
      }
    }
    resetFilters();
    getCitas();
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

    const url = `https://backend-transporteccss.onrender.com/api/cita/${idCita}`;
    const datosAusencia = {
      ausente: motivoAusencia,
      estadoCita: "Finalizada"
    };

    try {
      const response = await axios.put(url, datosAusencia);
      showToast('Éxito', 'Cita marcada como ausente exitosamente');
      getCitas();
    } catch (error) {
      console.error('Error al marcar la cita como ausente:', error.response.data);
    }
  }

  document.getElementById('guardarAusenciaBtn').addEventListener('click', marcarCitaComoAusente);
  getCitas();
  getUnidades();
})();
