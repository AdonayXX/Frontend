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
                <td class="text-center">${viaje.Paciente}</td>
                <td class="text-center">${viaje.LugarSalida}</td>
                <td class="text-center">${viaje.idUbicacionDestino}</td>
                <td class="text-center">${viaje.horaCita}</td>
                <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm full-width mx-auto" data-bs-toggle="modal"
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

async function cargarUnidades() {
    try {
      const URL_UNIDADES = 'https://backend-transporteccss.onrender.com/api/ViajeUnidades';
      const respuesta = await axios.get(URL_UNIDADES);
      const unidades = respuesta.data.unidades;
      const selectBody = document.querySelector('#unidades');
      const choferesSelect = document.querySelector('#choferes');

      selectBody.innerHTML = '';

      const opcionDefault = document.createElement('option');
      opcionDefault.textContent = 'Seleccionar Unidad...';
      opcionDefault.selected = true;
      opcionDefault.disabled = false;
      selectBody.appendChild(opcionDefault);

      unidades.forEach(unidad => {
        const option = document.createElement('option');
        option.value = unidad.id;
        option.dataset.choferId = unidad.idChofer;
        option.dataset.choferNombre = `${unidad.nombreChofer} ${unidad.apellido1Chofer}`;
        option.textContent = `Unidad ${unidad.numeroUnidad}`;
        selectBody.appendChild(option);
      });

      choferesSelect.innerHTML = opcionDefault.outerHTML;
    } catch (error) {
      console.error('Error al obtener las unidades:', error);
    }
  }

  function actualizarChofer() {
    const selectUnidades = document.getElementById('unidades');
    const choferesSelect = document.getElementById('choferes');
    const unidadSeleccionada = selectUnidades.options[selectUnidades.selectedIndex];

    if (unidadSeleccionada && unidadSeleccionada.dataset.choferId) {
      const choferOption = document.createElement('option');
      choferOption.value = unidadSeleccionada.dataset.choferId;
      choferOption.textContent = unidadSeleccionada.dataset.choferNombre;
      choferesSelect.innerHTML = '';
      choferesSelect.appendChild(choferOption);
    } else {
      choferesSelect.innerHTML = '<option selected>Seleccionar Chófer...</option>';
    }
  }


obtenerViajes();
