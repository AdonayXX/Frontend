getPatient(); 

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


  async function getAccomp() {
    try {
      const API_URL = 'http://localhost:18026/api/acompanante';
      const response = await axios.get(API_URL);
      const accompList = response.data.acompanantes;
      return accompList;
     
     
     
    
    } catch (error) {
      console.error('There has been a problem:', error);
    }
  }
  function fillAccomp(accompList, idPatient) {
    try {
        const tableBody = document.querySelector('#accomp-tbody');
        tableBody.innerHTML = ''; 
        const accompFiltered = accompList.filter(accomp => accomp.IdPaciente === idPatient);
  
        if (accompFiltered.length > 0) {
            accompFiltered.forEach(accomp => {
                const row = `
                    <tr>
                        <td>${accomp.Identificacion}</td>
                        <td>${accomp.Nombre} ${accomp.Apellido1} ${accomp.Apellido2}</td>
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
  
            console.log(`No se encontraron acompañantes para el paciente con ID: ${idPatient}`);
        }
    } catch (error) {
        console.error('There has been a problem:', error);
    }
  }
  


function fillPatient(patientList){
  try {
    const tableBody = document.querySelector('#patient-body');
    const patient = patientList.filter(a => {
      return a.Estado === "Activo" ;
    });
    if (patient) {
      tableBody.innerHTML = '';
      const fragment = document.createDocumentFragment();

      patient.forEach(patient => {
        const row =  document.createElement('tr');
        const telefonoCompleto = (patient.Telefono2 !== 0) ? `${patient.Telefono1}-${patient.Telefono2}` : `${patient.Telefono1}`;

        
        row.innerHTML =  `
          <tr>
            <td>${patient.Nombre} ${patient.Apellido1} ${patient.Apellido2}</td>
            <td>${patient.Tipo_identificacion} </td>
            <td>${patient.Identificacion}</td>
            <td>${patient.Genero}</td>
           <td>${patient.Prelacion ? 'Si' : 'No'}</td>
            <td>${telefonoCompleto}</td>
            <td>${patient.Tipo_seguro}</td>
            <td>${patient.Traslado}</td>
            <td>${patient.Direccion}</td>
            <td>
              <button class="btn btn-outline-primary btn-sm" onclick="openAccomp(${patient.IdPaciente})" id="ShowTableAccomp" data-bs-toggle="modal" data-bs-target="#showAccomp"><i class="bi bi-eye"></i></button>
              <button class="btn btn-outline-success btn-sm " data-bs-toggle="modal" data-bs-target="#addAccomp"><i class="bi bi-person-plus"></i></button>
            </td>
            <td class="actions">
              <button class="btn btn-outline-primary btn-sm" onclick="patientEdit(${patient.Id})"><i class="bi bi-pencil-square"></i></button>
              <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `;
        fragment.appendChild(row);
      });
      tableBody.appendChild(fragment);
      $(document).ready( function () {
        $('#tablePatient').DataTable({
          ordering:false,
          searching: false,
         
        });
      } );
     
   } else {
     throw new Error('Erro al cargar los pacientes');
   }
    
  } catch (error) {
    console.error('There has been a problem:', error);
    
  }
 

}




async function getPatient() {
    try {
      const API_URL = 'http://localhost:18026/api/paciente';
      const response = await axios.get(API_URL);
      const patientList = response.data.pacientes;

      fillPatient(patientList);
      
        
  
  
     
    } catch (error) {
      console.error('There has been a problem:', error);
    }
  }
   


  window.openAccomp =  async function(idPatient) {


    getAccomp().then(accompList => fillAccomp(accompList, idPatient));
   
 
   
 
};

window.patientEdit = function (idPatient){
  loadContent('formPatient.html', 'mainContent');




}
