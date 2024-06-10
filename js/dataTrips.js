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
      const API_URL = 'http://localhost:56336/api/viaje/';
      const response = await axios.get(API_URL);
      console.log(response.data);

      const viajes = response.data.viaje;
      const tableBody = document.querySelector('#viajesTableBody');

      tableBody.innerHTML = '';

      viajes.forEach(viaje => {
          const row = `
              <tr>
                  <td><input type="checkbox" /></td>
                  <td>${viaje.Nombre}</td>
                  <td>${viaje.LugarSalida}</td>
                  <td>${viaje.LugarDestino}</td>
                  <td>${viaje.Condicion}</td>
                  <td>${viaje.HoraCita}</td>
                  <td>${viaje.Ruta}</td>
                  <td>${viaje.Posicion}</td>
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

function exportToPDF() {
  // Implementa la lógica para exportar a PDF
}

function exportToExcel() {
  // Implementa la lógica para exportar a Excel
}

function realizarViajes() {
  // Implementa la lógica para realizar viajes
}
