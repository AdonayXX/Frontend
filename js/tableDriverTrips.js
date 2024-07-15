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

async function cargarChoferes() {
    try {
      const URL_CHOFERES = 'https://backend-transporteccss.onrender.com/api/choferes';
      const respuesta = await axios.get(URL_CHOFERES);
      const choferes = respuesta.data.choferes;
      const selectBody = document.querySelector('#choferes');

      selectBody.innerHTML = '';

      const opcionDefault = document.createElement('option');
      opcionDefault.textContent = 'Seleccionar Chofer...';
      opcionDefault.selected = true;
      opcionDefault.disabled = false;
      selectBody.appendChild(opcionDefault);

      choferes.forEach(chofer => {
        const option = document.createElement('option');
        option.value = chofer.id;
        option.textContent = `${chofer.nombre} ${chofer.apellido1}`;
        selectBody.appendChild(option);
      });
    } catch (error) {
      console.error('Error al obtener los choferes:', error);
    }
  }

async function asignarUnidad() {
    try {
      const selectUnidad = document.querySelector('#unidades');
      const selectChofer = document.querySelector('#choferes');
      const unidadId = selectUnidad.value;
      const choferId = selectChofer.value;
      const URL_ASIGNAR_UNIDAD = `https://backend-transporteccss.onrender.com/api/asignarUnidad/${unidadId}/${choferId}`;
      const respuesta = await axios.put(URL_ASIGNAR_UNIDAD);
      if (respuesta.status === 200) {
        showToast('Éxito', 'Unidad asignada correctamente');
        obtenerViajes();
      }
    } catch (error) {
      console.error('Error al asignar la unidad:', error);
      showToast('Error', 'Ocurrió un problema al asignar la unidad');
    }
  }



  function infoUser(){
    try {
        const token = localStorage.getItem('token');
        const decodedToken = jwt_decode(token);
        return (decodedToken);
    } catch (error) {
        console.error(error);
        showToast('Error','Ocurrio un problema al obtener loss datos del usuario')
        
    }

}

const infoUsuario = infoUser(); 
console.log(infoUsuario);

obtenerViajes();
