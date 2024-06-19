(function () {
    const idVale = sessionStorage.getItem('selectedIdVale');
    var url = 'https://backend-transporteccss.onrender.com/';

    if (idVale) {
        readVale(idVale);
        sessionStorage.removeItem('selectedIdVale');
    } else {
        console.error('No se encontró el ID del vale en sessionStorage.');
    }

    async function readVale(id) {
        try {
            const response = await axios.get(`${url}api/vales`);
            const vales = response.data.vales;
            const response2 = await axios.get(`${url}api/revicionVale`);
            const coordinate = response.data.vales;

            vales.forEach(vale => {
                if (id === vale.IdVale) {
                    const fechaSolicitud = new Date(vale.Fecha_Solicitud);
                    const fechaFormateada = fechaSolicitud.toISOString().split('T')[0];
                    document.getElementById('input-id').value = id;
                    document.getElementById('input-up').value = vale.UnidadProgramatica;
                    document.getElementById('input-unidad').value = vale.Unidad;
                    document.getElementById('input-solicitante').value = vale.NombreSolicitante;
                    document.getElementById('input-servicio').value = vale.Servicio;
                    document.getElementById('input-motivo').value = vale.Motivo;
                    document.getElementById('input-horaSalida').value = vale.Hora_Salida;
                    document.getElementById('input-fechaReq').value = fechaFormateada;
                    document.getElementById('txa-detalle').value = vale.Detalle;
                    if (vale.EstadoValeID === 3 || vale.EstadoValeID === 5 ) {
                        blockBtn()
                    }
                    acompanantes(vale);
                }
            });

            coordinate.forEach(value => {
                if (id === value.IdVale) {
                    document.getElementById('select-placa').selectedIndex = value.IdUnidad;
                    document.getElementById('select-chofer').selectedIndex = value.IdChofer;
                    document.getElementById('select-encargado').selectedIndex = value.IdFuncionario;
                }
            });

        } catch (error) {
            console.error('Error fetching vale data:', error);
        }
    }

    function acompanantes(vale) {
        if (vale.Acompanante1 != null) {
            const acompDiv1 = document.getElementById('input-acompanante1');
            const div1 = document.getElementById('div1');
            div1.style.display = 'block';
            acompDiv1.value = vale.NombreAcompanante1;
        }
        if (vale.Acompanante2 != null) {
            const acompDiv1 = document.getElementById('input-acompanante2');
            const div1 = document.getElementById('div2');
            div1.style.display = 'block';
            acompDiv1.value = vale.NombreAcompanante2;
        }
        if (vale.Acompanante3 != null) {
            const acompDiv1 = document.getElementById('input-acompanante3');
            acompDiv1.style.display = 'block';
            acompDiv1.value = vale.NombreAcompanante1;
        }
        if (vale.Acompanante4 != null) {
            const acompDiv1 = document.getElementById('input-acompanante4');
            acompDiv1.style.display = 'block';
            acompDiv1.value = vale.NombreAcompanante1;
        }
        if (vale.Acompanante5 != null) {
            const acompDiv1 = document.getElementById('input-acompanante5');
            acompDiv1.style.display = 'block';
            acompDiv1.value = vale.NombreAcompanante1;
        }
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    document.getElementById('input-fechaReq').min = formattedDate;


    async function addCoordinate() {
        try {
            const coordinate = {
                IdVale: idVale,
                IdUnidad: document.getElementById('select-placa').selectedIndex,
                IdChofer: document.getElementById('select-chofer').selectedIndex,
                IdFuncionario: document.getElementById('select-encargado').selectedIndex,
                Observaciones: "Agregando datos"
            };
            try {
                await axios.get(`${url}api/revicionVale`, coordinate);
                showToast('Datos Agregados', 'Los datos se han guardado correctamente');
                console.log(coordinate);
            } catch (error) {
                console.error('Error al guardar datos', error);
                showToast('Error', 'Error al guardar la cita.');
            }
        } catch (error) {
            console.error('Error fetching vale data:', error);
        }
    }

    const btnAdd = document.getElementById('btn-agregarSoli');
    btnAdd.addEventListener('click', function () {
        addCoordinate();
        const newIdEstado = 2;
        const valueId = document.getElementById('input-id').value;
        newStatus(valueId,newIdEstado);
    })

    // Configura la URL y los datos a enviar
    async function newStatus(valueId, newIdEstado) {
        try {
            // Configuracion de la URL para ejecutar la actualizacion 
            const valUrl = `${url}api/vales/actualizarEstado/${valueId}/${newIdEstado}`;
            // Realiza la petición PUT para actualizar el campo
            const response = await axios.put(valUrl);
            console.log('Campo actualizado correctamente:');
            if (newIdEstado === 3) {
                showToast('Se ha modificado el estado del vale', 'El vale ha sido rechazado');
            }else{
                showToast('Se ha modificado el estado del vale', 'El vale ha sido aprobado');
            }
            
        } catch (error) {
            console.error('Error al actualizar el campo:', error);
            throw error; // Propaga el error para manejarlo en el contexto externo si es necesario
        }
    }    

    //Se configuro el boton y se llama a la funcion Cancelar con el evento click
    const btnCancel = document.getElementById('btn-rechazarSoli');
    btnCancel.addEventListener('click', function () {
        const newIdEstado = 3;
        const valueId = document.getElementById('input-id').value;
        newStatus(valueId,newIdEstado);
    });
    
    function blockBtn(){
        btnCancel.disabled = true;
        btnAdd.disabled = true;
    }
})();

