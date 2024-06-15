"use strict";

document.getElementById('searchTrips').addEventListener('keyup', function() {
  let input = document.getElementById('searchTrips').value.toLowerCase();
  let rows = Array.from(document.getElementById('tableTrips').getElementsByTagName('tr'));

  rows.filter((row, index) => {
    if (index === 0) return;
    let cells = Array.from(row.getElementsByTagName('td'));
    let match = cells.some(cell => cell.innerText.toLowerCase().includes(input));
    row.style.display = match ? '' : 'none';
  });
});

async function getPatient() {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/viaje';
    const response = await axios.get(API_URL);
    console.log(response.data);

    const viajes = response.data.viaje;
    const tableBody = document.querySelector('#viajesTableBody');

    tableBody.innerHTML = '';

    viajes.forEach(viaje => {
      const fecha = new Date(viaje.FechaCita);
      const formattedFechaCita = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

      const row = `
        <tr>
          <td><input type="checkbox"></td>
          <td>${viaje.idPaciente}</td>
          <td>${viaje.LugarSalida}</td>
          <td>${viaje.idUbicacionDestino}</td>
          <td>${viaje.Condicion}</td>
          <td>${viaje.HoraCita}</td>
          <td>${formattedFechaCita}</td>
          <td>${viaje.Traslado}</td>
          <td>${viaje.Camilla}</td>
          <td>
            <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#ausenteModal">Ausente</button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error('There has been a problem:', error);
  }
}
getPatient();

// function exportToPDF() {
// }

// function exportToExcel() {
// }

// function realizarViajes() {
// }
