
getPatientComp();



async function getPatientComp() {
  mostrarSpinner();
  try {
    const token = localStorage.getItem('token');
    const API_URL = 'https://backend-transporteccss.onrender.com/api/paciente/acompanantes/';

    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const listPatientComp = response.data.pacientes;

    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#tablePatient')) {
        $('#tablePatient').DataTable().destroy();
      }
      fillPatientComp(listPatientComp);
      let table = $('#tablePatient').DataTable({
        dom: "<'row'<'col-md-6'l>" +
          "<'row'<'col-md-12't>>" +
          "<'row justify-content-between'<'col-md-6'i><'col-md-6'p>>",
        ordering: false,
        searching: true,
        paging: true,
        pageLength: 25,
        lengthMenu: [[25, 50, 100, -1], [25, 50, 100, "Todo"]],
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
    ocultarSpinner();
  } catch (error) {

    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      showToast('Ups!', errorMessage);
    } else {
      showToast('Error', 'Inesperado.');

    }
  }
}
function fillAccomp(acompanantes) {
  try {
    const tableBody = document.querySelector('#accomp-tbody');
    const noAcompanantesMessage = document.querySelector('#messageNoComp');
    const tableComp = document.querySelector('#tableComp');
    tableBody.innerHTML = '';
    // Filtrar solo los acompañantes con estado "Activo"
    const activeAcompanantes = acompanantes.length




    if (activeAcompanantes === 0) {
      tableComp.style.display = 'none';
      noAcompanantesMessage.style.display = 'block';

    } else {
      tableComp.style.display = 'block';
      noAcompanantesMessage.style.display = 'none';
      acompanantes.forEach(accomp => {
        const telefonoCompleto = (accomp.Telefono2 !== 0) ? `${accomp.Telefono1}/${accomp.Telefono2}` : `${accomp.Telefono1}`;
        const nombreCompleto = `${accomp.Nombre} ${accomp.Apellido1} ${accomp.Apellido2}`;
        const IdentificacionComp = `${accomp.Identificacion} `;
        const row = `
                    <tr>
                        <td>${accomp.Identificacion}</td>
                        <td>${nombreCompleto}</td>
                        <td>${telefonoCompleto}</td>
                        <td>${accomp.Parentesco}</td>
                        <td class="actions">
                        <button class="btn btn-outline-primary btn-sm" data-EditCompanion='${JSON.stringify(accomp)}' onclick = "editAccomp(this)" ><i class="bi bi-pencil-square"></i></button>
                             <button class="btn btn-outline-danger btn-sm" onclick="companionDelete(${accomp.IdAcompanante}, '${nombreCompleto}', '${IdentificacionComp}')"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `;
        tableBody.innerHTML += row;

      });



    }
  } catch (error) {
    showToast('Error', 'Inesperado.');

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
        const telefonoCompleto = (patient.Telefono2 !== 0) ? `${patient.Telefono1} / ${patient.Telefono2}` : `${patient.Telefono1}`;
        const nombreCompleto = `${patient.Nombre} ${patient.Apellido1} ${patient.Apellido2}`;
        const acompanantesActivos = patient.acompanantes

        const cantidadAcompanantes = acompanantesActivos.length;

        const dontShowButton = patient.Latitud == "0" && patient.Longitud == "0";

        row.innerHTML = `
          <tr>
            <td >${patient.Tipo_identificacion} </td>
            <td class='text-nowrap'> ${patient.Identificacion}</td>
            <td >${patient.Nombre} ${patient.Apellido1} ${patient.Apellido2}</td>
            <td>${patient.Genero}</td>
            <td class='text-center'>${telefonoCompleto}</td>
         <td class="text-center">
    <button class="btn btn-outline-primary btn-sm" onclick='viewDirection(
        ${JSON.stringify(patient.Provincia)},
        ${JSON.stringify(patient.Canton)},
        ${JSON.stringify(patient.Distrito)},
        ${JSON.stringify(patient.Barrio)},
        ${JSON.stringify(patient.OtrasSenas)}
    )'>
        <i class="bi bi-eye"></i>
    </button>
</td>
            <td class='text-center'>${patient.Prioridad ? 'Si' : 'No'}</td>
            <td class='text-center'>${patient.VbDM ? 'Si' : 'No'}</td>
            <td class='text-center'>
              ${dontShowButton ? 'Sin datos' : `<button class="btn btn-outline-success btn-sm" onclick="getLocation('${patient.Latitud}', '${patient.Longitud}')"><i class="bi bi-geo-alt-fill"></i></button>`}
            </td>
            <td class='text-center'>
              <button class="btn btn-outline-primary btn-sm" data-acompanantes='${JSON.stringify(patient.acompanantes)}' onclick='openAccomp(this)'><i class="bi bi-eye"></i></button>
              <button class="btn btn-outline-success btn-sm btnAddComp" data-bs-toggle="modal" data-bs-target="#addAccomp" onclick="companionAdd(${patient.IdPaciente})"><i class="bi bi-person-plus"></i></button>
            </td>
            <td class="actions">
            <button class="btn btn-outline-primary btn-sm" data-pacientes='${JSON.stringify(patient)}' onclick = "patientEdit(this)"><i class="bi bi-pencil-square"></i></button>
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
      showToast('Ups!', ' Error inesperado.');

    }

  } catch (error) {
    showToast('Error', 'Inesperado.');
  }
}

function getLocation(latitude, longitude) {
  var url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  window.open(url, '_blank');
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
  document.getElementById('phone2').value = acompanantes.Telefono2 || '';
  document.getElementById('parentesco').value = acompanantes.Parentesco;

  const IdAcompanante = acompanantes.IdAcompanante;


  document.querySelector("#saveChangesCompanion").addEventListener('click', function () {
    showLoaderModalComp();
    const companionData = {
      IdPaciente: acompanantes.IdPaciente,
      Nombre: document.getElementById('name').value.trim(),
      Apellido1: document.getElementById('firstlastname').value.trim(),
      Apellido2: document.getElementById('secondlastname').value.trim(),
      Identificacion: document.getElementById('identification').value.trim(),
      Telefono1: document.getElementById('phone1').value.trim(),
      Telefono2: document.getElementById('phone2').value.trim() || 0,
      Parentesco: document.getElementById('parentesco').value.trim()
    };

    addEditedCompanion(companionData, IdAcompanante);


  });
  async function addEditedCompanion(companionData, IdAcompanante) {

    try {
      const token = localStorage.getItem('token');
      const API_URL = `https://backend-transporteccss.onrender.com/api/acompanantes/${IdAcompanante}`;
      const response = await axios.put(API_URL, companionData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      modalAcomp.hide();
      document.querySelector('#formEditComp').reset();
      showToast('Acompañante', 'Se han guardado los cambios')
      hideLoaderModalComp();
      setTimeout(function () {
        loadContent('dataTablePatient.html', 'mainContent');
      }, 1000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        showToast('Ups!', errorMessage);
      } else {
        showToast('Ups!', ' Error inesperado.');

      }
      hideLoaderModalComp();
    }


  }

}
// Función para cargar los datos JSON y llenar los select
function cargarDatos() {
  fetch('data/provincias_cantones_distritos_costa_rica.json')
      .then(response => response.json())
      .then(data => {
          const provinciaSelect = document.getElementById('provincia');
          const cantonSelect = document.getElementById('canton');
          const distritoSelect = document.getElementById('distrito');

          // Cargar provincias
          Object.keys(data.provincias).forEach(provinciaKey => {
              const provincia = data.provincias[provinciaKey];
              const option = document.createElement('option');
              option.value = provincia.nombre; // Usar el nombre como valor
              option.textContent = provincia.nombre;
              provinciaSelect.appendChild(option);
          });

          // Evento para cargar cantones al seleccionar una provincia
          provinciaSelect.addEventListener('change', () => {
              // Limpiar select de cantones y distritos
              cantonSelect.innerHTML = '<option selected disabled value="">Seleccionar</option>';
              distritoSelect.innerHTML = '<option selected disabled value="">Seleccionar</option>';
              cantonSelect.disabled = false;
              distritoSelect.disabled = true;

              const provinciaSeleccionada = provinciaSelect.value;
              const provincia = Object.values(data.provincias).find(p => p.nombre === provinciaSeleccionada);

              if (provincia) {
                  Object.keys(provincia.cantones).forEach(cantonKey => {
                      const canton = provincia.cantones[cantonKey];
                      const option = document.createElement('option');
                      option.value = canton.nombre; // Usar el nombre como valor
                      option.textContent = canton.nombre;
                      cantonSelect.appendChild(option);
                  });
              }
             
          });

          // Evento para cargar distritos al seleccionar un cantón
          cantonSelect.addEventListener('change', () => {
              // Limpiar select de distritos
              distritoSelect.innerHTML = '<option selected disabled value="">Seleccionar</option>';
              distritoSelect.disabled = false;

              const provinciaSeleccionada = provinciaSelect.value;
              const cantonSeleccionado = cantonSelect.value;
              const provincia = Object.values(data.provincias).find(p => p.nombre === provinciaSeleccionada);
              const canton = provincia ? Object.values(provincia.cantones).find(c => c.nombre === cantonSeleccionado) : null;

              if (canton) {
                  Object.keys(canton.distritos).forEach(distritoKey => {
                      const distrito = canton.distritos[distritoKey];
                      const option = document.createElement('option');
                      option.value = distrito; // Usar el nombre como valor
                      option.textContent = distrito;
                      distritoSelect.appendChild(option);
                  });
              }
             
          });
       
      })
      .catch(error => showToast('Error', 'Al cargar la Información'));
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

  document.querySelector('#formEditPatient').addEventListener('submit', function (event) {
    event.preventDefault();
    showLoaderModalPatEdit();
    sendEditPatient(IdPersona);
  });
  async function editPatientPerson(personaData, pacienteData) {
    try {
      const token = localStorage.getItem('token');
      const API_URL_PERSONA = `https://backend-transporteccss.onrender.com/api/persona/${IdPersona}`;
      const responsePersona = await axios.put(API_URL_PERSONA, personaData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const API_URL_PACIENTE = `https://backend-transporteccss.onrender.com/api/paciente/${IdPaciente}`;
      const responsePaciente = await axios.put(API_URL_PACIENTE, pacienteData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
 // Cerrar el modal correctamente usando Bootstrap
 const modalElement = document.querySelector("#editPatient");
 const modalInstance = bootstrap.Modal.getInstance(modalElement);
 if (modalInstance) {
   modalInstance.hide();
 } else {
   const newModalInstance = new bootstrap.Modal(modalElement);
   newModalInstance.hide();
 }
      showToast('Paciente', 'Se han guardado los cambios')
      setTimeout(function () {
        loadContent('dataTablePatient.html', 'mainContent');
      }, 1000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        showToast('Ups!', errorMessage);
      } else {
        showToast('Ups!', ' Error inesperado.');

      }

    } finally {
      hideLoaderModalPatEdit();
    }

  }
  function sendEditPatient(IdPersona) {
    try {
      personaData = {
        Nombre: document.getElementById('nombre').value,
        Apellido1: document.getElementById('primerApellido').value,
        Apellido2: document.getElementById('segundoApellido').value,
        Identificacion: document.getElementById('identificacion').value,
        Tipo_identificacion: document.getElementById('tipoIdentificacion').value,
        Genero: document.getElementById('genero').value,
        Telefono1: document.getElementById('telefono1').value,
        Telefono2: document.getElementById('telefono2').value || 0,
        Tipo_seguro: "N/A",
        Direccion: document.getElementById('direccion').value,
        Latitud: document.getElementById('latitud').value || 0,
        Longitud: document.getElementById('longitud').value || 0,
        Tipo_sangre: document.getElementById('tipoSangre').value
      };

      pacienteData = {
        IdPersona: IdPersona,
        Criticidad: "N/A",
        Encamado: document.getElementById('encamado').value,
        VbDM: JSON.stringify(document.getElementById('trasladable').checked ? true : false),
        Prioridad: JSON.stringify(document.getElementById('prioridad').checked ? true : false),
        LugarSalida: document.querySelector('#lugarSalida').value,
        Estado: "Activo",
        Provincia: document.querySelector('#provincia').value,
        Canton:document.querySelector('#canton').value,
        Distrito:document.querySelector('#distrito').value,
        Barrio:document.querySelector('#barrio').value,
        OtrasSenas:document.querySelector('#direccion').value,

      };

      editPatientPerson(personaData, pacienteData);


    } catch (error) {
      hideLoaderModalPatEdit();

    }



  }
  function llenarcampos(pacientes) {
      // Limpiar los campos antes de llenarlos
      document.querySelector('#primerApellido').value = '';
      document.querySelector('#nombre').value = '';
      document.querySelector('#segundoApellido').value = '';
      document.querySelector('#genero').value = '';
      document.querySelector('#tipoIdentificacion').value = '';
      document.querySelector('#identificacion').value = '';
      document.querySelector('#telefono1').value = '';
      document.querySelector('#telefono2').value = '';
      document.querySelector('#tipoSangre').value = '';
      document.querySelector('#latitud').value = '';
      document.querySelector('#longitud').value = '';
      document.querySelector('#direccion').value = '';
      document.querySelector('#lugarSalida').value = '';
      document.querySelector('#prioridad').checked = false;
      document.querySelector('#trasladable').checked = false;
      document.querySelector('#encamado').value = '';
      document.querySelector('#provincia').value = '';
      document.querySelector('#canton').value = '';
      document.querySelector('#distrito').value = '';
      document.querySelector('#barrio').value = '';
   

    document.querySelector('#primerApellido').value = pacientes.Apellido1 || '';
    document.querySelector('#nombre').value = pacientes.Nombre || '';
    document.querySelector('#segundoApellido').value = pacientes.Apellido2 || '';
    document.querySelector('#genero').value = pacientes.Genero || '';
    document.querySelector('#tipoIdentificacion').value = pacientes.Tipo_identificacion || '';
    document.querySelector('#identificacion').value = pacientes.Identificacion || '';
    document.querySelector('#telefono1').value = pacientes.Telefono1 || '';
    document.querySelector('#telefono2').value = pacientes.Telefono2 || '';
    document.querySelector('#tipoSangre').value = pacientes.Tipo_sangre || '';
    document.querySelector('#latitud').value = pacientes.Latitud || '';
    document.querySelector('#longitud').value = pacientes.Longitud || '';
    document.querySelector('#direccion').value = pacientes.Direccion || '';
    document.querySelector('#lugarSalida').value = pacientes.LugarSalida || '';
    document.querySelector('#prioridad').checked = pacientes.Prioridad || '';
    document.querySelector('#trasladable').checked = pacientes.VbDM || '';
    document.querySelector('#encamado').value = pacientes.Encamado || '';
      // Simular la selección de una provincia y cargar cantones
      const provinciaSelect = document.querySelector('#provincia');
      const provinciaParaSeleccionar = pacientes.Provincia || ''; // Nombre de la provincia que deseas seleccionar
      provinciaSelect.value = provinciaParaSeleccionar;
      const event1 = new Event('change');
      provinciaSelect.dispatchEvent(event1);

      const cantonselect = document.querySelector('#canton');
      const cantonParaSeleccionar = pacientes.Canton ||'';
      cantonselect.value = cantonParaSeleccionar;
      const event2 = new Event('change');
      cantonselect.dispatchEvent(event2);
  
    document.querySelector('#distrito').value = pacientes.Distrito||'';
    document.querySelector('#barrio').value = pacientes.Barrio||'';

    

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
    const token = localStorage.getItem('token');
    const API_URL = `https://backend-transporteccss.onrender.com/api/paciente/${patientId}`;
    const response = await axios.delete(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    showToast('Exito', 'Paciente eliminado exitosamente.')
    setTimeout(function () {
      loadContent('dataTablePatient.html', 'mainContent');
    }, 1000);


  } catch (error) {
    showToast('Ups!', 'Error al eliminar el paciente.')
  }
}


window.companionAdd = function (idPatient) {



  document.querySelector("#saveCompanient").style.display = 'block';
  document.querySelector("#saveChangesCompanion").style.display = 'none';



  document.getElementById('name').value = "";
  document.getElementById('firstlastname').value = "";
  document.getElementById('secondlastname').value = "";
  document.getElementById('identification').value = "";
  document.getElementById('phone1').value = "";
  document.getElementById('phone2').value = "";
  document.getElementById('parentesco').value = "";
  document.querySelector("#saveCompanient").addEventListener('click', function () {
    showLoaderModalComp();

    addCompanion(idPatient);

  });

}



function addCompanion(idPacienteCapturado) {



  const acompananteNombre = document.querySelector(`#name`).value.trim();
  const acompananteApellido1 = document.querySelector(`#firstlastname`).value.trim();
  const acompananteApellido2 = document.querySelector(`#secondlastname`).value.trim();
  const acompananteIdentificacion = document.querySelector(`#identification`).value.trim();
  const acompananteTelefono1 = parseInt(document.querySelector(`#phone1`).value.trim());
  const acompananteTelefono2 = parseInt(document.querySelector(`#phone2`).value.trim() || '0');
  const acompananteParentesco = document.querySelector(`#parentesco`).value.trim();

  if (!acompananteNombre || !acompananteApellido1 || !acompananteApellido2 || !acompananteIdentificacion ||
    !acompananteTelefono1 || !acompananteParentesco) {
    showToast('Por favor', 'llene los campos solicitados');
    hideLoaderModalComp();
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
    "Parentesco": acompananteParentesco
  };

  agregarAcompanante(companionData);
}

//9: Registra un nuevo acompañante
async function agregarAcompanante(companionData) {
  try {

    const API_URL = 'https://backend-transporteccss.onrender.com/api/acompanantes';

    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, companionData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    showToast('Acompañante Registrado', 'El registro se ha realizado exitosamente.');
    // Cerrar el modal correctamente usando Bootstrap
    const modalElement = document.querySelector('#addAccomp');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    } else {
      const newModalInstance = new bootstrap.Modal(modalElement);
      newModalInstance.hide();
    }
    hideLoaderModalComp();
    setTimeout(function () {
      loadContent('dataTablePatient.html', 'mainContent');
    }, 1000);

  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      showToast('Ups!', errorMessage);
    } else {
      showToast('Ups!', ' Error inesperado.');

    }
    hideLoaderModalComp();

  }
}
document.querySelector('#telefono1').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});
document.querySelector('#telefono2').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});
document.querySelector('#phone1').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});
document.querySelector('#phone2').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});

function applyMaskBasedOnType() {
  let tipoIdentificacion = document.getElementById('tipoIdentificacion').value;
  let identificacionInput = document.getElementById('identificacion');

  switch (tipoIdentificacion) {
    case 'Cédula de Identidad':
      identificacionInput.setAttribute('data-mask', '0-0000-0000');
      break;
    case 'Número de Asegurado':
      identificacionInput.setAttribute('data-mask', '0000000000000000000000000');
      break;
    case 'Interno':
      identificacionInput.setAttribute('data-mask', '2536-00000000000000000000');
      break;
    default:
      identificacionInput.removeAttribute('data-mask');
      break;
  }

  identificacionInput.value = '';

  applyIdentificationMask('identificacion', identificacionInput.getAttribute('data-mask'));
}

function applyIdentificationMask(elementId, mask) {
  let inputElement = document.getElementById(elementId);
  if (!inputElement) return;

  let content = '';

  inputElement.addEventListener('input', function () {
    let maskedValue = maskIt(mask, this.value);
    this.value = maskedValue;

    if (this.value.replace(/\D/g, '').length > 20) {
      this.value = this.value.substring(0, this.value.length - 1);
    }
  });

  inputElement.addEventListener('keydown', function (e) {
    if (e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      return;
    }

    e.preventDefault();

    if (!mask) {
      mask = '';
    }

    if (isNumeric(e.key) && content.length < mask.length) {
      content += e.key;
    }

    if (content.replace(/\D/g, '').length > 20) {
      content = content.substring(0, content.length - 1);
    }

    if (e.keyCode == 8) {
      if (content.length > 0) {
        content = content.substr(0, content.length - 1);
      }
    }

    inputElement.value = maskIt(mask, content);
  });
}


function isNumeric(char) {
  return !isNaN(char - parseInt(char));
}

function maskIt(pattern, value) {
  let maskedValue = '';
  let valueIndex = 0;

  for (let patternIndex = 0; patternIndex < pattern.length; patternIndex++) {
    if (valueIndex >= value.length) {
      break;
    }

    if (pattern[patternIndex] === '0') {
      maskedValue += value[valueIndex];
      valueIndex++;
    } else {
      maskedValue += pattern[patternIndex];
    }
  }

  return maskedValue;
}

document.getElementById('tipoIdentificacion').addEventListener('change', function () {
  applyMaskBasedOnType();
});

applyMaskBasedOnType();
applyIdentificationMask('identificacion', '');



document.querySelectorAll('input[type="text"]').forEach(input => {
  input.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    event.target.value = toSentenceCase(inputValue);
  });
});

// Función para convertir solo la primera letra de cada oración a mayúscula
function toSentenceCase(str) {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function (c) {
    return c.toUpperCase();
  });
}

document.getElementById('direccion').addEventListener('input', (event) => {
  const inputValue = event.target.value;
  event.target.value = toSentenceCase(inputValue);
});

async function companionDelete(IdAcompanante, nombreCompleto, Identificacion) {
  let modal = new bootstrap.Modal(document.getElementById('confirmDeleteModalComp'), {
    backdrop: 'static',
    keyboard: false
  });
  let bodyConfirm = document.querySelector('#bodyConfirmComp');

  bodyConfirm.innerHTML = `
    <p>¿Estás seguro de que deseas eliminar al paciente:</p>
    <p><strong>Nombre:</strong> ${nombreCompleto}</p>
    <p><strong>Identificación:</strong> ${Identificacion}</p>
    <p>Esta acción no se puede deshacer.</p>
`;


  modal.show();


  let confirmBtn = document.getElementById('confirmDeleteBtnComp');

  confirmBtn.onclick = function () {

    deleteComp(IdAcompanante);
    // Cerrar el modal correctamente usando Bootstrap
    const modalElement = document.querySelector('#showAccomp');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    } else {
      const newModalInstance = new bootstrap.Modal(modalElement);
      newModalInstance.hide();
    }
    modal.hide();


  }
}
async function deleteComp(IdAcompanante) {
  try {
    const API_URL = `https://backend-transporteccss.onrender.com/api/acompanantes/${IdAcompanante}`;
    const token = localStorage.getItem('token');
    const response = await axios.delete(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    showToast('Exito', 'Acompañante eliminado exitosamente.');


    setTimeout(function () {
      loadContent('dataTablePatient.html', 'mainContent');
    }, 1000);


  } catch (error) {

    showToast('Ups!', 'Error al eliminar el acompañante.')
  }

}
window.viewDirection = function(provincia, canton, distrito, barrio, otrasSenas) {
  const direccionCompleta = `
    <p><strong>Provincia:</strong> ${provincia || ''}</p>
    <p><strong>Cantón:</strong> ${canton || ''}</p>
    <p><strong>Distrito:</strong> ${distrito || ''}</p>
    <p><strong>Barrio:</strong> ${barrio || ''}</p>
    <p><strong>Otras Señas:</strong> ${otrasSenas || ''}</p>
  `;
  document.querySelector("#bodyDireccion").innerHTML = direccionCompleta;
  
  let myModal = new bootstrap.Modal(document.getElementById('modalDireccion'));
  myModal.show();
}

//Spiner
// Mostrar el spinner
function mostrarSpinner() {
  document.getElementById('spinnerContainer').style.display = 'flex';
}

// Ocultar el spinner
function ocultarSpinner() {
  document.getElementById('spinnerContainer').style.display = 'none';
}
function showLoaderModalPatEdit() {
  document.querySelector('#loaderModalPatEdit').style.display = 'flex';
}

function hideLoaderModalPatEdit() {
  document.querySelector('#loaderModalPatEdit').style.display = 'none';
}

function showLoaderModalComp() {
  document.querySelector('#loaderModalComp').style.display = 'flex';
}

function hideLoaderModalComp() {
  document.querySelector('#loaderModalComp').style.display = 'none';
}


   // Llamar a la función cargarDatos inmediatamente
 cargarDatos();


