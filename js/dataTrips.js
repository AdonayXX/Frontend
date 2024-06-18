"use strict";

document.getElementById('searchTrips').addEventListener('keyup', function () {
  let input = document.getElementById('searchTrips').value.toLowerCase();
  let rows = Array.from(document.getElementById('tableTrips').getElementsByTagName('tr'));

  rows.filter((row, index) => {
    if (index === 0) return;
    let cells = Array.from(row.getElementsByTagName('td'));
    let match = cells.some(cell => cell.innerText.toLowerCase().includes(input));
    row.style.display = match ? '' : 'none';
  });
});

async function getCitas() {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/viajeCita';
    const response = await axios.get(API_URL);
    const viajes = response.data.citas;
    const tableBody = document.querySelector('#viajesTableBody');

    tableBody.innerHTML = '';

    const today = new Date();
    const filteredViajes = viajes.filter(viaje => {
      const viajeDate = new Date(viaje.fechaCita);
      return viajeDate >= today;
    });

    filteredViajes.forEach(viaje => {
      const formattedFechaCita = formatISODate(viaje.fechaCita); 
      const formattedCondicion = formatCondicion(viaje.condicionCita); 
      const row = `
        <tr data-paciente="${viaje.idPaciente}" data-nombrepaciente="${viaje.Paciente}" data-idcita="${viaje.idCita}" data-ubicaciondestino="${viaje.idUbicacionDestino}" data-condicion="${formattedCondicion}" data-fechacita="${formattedFechaCita}" data-horacita="${viaje.horaCita}" data-traslado="${viaje.Traslado}" data-camilla="${viaje.camilla}" data-lugarsalida="${viaje.ubicacionOrigen}">
          <td><input type="checkbox" class="cita-checkbox" value="${viaje.idCita}"></td>
          <td>${viaje.Paciente}</td>
          <td>${viaje.ubicacionOrigen}</td>
          <td>${viaje.idUbicacionDestino}</td>
          <td>${formattedCondicion}</td>
          <td>${viaje.horaCita}</td>
          <td>${formattedFechaCita}</td>
          <td>${viaje.Traslado}</td>
          <td>${viaje.camilla}</td>
          <td>
            <button class="btn btn-warning ausenteBtn" data-bs-toggle="modal" data-bs-target="#ausenteModal" data-idcita="${viaje.idCita}">Ausente</button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

    document.querySelectorAll('.ausenteBtn').forEach(button => {
      button.addEventListener('click', function() {
        const idCita = this.dataset.idcita;
        document.getElementById('ausenteCitaId').value = idCita;
      });
    });
  } catch (error) {
    console.error('Error al obtener las citas:', error);
  }
}

async function getUnidades() {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/viajeUnidades';
    const response = await axios.get(API_URL);
    const unidades = response.data.unidades;
    const selectBody = document.querySelector('#unidades');

    selectBody.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Seleccionar Unidad...';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    selectBody.appendChild(defaultOption);

    unidades.forEach(unidad => {
      const option = document.createElement('option');
      option.value = unidad.id; 
      option.textContent = `Unidad ${unidad.numeroUnidad}`;
      selectBody.appendChild(option);
    });
  } catch (error) {
    console.error('Error al obtener las unidades:', error);
  }
}

function formatISODate(isoDate) {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatCondicion(condicion) {
  switch (condicion.toLowerCase()) {
    case 'rojo':
      return 'Grave';
    case 'amarillo':
      return 'En riesgo';
    case 'verde':
      return 'Estable';
    default:
      return condicion;
  }
}

function getCitasSeleccionadas() {
  const checkboxes = document.querySelectorAll('.cita-checkbox:checked');
  const citasSeleccionadas = Array.from(checkboxes).map(checkbox => {
    const row = checkbox.closest('tr');
    return {
      idCita: checkbox.value,
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
    alert("Seleccione al menos una cita para crear un viaje.");
    return;
  }

  const idUnidadElement = document.getElementById('unidades');
  const fechaInicioElement = document.getElementById('fechaInicio');

  if (!idUnidadElement || !fechaInicioElement) {
    console.error('Algunos elementos del formulario no se encontraron.');
    alert('Por favor, complete todos los campos del formulario.');
    return;
  }

  const citasSeleccionadasList = document.getElementById('citasSeleccionadasList');
  citasSeleccionadasList.innerHTML = '';
  citasSeleccionadas.forEach(cita => {
    const listItem = document.createElement('li');
    listItem.textContent = `Cita ID: ${cita.idCita}, Paciente: ${cita.nombrePaciente}`;
    citasSeleccionadasList.appendChild(listItem);
  });

  const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
  confirmModal.show();

  document.getElementById('confirmarViajesBtn').onclick = async function() {
    confirmModal.hide();
    
    const idUnidad = idUnidadElement.value;
    const fechaInicio = fechaInicioElement.value;

    for (const cita of citasSeleccionadas) {
      const nuevoViaje = {
        idUnidad: idUnidad,
        FechaInicio: fechaInicio,
        idCita: cita.idCita,
        idPaciente: cita.idPaciente,
        LugarSalida: cita.lugarSalida, 
        idUbicacionDestino: cita.idUbicacionDestino,
        Condicion: cita.condicion,
        EstadoCita: "Iniciada",
        FechaCita: cita.fechaCita, 
        HoraCita: cita.horaCita,
        Traslado: cita.traslado,
        Camilla: cita.camilla
      };

      const url = 'https://backend-transporteccss.onrender.com/api/viaje';

      console.log('Datos que se enviarán en la solicitud POST:', JSON.stringify(nuevoViaje, null, 2));

      try {
        const response = await axios.post(url, nuevoViaje);
        console.log('Viaje creado exitosamente:', response.data);
      } catch (error) {
        if (error.response) {
          console.error('Error al crear el viaje:', error.response.data);
          console.error('Código de estado:', error.response.status);
          console.error('Headers:', error.response.headers);
        } else if (error.request) {
          console.error('No se recibió respuesta del servidor:', error.request);
        } else {
          console.error('Error al configurar la solicitud:', error.message);
        }
      }
    }
  };
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
    console.log('Cita marcada como ausente:', response.data);
    getCitas(); 
  } catch (error) {
    console.error('Error al marcar la cita como ausente:', error.response.data);
  }
}

document.getElementById('guardarAusenciaBtn').addEventListener('click', marcarCitaComoAusente);

getCitas();
getUnidades();
