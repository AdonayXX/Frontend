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
      const patientList = response.data.pacientes;
      const tableBody = document.querySelector('#patient-body');
      const patient = patientList.filter(a => {
        return a.Estado === "Activo" ;
      });
      if (patient) {
        tableBody.innerHTML = '';
  
        patient.forEach(patient => {
          const row = `
            <tr>
              <td>${patient.Nombre} ${patient.Apellido1} ${patient.Apellido2}</td>
              <td>${patient.Tipo_identificacion} </td>
              <td>${patient.Identificacion}</td>
              <td>${patient.Genero}</td>
             <td>${patient.Prelacion ? 'Si' : 'No'}</td>
              <td>${patient.Telefono1}-${patient.Telefono2}</td>
              <td>${patient.Tipo_seguro}</td>
              <td>${patient.Traslado}</td>
              <td>${patient.Direccion}</td>
              <td>
                <button class="btn btn-outline-primary btn-sm" onclick="openAccomp(${patient.Id})" id="ShowTableAccomp" data-bs-toggle="modal" data-bs-target="#showAccomp"><i class="bi bi-eye"></i></button>
                <button class="btn btn-outline-success btn-sm " data-bs-toggle="modal" data-bs-target="#addAccomp"><i class="bi bi-person-plus"></i></button>
              </td>
              <td class="actions">
                <button class="btn btn-outline-primary btn-sm" onclick="patientEdit(${patient.Id})"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `;
          tableBody.innerHTML += row;
        });
       
     } else {
       throw new Error('Erro al cargar los pacientes');
     }
        
  
  
     
    } catch (error) {
      console.error('There has been a problem:', error);
    }
  }
  getPatient();  


  window.openAccomp = function(idPatient) {
    const tableBody = document.querySelector('#accomp-tbody');
    tableBody.innerHTML = '';
  getAccomp(idPatient);
};
async function getAccomp(idPatient) {
  try {
    const API_URL = 'http://localhost:56336/api/acompanante';
    const response = await axios.get(API_URL);
    const accompList = response.data.acompanantes;
    const tableBody = document.querySelector('#accomp-tbody');
   
   const accomp = accompList.filter(a => {
    return a.Id === idPatient;
  });
     if (accomp) {
     

    accomp.forEach(accomp => {
      const row = `
        <tr>
          <td>${accomp.Identificacion} </td>
          <td>${accomp.Nombre} ${accomp.Apellido1} ${accomp.Apellido2} </td>
          <td>${accomp.Telefono1}-${accomp.Telefono2}</td>
          <td>${accomp.Parentesco}</td>
          <td class="actions">
            <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    }); 
    } else {
      throw new Error(`No se encontró un acompañante con el Id: ${idPatient}`);
    }
  } catch (error) {
    console.error('There has been a problem:', error);
  }
}
window.patientEdit = function (idPatient){
  loadContent('formPatient.html', 'mainContent');




}
