async function loadEspecialidades() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/especialidad', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const especialidades = response.data.Especialidad;

        renderTableEspecialidades(especialidades);

        if ($.fn.DataTable.isDataTable('#tableEspecialidades')) {
            $('#tableEspecialidades').DataTable().clear().destroy();
        }

        let table = $('#tableEspecialidades').DataTable({
            dom: "<'row'<'col-sm-6'l>" +
                "<'row'<'col-sm-12't>>" +
                "<'row'<'col-sm-6'i><'col-sm-6'p>>",
            ordering: false,
            searching: true,
            paging: true,
            lengthMenu: [5, 10, 25, 50],
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
            },
            caseInsensitive: true,
            smart: true
        });

        $('#searchEspecialidad').on('keyup', function () {
            let inputValue = $(this).val().toLowerCase();
            table.search(inputValue).draw();
        });

        ocultarSpinner()

    } catch (error) {
        showToast("Error", "Error al obtener las especialidades.")
    }
}

loadEspecialidades();

function renderTableEspecialidades(especialidades) {
    const tableBody = document.getElementById('especialidadesTableBody');
    tableBody.innerHTML = '';

    especialidades.forEach(especialidad => {
        const row = document.createElement('tr');
        const idEspecialidadStr = JSON.stringify(especialidad.idEspecialidad);

        row.innerHTML = `
            <td class="text-center">${especialidad.idEspecialidad}</td>
            <td class="text-center">${especialidad.Especialidad}</td>
            <td>
                <button type="button" class="btn btn-outline-danger btn-sm" onclick='createDeleteModal2(${idEspecialidadStr})'>
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function deleteEspecialidad(idEspecialidad) {
    try {
        const token = localStorage.getItem('token');

        await axios.delete(`https://backend-transporteccss.onrender.com/api/especialidad/${idEspecialidad}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        $('#confirmarEliminarModal2').modal('hide');

        setTimeout(function () {
            loadContent('especialidades.html', 'mainContent');
        }, 1000);
        showToast('¡Éxito!', 'Especialidad eliminada correctamente.');

    } catch (error) {
        showToast('Error', 'No se pudo eliminar la especialidad.');
        $('#confirmarEliminarModal2').modal('hide');
    }
}

function createDeleteModal2(idEspecialidad) {
    const existingModal = document.getElementById('confirmarEliminarModal2');
    if (existingModal) {
        existingModal.remove();
    }

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <div class="modal fade" id="confirmarEliminarModal2" tabindex="-1" aria-labelledby="confirmarEliminarModalLabel"
            aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmarEliminarModalLabel">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ¿Estás seguro de que deseas eliminar esta especialidad?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button"  class="btn btn-danger" id="eliminarEspecialidad" onclick='deleteEspecialidad(${JSON.stringify(idEspecialidad)})'>Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalContainer);

    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal2'));
    modal.show();
}


document.getElementById('BtnGuardarEspe').addEventListener('click', async () => {
    const nuevaEspecialidad = document.getElementById('AgregarEspe').value.trim();

    if (!nuevaEspecialidad) {
        showToast('Error', 'El campo es obligatorio.');
        return;
    }

    try {
        const token = localStorage.getItem('token');

        const response = await axios.get('https://backend-transporteccss.onrender.com/api/especialidad', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const especialidades = response.data.Especialidad;

        const especialidadExistente = especialidades.find(
            especialidad => especialidad.Especialidad.toLowerCase() === nuevaEspecialidad.toLowerCase()
        );

        if (especialidadExistente) {
            showToast('Error', 'La especialidad ya existe.');
            return;
        }

        const especialidadData = {
            Especialidad: nuevaEspecialidad
        };

        await axios.post('https://backend-transporteccss.onrender.com/api/especialidad', especialidadData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        $('#AgregarEspeModal').modal('hide');
        setTimeout(function () {
            loadContent('especialidades.html', 'mainContent');
        }, 1000);
        showToast('¡Éxito!', 'Especialidad agregada correctamente.');

        document.getElementById('AgregarEspe').value = '';

        const modalElement = document.getElementById('AgregarEspeModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);

        modalInstance.hide();

    } catch (error) {
        showToast("Error", "Error al agregar la especialidad.")
    }
});


function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}
