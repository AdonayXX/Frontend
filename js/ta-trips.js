const apiUrl = "https://backend-transporteccss.onrender.com/api/viaje";

document.addEventListener("DOMContentLoaded", () => {
    const unidadesSelect = document.getElementById('unidades');
    unidadesSelect.addEventListener('change', handleUnidadChange);
});

async function handleUnidadChange(event) {
    const IdUnidad = event.target.value;
    if (IdUnidad === "Seleccionar Unidad") return;

    const viajes = await fetchViajes();
    const viajesTableBody = document.getElementById('viajesTableBody');
    viajesTableBody.innerHTML = '';

    viajes.forEach(viaje => {
        if (viaje.IdUnidad == IdUnidad) {
            const row = createTableRow(viaje);
            viajesTableBody.appendChild(row);
        }
    });

    addCheckboxListeners();
}

async function fetchViajes() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.viaje;
    } catch (error) {
        console.error('Error fetching viajes:', error);
    }
}

function createTableRow(viaje) {
    const row = document.createElement('tr');

    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;  // Initially checked since it is assigned
    checkbox.dataset.Idviaje = viaje.Idviaje;
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);

    row.appendChild(createTableCell(viaje.idPaciente));
    row.appendChild(createTableCell(viaje.LugarSalida));
    row.appendChild(createTableCell(viaje.idUbicacionDestino));
    row.appendChild(createTableCell(viaje.Condicion));
    row.appendChild(createTableCell(viaje.HoraCita));
    row.appendChild(createTableCell(viaje.FechaCita));
    row.appendChild(createTableCell(viaje.Traslado));
    row.appendChild(createTableCell(viaje.Camilla));

    const actionsCell = document.createElement('td');
    const ausenteButton = document.createElement('button');
    ausenteButton.className = 'btn btn-warning';
    ausenteButton.dataset.bsToggle = 'modal';
    ausenteButton.dataset.bsTarget = '#ausenteModal';
    ausenteButton.innerText = 'Ausente';
    actionsCell.appendChild(ausenteButton);
    row.appendChild(actionsCell);

    return row;
}

function createTableCell(content) {
    const cell = document.createElement('td');
    cell.innerText = content;
    return cell;
}

function addCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async (event) => {
            const viajeId = event.target.dataset.viajeId;
            if (event.target.checked) {
                await assignUnidad(viajeId);
            } else {
                await unassignUnidad(viajeId);
            }
        });
    });
}

async function assignUnidad(viajeId) {
    try {
        const response = await fetch(`${apiUrl}/${viajeId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idUnidad: document.getElementById('unidades').value })
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        alert('Unidad asignada correctamente.');
    } catch (error) {
        console.error('Error assigning unidad:', error);
    }
}

async function unassignUnidad(viajeId) {
    try {
        const response = await fetch(`${apiUrl}/${viajeId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idUnidad: null })
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        alert('Unidad desasignada correctamente.');
    } catch (error) {
        console.error('Error unassigning unidad:', error);
    }
}
