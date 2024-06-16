"use strict";
document.addEventListener('DOMContentLoaded', function() {
    getPatient();
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

function loadToastTemplate(callback) {
    fetch('toast-template.html')
        .then(response => response.text())
        .then(data => {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = data;
                if (callback) callback();
            } else {
                console.error('Toast container not found');
            }
        })
        .catch(error => console.error('Error loading toast template:', error));
}

function showToast(title, message) {
    loadToastTemplate(() => {
        const toastElement = document.getElementById('common-toast');
        if (toastElement) {
            document.getElementById('common-toast-title').innerText = title;
            document.getElementById('common-toast-body').innerText = message;
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
        } else {
            console.error('Toast element not found');
        }
    });
}


