
getPatientComp();
  document.getElementById('searchPatient').addEventListener('keyup', function () {
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
async function getPatientComp() {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/paciente/acompanantes/';
    const response = await axios.get(API_URL);
    const listPatientComp= response.data.pacientes;
    fillPatientComp(listPatientComp);
    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#tablePatient')) {
        // Si DataTable ya está inicializado, destruirlo primero
        $('#tablePatient').DataTable().destroy();
      }
      $('#tablePatient').DataTable({
        ordering: false,
        searching: false,
        language: {
          url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
      }

      });
    });

  } catch (error) {
    console.error('There has been a problem:', error);
    alert("Hubo un problema al obtener los pacientes.")
  }
}
function fillAccomp(acompanantes) {
  try {
    const tableBody = document.querySelector('#accomp-tbody');
    const noAcompanantesMessage = document.querySelector('#messageNoComp');
    const tableComp = document.querySelector('#tableComp');
    tableBody.innerHTML = '';
   

    if (acompanantes.length === 0) {
      tableComp.style.display='none';
      noAcompanantesMessage.style.display='block'
     
    } else {
      tableComp.style.display='block';
      noAcompanantesMessage.style.display='none'
      acompanantes.forEach(accomp => {
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
     
    

     
    }
  } catch (error) {
    console.error('There has been a problem:', error);
  }
}

function fillPatientComp(listPatientComp) {
  try {
    const tableBody = document.querySelector('#patient-body');
    const patient = listPatientComp.filter(a => {
      return a.Estado === "Activo";
    });
    if (patient) {
      
      tableBody.innerHTML = '';
      const fragment = document.createDocumentFragment();

      patient.forEach(patient => {
   
       
        
       
        const row = document.createElement('tr');
        const telefonoCompleto = (patient.Telefono2 !== 0) ? `${patient.Telefono1}-${patient.Telefono2}` : `${patient.Telefono1}`;
        const nombreCompleto =`${patient.Nombre} ${patient.Apellido1} ${patient.Apellido2}`;



        row.innerHTML = `
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
              <button class="btn btn-outline-primary btn-sm" data-acompanantes='${JSON.stringify(patient.acompanantes)}' onclick='openAccomp(this)' id="ShowTableAccomp" data-bs-toggle="modal" data-bs-target="#showAccomp"><i class="bi bi-eye"></i></button>
              <button class="btn btn-outline-success btn-sm " data-bs-toggle="modal" data-bs-target="#addAccomp" onclick="companionAdd(${patient.IdPaciente})"><i class="bi bi-person-plus"></i></button>
            </td>
            <td class="actions">
              <button class="btn btn-outline-primary btn-sm"><i class="bi bi-pencil-square"></i></button>
              <button class="btn btn-outline-danger btn-sm" onclick="patientDelete(${patient.IdPaciente}, '${nombreCompleto}', '${patient.Identificacion}')"><i class="bi bi-trash"></i>
        </button>            </td>
          </tr>
        `;
        fragment.appendChild(row);
      });
      tableBody.appendChild(fragment);
      


    } else {
      throw new Error('Error al cargar los pacientes');
      
    }

  } catch (error) {
    
    console.error('There has been a problem:', error);
 

  }


}

window.openAccomp = async function (button) {

  const acompanantes = JSON.parse(button.getAttribute('data-acompanantes'));

  console.log(acompanantes);
  fillAccomp(acompanantes);







};

window.patientEdit = function (idPatient) {
  loadContent('formPatient.html', 'mainContent');


}


window.patientDelete = function (idPatient,nombreCompleto,identificacion) {


   let modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'), {
    backdrop: 'static',
    keyboard: false
});
let bodyConfirm = document.querySelector('#bodyConfirm');

bodyConfirm.innerHTML = `
    <p>¿Estás seguro de que deseas eliminar al paciente:</p>
    <p><strong>Nombre:</strong> ${nombreCompleto}</p>
    <p><strong>Identificación:</strong> ${identificacion}</p>
    <p>Esta acción no se puede deshacer.</p>
`;


modal.show();


let confirmBtn = document.getElementById('confirmDeleteBtn');
confirmBtn.onclick = function() {

    deletePatient(idPatient);

    
    modal.hide();
};

};

async function deletePatient(patientId) {
  try {
    const API_URL = `https://backend-transporteccss.onrender.com/api/paciente/${patientId}`;
    const response = await axios.delete(API_URL);
    getPatientComp();
    
  } catch (error) {
    console.error('There has been a problem deleting the patient:', error);
  }
}

/* // Variables globales para almacenar el ID del paciente capturado
let idPacienteCapturado = null; */

// Función para capturar y mostrar el ID del paciente
window.companionAdd =function (idPatient) {
  
  document.querySelector("#saveCompanient").addEventListener('click', function(){
  
    addCompanion(idPatient);
  });
  
}

// Función para mostrar el ID capturado
/* function obtenerIdPaciente(idPatient) {
  idPacienteCapturado = idPatient; // Actualizamos la variable global si es necesario
  console.log('Id Capturado:', idPacienteCapturado);
} */



function addCompanion(idPacienteCapturado) {

  
    const acompananteNombre = document.querySelector(`#name`).value.trim();
    const acompananteApellido1 = document.querySelector(`#firstlastname`).value.trim();
    const acompananteApellido2 = document.querySelector(`#secondlastname`).value.trim();
    const acompananteIdentificacion = document.querySelector(`#identification`).value.trim();
    const acompananteTelefono1 = document.querySelector(`#phone1`).value.trim();
    const acompananteTelefono2 = document.querySelector(`#phone2`).value.trim() || '0';
    const acompananteParentesco = document.querySelector(`#parentesco`).value.trim();

    if (!acompananteNombre || !acompananteApellido1 || !acompananteApellido2 || !acompananteIdentificacion ||
      !acompananteTelefono1 || !acompananteParentesco) {
        alert("Por favor, llene los campos solicitados");
        return;

      
    }
    const companionData = {
      "IdPaciente": idPacienteCapturado,
      "Nombre": acompananteNombre,
      "Apellido1": acompananteApellido1,
      "Apellido2": acompananteApellido2,
      "Identificacion": acompananteIdentificacion,
      "Telefono1": acompananteTelefono1,
      "Telefono2": acompananteTelefono2,
      "Parentesco": acompananteParentesco,
      "Estado": "Activo"
    };
   
    obtenerAcompanante(companionData);
  }

//8: Verifica si el acompañante ya está registrado
async function obtenerAcompanante(companionData) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/acompanantes';
    const response = await axios.get(API_URL);
    const listaAcompanantes = response.data.acompanantes;
    const acompananteEncontrado = listaAcompanantes.find(acompanante => acompanante.Identificacion === companionData.Identificacion && acompanante.IdPaciente === companionData.IdPaciente);
    if (acompananteEncontrado) {

      if (acompananteEncontrado.Estado === 'Activo') {

        console.log("Entro en activo")
      } else {

        console.log("Entro en Inactivo")
      }
  } else if(!acompananteEncontrado){
    agregarAcompanante(companionData);

  }
  
  
  } catch (error) {

  }
}

//9: Registra un nuevo acompañante
async function agregarAcompanante(companionData) {
  try {
    console.log(companionData)
    const API_URL = 'https://backend-transporteccss.onrender.com/api/acompanante';
    const response = await axios.post(API_URL, companionData);
    console.log(response.data);
    showToast('Acompañante Registrado', 'El registro se ha realizado exitosamente.');
  } catch (error) {
    console.error(error);
  }
}