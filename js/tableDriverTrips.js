async function obtenerViajes() {
    const apiURLViajes = 'https://backend-transporteccss.onrender.com/api/viajeChofer';
    try {
        const responseViajes = await axios.get(apiURLViajes);
        const viajes = responseViajes.data.viajes;
        const viajesTableBody = document.getElementById('viajesTableBody');

        viajesTableBody.innerHTML = '';

        const fragment = document.createDocumentFragment();

        viajes.forEach(viaje => {
            const row = document.createElement('tr');

            const acompanante1 = viaje.Acompanante1 ? viaje.Acompanante1 : 'N/A';
            const acompanante2 = viaje.Acompanante2 ? viaje.Acompanante2 : 'N/A';

            row.innerHTML = `
                <td>${viaje.Paciente}</td>
                <td>${viaje.LugarSalida}</td>
                <td>${viaje.idUbicacionDestino}</td>
                <td>${viaje.horaCita}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm full-width" data-bs-toggle="modal"
                        data-bs-target="#acompModal" onclick="openAccomp('${acompanante1}', '${acompanante2}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;

            fragment.appendChild(row);
        });

        viajesTableBody.appendChild(fragment);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

function openAccomp(acompanante1, acompanante2) {
    const acompTableBody = document.getElementById('acompTableBody');
    const messageNoComp = document.getElementById('messageNoComp');

    acompTableBody.innerHTML = '';

    if (acompanante1 === 'N/A' && acompanante2 === 'N/A') {
        messageNoComp.style.display = 'block';
    } else {
        messageNoComp.style.display = 'none';

        if (acompanante1 !== 'N/A') {
            const row1 = document.createElement('tr');
            row1.innerHTML = `<td>${acompanante1}</td>`;
            acompTableBody.appendChild(row1);
        }

        if (acompanante2 !== 'N/A') {
            const row2 = document.createElement('tr');
            row2.innerHTML = `<td>${acompanante2}</td>`;
            acompTableBody.appendChild(row2);
        }
    }
}

obtenerViajes();
