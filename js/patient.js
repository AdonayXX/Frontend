document.getElementById('searchPatient').addEventListener('keyup', function() {
    let input = document.getElementById('searchPatient').value.toLowerCase();
    let table = document.getElementById('tablePatient');
    let rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        let cells = rows[i].getElementsByTagName('td');
        let match = false;
        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(input)) {
                match = true;
                break;
            }
        }
        rows[i].style.display = match ? '' : 'none';
    }
});


async function getPatient() {
    try {
      const API_URL = 'http://localhost:56336/api/paciente';
      const response = await axios.get(API_URL);
      console.log(response.data);
  
      const patient = response.data.pacientes;
      const tableBody = document.querySelector('#patient-body');
  
  
      tableBody.innerHTML = '';
  
      patient.forEach(patient => {
        const row = `
          <tr>
            <td>${patient.Nombre} ${patient.Apellido1} ${patient.Apellido2}</td>
            <td>${patient.Tipo_identificacion} </td>
            <td>${patient.Identificacion}</td>
            <td>${patient.Genero}</td>
            <td>${patient.Prelacion || 'N/A'}</td>
            <td>${patient.Telefono1}-${patient.Telefono2}</td>
            <td>${patient.Tipo_seguro}</td>
            <td>${patient.Traslado}</td>
            <td>${patient.Direccion}</td>
            <td>
              <button class="btn btn-outline-primary btn-sm" id="ShowTableAccomp" data-bs-toggle="modal" data-bs-target="#showAccomp"><i class="bi bi-eye"></i></button>
              <button class="btn btn-outline-success btn-sm " data-bs-toggle="modal" data-bs-target="#addAccomp"><i class="bi bi-person-plus"></i></button>
            </td>
            <td class="actions">
              <button class="btn btn-outline-primary btn-sm"><i class="bi bi-pencil-square"></i></button>
              <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>
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
