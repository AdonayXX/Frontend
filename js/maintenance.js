(async function () {
  getlastMaintenance();
  getMaintenance();
  getUnidadesFiltro();
  setupFilterEvents();


  // Variables globales para almacenar los datos
  let last20Maintenance = [];
  let mantenimientoData = [];
  let actividadesData = [];
  let actividadesTodoData = [];
  let fieldCounter = 0;
  let actividadesLista = [];

  //Funcion para obtener los ultimos 20 mantenimientos para llenar la tabla
  async function getlastMaintenance() {
    try {
      const Api_Url = "https://backend-transporteccss.onrender.com/";
      const token = localStorage.getItem("token");

      // Obtener datos de mantenimiento
      const mantenimientoResponse = await axios.get(`${Api_Url}api/mantenimiento/last`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      last20Maintenance = mantenimientoResponse.data.mantenimientos || [];


      // Obtener datos de actividades de mantenimiento
      const actividadesResponse = await axios.get(`${Api_Url}api/actividadMantenimiento`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const actividadesData = actividadesResponse.data.actividadesMantenimiento || [];


      // Obtener todas las actividades
      const actividadesTodo = await axios.get(`${Api_Url}api/actividad`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      actividadesTodoData = actividadesTodo.data.actividades || [];
    

      // Destruir la instancia existente de DataTables
      if ($.fn.DataTable.isDataTable("#tableMaintenance")) {
        $("#tableMaintenance").DataTable().destroy();
      }

      // Vaciar el cuerpo de la tabla
      $("#maintenance-body").empty();
      // Llenar la tabla de mantenimientos con los últimos 20
      fillMaintenanceTable(last20Maintenance, actividadesData, actividadesTodoData);


      // Configurar DataTables y eventos de cambio
      setupDataTable();
      ocultarSpinner();
    } catch (error) {
      showToast('Error','Inesperado')

    }
  }

  // Función para llenar la tabla de mantenimientos
  function fillMaintenanceTable(maintenance, activities, allActivities) {
    
    try {
      const tableBody = document.querySelector("#maintenance-body");
      tableBody.innerHTML = "";

      if (maintenance.length === 0) {
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML =
          `<td colspan="11" class="text-center">No hay datos disponibles</td>`
          ;

        tableBody.appendChild(noDataMessage);
        return;
      }



      const fragment = document.createDocumentFragment();

      maintenance.forEach((maintenanceItem) => {
        // Filtrar actividades por IdMantenimiento
        const relatedActivities = activities.filter(
          (activity) => activity.IdMantenimiento === maintenanceItem.IdMantenimiento
        );


        // Encontrar actividades coincidentes con todas las actividades
        let foundActivity = null;
        allActivities.some((activity) => {
          foundActivity = relatedActivities.find(
            (related) => related.IdActividad === activity.IdActividad && activity.Descripcion === maintenanceItem.Descripcion
          );
          return foundActivity !== undefined;
        });
  

        // Crear fila HTML
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${maintenanceItem.IdMantenimiento || ''}</td>
          <td>${maintenanceItem.numeroUnidad || ''}</td>
          <td>${maintenanceItem.TipoUnidad || ''}</td>
          <td>${formatDate(maintenanceItem.FechaMantenimiento) || ''}</td>
          <td>${maintenanceItem.TipoMantenimiento || ''}</td>
          <td class='text-center'><button class="btn btn-outline-primary btn-sm"  onclick='SeeObervation(${JSON.stringify(maintenanceItem.Detalle)})'><i class="bi bi-eye"></i></button>
</td>
          <td>${maintenanceItem.Descripcion || ''}</td>
          <td class="text-center">${maintenanceItem.Cantidad || ''}</td>
          <td class='text-center'>${maintenanceItem.KilometrajeMantenimiento|| ''}</td>
          <td>${maintenanceItem.Estado || ''}</td>
          <td class="actions">
              <button class="btn btn-outline-success btn-sm text-center"
                data-toggle="tooltip"
                data-placement="bottom"
                title="Estado: Completado"
                onclick='cambioEstCop(${JSON.stringify({ foundActivity })})'
                ${maintenanceItem.Estado === 'Completado' ? 'disabled' : ''}>
                <i class="bi bi-check"></i>
              </button>
              <button class="btn btn-outline-primary btn-sm" id="btnEditarMaint" onclick='EditarMant(${JSON.stringify(
          { foundActivity })},${JSON.stringify(maintenanceItem)})' ><i class="bi bi-pencil"></i></button>
        </td>`
          ;
        fragment.appendChild(row);
        
      });

      tableBody.appendChild(fragment);

    } catch (error) {
      showToast('Error','Inesperado')
    }
  }



  function setupDataTable() {

    // Inicializar DataTables
    let table= $("#tableMaintenance").DataTable({
      dom: "<'row'<'col-md-6'l>" +
        "<'row'<'col-md-12't>>" +
        "<'row justify-content-between'<'col-md-6'i><'col-md-6'p>>",
      ordering: false,
      searching: true,
      paging: true,
      pageLength: 25, 
      lengthMenu: [ [25, 50, 100, -1], [25, 50, 100, "Todo"] ],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json",
      },
      caseInsensitive: true,
      smart: true,
    });
     // Maneja el evento keyup del input de búsqueda
   $('#searchMaintenance').on('keyup', function () {
    let inputValue = $(this).val().toLowerCase();
    // Filtra la tabla usando el valor del input
    table.search(inputValue).draw();
  });
  }



  // Función para obtener todos los mantenimientos
  async function getMaintenance() {
    try {
      const Api_Url = "https://backend-transporteccss.onrender.com/";
      const token = localStorage.getItem("token");

      // Obtener datos de mantenimiento
      const mantenimientoResponse = await axios.get(`${Api_Url}api/mantenimiento`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      mantenimientoData = mantenimientoResponse.data.mantenimientos || [];

      // Obtener datos de actividades de mantenimiento
      const actividadesResponse = await axios.get(`${Api_Url}api/actividadMantenimiento`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      actividadesData = actividadesResponse.data.actividadesMantenimiento || [];

      // Obtener todas las actividades
      const actividadesTodo = await axios.get(`${Api_Url}api/actividad`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      actividadesTodoData = actividadesTodo.data.actividades || [];

    } catch (error) {
      handleMaintenanceError(error);
    }
  }

  // Función para configurar eventos de cambio en filtros
  function setupFilterEvents() {
    // Captura el evento de cambio en el campo de fecha
    $('#fechaMantenimientoFiltro').on('change', function () {
      filterMaintenance();
    });

    // Captura el evento de cambio en el campo de unidad
    $('#unidadFiltro').on('change', function () {
      filterMaintenance();
    });
  }

  // Llamada a la función de filtrado
  function filterMaintenance() {
    const selectedDate = $('#fechaMantenimientoFiltro').val();
    const formattedSelectedDate = formatDateSelected(selectedDate);
   

    const selectedUnit = $('#unidadFiltro').val();


    let filteredMaintenance = [];

    if (selectedUnit === 'last20') {
      // Filtrar últimos 20 mantenimientos por fecha
      filteredMaintenance = last20Maintenance.filter(maintenance => {
        const formattedDate = formatDate(maintenance.FechaMantenimiento);
        return formattedSelectedDate ? formattedDate === formattedSelectedDate : true;
      });
    } else {
      // Filtrar todos los mantenimientos por fecha y unidad
      filteredMaintenance = mantenimientoData.filter(maintenance => {
        const formattedDate = formatDate(maintenance.FechaMantenimiento);
        const matchDate = formattedSelectedDate ? formattedDate === formattedSelectedDate : true;
        const matchUnit = selectedUnit && selectedUnit !== 'All' ? maintenance.numeroUnidad === selectedUnit : true;
        return matchDate && matchUnit;
      });
    }

    // Verificar si DataTables ya está inicializado
    if ($.fn.DataTable.isDataTable("#tableMaintenance")) {

      // Destruir la instancia existente
      $("#tableMaintenance").DataTable().clear().destroy();

    }

    // Llenar la tabla con los mantenimientos filtrados
    fillMaintenanceTable(filteredMaintenance, actividadesData, actividadesTodoData);

    // Solo inicializar DataTables si hay datos disponibles

    if (filteredMaintenance.length > 0) {
   
      setupDataTable();
    }
  }



  // Función para formatear la fecha seleccionada al formato DD/MM/AAAA
  function formatDateSelected(selectedDate) {
    if (!selectedDate) return null;

    const parts = selectedDate.split('-');
    if (parts.length !== 3) return null;

    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return formattedDate;
  }

  //Funcion para formatear la fecha
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Ocultar el spinner
  function ocultarSpinner() {
    document.getElementById("spinnerContainer").style.display = "none";
  }

 /*  $(document).ready(function () {
    $('#tipoMantenimiento').on('change', function () {
      kilometrajeType();
    });
  });

  async function kilometrajeType() {
    const tipoMantenimientoSelect = document.getElementById('tipoMantenimiento');
    const kilometrajeInput = document.getElementById('kilometraje');
    const unidadSelect = document.getElementById('unidadSelect').value;
  

    if (tipoMantenimientoSelect.value === 'Correctivo') {
      kilometrajeInput.disabled = true;

      const ultimoKilometraje = await obtenerUltimoKilometraje(unidadSelect);
 
      kilometrajeInput.value = ultimoKilometraje;
    } else {
      kilometrajeInput.disabled = false;
    }
  } 

  async function obtenerUltimoKilometraje(unidad) {
    try {
    
      const unidades = await getUnidades();


      // Convertir el id de la unidad seleccionada a número
      const unidadSeleccionada = unidades.find(u => u.id == unidad);

      return unidadSeleccionada ? unidadSeleccionada.kilometrajeActual : '';
    } catch (error) {
      showToast('Error','Inesperado.')

      return '';
    }
  }
    */

  // Mostrar el modal de mantenimiento luego de agregar actividades
  $(document).on("click", "#btnCloseTask", async function () {
    actividadesLista = [];
    $("#maintenanceModal").modal("show");
    actividadesLista = await getActiv();
 
    activitySelect(actividadesLista);



  });




  //Mostar Actividades/Mantenimiento
  async function getActividades1() {
    try {
      const token = localStorage.getItem("token");
      const API_URL = "https://backend-transporteccss.onrender.com/api/actividadMantenimiento";

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const listAct = response;


    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
       
        showToast("Ups!", errorMessage);
      } else {
        showToast("Error", "Hubo un problema al obtener los manteniminetos");
      }
    }
  }
  // Estado Completado
  window.cambioEstCop = async function (activ) {
    
    try {
      ActividadData = {
        IdMantenimiento: parseInt(activ.foundActivity.IdMantenimiento),
        IdActividad: activ.foundActivity.IdActividad,
        Cantidad: parseInt(activ.foundActivity.Cantidad),
        Estado: "Completado",
      };

      const token = localStorage.getItem("token");
      const API_URL = `https://backend-transporteccss.onrender.com/api/actividadMantenimiento/${activ.foundActivity.IdActividadMantenimiento}`;

      const response = await axios.put(API_URL, ActividadData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
   
      showToast("Exito", "Estado actulizado correctamente.");
      setTimeout(() => {
        loadContent("dataTableMaintenance.html", "mainContent");
      }, 500);
    } catch (error) {
      
      showToast("Error", "No se logro cambiar el estado");
    }
  }





  document
    .getElementById("addActividadBtn")
    .addEventListener("click", async function () {
      addFields(actividadesLista);
     
    });

  async function addFields(actividadesLista) {


    fieldCounter++;
    const container = document.getElementById("actividadesDinamicas");
    const fieldSet = document.createElement("div");
    fieldSet.className = "col-12 mb-3";
    fieldSet.id = `field-set-${fieldCounter}`;
    // Crear las opciones del select dinámicamente
    let optionsHTML = '<option selected disabled value="">Seleccionar</option>';
    actividadesLista.forEach(actividad => {
      optionsHTML += `<option value="${actividad.IdActividad}">${actividad.Descripcion}</option>`;
    });



    fieldSet.innerHTML = `
          <div class="row">
            <div class="col-md-3">
                <label for="activity-${fieldCounter}" class="form-label"><i class="bi bi-list"></i> Actividad:</label>
                <select required id="activity-${fieldCounter}" name="activity" class="form-select" onchange="updateUnidadMedida(${fieldCounter})">
                       ${optionsHTML}
                  </select>
              </div>
              <div class="col-md-3">
                  <label for="unidadMedida-${fieldCounter}" class="form-label"><i class="bi bi-archive"></i> Unidad:</label>
                   <select required id="unidadMedida-${fieldCounter}" name="activity" class="form-select" readonly>    
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
                      <option value="Completado">Completado</option>
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

  window.updateUnidadMedida = function (fieldCounter) {
    const actividadSelect = document.getElementById(`activity-${fieldCounter}`);
    const unidadMedidaSelect = document.getElementById(`unidadMedida-${fieldCounter}`);
    const actividadSeleccionada = actividadSelect.value;

    const actividad = actividadesLista.find(act => act.IdActividad == actividadSeleccionada);

    let opcionesUnidades = '';
    if (actividad) {
      opcionesUnidades += `<option value="${actividad.UnidadMedida}">${actividad.UnidadMedida}</option>`;
    }

    unidadMedidaSelect.innerHTML = opcionesUnidades;
  }

  window.removeFields = function (id) {
    const fieldSet = document.getElementById(`field-set-${id}`);
    fieldSet.remove();
  };

  document
    .querySelector("#maintenancebtn")
    .addEventListener("click", async () => {
      const uniLlenado = await getUnidades();

    
      const unidadSelect = document.querySelector("#unidadSelect");

      // Llenar el select con las opciones de unidad
      unidadSelect.innerHTML =
        '<option selected disabled value="">Seleccionar</option>';
      uniLlenado.forEach((unidad) => {
        const option = document.createElement("option");
        option.value = unidad.id;
        option.textContent = unidad.numeroUnidad;
        unidadSelect.appendChild(option);
      });

      // Añadir el event listener para cambio de selección
      unidadSelect.addEventListener("change", async () => {
        showLoaderModalMant();
        const kilometrajeActualUnidad = document.querySelector("#kilometraje")
      
        document.querySelector("#tipoUnidad").value = '';
        document.querySelector("#chofer").value = '';

        const unidadFiltrda = uniLlenado.find(
          (unidad) => unidad.id === parseInt(unidadSelect.value)
        );
        kilometrajeActualUnidad.value = unidadFiltrda.kilometrajeActual;
        let kilometrajeMantenimiento = document.querySelector('#kilometrajeMantenimiento');


       kilometrajeMantenimiento.addEventListener('blur', function () {
          if (kilometrajeMantenimiento.value === "" || parseInt(kilometrajeMantenimiento.value) < unidadFiltrda.kilometrajeActual) {
            kilometrajeMantenimiento.value = unidadFiltrda.kilometrajeActual;
          }
        });

        document.querySelector("#IdTipoUnidadHidden").value =
          unidadFiltrda.idTipoUnidad;
        document.querySelector("#IdChoferHidden").value =
          unidadFiltrda.choferDesignado;
        const idChofer = parseInt(unidadFiltrda.choferDesignado);
        const idtipoUnidad = parseInt(unidadFiltrda.idTipoUnidad);
        const choferfind = await getChoferNombre(idChofer);
        const obTipoUnidad = await getTipoRecursoNombre(idtipoUnidad);
        nombreCompletoChofer = `${choferfind.nombre} ${choferfind.apellido1} ${choferfind.apellido2}`;
        document.querySelector("#chofer").value = nombreCompletoChofer;
        document.querySelector("#tipoUnidad").value = obTipoUnidad;
        hideLoaderModalMant();
      });

    });

  //Obtener nombre de Tipo unidadd
  async function getTipoRecursoNombre(idtipoUnidad) {
   
    try {
      const token = localStorage.getItem("token");
      const API_URL =
        "https://backend-transporteccss.onrender.com/api/tipounidad";

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
   
      const tiposUnidad = response.data.tipounidad;
      const tiposUnidadFiltrada = tiposUnidad.find(
        (tipounidad) => tipounidad.idTipoUnidad === idtipoUnidad
      );
      return tiposUnidadFiltrada.tipo;
    } catch (error) { }
  }

  //Obtener nombre de chofer
  async function getChoferNombre(idChofer) {
    try {
      const token = localStorage.getItem("token");
      const API_URL = "https://backend-transporteccss.onrender.com/api/chofer";

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const choferes = response.data.choferes;
      const choferFiltrado = choferes.find(
        (chofer) => chofer.idChofer === idChofer
      );

      return choferFiltrado;
    } catch (error) { }
  }

  async function getUnidades() {
    try {
      const token = localStorage.getItem("token");
      const API_URL =
        "https://backend-transporteccss.onrender.com/api/unidades";

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.unidades; // Asumiendo que las unidades están en response.data
    } catch (error) {
      showToast('Error','Inesperado.')
      return []; // Retornar un arreglo vacío en caso de error
    }
  }

  //LLenar Actividades 
  async function getActiv() {
    try {
      const token = localStorage.getItem("token");
      const API_URL =
        "https://backend-transporteccss.onrender.com/api/actividad/";

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.actividades; // Asumiendo que las unidades están en response.data
    } catch (error) {
      showToast('Error','Inesperado.')
      
      return []; // Retornar un arreglo vacío en caso de error
    }
  }
  // Enviar Formulario
  // Manejar el envío del formulario
  document
    .getElementById("saveMaintenance")
    .addEventListener("click", async function () {
      showLoaderModalMant()
      const idChofer = document.querySelector("#IdChoferHidden").value.trim();
      const idUnidad = document.querySelector("#unidadSelect").value.trim();
      const fechaMantenimiento = document.querySelector("#fechaMantenimiento").value.trim();
      const kilometraje = document.querySelector("#kilometraje").value.trim();
      const tipoMantenimiento = document.querySelector("#tipoMantenimiento").value.trim();
      const detalle = document.querySelector("#detalle").value.trim() || "No hay detalle";
      const kilometrajeMantenimiento = document.querySelector("#kilometrajeMantenimiento").value.trim();
      // Recopilar datos del formulario
      const actividades = [];
      for (let i = 1; i <= fieldCounter; i++) {
        const activitySelect = document.getElementById(`activity-${i}`);
        const unidadMedida = document.getElementById(`unidadMedida-${i}`);
        const cantidadInput = document.getElementById(`cantidad-${i}`);
        const estadoSelect = document.getElementById(`estado-${i}`);

        if (activitySelect && unidadSelect && cantidadInput && estadoSelect) {
          actividades.push({
            IdActividad: parseInt(activitySelect.value),
            Cantidad: parseInt(cantidadInput.value.trim()),
            Estado: estadoSelect.value,
          });
        }
      }
      // Verificar si todos los valores necesarios existen y no están vacíos
      if (!idChofer || !idUnidad || !fechaMantenimiento || !kilometraje || !tipoMantenimiento) {
        showToast('', 'Por favor completa todos los campos obligatorios.');
         hideLoaderModalMant();
        return;

      }


      // Construir el objeto mantenimiento
      const mantenimiento = {
        IdChofer: parseInt(idChofer),
        IdUnidad: parseInt(idUnidad),
        FechaMantenimiento: fechaMantenimiento,
        Kilometraje: kilometraje,
        Detalle : detalle,
        TipoMantenimiento: tipoMantenimiento,
        KilometrajeMantenimiento : kilometrajeMantenimiento ,
        actividades: actividades
      };


      try {
        const token = localStorage.getItem("token");
        const API_URL = "https://backend-transporteccss.onrender.com/api/mantenimiento";
        const response = await axios.post(API_URL, mantenimiento, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response) {
          if (mantenimiento.TipoMantenimiento === 'Programado') {
            await ObtenerActualizarunidad(mantenimiento.IdUnidad, mantenimiento.FechaMantenimiento, mantenimiento.KilometrajeMantenimiento);
          }
          showToast("Exito", "Mantenimiento Creado.");
          // Cerrar el modal correctamente usando Bootstrap
          const modalElement = document.querySelector("#maintenanceModal");
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          } else {
            const newModalInstance = new bootstrap.Modal(modalElement);
            newModalInstance.hide();
          }
          hideLoaderModalMant();
          loadContent("dataTableMaintenance.html", "mainContent");


        }


      } catch (error) {
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.error;
         
          showToast("Ups!", errorMessage);
        } else {
          showToast("Error", "Hubo un problema al enviar los datos.");
        
        }
        hideLoaderModalMant();
        // Manejar el error aquí
      }
    });

  //Editar Mantenimiento
  window.EditarMant = async function (activ, maintenanceItem) {
    showLoaderModalMantEdit();
    try {

      // Mostrar el modal de mantenimiento
      $("#maintenanceModalEdit").modal("show");


      // Pasar la lista de actividades correcta a activitySelect
      activitySelect(actividadesTodoData);
      


      document.querySelector('#actividadEdit').addEventListener('change', async () => {
        try {

          const valorSelectAct = document.querySelector('#actividadEdit').value;

          // Obtener el select de unidades
          const selectUnidad = document.querySelector('#unidadMedidaEdit');

          // Limpiar opciones anteriores (si las hay)
          selectUnidad.innerHTML = '';
          // Llenar el select con las opciones de unidades basadas en la actividad seleccionada
          actividadesTodoData.forEach(actividad => {
            if (actividad.IdActividad == valorSelectAct) { // Asegúrate de comparar con la propiedad correcta de actividad
              const option = document.createElement("option");
              option.value = actividad.UnidadMedida;
              option.textContent = actividad.UnidadMedida;
              selectUnidad.appendChild(option);
            }
          });

        } catch (error) {
          showToast('Error','Inesperado.')
         
        }
      });

      document.querySelector('#unidadEditHidden').value = maintenanceItem.IdUnidad;
      document.querySelector('#unidadEdit').value = maintenanceItem.numeroUnidad;
      document.querySelector('#kilometrajeEdit').value = maintenanceItem.Kilometraje;
      document.querySelector('#tipoMantenimientoEdit').value = maintenanceItem.TipoMantenimiento;
      document.querySelector('#fechaMantenimientoEdit').value = maintenanceItem.FechaMantenimiento.substring(0, 10);
      document.querySelector('#detalleEdit').value = maintenanceItem.Detalle;
      document.querySelector('#kilometrajeMantenimientoEdit').value = maintenanceItem.KilometrajeMantenimiento;
      document.querySelector('#actividadEdit').value = activ.foundActivity.IdActividad;
      document.querySelector('#unidadMedidaEdit').value = activ.foundActivity.UnidadMedida;
      document.querySelector('#cantidadEdit').value = activ.foundActivity.Cantidad;
      document.querySelector('#estadoEdit').value = activ.foundActivity.Estado;
      document.querySelector("#IdTipoUnidadHiddenEdit").value = maintenanceItem.TipoUnidad;
      document.querySelector("#IdChoferHiddenEdit").value = maintenanceItem.IdChofer;
      

      // Simular evento de cambio
      const changeEvent1 = new Event("change");
      document.querySelector('#actividadEdit').dispatchEvent(changeEvent1);
      // Obtener las unidades disponibles
      const uniLlenado = await getUnidades();
      let unidadFiltrada = uniLlenado.find(
        (unidad) => unidad.id === parseInt(maintenanceItem.IdUnidad)
      );
      
      // Obtener nombre completo del chofer
      let idChofer = parseInt(unidadFiltrada.choferDesignado);
      let idtipoUnidad = parseInt(unidadFiltrada.idTipoUnidad);
      let choferfind = await getChoferNombre(idChofer);
      let obTipoUnidad = await getTipoRecursoNombre(idtipoUnidad);
      let nombreCompletoChofer = `${choferfind.nombre} ${choferfind.apellido1} ${choferfind.apellido2}`;

      // Mostrar el nombre del chofer y tipo de unidad
      document.querySelector("#choferEdit").value = nombreCompletoChofer;
      document.querySelector("#tipoUnidadEdit").value = obTipoUnidad;

      hideLoaderModalMantEdit();


      //Evento click para guardar cambios
      document.querySelector('#saveMaintenanceEdit').addEventListener('click', async function () {
        try {
          showLoaderModalMantEdit();
          const mantenimientoData = {
            IdChofer: parseInt(document.querySelector("#IdChoferHiddenEdit").value.trim()),
            IdUnidad: parseInt(document.querySelector("#unidadEditHidden").value.trim()),
            FechaMantenimiento: document.querySelector("#fechaMantenimientoEdit").value.trim(),
            Kilometraje: document.querySelector("#kilometrajeEdit").value.trim(),
            KilometrajeMantenimiento: document.querySelector('#kilometrajeMantenimientoEdit').value.trim(),
            Detalle : document.querySelector('#detalleEdit').value.trim() || "No hay Detalle",
            TipoMantenimiento: document.querySelector("#tipoMantenimientoEdit").value.trim(),
          };

          const actividadMantenimientoData = {
            IdMantenimiento: parseInt(maintenanceItem.IdMantenimiento),
            IdActividad: parseInt(document.querySelector('#actividadEdit').value),
            Cantidad: parseInt(document.querySelector('#cantidadEdit').value.trim()),
            Estado: document.querySelector('#estadoEdit').value
          };

     

          const API_URL = `https://backend-transporteccss.onrender.com/api/actividadMantenimiento/${activ.foundActivity.IdActividadMantenimiento}`;
          const API_URL2 = `https://backend-transporteccss.onrender.com/api/mantenimiento/${maintenanceItem.IdMantenimiento}`;
          const token = localStorage.getItem('token');
          const headers = { 'Authorization': `Bearer ${token}` };

          // Make API requests concurrently
          const [response1, response2] = await Promise.all([
            axios.put(API_URL, actividadMantenimientoData, { headers }),
            axios.put(API_URL2, mantenimientoData, { headers })
          ]);


          showToast('Éxito!', 'Mantenimiento actualizado correctamente.');
          $("#maintenanceModalEdit").modal("hide");

          setTimeout(() => {
            loadContent('dataTableMaintenance.html', 'mainContent');
          }, 500);
        } catch (error) {
          handleError(error);
        }
      });

      function handleError(error) {
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.error;
          showToast('Error',errorMessage)
        } else {
          showToast('Error','Inesperado')
         
        }
        hideLoaderModalMantEdit();
      }




    } catch (error) {
      showToast('Error', 'Al cargar los datos de mantenimiento.');
      hideLoaderModalMantEdit()
    }
  }

  //Llenar Select Actividades Editar

  // Llenar Select Actividades Editar
  function activitySelect(actividades) {
    // Verificar si actividades es un array
    if (!Array.isArray(actividades)) {
     
      return;
    }

    // Obtener el select de actividades
    const selectActividad = document.getElementById("actividadEdit");

    // Limpiar opciones anteriores (si las hay)
    selectActividad.innerHTML = '';

    // Crear opción por defecto
    const optionDefault = document.createElement("option");
    optionDefault.value = '';
    optionDefault.textContent = 'Seleccionar';
    selectActividad.appendChild(optionDefault);

    // Llenar el select con las opciones de actividades
    actividades.forEach(actividad => {
      const option = document.createElement("option");
      option.value = actividad.IdActividad;
      option.textContent = actividad.Descripcion;
      selectActividad.appendChild(option);
    });




  }


  //Funcion para validar qu#e la fecha no pueda ser menor a la actual
  document
    .getElementById("fechaMantenimiento")
    .addEventListener("focus", function () {
      var fecha = new Date();
      var anio = fecha.getFullYear();
      var dia = fecha.getDate();
      var mes = fecha.getMonth() + 1; // Los meses empiezan en 0

      if (mes < 10) {
        mes = "0" + mes;
      }

      if (dia < 10) {
        dia = "0" + dia;
      }

      var fechaActual = anio + "-" + mes + "-" + dia;
      this.min = fechaActual;
    });

  // Función para obtener y llenar las unidades en el filtro
  async function getUnidadesFiltro() {
    try {
      const unidades = await getUnidades(); // Utiliza la función existente para obtener unidades
      const unidadFiltroSelect = document.getElementById("unidadFiltro");
      unidadFiltroSelect.innerHTML = '<option value="last20">Últimas 20 Unidades</option>';
      unidadFiltroSelect.innerHTML += '<option value="All">Todas las Unidades</option>';

      unidades.forEach((unidad) => {
        const option = document.createElement("option");
        option.value = unidad.numeroUnidad;
        option.textContent = unidad.numeroUnidad;
        unidadFiltroSelect.appendChild(option);
      });

      // Establecer "Últimas 20 Unidades" como la opción por defecto
      unidadFiltroSelect.value = "last20";
    } catch (error) {
  
      showToast("Ups!", "Hubo un problema al obtener las unidades");
    }
  }

  // Función para manejar errores en la obtención de mantenimientos
  function handleMaintenanceError(error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;

      showToast("Ups!", errorMessage);
    } else {
      showToast("Error", "Hubo un problema al obtener los mantenimientos");
    }
  }

  // Función para formatear la fecha en formato dd/mm/aaaa
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Función para manejar errores en la obtención de mantenimientos
  function handleMaintenanceError(error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
     
      showToast("Ups!", errorMessage);
    } else {
      showToast("Error", "Hubo un problema al obtener los mantenimientos");
    }
  }

  // ACTIVIDADES 
  document.querySelector('#openTask').addEventListener('click', optimazadoactividades());

  async function optimazadoactividades() {
    const actividades = await getActividades();

    if ($.fn.DataTable.isDataTable("#tableActividad")) {
      $("#tableActividad").DataTable().destroy();
    }

    fillActividades(actividades);
    let table = $("#tableActividad").DataTable({

      dom: "<'row justify-content-between'<'col-sm-5'l><'col-sm-5'f>>" +
        "<'row'<'col-sm-12 mt-1't>>" +
        "<'row '<'col-sm-6'i><'col-sm-6'p>>",
      ordering: false,
      searching: true,
      paging: true,
      pageLength: 5,
      lengthMenu: [5, 10, 25, 50],
      pagingType: 'simple_numbers',
      autoWidth: false,
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
      },
      caseInsensitive: true,
      smart: true
    });
    hideLoaderModalAct();

  }
  async function getActividades() {
    try {
      const Api_Url = "https://backend-transporteccss.onrender.com/";
      const token = localStorage.getItem("token");

      const response = await axios.get(`${Api_Url}api/actividad`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const actividades = response.data.actividades || [];


      return actividades;

    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
       
        showToast("Ups!", errorMessage);
      } else {
        showToast("Error", "Hubo un problema al obtener las actividades");
      }
    }

  }

  function fillActividades(actividades) {
    try {
      const tableBody = document.querySelector("#activity-body");

      tableBody.innerHTML = "";
      const fragment = document.createDocumentFragment();

      actividades.forEach((actividad) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td class="text-center">${actividad.IdActividad}</td>
                <td>${actividad.Descripcion}</td>
                <td>${actividad.UnidadMedida}</td>
                <td class="actions">
                    <button class="btn btn-outline-danger btn-sm text-center" onclick="deleteActividad(${actividad.IdActividad})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
        fragment.appendChild(row);
      });

      tableBody.appendChild(fragment);
    } catch (error) {
      showToast('Error','Inesperado.')
    }
  }

  document.querySelector("#saveTask").addEventListener("click", function (event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario
    getActividad();
  });

  //Funcion para obtener los datos de la actividad
  function getActividad() {
    const descripcion = document.querySelector("#tarea").value.trim();
    const unidadMedida = document.querySelector("#unidadMedida").value.trim();

    if (descripcion && unidadMedida) {
      const activityData = {
        Descripcion: descripcion,
        UnidadMedida: unidadMedida,
      };
      addActivity(activityData);
    } else {
      showToast('Por favor','complete todos los campos.')
    }
  }
  //Funcion para agregar una actividad
  async function addActivity(activityData) {
    try {
      const API_URL = "https://backend-transporteccss.onrender.com/api/actividad";
      const token = localStorage.getItem("token");
      const response = await axios.post(API_URL, activityData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
    

      showToast("Actividad agregada", "La actividad se ha agregado correctamente");



      // Limpiar los campos del formulario después de guardar
      limpiarCampos();

      // Recargar la lista de actividades
      showLoaderModalAct();
      optimazadoactividades();
    } catch (error) {
     
      showToast('Error','Inesperado.')
    }
  }

  window.deleteActividad = async function (idActividad) {
    try {
      const token = localStorage.getItem('token');
      const API_URL = `https://backend-transporteccss.onrender.com/api/actividad/${idActividad}`;
      const response = await axios.delete(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      showToast('Éxito', 'Actividad eliminada exitosamente');
      // Recargar la lista de actividades
      showLoaderModalAct();
      optimazadoactividades();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        showToast('Ups!', 'Ocurrio un problema al eliminar la actividad.');
      } else {
        showToast('Ups!', 'Error al eliminar la actividad.');
      }
    }
  }

  // Función para limpiar los campos del formulario
  function limpiarCampos() {
    document.querySelector("#tarea").value = "";
    document.querySelector("#unidadMedida").value = "";
  }

  function prepararDatosUnidad(unidadEncontrada, fechaMantenimiento, kilometrajeActualMantenimiento) {
    // Convertir la fecha a formato ISO
    const dekraDate = convertISOStringToDate(unidadEncontrada.fechaDekra);

    // Preparar los datos de la unidad a actualizar
    const idTipoUnidad = parseInt(unidadEncontrada.idTipoUnidad);
    const idTipoRecurso = parseInt(unidadEncontrada.idTipoRecurso);
    const tipoFrecuenciaCambio = unidadEncontrada.tipoFrecuenciaCambio || null;
    const ultimoMantenimientoFecha = fechaMantenimiento;
    const ultimoMantenimientoKilometraje = parseInt(kilometrajeActualMantenimiento);
    const numeroUnidad = unidadEncontrada.numeroUnidad;
    const choferDesignado = parseInt(unidadEncontrada.choferDesignado);
    const fechaDekra = dekraDate;
    const capacidadTotal = parseInt(unidadEncontrada.capacidadTotal);
    const capacidadCamas = parseInt(unidadEncontrada.capacidadCamas);
    const capacidadSillas = parseInt(unidadEncontrada.capacidadSillas);
    const kilometrajeInicial = parseInt(unidadEncontrada.kilometrajeInicial);
    const kilometrajeActual = parseInt(kilometrajeActualMantenimiento);
    const adelanto = parseInt(unidadEncontrada.adelanto);
    const idEstado = parseInt(unidadEncontrada.idEstado);
    const valorFrecuenciaC = parseInt(unidadEncontrada.valorFrecuenciaC);
    const usuario = parseInt(unidadEncontrada.usuario);

    return {
      idTipoUnidad,
      idTipoRecurso,
      tipoFrecuenciaCambio,
      ultimoMantenimientoFecha,
      ultimoMantenimientoKilometraje,
      numeroUnidad,
      choferDesignado,
      fechaDekra,
      capacidadTotal,
      capacidadCamas,
      capacidadSillas,
      kilometrajeInicial,
      kilometrajeActual,
      adelanto,
      idEstado,
      valorFrecuenciaC,
      usuario
    };
  }

  async function actualizarUnidad(numeroUnidad, unidadData) {
    try {
      const token = localStorage.getItem("token"); // Obtén el token desde el almacenamiento local

      // Hacer la petición PUT para actualizar la unidad
      const response = await axios.put(`https://backend-transporteccss.onrender.com/api/unidades/${numeroUnidad}`, unidadData, {
        headers: {
          Authorization: `Bearer ${token}` // Añadir el token en el encabezado de la petición
        }
      });
    

      // Verificar la respuesta del servidor
      if (response.status !== 200) {
        showToast('Error', 'Error al actualizar la unidad.');
      } 
    } catch (error) {
      // Manejar errores generales
      showToast('Error', 'Error al actualizar la unidad.');
    }
  }

  async function ObtenerActualizarunidad(Idunidad, fechaMantenimiento, kilometrajeActualMantenimiento) {
    try {
      // Obtener la lista de unidades
      const unidadesLista = await getUnidades();

      // Encontrar la unidad correspondiente por ID
      const unidadEncontrada = unidadesLista.find(a => a.id === Idunidad);
      if (!unidadEncontrada) {
        throw new Error(`Unidad con ID ${Idunidad} no encontrada.`);
      }

      // Preparar los datos de la unidad a actualizar
      const unidadData = prepararDatosUnidad(unidadEncontrada, fechaMantenimiento, kilometrajeActualMantenimiento);

    

      // Hacer la solicitud PUT para actualizar la unidad
      await actualizarUnidad(unidadData.numeroUnidad, unidadData);
    } catch (error) {
      // Manejar errores generales
      showToast('Error', 'Error al actualizar la unidad.');
    }
  }
  function convertISOStringToDate(isoString) {
    // Crear una instancia de Date usando el string ISO
    const date = new Date(isoString);

    // Obtener el año, mes y día de la fecha
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const day = String(date.getUTCDate()).padStart(2, '0');

    // Formatear la fecha en 'YYYY-MM-DD'
    return `${year}-${month}-${day}`;
  }

  actividadesLista = await getActiv();

  function showLoaderModalAct() {
    document.querySelector('#loaderModalAct').style.display = 'flex';
  }

  function hideLoaderModalAct() {
    document.querySelector('#loaderModalAct').style.display = 'none';
  }

  function showLoaderModalMant() {
    document.querySelector('#loaderModalMant').style.display = 'flex';
  }

  function hideLoaderModalMant() {
    document.querySelector('#loaderModalMant').style.display = 'none';
  }
  function showLoaderModalMantEdit() {
    document.querySelector('#loaderModalMantEdit').style.display = 'flex';
  }

  function hideLoaderModalMantEdit() {
    document.querySelector('#loaderModalMantEdit').style.display = 'none';
  }

  window.SeeObervation= function(detalle){

    document.querySelector("#bodyObservation").textContent = detalle;
            let myModal = new bootstrap.Modal(document.getElementById('modalobservaciones'));
            myModal.show();
    
    
  }

  //Asginar fecha del sistema en el input date

   // Obtiene la fecha actual
   const today = new Date();
   // Formatea la fecha a YYYY-MM-DD
   const formattedDate = today.toISOString().split('T')[0];
   // Asigna la fecha formateada al valor del campo de fecha
   document.getElementById('fechaMantenimiento').value = formattedDate;

  

 




})();
