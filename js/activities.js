getActividades();
async function getActividades() {
    try {
        const Api_Url = "http://localhost:18026/";
        const token = localStorage.getItem("token");

        const response = await axios.get(`${Api_Url}api/actividad`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const actividades = response.data.actividades || [];
        console.log("Actividades obtenidas:", actividades);
        fillActividades(actividades);

    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errorMessage = error.response.data.error;
            console.error("Error específico:", errorMessage);
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
                <td>${actividad.IdActividad}</td>
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
        console.error("There has been a problem:", error);
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
        alert("Por favor, complete todos los campos.");
    }
}

//Funcion para agregar una actividad
async function addActivity(activityData) {
    try {
        const API_URL = "http://localhost:18026/api/actividad";
        const token = localStorage.getItem("token");
        const response = await axios.post(API_URL, activityData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        console.log(response.data);
        showToast("Actividad agregada", "La actividad se ha agregado correctamente");

        // Cerrar el modal correctamente usando Bootstrap
        const modalElement = document.querySelector("#saveTask").closest('.modal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }

        // Limpiar los campos del formulario después de guardar
        limpiarCampos();
        
        // Recargar la lista de actividades
        getActividades();
    } catch (error) {
        console.error('Ha ocurrido un problema:', error);
        alert("Ocurrió un problema al agregar la actividad");
    }
}

async function deleteActividad(idActividad) {
    try {
        const token = localStorage.getItem('token');
        const API_URL = `http://localhost:18026/api/actividad/${idActividad}`;
        const response = await axios.delete(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        showToast('Éxito', 'Actividad eliminada exitosamente');

        // Recargar la lista de actividades
        getActividades();
    } catch (error) {
        if (error.response && error.response.status === 400) {
            const errorMessage = error.response.data.error;
            console.error('Error específico:', errorMessage);
            showToast('Ups!', errorMessage);
        } else {
            console.error('There has been a problem deleting the activity:', error);
            showToast('Ups!', 'Error al eliminar la actividad');
        }
    }
}

// Función para limpiar los campos del formulario
function limpiarCampos() {
    document.querySelector("#tarea").value = "";
    document.querySelector("#unidadMedida").value = "";
}