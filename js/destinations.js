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
