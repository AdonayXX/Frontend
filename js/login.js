document.addEventListener('DOMContentLoaded', () => {
getVales();
});

var motivoSeleccionado;
function mostrarCampos() {
    motivoSeleccionado = document.getElementById('motivo').value;
    var contenedorSelectSalida = document.getElementById('contenedorSelectSalida');
    var contenedorSelectDestino = document.getElementById('contenedorSelectDestino');
    var contenedorEscribirSalida = document.getElementById('contenedorEscribirSalida');
    var contenedorEscribirDestino = document.getElementById('contenedorEscribirDestino');

    if (motivoSeleccionado === '3') {
        contenedorSelectSalida.style.display = 'block';
        contenedorSelectDestino.style.display = 'block';
        contenedorEscribirSalida.style.display = 'none';
        contenedorEscribirDestino.style.display = 'none';
        document.getElementById('lugarSa2').setAttribute('disabled', 'disabled');
        document.getElementById('lugarDes2').setAttribute('disabled', 'disabled');
    } else {
        contenedorSelectSalida.style.display = 'none';
        contenedorSelectDestino.style.display = 'none';
        contenedorEscribirSalida.style.display = 'block';
        contenedorEscribirDestino.style.display = 'block';
        document.getElementById('lugarSa2').removeAttribute('disabled');
        document.getElementById('lugarDes2').removeAttribute('disabled');
    }
}

function loadToastTemplate(callback) {
    fetch('toast-template.html')
        .then(response => response.text())
        .then(data => {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = data;
                if (callback) callback();
            } else {
                console.error('Toast container no encontrado');
            }
        })
        .catch(error => console.error('Error al cargar la plantilla de toast:', error));
}

function showToast(title, message, reloadCallback) {
    loadToastTemplate(() => {
        const toastElement = document.getElementById('common-toast');
        if (toastElement) {
            document.getElementById('common-toast-title').innerText = title;
            document.getElementById('common-toast-body').innerText = message;
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            setTimeout(() => {
                toast.hide();
                if (reloadCallback) {
                    reloadCallback();
                }
            }, 2000);
        } else {
            console.error('Toast element no encontrado');
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    var today = new Date();
    var formattedDate = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    document.getElementById('date').textContent = formattedDate;
});

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;
document.getElementById('b_date').min = formattedDate;

let acompananteCount = 0;
document.getElementById('addCompanion').addEventListener('click', function () {
    if (acompananteCount < 5) {
        acompananteCount++;
        const acompDiv = document.getElementById('acompanante' + acompananteCount);
        if (acompDiv) {
            acompDiv.style.display = 'block';
        }
    } else {
        showToast("Error", "No se pueden agregar más de 5 acompañantes");
    }
});
    
    document.getElementById('removeCompanion').addEventListener('click', function () {
        if (acompananteCount > 0) {
            const acompDiv = document.getElementById('acompanante' + acompananteCount);
            if (acompDiv) {
                const inputs = acompDiv.getElementsByTagName('input');
                for (let input of inputs) {
                    input.value = '';
                }
                acompDiv.style.display = 'none';
            }
            acompananteCount--;
        }
    });
    
    
    
    
    function SolicitarVale() {
     Promise.all([
            ObtenerUnidades(),
            
            ObtenerServicios(),
            ObtenerMotivos(),
            ObtenerDestino(),
            ObtenerSalida(),
            ObtenerRutaSalida(),
            ObtenerRutaDestino()
        ]).then(() => {
            // console.log('Todos los selects han sido llenados. Ahora cargando datos del localStorage.');
            loadFormData();
        }).catch(error => {
            console.error('Hubo un problema al cargar los datos:', error);
        });
    }
    
    var url = 'https://backend-transporteccss.onrender.com/';
    //Obtener Unidades
    function ObtenerUnidades() {
    
        return axios.get(`${url}api/unidadProgramatica`)
            .then(response => {
    
        return LlenarUnidadesProgramaticas(response.data);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
    
    function LlenarUnidadesProgramaticas(data) {
     return new Promise((resolve) => {
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            for (let index = 0; index < data.length; index++) {
                body += `<option value="${data[index].IdUnidadProgramatica}">${data[index].IdUnidadProgramatica} - ${data[index].NombreUnidad}</option>`;
            }
            document.getElementById('Up').innerHTML = body;
            resolve();
        });
    }
    
    //Obtener servicios
    function ObtenerServicios() {
      return axios.get(`${url}api/servicios`)
            .then(response => {
      return LlenarServicios(response.data);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
    
    function LlenarServicios(data) {
      return new Promise((resolve) => {
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            for (let index = 0; index < data.length; index++) {
                body += `<option value="${data[index].ServicioID}">${data[index].Descripcion}</option>`;
            }
            document.getElementById('service').innerHTML = body;
            resolve();
        });
    }
    
    //Obtener los Motivos
    function ObtenerMotivos() {
     return axios.get(`${url}api/motivoVale`)
            .then(response => {
      return llenarMotivos(response.data);
            })
            .catch(error => {
                console.error('Hubo un problema al obtener los datos:', error);
            });
    }
    
    // Función para llenar las opciones del select de motivo
    function llenarMotivos(data) {
      return new Promise((resolve) => {
            let options = '<option selected disabled value="">Seleccione una opción</option>';
            data.forEach(motivo => {
                options += `<option value="${motivo.id}">${motivo.descripcion}</option>`;
            });
            document.getElementById('motivo').innerHTML = options;
            resolve();
        });
    }
    
    //Obtener Lugar de Salida
    function ObtenerSalida() {
    
     return axios.get(`${url}api/ebais/perifericos`)
            .then(response => {
     return LlenarSalida(response.data.ebaisPerifericos);
            })
            .catch(error => {
                console.error('Hubo un problema con la operación de obtención:', error);
            });
    }
    
    // Llenar selector de lugar de salida con EBAIS
    function LlenarSalida(data) {
     return new Promise((resolve) => {
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            data.forEach(ebai => {
                body += `<option value="${ebai.id}">${ebai.Ebais} - ${ebai.Periferico}</option>`;
            });
            document.getElementById('lugarSa').innerHTML = body;
            resolve();
        });
    }
    
    // Obtener EBAIS para lugar de destino
    function ObtenerDestino() {
    return axios.get(`${url}api/ebais/perifericos`)
            .then(response => {
     return LlenarDestino(response.data.ebaisPerifericos);
            })
            .catch(error => {
                console.error('Hubo un problema con la operación de obtención:', error);
            });
    }
    
    // Llenar selector de lugar de destino con EBAIS
    function LlenarDestino(data) {
     return new Promise((resolve) => {
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            data.forEach(ebai => {
                body += `<option value="${ebai.id}">${ebai.Ebais} - ${ebai.Periferico}</option>`;
            });
            document.getElementById('lugarDes').innerHTML = body;
            resolve();
        });
    
    }
    
    //------------------------------------------------------------------------------------------
    //Funciones para obtener las rutas
    function ObtenerRutaSalida() {
    
      return axios.get(`${url}api/rutas`)
            .then(response => {
    
     return LlenarRutaSalida(response.data);
            })
            .catch(error => {
                console.error('Hubo un problema al obtener los datos:', error);
            });
    }
    
    function LlenarRutaSalida(data) {
        return new Promise((resolve) => {
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            for (let index = 0; index < data.length; index++) {
                body += `<option value="${data[index].IdRuta}">${data[index].IdRuta} - ${data[index].Descripcion}</option>`;
            }
            document.getElementById('lugarSa2').innerHTML = body;
            resolve();
        });
    }
    
    function ObtenerRutaDestino() {
    
        return axios.get(`${url}api/rutas`)
            .then(response => {
    
      return LlenarRutaDestino(response.data);
            })
            .catch(error => {
                console.error('Hubo un problema al obtener los datos:', error);
            });
    }
    
    function LlenarRutaDestino(data) {
    return new Promise((resolve) => {
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            for (let index = 0; index < data.length; index++) {
                body += `<option value="${data[index].IdRuta}">${data[index].IdRuta} - ${data[index].Descripcion}</option>`;
            }
            document.getElementById('lugarDes2').innerHTML = body;
            resolve();
        });
    }
    
    document.getElementById('btn_Guardar').addEventListener('click', function (event) {
        event.preventDefault();
        GuardarDatos();
    });
    
    function validateModalForm() {
        const inputs = document.querySelectorAll('#form-request input, #form-request textarea, #form-request select');
        let isValid = true;
    
        inputs.forEach(input => {
            if (input.id.startsWith('acompananteNombre')) return;
            if (input.offsetParent === null) return;
            if (input.value.trim() === '' || input.value === null) {
                isValid = false;
            }
        });
    
        return isValid;
    }
    
    function GuardarDatos() {
        if (!validateModalForm()) {
            showToast("Error", "Se deben llenar todos los campos");
            return;
        }
    
        let Acompanante1 = document.getElementById('acompananteNombre1').value;
        let Acompanante2 = document.getElementById('acompananteNombre2').value;
        let Acompanante3 = document.getElementById('acompananteNombre3').value;
        let Acompanante4 = document.getElementById('acompananteNombre4').value;
        let Acompanante5 = document.getElementById('acompananteNombre5').value;
        const IdUnidadProgramatica = document.getElementById('Up').value;
        const ServicioID = document.getElementById('service').value;
        const MotivoID = document.getElementById('motivo').value;
        const Detalle = document.getElementById('detalle').value;
        const NombreSolicitante = document.getElementById('nameSoli').value;
        const Estado = 1;
        const Hora_Salida = document.getElementById('hora_salida').value;
        const Fecha_Solicitud = document.getElementById('b_date').value;
    
    const Chofer = document.getElementById('chofer').checked ? 1 : 0; 
        let SalidaId = document.getElementById('lugarSa2').value;
        let DestinoId = document.getElementById('lugarDes2').value;
        let SalidaEbaisId = document.getElementById('lugarSa').value;
        let DestinoEbaisId = document.getElementById('lugarDes').value;
    
        Acompanante1 = adjustToNullIfEmpty(Acompanante1);
        Acompanante2 = adjustToNullIfEmpty(Acompanante2);
        Acompanante3 = adjustToNullIfEmpty(Acompanante3);
        Acompanante4 = adjustToNullIfEmpty(Acompanante4);
        Acompanante5 = adjustToNullIfEmpty(Acompanante5);
    
        function adjustToNullIfEmpty(value) {
            if (typeof value === 'string' && value.trim() === '') {
                value = null;
            }
            return value;
        }
    
        if (motivoSeleccionado === '3') {
            SalidaId = null;
            DestinoId = null;
        } else {
            SalidaEbaisId = null;
            DestinoEbaisId = null;
        }
    
        const datos = {
            NombreSolicitante: NombreSolicitante,
            SalidaId: SalidaId,
            DestinoId: DestinoId,
            SalidaEbaisId: SalidaEbaisId,
            DestinoEbaisId: DestinoEbaisId,
            MotivoId: MotivoID,
            ServicioId: ServicioID,
            Fecha_Solicitud: Fecha_Solicitud,
            Hora_Salida: Hora_Salida,
            Detalle: Detalle,
            EstadoId: Estado,
            IdUnidadProgramatica: IdUnidadProgramatica,
            Acompanante1: Acompanante1,
            Acompanante2: Acompanante2,
            Acompanante3: Acompanante3,
            Acompanante4: Acompanante4,
            Acompanante5: Acompanante5,
            Chofer: Chofer
        };
    
     axios.post(`${url}api/vales`, datos)
            .then(response => {
                showToast("Éxito!", "Se generó la solicitud exitosamente");
                getVales();
                saveFormData();
    
     })
            .catch(error => {
                if (error.response) {
                    showToast("Error al guardar los datos", error.response.data.message);
                } else {
                    console.error('Error desconocido:', error);
                }
            });
    
    }
    
    document.getElementById('btn-limpiar').addEventListener('click', function () {
    
     const fields = [
            'acompananteNombre1', 'acompananteNombre2', 'acompananteNombre3',
            'acompananteNombre4', 'acompananteNombre5', 'Up', 'lugarSa', 'service',
            'motivo', 'lugarDes', 'detalle', 'nameSoli', 'hora_salida', 'b_date',
            'lugarSa2', 'lugarDes2', 'chofer'
        ];
    
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element.type === 'checkbox') {
                element.checked = false;
            } else {
                element.value = '';
            }
        });
    
        document.addEventListener('DOMContentLoaded', getVales);
    
     localStorage.clear();
    });
    
    var error;
    
    //Mostrar ID de Vale
    async function getVales() {
        try {
            const response = await axios.get(`${url}api/vales`);
            const data = response.data;
            const vales = data.vales;
    
            if (vales.length > 0) {
                const ids = vales.map(vale => vale.IdVale);
                const lastId = ids.sort().reverse()[0];
                const [year, number] = lastId.split('-');
                const newNumber = String(parseInt(number) + 1).padStart(3, '0');
                const nuevoId = `${year}-${newNumber}`;
                document.getElementById('valeId').textContent = nuevoId;
            } else {
                document.getElementById('valeId').textContent = '2024-001';
            }
        } catch (error) {
            console.error('Hubo un problema con la operación de obtención:', error);
            document.getElementById('valeId').textContent = 'Error al obtener vales';
        }
    }
    // Funcion para guardar los datos de vales en localStorage
    function saveFormData() {
        const fields = [
            'acompananteNombre1', 'acompananteNombre2', 'acompananteNombre3',
            'acompananteNombre4', 'acompananteNombre5', 'Up', 'lugarSa', 'service',
            'motivo', 'lugarDes', 'detalle', 'nameSoli', 'hora_salida', 'b_date',
            'lugarSa2', 'lugarDes2'
        ];
    
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                localStorage.setItem(field, element.value);
            }
        });
    
        const choferElement = document.getElementById('chofer');
        if (choferElement) {
            localStorage.setItem('chofer', choferElement.checked ? '1' : '0');
        }
    }
    
    

    function loadFormData() {
        const fields = [
            'acompananteNombre1', 'acompananteNombre2', 'acompananteNombre3',
            'acompananteNombre4', 'acompananteNombre5', 'Up', 'lugarSa', 'service',
            'motivo', 'lugarDes', 'detalle', 'nameSoli', 'hora_salida', 'b_date',
            'lugarSa2', 'lugarDes2'
        ];
    
        fields.forEach(field => {
            const value = localStorage.getItem(field);
            if (value !== null && value !== "") {
                const element = document.getElementById(field);
                element.value = value;
            }
        });
    
        const choferValue = localStorage.getItem('chofer');
        if (choferValue !== null) {
            document.getElementById('chofer').checked = choferValue === '1';
        }
    }
