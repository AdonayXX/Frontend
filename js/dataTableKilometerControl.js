(async function () {
  //LLamadas a las funciones
  getLastATAP();
  getAllATAP();
  setupFilterEvents();
  getUnidadesFiltro();

  ////Funciones para llenar la tabla
  let lastATAP = { mantenimientos: [] };
  let allATAP = { mantenimientos: [] };

  //Funcion para obtener los ultimos ATAP
  async function getLastATAP() {
    try {
      const API_URL = "http://localhost:18026/";
      const token = localStorage.getItem("token");

      const atapResponse = await axios.get(
        `${API_URL}api/mantenimientoATAP/last`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      //obtener el ultimos atap
      lastATAP = atapResponse.data;

      // Destruir la instancia existente de DataTables
      if ($.fn.DataTable.isDataTable("#tableControlKm")) {
        $("#tableControlKm").DataTable().destroy();
      }

      // Vaciar el cuerpo de la tabla
      $("#atap-body").empty();
      // Llenar la tabla de mantenimientos con los últimos 20
      fillAtapTable(lastATAP);

      // Configurar DataTables y eventos de cambio
      setupDataTable();
      ocultarSpinner();
    } catch (error) {
      showToast("Error", "Inesperado.");
    }
  }

  // Función para obtener todos los ATAP
  async function getAllATAP() {
    try {
      const API_URL = "http://localhost:18026/api/mantenimientoATAP/";
      const token = localStorage.getItem("token");

      // Obtener todos los registros de ATAP
      const atapResponse = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Actualizar la variable global allATAP
      allATAP = atapResponse.data;
    } catch (error) {
      showToast("Error", "Inesperado.");
    }
  }

  // Función para llenar la tabla de Control de Kilometraje
  function fillAtapTable(atapData) {
    try {
      const tableBody = document.querySelector("#atap-body");
      tableBody.innerHTML = "";

      // Verificar si atapData tiene la propiedad mantenimientos y es un arreglo
      if (!atapData.mantenimientos || atapData.mantenimientos.length === 0) {
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML = `<td colspan="7" class="text-center">No hay datos disponibles</td>`;
        tableBody.appendChild(noDataMessage);
        return;
      }

      const fragment = document.createDocumentFragment();

      atapData.mantenimientos.forEach((atapItem) => {
        // Crear fila HTML
        const row = document.createElement("tr");

        row.innerHTML = `
                 <td>${atapItem.IdMantenimientoATAP || ""}</td>
                <td>${formatDateBd(atapItem.FechaMantenimiento) || ""}</td>
                <td>${atapItem.NombreChofer || ""}</td>
                <td>${atapItem.numeroUnidad || ""}</td>
                <td class='text-center'>${atapItem.KilometrosSalida || ""}</td>
                <td class='text-center'>${atapItem.KilometrosEntrada || ""}</td>
                <td class='text-center'>${
                  atapItem.KilometrosEntrada - atapItem.KilometrosSalida || ""
                }</td>
                  <td class='text-center'>${atapItem.LugarVisitado || ""}</td>
                <td class='actions'>
                    <button class='btn btn-outline-primary btn-sm' id='btnEditAtap' onclick='editAtap(${JSON.stringify(
                      atapItem
                    )})'><i class='bi bi-pencil'></i></button>
                    <button class='btn btn-outline-danger btn-sm' onclick='deleteAtap(${JSON.stringify(
                      atapItem
                    )})'><i class='bi bi-trash'></i></button>
                </td>
            `;

        fragment.appendChild(row);
      });

      tableBody.appendChild(fragment);
    } catch (error) {
      showToast(
        "Ups!",
        "Error al llenar la tabla",
        "Por favor, intenta de nuevo"
      );
    }
  }

  //Funcion para preparar la tabla
  function setupDataTable() {
    // Inicializar DataTables
    let table = $("#tableControlKm").DataTable({
      dom:
        "<'row'<'col-md-6'l>" +
        "<'row'<'col-md-12't>>" +
        "<'row justify-content-between'<'col-md-6'i><'col-md-6'p>>",
      ordering: false,
      searching: true,
      paging: true,
      pageLength: 25,
      lengthMenu: [
        [25, 50, 100, -1],
        [25, 50, 100, "Todo"],
      ],
      language: {
        url: "./assets/json/Spanish.json",
      },
      caseInsensitive: true,
      smart: true,
    });
    // Maneja el evento keyup del input de búsqueda
    $("#searchATAP").on("keyup", function () {
      let inputValue = $(this).val().toLowerCase();
      // Filtra la tabla usando el valor del input
      table.search(inputValue).draw();
    });
  }

  // Función principal para editar ATAP
  window.editAtap = function (atapItem) {
    showEditModal(atapItem);
    addKilometrajeBlurEvents(atapItem);

    document
      .querySelector("#saveAtapEdit")
      .addEventListener("click", function () {
        saveAtapChanges(atapItem);
      });
  };

  // Función para mostrar el modal y rellenar los campos
  function showEditModal(atapItem) {
    // Llenar los campos del modal
    fillModalFields(atapItem);

    // Manejar la visualización del lugar visitado
    handleLugarVisitado(atapItem);

    // Configurar el listener del select después de mostrar el modal
    setupLugarVisitadoListener();
  }

  // Función para agregar eventos de validación de kilometraje
  function addKilometrajeBlurEvents(atapItem) {
    document
      .querySelector("#KilometrosEntradaEdit")
      .addEventListener("blur", function () {
        const kmSValue = parseInt(
          document.querySelector("#KilometrosSalidaEdit").value
        );
        const kmEValue = parseInt(this.value);

        if (isNaN(kmEValue) || kmEValue < kmSValue) {
          this.value = atapItem.KilometrosEntrada;
          document.querySelector("#KilometrosRecorridosEdit").value =
            atapItem.KilometrosRecorridos;
          showToast(
            "Kilometraje Entrada",
            "No puede ser menor al Kilometraje Salida."
          );
        } else {
          document.querySelector("#KilometrosRecorridosEdit").value =
            kmEValue - kmSValue;
        }
      });

    document
      .querySelector("#KilometrosSalidaEdit")
      .addEventListener("blur", function () {
        const kmSValue = parseInt(this.value);
        const kmEValue = parseInt(
          document.querySelector("#KilometrosEntradaEdit").value
        );

        if (isNaN(kmSValue) || kmSValue > kmEValue) {
          this.value = atapItem.KilometrosSalida;
          document.querySelector("#KilometrosRecorridosEdit").value =
            atapItem.KilometrosRecorridos;
          showToast(
            "Kilometraje Salida",
            "No puede ser mayor al Kilometraje Entrada."
          );
        } else {
          document.querySelector("#KilometrosRecorridosEdit").value =
            kmEValue - kmSValue;
        }
      });
  }

  function fillModalFields(atapItem) {
    // Mostrar el modal
    $("#atapModalEdit").modal("show");

    // Rellenar campos del modal
    document.querySelector("#IdUnidadEdit").value = atapItem.numeroUnidad;
    document.querySelector("#IdChoferEdit").value = atapItem.NombreChofer;
    document.querySelector("#KilometrosSalidaEdit").value =
      atapItem.KilometrosSalida;
    document.querySelector("#KilometrosEntradaEdit").value =
      atapItem.KilometrosEntrada;
    document.querySelector("#KilometrosRecorridosEdit").value =
      atapItem.KilometrosRecorridos;
    document.querySelector("#FechaMantenimientoEdit").value =
      atapItem.FechaMantenimiento.substring(0, 10);
  }

  function handleLugarVisitado(atapItem) {
    // Obtener el select y el input de lugar visitado
    const lugarVisitadoSelect = document.querySelector("#LugarVisitadoSelect");
    const lugarVisitadoInput = document.querySelector("#LugarVisitadoInput");

    // Verificar si el lugar visitado está en las opciones del select
    let optionExists = false;
    for (let option of lugarVisitadoSelect.options) {
      if (option.value === atapItem.LugarVisitado) {
        optionExists = true;
        break;
      }
    }

    if (optionExists) {
      // Si el lugar está en las opciones, seleccionarlo
      lugarVisitadoSelect.value = atapItem.LugarVisitado;
      lugarVisitadoSelect.style.display = "block"; // Mostrar el select
      lugarVisitadoInput.style.display = "none"; // Ocultar el input
    } else {
      // Si el lugar no está en las opciones, seleccionar "Otro" y mostrar el input
      lugarVisitadoSelect.value = "Otro";
      lugarVisitadoSelect.style.display = "block"; // Mostrar el select
      lugarVisitadoInput.style.display = "block"; // Mostrar el input
      lugarVisitadoInput.value = atapItem.LugarVisitado; // Cargar el valor en el input
    }
  }

  // Manejador de eventos para el select de lugar visitado
  function setupLugarVisitadoListener() {
    const lugarVisitadoSelect = document.getElementById("LugarVisitadoSelect");
    const lugarVisitadoInput = document.getElementById("LugarVisitadoInput");

    lugarVisitadoSelect.addEventListener("change", function () {
      if (lugarVisitadoSelect.value === "Otro") {
        lugarVisitadoInput.style.display = "block";
        lugarVisitadoInput.required = true; // Hacer el input requerido
      } else {
        lugarVisitadoInput.style.display = "none";
        lugarVisitadoInput.required = false; // Hacer el input no requerido
        lugarVisitadoInput.value = ""; // Limpiar el valor del input
      }
    });
  }

  // Función para guardar cambios
  async function saveAtapChanges(atapItem) {
    try {
      showLoaderModalAtapEdit();

      const atapData = {
        IdChofer: parseInt(atapItem.IdChofer),
        IdUnidad: parseInt(atapItem.IdUnidad),
        FechaMantenimiento: document
          .querySelector("#FechaMantenimientoEdit")
          .value.trim(),
        KilometrosSalida: parseInt(
          document.querySelector("#KilometrosSalidaEdit").value.trim()
        ),
        KilometrosEntrada: parseInt(
          document.querySelector("#KilometrosEntradaEdit").value.trim()
        ),
        LugarVisitado: document
          .querySelector("#LugarVisitadoSelect")
          .value.trim(),
      };

      if (
        isNaN(atapData.IdChofer) ||
        isNaN(atapData.IdUnidad) ||
        !atapData.FechaMantenimiento ||
        isNaN(atapData.KilometrosEntrada) ||
        isNaN(atapData.KilometrosSalida) ||
        !atapData.LugarVisitado
      ) {
        showToast("Ups!", "Por favor llene todos los campos");
        hideLoaderModalAtapEdit();
        return;
      }

      if (atapData.KilometrosEntrada < atapData.KilometrosSalida) {
        showToast(
          "Error",
          "Los kilómetros de entrada no pueden ser menores que los kilómetros de salida"
        );
        hideLoaderModalAtapEdit();
        return;
      }

      const API_URL = `http://localhost:18026/api/mantenimientoATAP/${atapItem.IdMantenimientoATAP}`;
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.put(API_URL, atapData, { headers });

      showToast("Éxito!", "Actualizado correctamente.");
      $("#atapModalEdit").modal("hide");
      loadContent("dataTablekilometerControl.html", "mainContent");
    } catch (error) {
      showToast("Error", "Ocurrió un error al actualizar.");
    } finally {
      hideLoaderModalAtapEdit();
    }
  }

  // Función para eliminar un mantenimiento ATAP
  window.deleteAtap = async function (atapItem) {
    let modal = new bootstrap.Modal(
      document.getElementById("confirmDeleteControlKm"),
      {
        backdrop: "static",
        keyboard: false,
      }
    );
    let bodyConfirm = document.querySelector("#bodyDeleteControlKm");

    bodyConfirm.innerHTML = `
          <p> <strong> Registro #:</strong>  ${atapItem.IdMantenimientoATAP}</p>
          <p> <strong> Número Placa:</strong>  ${atapItem.numeroUnidad}</p>
            <p>¿Estás seguro de que deseas eliminar este registro?</p>
        `;

    modal.show();

    let confirmBtn = document.getElementById("confirmDeleteBtnPermission");

    confirmBtn.onclick = function () {
      deleteControlKm(atapItem.IdMantenimientoATAP);

      modal.hide();
    };

    //Delete control km

    async function deleteControlKm(idMantenimiento) {
      try {
        const token = localStorage.getItem("token");
        const API_URL = `http://localhost:18026/api/mantenimientoATAP/${idMantenimiento}`;
        const response = await axios.delete(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showToast("Éxito", "Eliminado exitosamente");
        // Recargar la tabla de mantenimientos
        loadContent("dataTablekilometerControl.html", "mainContent");
      } catch (error) {
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.error;
          showToast("Ups!", errorMessage || "Ocurrió un problema al eliminar.");
        } else {
          showToast("Ups!", "Error al elimina.");
        }
      }
    }
  };

  /////FUNCIONALIDADES

  //Funcion para preparar los filtros
  function setupFilterEvents() {
    // Captura el evento de cambio en el campo de fecha
    $("#fechaMantenimientoFiltro").on("change", function () {
      filterATAP();
    });

    // Captura el evento de cambio en el campo de unidad
    $("#unidadFiltro").on("change", function () {
      filterATAP();
    });
  }

  // Función para filtrar los ATAP
  async function filterATAP() {
    const selectedDate = $("#fechaMantenimientoFiltro").val();
    const formattedSelectedDate = formatDateSelected(selectedDate);
    const selectedUnit = $("#unidadFiltro").val();
    let filteredATAP = [];

    if (selectedUnit === "last20") {
      // Filtrar últimos 20 mantenimientos por fecha
      filteredATAP = lastATAP.mantenimientos.filter((atap) => {
        const formattedDate = formatDate(atap.FechaMantenimiento);
        return formattedSelectedDate
          ? formattedDate === formattedSelectedDate
          : true;
      });
    } else if (selectedUnit === "All") {
      // Filtrar todos los mantenimientos por fecha
      filteredATAP = allATAP.mantenimientos.filter((atap) => {
        const formattedDate = formatDate(atap.FechaMantenimiento);
        return formattedSelectedDate
          ? formattedDate === formattedSelectedDate
          : true;
      });
    } else {
      // Filtrar todos los mantenimientos por fecha y unidad específica
      const selectedUnitNumber = Number(selectedUnit); // Convertir selectedUnit a número
      filteredATAP = allATAP.mantenimientos.filter((atap) => {
        const formattedDate = formatDate(atap.FechaMantenimiento);
        const matchDate = formattedSelectedDate
          ? formattedDate === formattedSelectedDate
          : true;
        const matchUnit = selectedUnitNumber
          ? atap.IdUnidad === selectedUnitNumber
          : true;
        return matchDate && matchUnit;
      });
    }

    // Verificar si DataTables ya está inicializado
    if ($.fn.DataTable.isDataTable("#tableControlKm")) {
      // Destruir la instancia existente
      $("#tableControlKm").DataTable().clear().destroy();
    }

    // Llenar la tabla con los mantenimientos filtrados
    fillAtapTable({ mantenimientos: filteredATAP });

    // Solo inicializar DataTables si hay datos disponibles
    if (filteredATAP.length > 0) {
      setupDataTable();
    }
  }

  // Función para formatear la fecha seleccionada al formato DD/MM/AAAA
  function formatDateSelected(selectedDate) {
    if (!selectedDate) return null;
    const parts = selectedDate.split("-");
    if (parts.length !== 3) return null;
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return formattedDate;
  }

  // Función para formatear la fecha
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  //Función para formatear la fecha
  function formatDateBd(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  //Función para obtener las unidades
  async function getUnidades() {
    try {
      const token = localStorage.getItem("token");
      const API_URL = "http://localhost:18026/api/unidades";

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.unidades; // Asumiendo que las unidades están en response.data
    } catch (error) {
      showToast("Error", "Inesperado.");
      return []; // Retornar un arreglo vacío en caso de error
    }
  }

  //Función para obtener y llenar las unidades en el filtro
  async function getUnidadesFiltro() {
    try {
      const unidades = await getUnidades(); // Utiliza la función existente para obtener unidades
      const unidadFiltroSelect = document.getElementById("unidadFiltro");

      // Agrega opciones predefinidas
      unidadFiltroSelect.innerHTML =
        '<option value="last20">Últimas 20 Unidades</option>';
      unidadFiltroSelect.innerHTML +=
        '<option value="All">Todas las Unidades</option>';

      // Filtra las unidades para mostrar solo las de tipo 3 (Motos)
      const unidadesMotos = unidades.filter(
        (unidad) => unidad.idTipoUnidad === 3
      ); // Ajusta la propiedad según tu estructura de datos

      // Agrega las opciones filtradas de la API
      unidadesMotos.forEach((unidad) => {
        const option = document.createElement("option");
        option.value = unidad.id; // Ajusta según la estructura de tu unidad
        option.textContent = unidad.numeroUnidad; // Ajusta según la estructura de tu unidad
        unidadFiltroSelect.appendChild(option);
      });

      // Establecer "Últimas 20 Unidades" como la opción por defecto
      unidadFiltroSelect.value = "last20";
    } catch (error) {
      showToast("Ups!", "Hubo un problema al obtener las unidades");
    }
  }

  // Ocultar el spinner
  function ocultarSpinner() {
    document.getElementById("spinnerContainer").style.display = "none";
  }

  function showLoaderModalAtapEdit() {
    document.querySelector("#loaderModalAtapEdit").style.display = "flex";
  }

  function hideLoaderModalAtapEdit() {
    document.querySelector("#loaderModalAtapEdit").style.display = "none";
  }
})();
