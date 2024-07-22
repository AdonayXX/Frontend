
(function () {
    const idVale = sessionStorage.getItem('selectedIdVale');
    var url = 'https://backend-transporteccss.onrender.com/';
    const btnAdd = document.getElementById('btn-agregarSoli');

    if (idVale) {
        readVale(idVale);
        sessionStorage.removeItem('selectedIdVale');
        readChofer();
        readUnidad();
    } else {
        console.error('No se encontró el ID del vale en sessionStorage.');
    }

    async function readVale(id) {
        try {
            const response = await axios.get(`${url}api/vales`);
            const vales = response.data.vales;
            const response2 = await axios.get(`${url}api/revicionVale`);
            const coordinate = response2.data.revicionVales;

            vales.forEach(vale => {
                if (id === vale.IdVale) {
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
                    document.getElementById('input-salida').value = vale.NombreSalida;
                    document.getElementById('input-destino').value = vale.NombreDestino;
                    if (vale.EstadoId === 3 || vale.EstadoId === 5) {
                        blockBtn()
                        const selectPlaca = document.getElementById('select-placa');
                        const selectChofer = document.getElementById('select-chofer');
                        const selectEncargado = document.getElementById('select-encargado');
                        selectPlaca.disabled = true;
                        selectChofer.disabled = true;
                        selectEncargado.disabled = true;
                        showToast('Vale Rechazado', 'No se pueden modificar datos.');
                    }else{
                        if (vale.EstadoId == 2) {
                            blockBtn();
                        }
                    }
                    if (vale.Chofer == 0 || null) {
                        selects();
                    }
                    acompanantes(vale);
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

        } catch (error) {
            console.error('Error fetching vale data:', error);
        }
    }

    function selects() {
        const select1 = document.getElementById('placa');
        const select1Asu = document.getElementById('placa-asu');
        select1.style.display = 'none';
        select1Asu.style.display = 'block';
        const select2 = document.getElementById('chofer');
        const select2Asu = document.getElementById('chofer-asu');
        select2.style.display = 'none';
        select2Asu.style.display = 'block';
        const selectPlaca = document.getElementById('select-placa');
        const selectChofer = document.getElementById('select-chofer');
        selectPlaca.disabled = true;
        selectChofer.disabled = true;
    }

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
            console.log(coordinate);
            try {
                await axios.post(`${url}api/revicionVale`, coordinate);
                return true;
            } catch (error) {
                console.error('Error al guardar datos', error);
                showToast('Error', 'Error al guardar la la revición.');
                return false;
            }
        } catch (error) {
            console.error('Error fetching vale data:', error);
            return false;
        }
    }

    btnAdd.addEventListener('click', function () {
        if(addCoordinate()){
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

    async function readChofer() {
        try {
            const response = await axios.get(`${url}api/chofer`);
            const choferes = response.data.choferes;
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            choferes.forEach(chofer => {
                body += `<option value="${chofer.idChofer}">${chofer.nombre}</option>`;
            });
            document.getElementById('select-chofer').innerHTML = body;

        } catch (error) {
            console.error('No se cargaron los datos', error);
        }
    }

    async function readUnidad() {
        try {
            const response = await axios.get(`${url}api/unidades`);
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
            console.log('Campo actualizado correctamente:');

            if (newIdEstado === 2) {
                showToast('Se ha modificado el estado del vale', 'El vale ha sido aprobado');
            } else {
                showToast('Se ha modificado el estado del vale', 'El vale ha sido rechazado');
                blockBtn();
            }
    
        } catch (error) {
            console.error('Error al actualizar el campo:', error);
            throw error;
        }
    }

    const btnCancel = document.getElementById('btn-rechazarSoli');
    btnCancel.addEventListener('click', function () {
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
})();

