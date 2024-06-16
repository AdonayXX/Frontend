'use strict';

async function loadUnidades() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/unidades');
        const unidades = response.data.unidades;
        const tableBody = document.getElementById('unitTableBody');
        tableBody.innerHTML = '';

        unidades.forEach(unidad => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${unidad.numeroUnidad}</td>
                <td>${unidad.capacidadTotal}</td>
                <td>${getNombreRecurso(unidad.idTipoRecurso)}</td>
                <td>${unidad.kilometrajeInicial}</td>
                <td>${unidad.kilometrajeActual}</td>
                <td>${getNombreEstado(unidad.idEstado)}</td>
                <td>${new Date(unidad.fechaDekra).toLocaleDateString()}</td>
                <td>${getNombreFrecuenciaCambio(unidad.idFrecuenciaCambio)}</td>
                <td>${unidad.choferDesignado}</td>
                <td>${unidad.adelanto}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener las unidades:', error);
    }
}

function getNombreRecurso(id) {
    const recursos = {
        1: 'CCSS',
        2: 'Cruz Roja',
        3: 'Privado',
        4: 'Taxi',
        5: 'Moto'
    };
    return recursos[id] || 'Desconocido';
}

function getNombreEstado(id) {
    const estados = {
        1: 'Activa',
        2: 'Inactiva',
        3: 'En Mantenimiento',
        4: 'Operativa',
        5: 'Desechada'
    };
    return estados[id] || 'Desconocido';
}

function getNombreFrecuenciaCambio(id) {
    const frecuencias = {
        1: 'Diaria',
        2: 'Semanal',
        5: 'Mensual'
    };
    return frecuencias[id] || 'No Aplica';
}

loadUnidades();
