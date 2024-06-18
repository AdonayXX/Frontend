 getPatientComp();
async function getPatientComp() {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/paciente/acompanantes/';
    const response = await axios.get(API_URL);
    const listPatientComp = response.data.pacientes;
    
    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#tablePatient')) {
        $('#tablePatient').DataTable().destroy();
      }
    fillPatientComp(listPatientComp);
        let table = $('#tablePatient').DataTable({
            dom: "<'row'<'col-md-6'l>" +
                 "<'row'<'col-md-12't>>" +
                 "<'row justify-content-between'<'col-md-5'i><'col-md-5'p>>", 
            ordering: false,
            searching: true,
            paging: true,
            language: {
              url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
            },
            caseInsensitive: true,
            smart: true
    
          });
            $('#searchPatient').on('keyup', function () {
              let inputValue = $(this).val().toLowerCase(); 
              table.search(inputValue).draw();
            });

         
         
        });
      
   

  } catch (error) {
  
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        console.error('Error específico:', errorMessage);
        showToast('Ups!', errorMessage);

      } 
  }
}
function fillAccomp(acompanantes) {
  try {
    const tableBody = document.querySelector('#accomp-tbody');
    const noAcompanantesMessage = document.querySelector('#messageNoComp');
    const tableComp = document.querySelector('#tableComp');
    tableBody.innerHTML = '';


    if (acompanantes.length === 0) {
      tableComp.style.display = 'none';
      noAcompanantesMessage.style.display = 'block'

    } else {
      tableComp.style.display = 'block';
      noAcompanantesMessage.style.display = 'none';
      acompanantes.forEach(accomp => {
        const telefonoCompleto = (accomp.Telefono2 !== 0) ? `${accomp.Telefono1}-${accomp.Telefono2}` : `${accomp.Telefono1}`;
        const row = `
                    <tr>
                        <td>${accomp.Identificacion}</td>
                        <td>${accomp.Nombre} ${accomp.Apellido1} ${accomp.Apellido2}</td>
                        <td>${telefonoCompleto}</td>
                        <td>${accomp.Parentesco}</td>
                        <td class="actions">
                            <button class="btn btn-outline-primary btn-sm"><i class="bi bi-pencil-square" data-EditCompanion='${JSON.stringify(accomp)}' onclick = "editAccomp(this)" ></i></button>
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
        const nombreCompleto = `${patient.Nombre} ${patient.Apellido1} ${patient.Apellido2}`;
        
        const cantidadAcompanantes = patient.acompanantes.length;
          
        row.innerHTML = `
          <tr>
            <td>${patient.Nombre} ${patient.Apellido1} ${patient.Apellido2}</td>
            <td>${patient.Tipo_identificacion} </td>
            <td>${patient.Identificacion}</td>
            <td>${patient.Genero}</td>
           <td>${patient.Prioridad ? 'Si' : 'No'}</td>
            <td>${telefonoCompleto}</td>
            <td>${patient.Tipo_seguro}</td>
            <td>${patient.Traslado}</td>
            <td>${patient.Direccion}</td>
            <td>
              <button class="btn btn-outline-primary btn-sm" data-acompanantes='${JSON.stringify(patient.acompanantes)}' onclick='openAccomp(this)'><i class="bi bi-eye"></i></button>
              <button class="btn btn-outline-success btn-sm btnAddComp" data-bs-toggle="modal" data-bs-target="#addAccomp" onclick="companionAdd(${patient.IdPaciente})"><i class="bi bi-person-plus"></i></button>
            </td>
            <td class="actions">
              <button class="btn btn-outline-primary btn-sm"><i class="bi bi-pencil-square" data-pacientes='${JSON.stringify(patient)}' onclick = "patientEdit(this)"></i></button>
              <button class="btn btn-outline-danger btn-sm" onclick="patientDelete(${patient.IdPaciente}, '${nombreCompleto}', '${patient.Identificacion}')"><i class="bi bi-trash"></i>
        </button>            </td>
          </tr>
        `;
        fragment.appendChild(row);
 
        const btnAddComp = row.querySelector('.btnAddComp');
        if (cantidadAcompanantes >= 2) {
          btnAddComp.disabled = true;
        }
      
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
  let modalAcomp = new bootstrap.Modal(document.getElementById('showAccomp'), {
  });
  modalAcomp.show();
  
  
  fillAccomp(acompanantes);

};

window.editAccomp = function (button) {
  const acompanantes = JSON.parse(button.getAttribute('data-EditCompanion'));
  document.querySelector('#showAccomp .btn-close').click();
  let modalAcomp = new bootstrap.Modal(document.getElementById('addAccomp'), {
  });
  modalAcomp.show();
  

  document.querySelector("#saveCompanient").style.display = 'none';
  document.querySelector("#saveChangesCompanion").style.display = 'block';
  

  document.getElementById('name').value = acompanantes.Nombre;
  document.getElementById('firstlastname').value = acompanantes.Apellido1;
  document.getElementById('secondlastname').value = acompanantes.Apellido2;
  document.getElementById('identification').value = acompanantes.Identificacion;
  document.getElementById('phone1').value = acompanantes.Telefono1;
  document.getElementById('phone2').value = acompanantes.Telefono2;
  document.getElementById('parentesco').value = acompanantes.Parentesco;

  const IdAcompanante = acompanantes.IdAcompanante;


  document.querySelector("#saveChangesCompanion").addEventListener('click', function () {
    const companionData = {
      IdPaciente: acompanantes.IdPaciente,
      Nombre: document.getElementById('name').value,
      Apellido1: document.getElementById('firstlastname').value,
      Apellido2: document.getElementById('secondlastname').value,
      Identificacion: document.getElementById('identification').value,
      Telefono1: document.getElementById('phone1').value,
      Telefono2: document.getElementById('phone2').value,
      Parentesco: document.getElementById('parentesco').value,
      Estado: "Activo"
    };
  
    addEditedCompanion(companionData, IdAcompanante);
   
    
  });
  async function addEditedCompanion(companionData, IdAcompanante) {
    
    try {
      
      
      const API_URL = `https://backend-transporteccss.onrender.com/api/acompanantes/${IdAcompanante}`;
      const response = await axios.put(API_URL, companionData);
      modalAcomp.hide();
      document.querySelector('#formEditComp').reset();
      showToast('Acompañante','Se han guardado los cambios')
      setTimeout(function() {
        loadContent('dataTablePatient.html', 'mainContent');
    }, 1000);
    } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error('Error específico:', errorMessage);
      alert(errorMessage);
    } else {
      console.error('Ha ocurrido un problema:', error);
      alert("Ocurrió un problema");
    }
  }

      
  }
  
}



window.patientEdit = function (button) {
  let pacientes = JSON.parse(button.getAttribute('data-pacientes'));

  let modal = new bootstrap.Modal(document.getElementById('editPatient'), {
    backdrop: 'static',
    keyboard: false
  });
  


  modal.show();

 document.getElementById('formEditPatient').reset();

 llenarcampos(pacientes);
  const IdPaciente = pacientes.IdPaciente;
  const IdPersona = pacientes.IdPersona;

  document.querySelector('#formEditPatient').addEventListener('submit', function(event){
    event.preventDefault();
    sendEditPatient(IdPersona);
    
  
  }); 
  async function editPatientPerson(personaData,pacienteData){
    try {
      const API_URL_PERSONA = `https://backend-transporteccss.onrender.com/api/persona/${IdPersona}`;
      const responsePersona = await axios.put(API_URL_PERSONA, personaData);
      const API_URL_PACIENTE = `https://backend-transporteccss.onrender.com/api/paciente/${IdPaciente}`;
      const responsePaciente = await axios.put(API_URL_PACIENTE, pacienteData);
      console.log(responsePersona);
      console.log(responsePaciente);
     
      modal.hide();
      showToast('Paciente','Se han guardado los cambios')
      setTimeout(function() {
        loadContent('dataTablePatient.html', 'mainContent');
    }, 1000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        console.error('Error específico:', errorMessage);
        alert(errorMessage);
      } else {
        console.error('Ha ocurrido un problema:', error);
        alert("Ocurrió un problema");
      }
    } 

  }
  function sendEditPatient(IdPersona){

    personaData = {
      Nombre: document.getElementById('nombre').value,
      Apellido1: document.getElementById('primerApellido').value,
      Apellido2: document.getElementById('segundoApellido').value,
      Identificacion: document.getElementById('identificacion').value,
      Tipo_identificacion: document.getElementById('tipoIdentificacion').value,
      Genero: document.getElementById('genero').value,
      Telefono1: document.getElementById('telefono1').value,
      Telefono2: document.getElementById('telefono2').value ||0,
      Tipo_seguro: document.getElementById('tipoSeguro').value,
      Direccion: document.getElementById('direccion').value,
      Latitud: document.getElementById('latitud').value||0,
      Longitud: document.getElementById('longitud').value ||0,
      Tipo_sangre: document.getElementById('tipoSangre').value
    };
  
    pacienteData = {
      IdPersona: IdPersona,
      Criticidad: "null",
      Encamado: document.getElementById('encamado').value,
      Traslado: document.getElementById('lugarSalida').value,
      Prioridad: JSON.stringify(document.getElementById('prioridad').checked ? true : false),
      Estado: "Activo"
    };
  
    editPatientPerson(personaData,pacienteData);
   
   
  }
  function llenarcampos(pacientes){
    document.querySelector('#primerApellido').value = pacientes.Apellido1|| '';
    document.querySelector('#nombre').value = pacientes.Nombre|| '';
    document.querySelector('#segundoApellido').value = pacientes.Apellido2|| '';
    document.querySelector('#genero').value = pacientes.Genero|| '';
    document.querySelector('#tipoIdentificacion').value = pacientes.Tipo_identificacion|| '';
    document.querySelector('#identificacion').value = pacientes.Identificacion|| '';
    document.querySelector('#tipoSeguro').value = pacientes.Tipo_seguro|| '';
    document.querySelector('#telefono1').value = pacientes.Telefono1|| '';
    document.querySelector('#telefono2').value = pacientes.Telefono2|| '';
    document.querySelector('#tipoSangre').value = pacientes.Tipo_sangre|| '';
    document.querySelector('#latitud').value = pacientes.Latitud|| '';
    document.querySelector('#longitud').value = pacientes.Longitud|| '';
    document.querySelector('#direccion').value = pacientes.Direccion|| '';
    document.querySelector('#prioridad').checked = pacientes.Prioridad|| '';
    document.querySelector('#lugarSalida').value = pacientes.Traslado|| '';
    document.querySelector('#encamado').value = pacientes.Encamado|| '';
  
  }
   
   
  }

  






window.patientDelete = function (idPatient, nombreCompleto, identificacion) {


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
  confirmBtn.onclick = function () {

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


window.companionAdd = function (idPatient) {
    
  
  
  document.querySelector("#saveCompanient").style.display = 'block';
  document.querySelector("#saveChangesCompanion").style.display = 'none';
  
  

  document.getElementById('name').value = "";
  document.getElementById('firstlastname').value = "";
  document.getElementById('secondlastname').value = "";
  document.getElementById('identification').value =  "";
  document.getElementById('phone1').value = "";
  document.getElementById('phone2').value = "";
  document.getElementById('parentesco').value = "";
  document.querySelector("#saveCompanient").addEventListener('click', function () {

    addCompanion(idPatient);
   
  });

}



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
  
    const API_URL = 'https://backend-transporteccss.onrender.com/api/acompanantes/';
    const response = await axios.get(API_URL);
    const listaAcompanantes = response.data.acompanantes;
    const acompananteEncontrado = listaAcompanantes.find(acompanante => acompanante.Identificacion === companionData.Identificacion && acompanante.IdPaciente === companionData.IdPaciente);
    if (acompananteEncontrado) {
      alert("Acompañante ya registrado");
     
     ;

    }else{
      agregarAcompanante(companionData)
    }



  } catch (error) {

  }
}

//9: Registra un nuevo acompañante
async function agregarAcompanante(companionData) {
  try {
    
    const API_URL = 'https://backend-transporteccss.onrender.com/api/acompanantes';
    const response = await axios.post(API_URL, companionData);
    console.log(response.data);
    showToast('Acompañante Registrado', 'El registro se ha realizado exitosamente.');
    setTimeout(function() {
      loadContent('dataTablePatient.html', 'mainContent');
  }, 1000);
  
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error('Error específico:', errorMessage);
      alert(errorMessage);
    } else {
      console.error('Ha ocurrido un problema:', error);
      alert("Ocurrió un problema");
    }
  }
}



