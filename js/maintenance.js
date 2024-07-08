getMaintenance();
//Obtener los matenimientos
async function getMaintenance() {
  try {
    const Api_Url = 'http://localhost:18026/';
    const token = localStorage.getItem('token');

    const mantenimientoResponse = await axios.get(`${Api_Url}api/mantenimiento`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const actividadesResponse = await axios.get(`${Api_Url}api/actividadMantenimiento`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const mantenimiento = mantenimientoResponse.data.mantenimientos || [];
    const actividades = actividadesResponse.data.actividadesMantenimiento || [];
    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable('#tableMaintenance')) {
        $('#tableMaintenance').DataTable().destroy();
      }
      fillMaintenance(mantenimiento, actividades);
      let table = $('#tableMaintenance').DataTable({
        dom: "<'row'<'col-md-6'l>" +
          "<'row'<'col-md-12't>>" +
          "<'row justify-content-between'<'col-md-6'i><'col-md-6'p>>",
        ordering: false,
        searching: true,
        paging: true,
        language: {
          url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
        },
        caseInsensitive: true,
        smart: true

      });
      $('#searchMaintenance').on('keyup', function () {
        let inputValue = $(this).val().toLowerCase();
        table.search(inputValue).draw();
      });



    });
    ocultarSpinner();
  } catch (error) {

    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error('Error específico:', errorMessage);
      showToast('Ups!', errorMessage);

    } else {
      showToast('Error', 'Hubo un problema al obtener los manteniminetos');
    }
  }
}

//llenar tabla mantenimiento
function fillMaintenance(mantenimiento, actividades) {
  try {
    const tableBody = document.querySelector('#maintenance-body');


    tableBody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    mantenimiento.forEach(maintenance => {

      const activ = actividades.filter(actividad => maintenance.IdMantenimiento === actividad.IdMantenimiento);
      const activfind = activ.find(actividad => actividad.DescripcionTarea === maintenance.DescripcionTarea);

      if (activ) {
        // Formatear la fecha en formato dd/mm/aaaa
        const formattedDate = formatDate(maintenance.FechaMantenimiento);





        const row = document.createElement('tr');
        row.innerHTML = `
              <tr>
                <td >${maintenance.numeroUnidad}</td>
                <td >${maintenance.TipoUnidad} </td>
                <td >${formattedDate}</td>
                <td>${maintenance.DescripcionTarea}</td>
               <td class='text-center'>${maintenance.Cantidad}</td>
                <td class='text-center'>${maintenance.UnidadMedida}</td>
                <td class='text-center'>${maintenance.Estado}</td>
                <td class="actions">
                <button class="btn btn-outline-success btn-sm text-center" data-toggle="tooltip" data-placement="bottom" title="Estado: Finalizado" onclick='cambioEstCop(${JSON.stringify({ activfind })})'>   <i class="bi bi-check"></i></button>

             <button class="btn btn-outline-warning btn-sm text-center" data-toggle="tooltip"  data-placement="bottom" title="Estado: Pendiente"  onclick='cambioEstPen(${JSON.stringify({ activfind })})'><i class="bi bi-exclamation"></i></button>       
              </td>
              </tr>
            `;
        fragment.appendChild(row);
      } else {
        console.log("Ocurrio un error");
      }


    });

    tableBody.appendChild(fragment);






  } catch (error) {

    console.error('There has been a problem:', error);


  }

}

//Funcion para formatear la fecha
function formatDate(isoDate) {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Ocultar el spinner
function ocultarSpinner() {
  document.getElementById('spinnerContainer').style.display = 'none';
}

// Mostrar el modal de mantenimiento luego de agregar actividades
$(document).on('click', '#btnCloseTask', function () {
  $('#maintenanceModal').modal('show');

});

document.querySelector('#openTask').addEventListener('click', () => {
  getActividades();

});

//Mostar Actividades
async function getActividades() {
  try {
    const token = localStorage.getItem('token');
    const API_URL = 'http://localhost:18026/api/actividadMantenimiento';

    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const listAct = response;
    console.log(listAct)
  } catch (error) {

    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error('Error específico:', errorMessage);
      showToast('Ups!', errorMessage);

    } else {
      showToast('Error', 'Hubo un problema al obtener los manteniminetos');
    }
  }

}

async function cambioEstCop(activ) {
  console.log(activ);
  try {
    ActividadData = {
      IdMantenimiento: parseInt(activ.activfind.IdMantenimiento),
      DescripcionTarea: activ.activfind.DescripcionTarea,
      Cantidad: parseInt(activ.activfind.Cantidad),
      UnidadMedida: activ.activfind.UnidadMedida,
      Estado: "Completado"
    }

    console.log(ActividadData);
    const token = localStorage.getItem('token');
    const API_URL = `http://localhost:18026/api/actividadMantenimiento/${activ.activfind.IdActividad}`;

    const response = await axios.put(API_URL, ActividadData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(response);
    showToast('Exito', 'Estado actulizado correctamente.')
    getMaintenance();



  } catch (error) {
    console.error(error)
    showToast('Error', 'No se logro cambiar el estado')

  }
}
async function cambioEstPen(activ) {

  try {
    ActividadData = {
      IdMantenimiento: parseInt(activ.activfind.IdMantenimiento),
      DescripcionTarea: activ.activfind.DescripcionTarea,
      Cantidad: parseInt(activ.activfind.Cantidad),
      UnidadMedida: activ.activfind.UnidadMedida,
      Estado: "Pendiente"
    }

    console.log(ActividadData);
    const token = localStorage.getItem('token');
    const API_URL = `http://localhost:18026/api/actividadMantenimiento/${activ.activfind.IdActividad}`;

    const response = await axios.put(API_URL, ActividadData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(response);
    showToast('Exito', 'Estado actulizado correctamente.')
    getMaintenance();



  } catch (error) {
    console.error(error)
    showToast('Error', 'No se logro cambiar el estado')

  }
}




(function () {
  let fieldCounter = 0;

  document.getElementById('addActividadBtn').addEventListener('click', function () {
    addFields();
    console.log("Entro");
  });

  function addFields() {
    fieldCounter++;
    const container = document.getElementById('actividadesDinamicas');
    const fieldSet = document.createElement('div');
    fieldSet.className = 'col-12 mb-3';
    fieldSet.id = `field-set-${fieldCounter}`;

    fieldSet.innerHTML = `
          <div class="row">
              <div class="col-md-3">
                  <label for="activity-${fieldCounter}" class="form-label"><i class="bi bi-list"></i> Actividad:</label>
                  <select required id="activity-${fieldCounter}" name="activity" class="form-select">
                      <option selected disabled value="">Seleccionar</option>
                      <option value="Cambio de aceite">Cambio de aceite</option>
                      <option value="Cambio de llantas">Cambio de llantas</option>
                  </select>
              </div>
              <div class="col-md-3">
                  <label for="unidadMedida-${fieldCounter}" class="form-label"><i class="bi bi-archive"></i> Unidad:</label>
                   <select required id="unidadMedida-${fieldCounter}" name="activity" class="form-select">
                      <option selected disabled value="">Seleccionar</option>
                      <option value="Litros">Litros</option>
                      <option value="Unidades">Unidades</option>
                  </select>
              </div>
              <div class="col-md-2">
                  <label for="cantidad-${fieldCounter}" class="form-label"><i class="bi bi-box"></i> Cantidad:</label>
                  <input required type="number" id="cantidad-${fieldCounter}" name="cantidad" class="form-control">
              </div>
              <div class="col-md-3">
                  <label for="estado-${fieldCounter}" class="form-label"><i class="bi bi-shield"></i> Estado:</label>
                  <select required id="estado-${fieldCounter}" name="estado" class="form-select">
                      <option selected disabled value="">Seleccionar</option>
                      <option value="Completo">Completo</option>
                      <option value="Pendiente">Pendiente</option>
                  </select>
              </div>
              <div class="col-md-1 d-flex align-items-end">
                  <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeFields(${fieldCounter})">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                        </svg>
                  </button>
              </div>
          </div>
          <hr>
      `;

    container.appendChild(fieldSet);
  }

  window.removeFields = function (id) {
    const fieldSet = document.getElementById(`field-set-${id}`);
    fieldSet.remove();
  }
  document.querySelector('#maintenancebtn').addEventListener('click', async () => {
    const uniLlenado = await getUnidades();
    console.log(uniLlenado);
    const unidadSelect = document.querySelector('#unidadSelect');

    // Llenar el select con las opciones de unidad
    unidadSelect.innerHTML = '<option selected disabled value="">Seleccionar</option>';
    uniLlenado.forEach(unidad => {
      const option = document.createElement('option');
      option.value = unidad.id;
      option.textContent = unidad.numeroUnidad;
      unidadSelect.appendChild(option);
    });

    // Añadir el event listener para cambio de selección
    unidadSelect.addEventListener('change', async () => {
      console.log(uniLlenado)

      const unidadFiltrda = uniLlenado.find(unidad => unidad.id === parseInt(unidadSelect.value));
      document.querySelector('#kilometraje').value = unidadFiltrda.kilometrajeActual;
      document.querySelector('#IdTipoUnidadHidden').value = unidadFiltrda.idTipoUnidad;
      document.querySelector('#IdChoferHidden').value = unidadFiltrda.choferDesignado;
      const idChofer = parseInt(unidadFiltrda.choferDesignado);
      const idtipoUnidad = parseInt(unidadFiltrda.idTipoUnidad);
      const choferfind = await getChoferNombre(idChofer);
      const obTipoUnidad = await getTipoRecursoNombre(idtipoUnidad);
      nombreCompletoChofer = `${choferfind.nombre} ${choferfind.apellido1} ${choferfind.apellido2}`
      document.querySelector('#chofer').value = nombreCompletoChofer;
      document.querySelector('#tipoUnidad').value = obTipoUnidad



    });
  });

  //Obtener nombre de Tipo unidadd
  async function getTipoRecursoNombre(idtipoUnidad) {
    console.log(idtipoUnidad)
    try {
      const token = localStorage.getItem('token');
      const API_URL = 'https://backend-transporteccss.onrender.com/api/tipounidad';

      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response);
      const tiposUnidad = response.data.tipounidad;
      const tiposUnidadFiltrada = tiposUnidad.find(tipounidad => tipounidad.idTipoUnidad === idtipoUnidad);
      return tiposUnidadFiltrada.tipo;








    } catch (error) {

    }
  }



  //Obtener nombre de chofer
  async function getChoferNombre(idChofer) {
    try {
      const token = localStorage.getItem('token');
      const API_URL = 'https://backend-transporteccss.onrender.com/api/chofer';

      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const choferes = response.data.choferes;
      const choferFiltrado = choferes.find(chofer => chofer.idChofer === idChofer);



      return choferFiltrado;




    } catch (error) {

    }
  }




  async function getUnidades() {
    try {
      const token = localStorage.getItem('token');
      const API_URL = 'https://backend-transporteccss.onrender.com/api/unidades';

      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.unidades; // Asumiendo que las unidades están en response.data

    } catch (error) {
      console.error(error);
      return []; // Retornar un arreglo vacío en caso de error
    }
  }
  // Enviar Formulario 
  // Manejar el envío del formulario
  document.getElementById('formMaintenance').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Recopilar datos del formulario
    const actividades = [];
    for (let i = 1; i <= fieldCounter; i++) {
      const activitySelect = document.getElementById(`activity-${i}`);
      const unidadMedida = document.getElementById(`unidadMedida-${i}`);
      const cantidadInput = document.getElementById(`cantidad-${i}`);
      const estadoSelect = document.getElementById(`estado-${i}`);

      if (activitySelect && unidadSelect && cantidadInput && estadoSelect) {
        actividades.push({
          DescripcionTarea: activitySelect.value,
          UnidadMedida: unidadMedida.value,
          Cantidad: parseInt(cantidadInput.value.trim()),
          Estado: estadoSelect.value
        });
      }
    }

    const mantenimiento = {
      IdChofer: document.querySelector('#IdChoferHidden').value.trim(),
      IdUnidad: parseInt(document.querySelector('#unidadSelect').value.trim()),
      FechaMantenimiento: document.querySelector('#fechaMantenimiento').value.trim(),
      Kilometraje: document.querySelector('#kilometraje').value.trim(),
      TipoMantenimiento: document.querySelector('#tipoMantenimiento').value.trim(),
      Observacion: document.querySelector('#observaciones').value.trim(),
      actividades: actividades
    };
    console.log(mantenimiento);

    try {
      const token = localStorage.getItem('token');
      const API_URL = 'http://localhost:18026/api/mantenimiento';
      const response = await axios.post(API_URL, mantenimiento, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data);
      showToast('Exito', 'Mantenimiento Creado.')
      // Cerrar el modal correctamente usando Bootstrap
      const modalElement = document.querySelector('#maintenanceModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      } else {
        const newModalInstance = new bootstrap.Modal(modalElement);
        newModalInstance.hide();
      }
      setTimeout(function () {
        loadContent('dataTableMaintenance.html', 'mainContent')
      }, 500);
      // Manejar la respuesta del servidor aquí
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        console.error(error);
        showToast('Ups!', errorMessage);

      } else {
        showToast('Error', 'Hubo un problema al enviar los datos.');
        console.error(error);

      }
      // Manejar el error aquí
    }
  });


})();

//Funcion para validar que la fecha no pueda ser menor a la actual
document.getElementById('fechaMantenimiento').addEventListener('focus', function () {
  var fecha = new Date();
  var anio = fecha.getFullYear();
  var dia = fecha.getDate();
  var mes = fecha.getMonth() + 1; // Los meses empiezan en 0

  if (mes < 10) {
    mes = '0' + mes;
  }

  if (dia < 10) {
    dia = '0' + dia;
  }

  var fechaActual = anio + '-' + mes + '-' + dia;
  this.min = fechaActual;
});
