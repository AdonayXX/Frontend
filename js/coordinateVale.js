
(function () {
    const token = localStorage.getItem('token');
    const idVale = sessionStorage.getItem('selectedIdVale');
    var url = 'https://backend-transporteccss.onrender.com/';
    const btnAdd = document.getElementById('btn-agregarSoli');
    let isCero = 1;
    

    if (idVale) {
        readVale(idVale);
        sessionStorage.removeItem('selectedIdVale');
        readChofer();
        readUnidad();
        readManager();
    } else {
        console.error('No se encontró el ID del vale en sessionStorage.');
    }

    async function readVale(id) {
        try {
            const response = await axios.get(`${url}api/vales`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const vales = response.data.vales;
            const response2 = await axios.get(`${url}api/revicionVale`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const coordinate = response2.data.revicionVales;
            let valeObject = null;
            vales.forEach(vale => {
                if (id === vale.IdVale) {
                    var salida, destino;
                    if (vale.NombreSalida == null) {
                        salida = vale.NombreSalidaEbais;
                        destino = vale.NombreDestinoEbais
                    } else {
                        salida = vale.NombreSalida;
                        destino = vale.NombreDestino;
                    }
                    const fechaSolicitud = new Date(vale.Fecha_Solicitud);
                    const fechaFormateada = fechaSolicitud.toISOString().split('T')[0];
                    document.getElementById('input-id').value = id;
                    document.getElementById('input-up').value = vale.NombreUnidadProgramatica;
                    document.getElementById('input-solicitante').value = vale.NombreSolicitante;
                    document.getElementById('input-servicio').value = vale.NombreServicio;
                    document.getElementById('input-motivo').value = vale.NombreMotivo;
                    document.getElementById('input-horaSalida').value = vale.Hora_Salida;
                    document.getElementById('input-fechaReq').value = fechaFormateada;
                    document.getElementById('txa-detalle').value = vale.Detalle;
                    document.getElementById('input-salida').value = salida;
                    document.getElementById('input-destino').value = destino;
                    if (vale.EstadoId === 3 || vale.EstadoId === 5) {
                        blockBtn()
                        const selectPlaca = document.getElementById('select-placa');
                        const selectChofer = document.getElementById('select-chofer');
                        const selectEncargado = document.getElementById('select-encargado');
                        selectPlaca.disabled = true;
                        selectChofer.disabled = true;
                        selectEncargado.disabled = true;
                        showToast('Vale Rechazado', 'No se pueden modificar datos.');
                    } else {
                        if (vale.EstadoId == 2) {
                            blockBtn();
                        }
                    }
                    if (vale.Chofer === 1 || vale.Chofer === null) {
                        let callChofer = 1;
                        readChofer(callChofer);
                        // selects(callChofer);
                    }else{
                        let callChofer = 0;
                        readChofer(callChofer);
                    }
                    acompanantes(vale);
                    valeObject = vale;
                }
            });

            coordinate.forEach(vale => {
                if (id === vale.IdVale) {
                    const selectPlaca = document.getElementById('select-placa');
                    const selectChofer = document.getElementById('select-chofer');
                    const selectEncargado = document.getElementById('select-encargado');
                    selectPlaca.value = vale.IdUnidad;
                    selectChofer.value = vale.IdChofer;
                    selectEncargado.value = vale.Encargado;
                    selectPlaca.disabled = true;
                    selectChofer.disabled = true;
                    selectEncargado.disabled = true;
                    btnAdd.disabled = true;
                }
            });
            if (valeObject.Chofer == 0 || null) {
                // selects();
            }

        } catch (error) {
            console.error('Error fetching vale data:', error);
        }
    }

    // function selects() {
    //     const selectElement = document.getElementById('select-chofer');
    //     const newOption = document.createElement('option');
    //     newOption.id = '0';
    //     newOption.value = '0';
    //     newOption.textContent = 'Chofer ASU';
    //     selectElement.appendChild(newOption);
    //     selectElement.value = '0';
    //     selectElement.disabled = true;
    //     isCero = 0;
    // }

    function acompanantes(vale) {
        if (vale.Acompanante1 != null) {
            const acompDiv1 = document.getElementById('input-acompanante1');
            const div1 = document.getElementById('div1');
            div1.style.display = 'block';
            acompDiv1.value = vale.Acompanante1;
        }
        if (vale.Acompanante2 != null) {
            const acompDiv1 = document.getElementById('input-acompanante2');
            const div1 = document.getElementById('div2');
            div1.style.display = 'block';
            acompDiv1.value = vale.Acompanante2;
        }
        if (vale.Acompanante3 != null) {
            const acompDiv1 = document.getElementById('input-acompanante3');
            const div1 = document.getElementById('div3');
            div1.style.display = 'block';
            acompDiv1.value = vale.Acompanante3;
        }
        if (vale.Acompanante4 != null) {
            const acompDiv1 = document.getElementById('input-acompanante4');
            const div1 = document.getElementById('div4');
            div1.style.display = 'block';
            acompDiv1.value = vale.Acompanante4;
        }
        if (vale.Acompanante5 != null) {
            const acompDiv1 = document.getElementById('input-acompanante5');
            const div1 = document.getElementById('div5');
            div1.style.display = 'block';
            acompDiv1.value = vale.Acompanante5;
        }
    }

    const obtenerFechaActual = () => {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const día = String(hoy.getDate()).padStart(2, '0');

        return `${año}-${mes}-${día}`;
    }
    const obtenerHoraActual = () => {
        const hoy = new Date();
        const horas = String(hoy.getHours()).padStart(2, '0');
        const minutos = String(hoy.getMinutes()).padStart(2, '0');

        return `${horas}:${minutos}`;
    }

    async function addCoordinate() {
        try {
            const coordinate = {
                IdVale: idVale,
                IdUnidad: document.getElementById('select-placa').value,
                IdChofer: document.getElementById('select-chofer').value,
                Encargado: document.getElementById('select-encargado').value,
                FechaRevision: obtenerFechaActual(),
                HoraRevision: obtenerHoraActual(),
                Observaciones: "Agregando datos"
            };
            if (isCero == 0) {
                coordinate.IdChofer = 25;
            }
            const response = await axios.post(`${url}api/revicionVale`, coordinate, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const dataTripVale = {
                fecha: document.getElementById('input-fechaReq').value,
                idUnidad: document.getElementById('select-placa').value
            };
            const tripValeResponse = await axios.post(`${url}api/viajeVale`, dataTripVale, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            return true;
        } catch (error) {
            if (error.response) {
                console.error('Error al guardar datos:', error.response.data);
            } else if (error.request) {
                console.error('Error al guardar datos: No se recibió respuesta del servidor', error.request);
            } else {
                console.error('Error al guardar datos:', error.message);
            }
            showToast('Error', 'Error al guardar la revisión.');
            return false;
        }
    }

    btnAdd.addEventListener('click', function () {
        if (addCoordinate()) {
            const selectPlaca = document.getElementById('select-placa');
            const selectChofer = document.getElementById('select-chofer');
            const selectEncargado = document.getElementById('select-encargado');
            selectPlaca.disabled = true;
            selectChofer.disabled = true;
            selectEncargado.disabled = true;
            showToast('Datos Agregados', 'Los datos se han guardado correctamente');
            const newIdEstado = 2;
            const valueId = document.getElementById('input-id').value;
            newStatus(valueId, newIdEstado);
            blockBtn();
        }
    })

    async function readChofer(callChofer) {
        try {
            const response = await axios.get(`${url}api/chofer`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const choferes = response.data.choferes;
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            choferes.forEach(chofer => {
                if (callChofer == chofer.autorizado ) {
                    body += `<option value="${chofer.idChofer}">${chofer.nombre}</option>`;
                } else if (callChofer == chofer.autorizado) {
                    body += `<option value="${chofer.idChofer}">${chofer.nombre}</option>`;
                }
            });
            document.getElementById('select-chofer').innerHTML = body;

        } catch (error) {
            console.error('No se cargaron los datos', error);
        }
    }

    async function readManager() {
        try {
            const response = await axios.get(`${url}api/funcionarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const managers = response.data.funcionarios;
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            managers.forEach(manager => {
                body += `<option value="${manager.Nombre} ${manager.Apellidos}">${manager.Nombre} ${manager.Apellidos}</option>`;
            });
            document.getElementById('select-encargado').innerHTML = body;
        } catch (error) {
            console.error('No se cargaron los datos', error);
        }
    }

    async function readUnidad() {
        try {
            const response = await axios.get(`${url}api/unidades`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const unidades = response.data.unidades;
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            unidades.forEach(unidad => {
                body += `<option value="${unidad.id}">${unidad.numeroUnidad}</option>`;
            });
            document.getElementById('select-placa').innerHTML = body;

        } catch (error) {
            console.error('No se cargaron los datos', error);
        }
    }

    async function newStatus(valueId, newIdEstado) {
        try {
            const valUrl = `${url}api/vales/actualizarEstado/${valueId}/${newIdEstado}`;
            const response = await axios.put(valUrl);

            if (newIdEstado === 2) {

            } else {
                blockBtn();
            }

        } catch (error) {
            console.error('Error al actualizar el campo:', error);
            throw error;
        }
    }

    const btnCancel = document.getElementById('btn-rechazarSoli');
    btnCancel.addEventListener('click', function () {
        event.preventDefault();
        const newIdEstado = 3;
        const valueId = document.getElementById('input-id').value;
        newStatus(valueId, newIdEstado);
        const selectPlaca = document.getElementById('select-placa');
        const selectChofer = document.getElementById('select-chofer');
        const selectEncargado = document.getElementById('select-encargado');
        selectPlaca.disabled = true;
        selectChofer.disabled = true;
        selectEncargado.disabled = true;
    });

    function blockBtn() {
        btnCancel.disabled = true;
        btnAdd.disabled = true;
    }

    /*
//Funcion para mandar el usuario
function infoUser() {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwt_decode(token);
      return (decodedToken);
    } catch (error) {
      console.error(error);
      showToast('Error', 'Ocurrio un problema al obtener loss datos del usuario')
 
    }
 
  }
  const infoUsuario = infoUser();
  const idUsuario = infoUsuario.usuario.IdUsuario;
*/
})();