////Funciones para llenar la tabla

//Funcion para obtener los ultimos ATAP
// getLastATAP();
async function getLastATAP() {
    try {
        const API_URL = "http://localhost:18026/";
        const token = localStorage.getItem("token");

        const atapResponse = await axios.get(`${API_URL}, api/mantenimientoATAP/last`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        //obtener el ultimos atap
        lastATAP = atapResponse.data;
        console.log(lastATAP);

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
        // ocultarSpinner();
    } catch (error) {
        console.error(error);
    }
}

async function getAllATAP() {
    try {
        const API_URL = "http://localhost:18026/api/mantenimientoATAP/";
        const token = localStorage.getItem("token");

        // Obtener todos los registros de ATAP
        const atapResponse = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Obtener los datos de ATAP
        const allATAP = atapResponse.data;
        console.log(allATAP);

    } catch (error) {
        console.error(error);
    }
}


// Función para llenar la tabla de Control de Kilometraje
function fillAtapTable(atapData) {
    try {
        const tableBody = document.querySelector("#atap-body");
        tableBody.innerHTML = "";

        if (atapData.length === 0) {
            const noDataMessage = document.createElement("tr");
            noDataMessage.innerHTML = `<td colspan="6" class="text-center">No hay datos disponibles</td>`;
            tableBody.appendChild(noDataMessage);
            return;
        }

        const fragment = document.createDocumentFragment();

        atapData.forEach((atapItem) => {
            // Crear fila HTML
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${atapItem.FechaMantenimiento || ''}</td>
                <td>${atapItem.Chofer || ''}</td>
                <td>${atapItem.Unidad || ''}</td>
                <td class='text-center'>${atapItem.KilometrosSalida || ''}</td>
                <td class='text-center'>${atapItem.KilometrosEntrada || ''}</td>
                <td class='text-center'>${(atapItem.KilometrosEntrada - atapItem.KilometrosSalida) || ''}</td>
                <td class='actions'>
                    <button class='btn btn-outline-primary btn-sm' id='btnEditAtap' onclick='editAtap(${JSON.stringify({ atapItem })})'><i class='bi bi-pencil'></i></button>
                    <button class='btn btn-outline-danger btn-sm' onclick='deleteAtap(${atapItem.Id})'><i class='bi bi-trash'></i></button>
                </td>
            `;

            fragment.appendChild(row);
        });

        tableBody.appendChild(fragment);

    } catch (error) {
        showToastr("Ups!", "Error al llenar la tabla", "Por favor, intenta de nuevo");
        console.error('Error al llenar la tabla:', error);
    }
}

//Funcion para preparar la tabla
function setupDataTable() {
    // Inicializar DataTables
    let table = $("#tableControlKm").DataTable({
        dom: "<'row'<'col-md-6'l>" +
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
    // Maneja el evento keyup del input de búsqueda
    $('#searchATAP').on('keyup', function () {
        let inputValue = $(this).val().toLowerCase();
        // Filtra la tabla usando el valor del input
        table.search(inputValue).draw();
    });
}


/////FUNCIONALIDADES

//Funcion para preparar los filtros
// setupFilterEvents();
function setupFilterEvents() {
    // Captura el evento de cambio en el campo de fecha
    $('#fechaMantenimientoFiltro').on('change', function () {
        filterATAP();
    });

    // Captura el evento de cambio en el campo de unidad
    $('#unidadFiltro').on('change', function () {
        filterATAP();
    });
}

//Funcion para filtrar los ATAP
function filterATAP() {
    const selectedDate = $('#fechaMantenimientoFiltro').val();
    const selectedUnit = $('#unidadFiltro').val();

    // Filtrar los datos de ATAP
    let filteredATAP = lastATAP.filter(atap => {
        const matchDate = selectedDate ? atap.FechaMantenimiento === formatDate(selectedDate) : true;
        const matchUnit = selectedUnit && selectedUnit !== '' ? atap.IdUnidad === selectedUnit : true;
        return matchDate && matchUnit;
    });

    // Verificar si DataTables ya está inicializado
    if ($.fn.DataTable.isDataTable("#tableControlKm")) {
        // Destruir la instancia existente
        $("#tableControlKm").DataTable().clear().destroy();
    }

    // Llenar la tabla con los datos filtrados
    fillAtapTable(filteredATAP);

    // Solo inicializar DataTables si hay datos disponibles
    if (filteredATAP.length > 0) {
        setupDataTable();
    }
}

// Función para formatear la fecha
function formatDate(date) {
    const d = new Date(date + 'T00:00:00');
    let month = '' + (d.getUTCMonth() + 1);
    let day = '' + d.getUTCDate();
    const year = d.getUTCFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

//Función para obtener las unidades
async function getUnidades() {
    try {
        const token = localStorage.getItem("token");
        const API_URL = "https://backend-transporteccss.onrender.com/api/unidades";

        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.unidades; // Asumiendo que las unidades están en response.data
    } catch (error) {
        showToast('Error', 'Inesperado.');
        return []; // Retornar un arreglo vacío en caso de error
    }
}

//Función para obtener y llenar las unidades en el filtro
getUnidadesFiltro();
async function getUnidadesFiltro() {
    try {
        const unidades = await getUnidades(); // Utiliza la función existente para obtener unidades
        const unidadFiltroSelect = document.getElementById("unidadFiltro");

        // Limpia las opciones existentes
        unidadFiltroSelect.innerHTML = '<option value="" selected disabled>Seleccionar Unidad</option>';

        // Agrega opciones predefinidas
        unidadFiltroSelect.innerHTML += '<option value="last20">Últimas 20 Unidades</option>';
        unidadFiltroSelect.innerHTML += '<option value="All">Todas las Unidades</option>';

        // Filtra las unidades para mostrar solo las de tipo 3 (Motos)
        const unidadesMotos = unidades.filter(unidad => unidad.idTipoUnidad === 3); // Ajusta la propiedad según tu estructura de datos
        console.log(unidadesMotos);

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
// function ocultarSpinner() {
//     document.getElementById("spinnerContainer").style.display = "none";
// }