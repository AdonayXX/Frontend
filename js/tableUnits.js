"use strict";

function mostrarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'flex';
}

function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}

async function getNombreChofer() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const choferes = response.data.choferes;
        const choferMap = {};

        choferes.forEach(chofer => {
            choferMap[chofer.idChofer] = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
        });

        return choferMap;
    } catch (error) {
        showToast('Error', 'Error al obtener los choferes.');
        return {};
    }
}

async function getTiposRecurso() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/tipoRecurso', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const tiposRecurso = response.data.tiporecurso;
        const recursoMap = {};

        tiposRecurso.forEach(recurso => {
            recursoMap[recurso.idTipoRecurso] = recurso.recurso;
        });

        return recursoMap;
    } catch (error) {

        return {};
    }
}

async function getEstadosUnidad() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/estadoUnidad', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const estadosUnidad = response.data.estadosUnidad;
        const estadoMap = {};

        estadosUnidad.forEach(estado => {
            estadoMap[estado.idEstado] = estado.estado;
        });

        return estadoMap;
    } catch (error) {
        showToast('Error', 'Error al obtener los estados de las unidades.');
        return {};
    }
}

async function getUnidades() {
    try {
        const [recursoMap, estadoMap, choferMap] = await Promise.all([
            getTiposRecurso(),
            getEstadosUnidad(),
            getNombreChofer()
        ]);

        const token = localStorage.getItem('token');
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const unidades = response.data.unidades;

        // Sort the unidades array by numeroUnidad in alphabetical order
        unidades.sort((a, b) => a.numeroUnidad.localeCompare(b.numeroUnidad));

        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#unitTable')) {
                $('#unitTable').DataTable().destroy();
            }

            const tableBody = document.getElementById('unitTableBody');
            tableBody.innerHTML = '';

            unidades.forEach(unidad => {
                if (unidad.idEstado !== 5) {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td class="text-center">${unidad.numeroUnidad || 'N/A'}</td>
                        <td class="text-center">${unidad.capacidadTotal || 'N/A'}</td>
                        <td class="text-center">${(recursoMap[unidad.idTipoRecurso] || 'N/A').toUpperCase()}</td>
                        <td class="text-center">${unidad.kilometrajeInicial || 'N/A'}</td>
                        <td class="text-center">${unidad.kilometrajeActual || 'N/A'}</td>
                        <td class="text-center">${(estadoMap[unidad.idEstado] || 'N/A').toUpperCase()}</td>
                        <td class="text-center">${new Date(unidad.fechaDekra).toISOString().split('T')[0] || 'N/A'}</td>
                        <td class="text-center">${choferMap[unidad.choferDesignado] || 'N/A'}</td>
                    `;

                    tableBody.appendChild(row);
                }
            });

            $('#unitTable').DataTable({
                dom: "<'row'<'col-sm-6'l>" +
                    "<'row'<'col-sm-12't>>" +
                    "<'row'<'col-sm-6'i><'col-sm-6'p>>",
                ordering: false,
                searching: true,
                paging: true,
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
                },
                caseInsensitive: true,
                smart: true
            });

            $('#searchUnit').on('keyup', function () {
                let inputValue = $(this).val().toLowerCase();
                $('#unitTable').DataTable().search(inputValue).draw();
            });

        });
        ocultarSpinner();
    } catch (error) {
        showToast('Error', 'Error al obtener las unidades.');
        ocultarSpinner();
    }
}

getUnidades();
