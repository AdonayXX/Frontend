async function getNombreChofer() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer');
        const choferes = response.data.choferes;
        const choferMap = {};

        choferes.forEach(chofer => {
            choferMap[chofer.idChofer] = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
        });

        return choferMap;
    } catch (error) {
        console.error('Error al obtener los nombres de los choferes:', error);
        return {};
    }
}

async function getTiposRecurso() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/tipoRecurso');
        const tiposRecurso = response.data.tiporecurso;
        const recursoMap = {};

        tiposRecurso.forEach(recurso => {
            recursoMap[recurso.idTipoRecurso] = recurso.recurso;
        });

        return recursoMap;
    } catch (error) {
        console.error('Error al obtener los tipos de recurso:', error);
        return {};
    }
}

async function getEstadosUnidad() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/estadoUnidad');
        const estadosUnidad = response.data.estadosUnidad;
        const estadoMap = {};

        estadosUnidad.forEach(estado => {
            estadoMap[estado.idEstado] = estado.estado;
        });

        return estadoMap;
    } catch (error) {
        console.error('Error al obtener los estados de las unidades:', error);
        return {};
    }
}

async function getFrecuenciaCambio() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/frecuenciaCambio');
        const frecuenciaCambio = response.data.frecuenciacambios;
        const frecuenciaMap = {};

        frecuenciaCambio.forEach(tipo => {
            frecuenciaMap[tipo.idFrecuenciaCambio] = tipo.tipo;
        });

        return frecuenciaMap;
    } catch (error) {
        console.error('Error al obtener las frecuencias de cambio:', error);
        return {};
    }
}

async function getUnidades() {
    try {
        const [recursoMap, estadoMap, frecuenciaMap, choferMap] = await Promise.all([
            getTiposRecurso(),
            getEstadosUnidad(),
            getFrecuenciaCambio(),
            getNombreChofer()
        ]);

        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades');
        const unidades = response.data.unidades;

        $(document).ready(function () {
            if ($.fn.DataTable.isDataTable('#unitTable')) {
                $('#unitTable').DataTable().destroy();
            }

            const tableBody = document.getElementById('unitTableBody');
            tableBody.innerHTML = '';

            unidades.forEach(unidad => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td class="text-center">${unidad.numeroUnidad || 'N/A'}</td>
                    <td class="text-center">${unidad.capacidadTotal || 'N/A'}</td>
                    <td class="text-center">${recursoMap[unidad.idTipoRecurso] || 'N/A'}</td>
                    <td class="text-center">${unidad.kilometrajeInicial || 'N/A'}</td>
                    <td class="text-center">${unidad.kilometrajeActual || 'N/A'}</td>
                    <td class="text-center">${(estadoMap[unidad.idEstado]).toUpperCase() || 'N/A'}</td>
                    <td class="text-center">${new Date(unidad.fechaDekra).toLocaleDateString() || 'N/A'}</td>
                    <td class="text-center">${frecuenciaMap[unidad.idFrecuenciaCambio] || 'N/A'}</td>
                    <td class="text-center">${choferMap[unidad.choferDesignado] || 'N/A'}</td>
                `;

                row.addEventListener('click', function () {
                    loadFormData(unidad);
                });

                tableBody.appendChild(row);
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
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

getUnidades();