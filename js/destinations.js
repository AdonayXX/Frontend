async function loadDestinations() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/rutas', {

            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const destinos = response.data;
        const select = document.getElementById('select-destinos');

        destinos.forEach(destino => {
            const option = document.createElement('option');
            option.value = destino.IdRuta;
            option.textContent = destino.Descripcion;
            select.appendChild(option);
        });

        ocultarSpinner()

    } catch (error) {
        showToast("Error", "Error al obtener los destinos.")

    }
}

loadDestinations();

async function loadEspecialidades() {
    let especialidadesMarcadasInicial = [];

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

        $('#tableEspecialidades').DataTable({
            dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                "<'row'<'col-sm-12't>>" +
                "<'row'<'col-sm-12'p>>",
            ordering: false,
            searching: true,
            paging: true,
            pageLength: 5,
            lengthMenu: [5, 10],
            pagingType: 'simple_numbers',
            autoWidth: false,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json',
                paginate: {
                    previous: 'Anterior',
                    next: 'Siguiente',
                },
                info: ''
            },
            caseInsensitive: true,
            smart: true,
        });

        $('#buscarEspecialidad').on('keyup', function () {
            let inputValue = $(this).val().toLowerCase();
            $('#tableEspecialidades').DataTable().search(inputValue).draw();
        });

        document.querySelectorAll('#espe input[type="checkbox"]').forEach(checkbox => {
            checkbox.disabled = true;
        });

        document.querySelectorAll('#espe .btn-outline-danger').forEach(deleteBtn => {
            deleteBtn.disabled = true;
        });

        const handleSelectDestinosChange = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://backend-transporteccss.onrender.com/api/rutaEspecialidad', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const rutas = response.data;
                const response2 = await axios.get('https://backend-transporteccss.onrender.com/api/especialidad', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const especialidades = response2.data.Especialidad;

                const selectedRutaId = document.querySelector("#select-destinos").value;
                const selectedRuta = rutas.find(ruta => ruta.IdRuta === selectedRutaId);

                if (!selectedRuta || selectedRuta.Especialidades.length === 0) {
                    especialidadesMarcadasInicial = [];
                    document.querySelectorAll('#espe input[type="checkbox"]').forEach(checkbox => {
                        checkbox.checked = false;
                        checkbox.disabled = false;
                    });

                    document.querySelectorAll('#espe .btn-outline-danger').forEach(deleteBtn => {
                        deleteBtn.disabled = true;
                    });

                    return;
                }

                const especialidadesArray = selectedRuta.Especialidades.map(especialidad => especialidad.Especialidad);
                let espeEncontrada = [];

                especialidadesArray.forEach(espe => {
                    const found = especialidades.find(a => a.Especialidad === espe);
                    if (found) {
                        espeEncontrada.push(found);
                    }
                });

                especialidadesMarcadasInicial = espeEncontrada.map(especialidad => especialidad.idEspecialidad);
                renderTableEspecialidades(especialidades, especialidadesMarcadasInicial);

                document.querySelectorAll('#espe input[type="checkbox"]').forEach(checkbox => {
                    const idEspecialidad = parseInt(checkbox.dataset.id);

                    checkbox.disabled = false;

                    if (especialidadesMarcadasInicial.includes(idEspecialidad)) {
                        checkbox.checked = true;
                        checkbox.disabled = true;
                    } else {
                        checkbox.checked = false;
                    }
                });

                document.querySelectorAll('#espe tr').forEach(row => {
                    const checkbox = row.querySelector('input[type="checkbox"]');
                    const deleteBtn = row.querySelector('.btn-outline-danger');
                    if (checkbox && deleteBtn) {
                        deleteBtn.disabled = !especialidadesMarcadasInicial.includes(parseInt(checkbox.dataset.id));
                    }
                });

                document.querySelectorAll('#espe input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', function () {
                        const deleteBtn = this.closest('tr').querySelector('.btn-outline-danger');
                        const idEspecialidad = parseInt(this.dataset.id);
                        deleteBtn.disabled = !especialidadesMarcadasInicial.includes(idEspecialidad);
                    });
                });

            } catch (error) {
                showToast("Error", "Error al obtener las especialidades del destino.");
            }
        };

        document.querySelector("#select-destinos").addEventListener('change', handleSelectDestinosChange);

        const handleBtnGuardar2Click = async () => {
            const rutaSeleccionada = document.getElementById('select-destinos').value.trim();
            const especialidadesSeleccionadas = [];

            if (!rutaSeleccionada) {
                showToast('Error', 'Debes seleccionar un destino antes de asignar una especialidad.');
                return;
            }

            document.querySelectorAll('#espe input[type="checkbox"]:checked').forEach(checkbox => {
                const idEspecialidad = parseInt(checkbox.dataset.id);

                if (!especialidadesMarcadasInicial.includes(idEspecialidad)) {
                    especialidadesSeleccionadas.push(idEspecialidad);
                }
            });

            if (especialidadesSeleccionadas.length === 0) {
                showToast('Error', 'Debes seleccionar al menos una especialidad.');
                return;
            }

            try {
                const data = {
                    idRuta: rutaSeleccionada,
                    especialidades: especialidadesSeleccionadas
                };

                const token = localStorage.getItem('token');

                await axios.post('https://backend-transporteccss.onrender.com/api/rutaEspecialidad', data, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                showToast('¡Éxito!', 'Especialidades asignadas correctamente.');
                setTimeout(function () {
                    loadContent('formUbi.html', 'mainContent');
                }, 1400);

            } catch (error) {
                showToast('Error', 'No se pudo asignar las especialidades.');
            }
        };

        document.getElementById('BtnGuardar2').addEventListener('click', handleBtnGuardar2Click);

        ocultarSpinner();

    } catch (error) {
        showToast("Error", "Error al obtener las especialidades.");
    }
}

loadEspecialidades();

document.getElementById('BtnGuardarUbi').addEventListener('click', async () => {
    const nuevaUbicacion = document.getElementById('AgregarUbi').value.trim();
    const nuevaAbreviacion = document.getElementById('AgregarAbre').value.trim();
    const apiUrl = 'https://backend-transporteccss.onrender.com/api/rutas';

    if (!nuevaUbicacion || !nuevaAbreviacion) {
        showToast('Error', 'Ambos campos son obligatorios.');
        return;
    }

    try {
        const response = await axios.get(apiUrl);
        const ubicaciones = response.data;

        const ubicacionExistente = ubicaciones.find(ubi =>
            ubi.Descripcion === nuevaUbicacion || ubi.IdRuta === nuevaAbreviacion
        );

        if (!ubicacionExistente) {
            await axios.post(apiUrl, {
                IdRuta: nuevaAbreviacion,
                Descripcion: nuevaUbicacion
            });

            $('#AgregarUbiModal').modal('hide');
            setTimeout(function () {
                loadContent('formUbi.html', 'mainContent');
            }, 1400);

            showToast('¡Éxitos!', 'Ubicación agregada correctamente.');

            document.getElementById('AgregarUbi').value = '';
            document.getElementById('AgregarAbre').value = '';

            const modalElement = document.getElementById('AgregarUbiModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        } else {

            showToast('Error', 'La ubicación ya existe.');
        }
    } catch (error) {
        showToast('Error', 'Error al agregar la ubicación.');
    }
});

function renderTableDestinations(ubicaciones) {
    const tableBody = document.getElementById('destinosTableBody');
    tableBody.innerHTML = '';

    ubicaciones.forEach(ubicacion => {
        const row = document.createElement('tr');
        const idDestinoStr = JSON.stringify(ubicacion.IdRuta);

        row.innerHTML = `
            <td class="text-center">${ubicacion.IdRuta}</td>
            <td class="text-center">${ubicacion.Descripcion}</td>
            <td>
                <button type="button" class="btn btn-outline-danger btn-sm" onclick='createDeleteModal(${idDestinoStr})'>
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderTableEspecialidades(especialidades, especialidadesMarcadasInicial = []) {
    const tableBody = document.getElementById('espe');
    tableBody.innerHTML = '';

    especialidades.sort((a, b) => {
        const aMarcada = especialidadesMarcadasInicial.includes(a.idEspecialidad);
        const bMarcada = especialidadesMarcadasInicial.includes(b.idEspecialidad);
        return bMarcada - aMarcada;
    });

    especialidades.forEach(especialidad => {

        const row = document.createElement('tr');
        const idEspecialidadStr = JSON.stringify(especialidad.idEspecialidad);

        const checked = especialidadesMarcadasInicial.includes(especialidad.idEspecialidad) ? 'checked' : '';
        const disabled = checked ? '' : 'disabled';

        row.innerHTML = `
            <td class="text-center"><input type="checkbox" data-id="${especialidad.idEspecialidad}" ${checked} onchange="toggleDeleteButton(this)"></td>
            <td class="text-center">${especialidad.Especialidad}</td>
            <td>
                <button type="button" class="btn btn-outline-danger btn-sm" id="deletebtn" onclick='createDeleteModal2(${idEspecialidadStr})' ${disabled}>
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function toggleDeleteButton(checkbox) {
    const deleteButton = checkbox.closest('tr').querySelector('.btn-outline-danger');
    if (checkbox.checked) {
        deleteButton.disabled = false;
    } else {
        deleteButton.disabled = true;
    }
}

async function loadDestinations2() {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get('https://backend-transporteccss.onrender.com/api/rutas', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const destinos = response.data;
        renderTableDestinations(destinos);

        if ($.fn.DataTable.isDataTable('#TableDestinations')) {
            $('#TableDestinations').DataTable().clear().destroy();
        }

        let table = $('#TableDestinations').DataTable({
            dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                "<'row'<'col-sm-12't>>" +
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

        $('#buscarDestino').on('keyup', function () {
            let inputValue = $(this).val().toLowerCase();
            table.search(inputValue).draw();
        });

    } catch (error) {
        showToast("Error", "Error al obtener los destinos.")
    }
}

loadDestinations2()

function createDeleteModal(idDestino) {
    const existingModal = document.getElementById('confirmarEliminarModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <div class="modal fade" id="confirmarEliminarModal" tabindex="-1" aria-labelledby="confirmarEliminarModalLabel"
            aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmarEliminarModalLabel">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ¿Estás seguro de que deseas eliminar esta ubicación?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button"  class="btn btn-danger" id="eliminarUbicacion" onclick='deleteDestination(${JSON.stringify(idDestino)})'>Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalContainer);

    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal'));
    modal.show();

}

async function deleteDestination(idRuta) {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://backend-transporteccss.onrender.com/api/rutas/${idRuta}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        showToast('¡Éxito!', 'Ubicación eliminada correctamente.');
        $('#confirmarEliminarModal').modal('hide');
        $('#AgregarUbiModal').modal('hide');
        setTimeout(function () {
            loadContent('formUbi.html', 'mainContent');
        }, 1400);

    } catch (error) {
        showToast('Error', 'No se pudo eliminar la ubicación.');
        $('#confirmarEliminarModal').modal('hide');


    }
}

async function deleteEspecialidad(idEspecialidad, idRuta) {
    try {
        const select = document.getElementById('select-destinos');
        idRuta = select.value;

        if (!idRuta) {
            showToast('Error', 'Debes seleccionar un destino antes de eliminar la especialidad.');
            $('#confirmarEliminarModal2').modal('hide');
            return;
        }

        const token = localStorage.getItem('token');

        await axios.delete(`https://backend-transporteccss.onrender.com/api/rutaEspecialidad/${idRuta}/${idEspecialidad}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        $('#confirmarEliminarModal2').modal('hide');

        setTimeout(function () {
            loadContent('formUbi.html', 'mainContent');
        }, 1400);

        showToast('¡Éxito!', 'Especialidad eliminada correctamente.');

    } catch (error) {
        showToast('Error', 'No se pudo eliminar la especialidad asignada al destino seleccionado.');

        $('#confirmarEliminarModal2').modal('hide');
    }
}

function createDeleteModal2(idEspecialidad, idRuta) {
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
                        <button type="button" class="btn btn-danger" id="eliminarEspecialidad" onclick='deleteEspecialidad(${JSON.stringify(idEspecialidad)}, ${JSON.stringify(idRuta)})'>Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalContainer);

    const modal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal2'));
    modal.show();
}

function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}