async function loadDestinations() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/destinos');
        const destinos = response.data;
        const select = document.getElementById('select-destinos');

        destinos.forEach(destino => {
            const option = document.createElement('option');
            option.value = destino.IdDestino;
            option.textContent = destino.Descripcion;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al obtener los destinos:', error);
    }
}
loadDestinations()

async function loadEspecialidades() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/especialidad');
        const especialidad = response.data;
        const tableBody = document.getElementById('espe');
        tableBody.innerHTML = '';

        especialidad.forEach(espe => {
            const row = document.createElement('tr');

            row.innerHTML = `
              <td><input type="checkbox" id="seleccionarEspe"/></td>
                <td>${espe.Especialidad}</td>
                 <td><button class="btn btn-outline-danger btn-sm" id="btnEliminarEspe"><i
                 class="bi bi-trash"></i></button></td>
            `;

            tableBody.appendChild(row);

        });
    } catch (error) {
        console.error('Error al cargar las especialidades:', error);

    }

}

loadEspecialidades() 
