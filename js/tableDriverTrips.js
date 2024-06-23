'use strict';

// Utilidad para manejar la API de axios
const axiosInstance = axios.create({
    baseURL: 'https://backend-transporteccss.onrender.com/api'
});

// Función para obtener y mostrar los viajes
async function obtenerViajes() {
    try {
        const { data } = await axiosInstance.get('/viajeChofer');
        const viajesTableBody = document.getElementById('viajesTableBody');
        
        viajesTableBody.innerHTML = data.viajes.map(viaje => `
            <tr>
                <td>${viaje.Paciente}</td>
                <td>${viaje.LugarSalida}</td>
                <td>${viaje.idUbicacionDestino}</td>
                <td>${viaje.horaCita}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm full-width" data-bs-toggle="modal"
                        data-bs-target="#acompModal" onclick="openAccomp('${viaje.idAcompanante1}', '${viaje.idAcompanante2}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

// Función para abrir el modal y mostrar los acompañantes
async function openAccomp(idAcompanante1, idAcompanante2) {
    try {
        const { data } = await axiosInstance.get('/paciente/acompanantes/');
        const acompanantes = data.pacientes.filter(acomp => 
            acomp.idAcompanante === idAcompanante1 || acomp.idAcompanante === idAcompanante2);
        
        fillAccomp(acompanantes);
    } catch (error) {
        console.error('Error al obtener los acompañantes:', error);
    }
}

// Función para llenar el modal con los acompañantes
function fillAccomp(acompanantes) {
    const tableBody = document.querySelector('#acompTableBody');
    const noAcompanantesMessage = document.querySelector('#messageNoComp');
    const tableComp = document.querySelector('#tableComp');
    tableBody.innerHTML = '';
    
    if (acompanantes.length === 0) {
        tableComp.style.display = 'none';
        noAcompanantesMessage.style.display = 'block';
    } else {
        tableComp.style.display = 'block';
        noAcompanantesMessage.style.display = 'none';
        tableBody.innerHTML = acompanantes.map(accomp => {
            const telefonoCompleto = acomp.Telefono2 !== 0 ? `${accomp.Telefono1}-${accomp.Telefono2}` : acomp.Telefono1;
            return `
                <tr>
                    <td>${accomp.Identificacion}</td>
                    <td>${accomp.Nombre} ${accomp.Apellido1} ${accomp.Apellido2}</td>
                    <td>${telefonoCompleto}</td>
                    <td>${accomp.Parentesco}</td>
                </tr>
            `;
        }).join('');
    }
}

// Función para buscar en la tabla
function setupSearch() {
    const searchInput = document.querySelector('#searchPatient');
    searchInput.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#viajesTableBody tr');
        
        rows.forEach(row => {
            const match = Array.from(row.querySelectorAll('td')).some(cell => 
                cell.textContent.toLowerCase().includes(searchTerm)
            );
            row.style.display = match ? '' : 'none';
        });
    });
}

// Inicialización
function init() {
    obtenerViajes();
    setupSearch();
}

init();