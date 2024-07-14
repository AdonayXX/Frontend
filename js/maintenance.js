getMaintenance();
//Obtener los matenimientos
async function getMaintenance() {
  try {
    const Api_Url = "http://localhost:18026/";
    const token = localStorage.getItem("token");

    const mantenimientoResponse = await axios.get(
      `${Api_Url}api/mantenimiento`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const actividadesResponse = await axios.get(
      `${Api_Url}api/actividadMantenimiento`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const actividadesTodo = await axios.get(`${Api_Url}api/actividad`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const mantenimiento = mantenimientoResponse.data.mantenimientos || [];
    const actividades = actividadesResponse.data.actividadesMantenimiento || [];
    const actividadesT = actividadesTodo.data.actividades || [];
    console.log("manteniminento", mantenimiento);
    console.log("actividades", actividades);
    $(document).ready(function () {
      if ($.fn.DataTable.isDataTable("#tableMaintenance")) {
        $("#tableMaintenance").DataTable().destroy();
      }
      fillMaintenance(mantenimiento, actividades, actividadesT);
      let table = $("#tableMaintenance").DataTable({
        dom:
          "<'row'<'col-md-6'l>" +
          "<'row'<'col-md-12't>>" +
          "<'row justify-content-between'<'col-md-6'i><'col-md-6'p>>",
        ordering: false,
        searching: true,
        paging: true,
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json",
        },
        caseInsensitive: true,
        smart: true,
      });
      // Búsqueda por nombre
      $("#searchMaintenance").on("keyup", function () {
        let inputValue = $(this).val().toLowerCase();
        table.search(inputValue).draw();
      });
      $('#searchMaintenanceDate').on('change', function () {
        let fechamaint = $('#searchMaintenanceDate').val();
        $('#tableMaintenance').DataTable().column(2).search(fechamaint).draw();
      });
    });
    ocultarSpinner();
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error("Error específico:", errorMessage);
      showToast("Ups!", errorMessage);
    } else {
      showToast("Error", "Hubo un problema al obtener los manteniminetos");
    }
  }
}

//llenar tabla mantenimiento
function fillMaintenance(mantenimiento, actividades, actividadesT) {
  console.log(actividadesT);
  try {
    const tableBody = document.querySelector("#maintenance-body");

    tableBody.innerHTML = "";
    const fragment = document.createDocumentFragment();

    mantenimiento.forEach((maintenance) => {
      const activ = actividades.filter(
        (actividad) => maintenance.IdMantenimiento === actividad.IdMantenimiento
      );
      let activfind = null;

      actividadesT.some((at) => {
        activfind = activ.find(
          (ac) =>
            ac.IdActividad === at.IdActividad &&
            at.Descripcion === maintenance.Descripcion
        );
        return activfind !== undefined;
      });

      if (activ) {
        const idMantenimiento = maintenance.IdMantenimiento;
        const cantidad = maintenance.Cantidad;
        // Formatear la fecha en formato dd/mm/aaaa
        const formattedDate = formatDate(maintenance.FechaMantenimiento);

        const row = document.createElement("tr");
        row.innerHTML = `
              <tr>
                <td >${maintenance.numeroUnidad}</td>
                <td >${maintenance.TipoUnidad} </td>
                <td >${formattedDate}</td>
                <td class='text-center'>${maintenance.TipoMantenimiento}</td>
                <td class='text-center'>${maintenance.Observacion}</td>
                <td>${maintenance.Descripcion}</td>
               <td class='text-center'>${maintenance.Cantidad}</td>
                <td class='text-center'>${maintenance.UnidadMedida}</td>
                <td class='text-center'>${maintenance.Estado} 
                </td>
                <td class="actions">
                 <button class="btn btn-outline-success btn-sm text-center" 
        data-toggle="tooltip" 
        data-placement="bottom" 
        title="Estado: Completado"  
        onclick='cambioEstCop(${JSON.stringify({ activfind })})'
        ${maintenance.Estado === 'Completado' ? 'disabled' : ''}>
    <i class="bi bi-check"></i>
</button>
              <button class="btn btn-outline-primary btn-sm" id="btnEditarMaint" onclick='EditarMant(${JSON.stringify(
          { activ })},${JSON.stringify(maintenance)})' ><i class="bi bi-pencil"></i></button>

              
              </tr>
            `;
        fragment.appendChild(row);
        if (maintenance.Estado) {

        }
      } else {
        console.log("Ocurrio un error");
      }
    });

    tableBody.appendChild(fragment);
  } catch (error) {
    console.error("There has been a problem:", error);
  }
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

// Mostrar el modal de mantenimiento luego de agregar actividades
$(document).on("click", "#btnCloseTask", function () {
  $("#maintenanceModal").modal("show");
});

document.querySelector("#openTask").addEventListener("click", () => {
  getActividades();
});

//Mostar Actividades
async function getActividades() {
  try {
    const token = localStorage.getItem("token");
    const API_URL = "http://localhost:18026/api/actividadMantenimiento";

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const listAct = response;
    console.log(listAct);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error("Error específico:", errorMessage);
      showToast("Ups!", errorMessage);
    } else {
      showToast("Error", "Hubo un problema al obtener los manteniminetos");
    }
  }
}
// Estado Completado
async function cambioEstCop(activ) {
  console.log(activ);
  try {
    ActividadData = {
      IdMantenimiento: parseInt(activ.activfind.IdMantenimiento),
      IdActividad: activ.activfind.IdActividad,
      Cantidad: parseInt(activ.activfind.Cantidad),
      Estado: "Completado",
    };

    console.log(ActividadData);
    const token = localStorage.getItem("token");
    const API_URL = `http://localhost:18026/api/actividadMantenimiento/${activ.activfind.IdActividadMantenimiento}`;

    const response = await axios.put(API_URL, ActividadData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response);
    showToast("Exito", "Estado actulizado correctamente.");
    getMaintenance();
  } catch (error) {
    console.error(error);
    showToast("Error", "No se logro cambiar el estado");
  }
}


(async function () {
  let fieldCounter = 0;
  const actividadesLista = await getActiv();

  document
    .getElementById("addActividadBtn")
    .addEventListener("click", function () {
      addFields(actividadesLista);
      console.log("Entro");
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

      console.log(uniLlenado);
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
        console.log(uniLlenado);

        const unidadFiltrda = uniLlenado.find(
          (unidad) => unidad.id === parseInt(unidadSelect.value)
        );
        document.querySelector("#kilometraje").value =
          unidadFiltrda.kilometrajeActual;
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
      });
    });

  //Obtener nombre de Tipo unidadd
  async function getTipoRecursoNombre(idtipoUnidad) {
    console.log(idtipoUnidad);
    try {
      const token = localStorage.getItem("token");
      const API_URL =
        "https://backend-transporteccss.onrender.com/api/tipounidad";

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
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
      console.error(error);
      return []; // Retornar un arreglo vacío en caso de error
    }
  }

  //LLenar Actividades 
  async function getActiv() {
    try {
      const token = localStorage.getItem("token");
      const API_URL =
        "http://localhost:18026/api/actividad/";

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.actividades; // Asumiendo que las unidades están en response.data
    } catch (error) {
      console.error(error);
      return []; // Retornar un arreglo vacío en caso de error
    }
  }
  // Enviar Formulario
  // Manejar el envío del formulario
  document
    .getElementById("saveMaintenance")
    .addEventListener("click", async function () {
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
            Estado: estadoSelect.value,
          });
        }
      }

      const mantenimiento = {
        IdChofer: document.querySelector("#IdChoferHidden").value.trim(),
        IdUnidad: parseInt(
          document.querySelector("#unidadSelect").value.trim()
        ),
        FechaMantenimiento: document
          .querySelector("#fechaMantenimiento")
          .value.trim(),
        Kilometraje: document.querySelector("#kilometraje").value.trim(),
        TipoMantenimiento: document
          .querySelector("#tipoMantenimiento")
          .value.trim(),
        Observacion: document.querySelector("#observaciones").value.trim(),
        actividades: actividades,
      };
      console.log(mantenimiento);

      try {
        const token = localStorage.getItem("token");
        const API_URL = "http://localhost:18026/api/mantenimiento";
        const response = await axios.post(API_URL, mantenimiento, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(response.data);
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
        setTimeout(function () {
          loadContent("dataTableMaintenance.html", "mainContent");
        }, 500);
        // Manejar la respuesta del servidor aquí
      } catch (error) {
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.error;
          console.error(error);
          showToast("Ups!", errorMessage);
        } else {
          showToast("Error", "Hubo un problema al enviar los datos.");
          console.error(error);
        }
        // Manejar el error aquí
      }
    });

  window.EditarMant = async function (activ, mantenimiento) {
    try {

      // Mostrar el modal de mantenimiento luego de agregar actividades
      $("#maintenanceModalEdit").modal("show");

      const uniLlenado = await getUnidades();
      console.log(uniLlenado);
      const unidadSelect = document.querySelector("#unidadSelectEdit");

      // Llenar el select con las opciones de unidad
      unidadSelect.innerHTML =
        '<option selected disabled value="">Seleccionar</option>';
      uniLlenado.forEach((unidad) => {
        const option = document.createElement("option");
        option.value = unidad.id;
        option.textContent = unidad.numeroUnidad;
        unidadSelect.appendChild(option);
      });
      // Establecer el valor seleccionado
      unidadSelect.value = mantenimiento.IdUnidad;
      // Simular evento change
      const changeEvent = new Event("change");
      unidadSelect.dispatchEvent(changeEvent);

      // Añadir el event listener para cambio de selección
      unidadSelect.addEventListener("change", async () => {
        console.log(uniLlenado);

        const unidadFiltrda = uniLlenado.find(
          (unidad) => unidad.id === parseInt(unidadSelect.value)
        );
        document.querySelector("#kilometraje").value =
          unidadFiltrda.kilometrajeActual;
        document.querySelector("#IdTipoUnidadHiddenEdit").value =
          unidadFiltrda.idTipoUnidad;
        document.querySelector("#IdChoferHiddenEdit").value =
          unidadFiltrda.choferDesignado;
        const idChofer = parseInt(unidadFiltrda.choferDesignado);
        const idtipoUnidad = parseInt(unidadFiltrda.idTipoUnidad);
        const choferfind = await getChoferNombre(idChofer);
        const obTipoUnidad = await getTipoRecursoNombre(idtipoUnidad);
        nombreCompletoChofer = `${choferfind.nombre} ${choferfind.apellido1} ${choferfind.apellido2}`;
        document.querySelector("#choferEdit").value = nombreCompletoChofer;
        document.querySelector("#tipoUnidadEdit").value = obTipoUnidad;
      });





    } catch (error) {
      console.error(error);

    }
  }

})();

//Funcion para validar que la fecha no pueda ser menor a la actual
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

// Agrega esta función para obtener las unidades y llenar el select
async function getUnidades() {
  try {
    const Api_Url = "https://backend-transporteccss.onrender.com/api/unidades"; // Actualiza la URL de la API según corresponda
    const token = localStorage.getItem("token");

    const unidadesResponse = await axios.get(Api_Url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const unidades = unidadesResponse.data.unidades || [];
    console.log("unidades", unidades);

    const unidadFiltroSelect = document.getElementById("unidadFiltro");
    unidadFiltroSelect.innerHTML = '<option selected disabled value="">Seleccionar</option>';

    unidades.forEach((unidad) => {
      const option = document.createElement("option");
      option.value = unidad.id;
      option.textContent = unidad.numeroUnidad;
      unidadFiltroSelect.appendChild(option);
    });

  } catch (error) {
    console.error("Error al obtener unidades:", error);
    showToast("Ups!", "Hubo un problema al obtener las unidades");
  }
}
getUnidades();

// Función para filtrar la tabla por fecha de mantenimiento
async function filterByFechaMantenimiento(selectedDate) {
  const tableBody = document.querySelector("#maintenance-body");
  const tableRows = tableBody.querySelectorAll("tr");

  let foundMantenimientos = false;

  tableRows.forEach(row => {
    const fechaMantenimientoCell = row.querySelector("td:nth-child(3)"); // Ajusta el selector según la posición de la fecha de mantenimiento en tu tabla
    if (fechaMantenimientoCell) {
      const fechaMantenimiento = fechaMantenimientoCell.textContent.trim();
      console.log("La fecha de la db es", fechaMantenimiento);
      console.log("La fecha seleccionada es", selectedDate);

      // Ajusta el formato de la fecha de la db según el formato de selectedDate (yyyy-mm-dd)
      const formattedFechaMantenimiento = formatDateForComparison(fechaMantenimiento);

      if (formattedFechaMantenimiento === selectedDate) {
        row.style.display = ""; // Muestra la fila si coincide con la fecha seleccionada
        foundMantenimientos = true;
      } else {
        row.style.display = "none"; // Oculta la fila si no coincide con la fecha seleccionada
      }
    }
  });

  if (!foundMantenimientos) {
    showToast("Ups!", "No se encontraron mantenimientos para la fecha indicada");
    getMaintenance(); // Vuelve a cargar todos los mantenimientos
    document.querySelector("#fechaMantenimientoFiltro").value = ""; // Limpia el campo de fecha
  }
}

// Función para formatear la fecha de la db para comparación
function formatDateForComparison(isoDate) {
  const parts = isoDate.split('/');
  if (parts.length === 3) {
    // Formato dd/mm/yyyy
    const year = parts[2];
    const month = parts[1].padStart(2, '0');
    const day = parts[0].padStart(2, '0');
    return `${year}-${month}-${day}`; // Formato yyyy-mm-dd
  }
  return isoDate; // Devuelve tal cual si no se puede formatear
}

// Captura el evento de cambio en el campo de fecha
document.getElementById("fechaMantenimientoFiltro").addEventListener("change", function () {
  const selectedDate = this.value; // Obtén la fecha seleccionada
  filterByFechaMantenimiento(selectedDate); // Llama a la función para filtrar por fecha de mantenimiento
});

// Función para filtrar la tabla por unidad
async function filterByUnidad(selectedUnidad) {
  const tableBody = document.querySelector("#maintenance-body");
  const tableRows = tableBody.querySelectorAll("tr");

  let foundMantenimientos = false;

  tableRows.forEach(row => {
    const unidadCell = row.querySelector("td:nth-child(1)"); // Ajusta el selector según la posición de la unidad en tu tabla
    if (unidadCell) {
      const unidad = unidadCell.textContent.trim();
      console.log("La unidad en la db es", unidad);
      console.log("La unidad seleccionada es", selectedUnidad);

      if (unidad === selectedUnidad) {
        row.style.display = ""; // Muestra la fila si coincide con la unidad seleccionada
        foundMantenimientos = true;
      } else {
        row.style.display = "none"; // Oculta la fila si no coincide con la unidad seleccionada
      }
    }
  });

  if (!foundMantenimientos) {
    showToast("Ups!", "No se encontraron mantenimientos para la unidad indicada");
    getMaintenance(); // Vuelve a cargar todos los mantenimientos si no se encuentran mantenimientos para la unidad seleccionada
  } else {
  }
}

// Captura el evento de cambio en el select de unidad
document.getElementById("unidadFiltro").addEventListener("change", function () {
  const selectedUnidad = this.options[this.selectedIndex].text; // Obtén la unidad seleccionada
  filterByUnidad(selectedUnidad); // Llama a la función para filtrar por unidad
});