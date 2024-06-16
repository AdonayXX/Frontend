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
    console.log(response.data);

    const viajes = response.data.citas;
    const tableBody = document.querySelector('#viajesTableBody');

    tableBody.innerHTML = '';

    viajes.forEach(viaje => {
      const fecha = new Date(viaje.fechaCita);
      const formattedFechaCita = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

      const row = `
        <tr>
          <td><input type="checkbox"></td>
          <td>${viaje.Paciente}</td>
          <td>${viaje.ubicacionOrigen}</td>
          <td>${viaje.idUbicacionDestino}</td>
          <td>${viaje.condicionCita}</td>
          <td>${viaje.horaCita}</td>
          <td>${formattedFechaCita}</td>
          <td>${viaje.Traslado}</td>
          <td>${viaje.camilla}</td>
          <td>
            <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#ausenteModal">Ausente</button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error('Error al obtener las citas:', error);
  }
}

async function getUnidades() {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/viajeUnidades';
    const response = await axios.get(API_URL);
    console.log(response.data);

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
      option.textContent = `${unidad.tipo.toUpperCase()} ${unidad.id}`;
      selectBody.appendChild(option);
    });
  } catch (error) {
    console.error('Error al obtener las unidades:', error);
  }
}

getCitas();
getUnidades();

// function exportToPDF() {
// }

// function exportToExcel() {
// }

// function realizarViajes() {
// }
