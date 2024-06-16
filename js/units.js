'use strict';

//FUNCIONN PARA JALAR LOS DATITOS DE EL TIPO DE RECURSO
async function loadTiposRecurso() {
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

//FUNCION PARA JALAR  EL ESTADOOO DE LA UNIDAD
async function loadEstadosUnidad() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/estadoUnidad');
        const estadosUnidad = response.data.estadosUnidad;
        const estadoMap = {};

        estadosUnidad.forEach(estado => {
            estadoMap[estado.idEstado] = estado.estado;
        });

        return estadoMap;
    } catch (error) {
        console.error('Error al obtener los estados de unidad:', error);
        return {};
    }
}

//CARGAAA Y ACTUALIZA
async function loadUnidades() {
    try {
        const [recursoMap, estadoMap] = await Promise.all([
            loadTiposRecurso(),
            loadEstadosUnidad()
        ]);

        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades');
        const unidades = response.data.unidades;
        const tableBody = document.getElementById('unitTableBody');
        tableBody.innerHTML = '';

        unidades.forEach(unidad => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${unidad.numeroUnidad}</td>
                <td>${unidad.capacidadTotal}</td>
                <td>${recursoMap[unidad.idTipoRecurso] || 'Desconocido'}</td>
                <td>${unidad.kilometrajeInicial}</td>
                <td>${unidad.kilometrajeActual}</td>
                <td>${estadoMap[unidad.idEstado] || 'Desconocido'}</td>
                <td>${new Date(unidad.fechaDekra).toLocaleDateString()}</td>
                <td>N/A</td>
                <td>${unidad.choferDesignado}</td>
                <td>${unidad.adelanto}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

 loadUnidades();
