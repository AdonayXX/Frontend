/////FUNCIONES PARA EL POST
// Evento click en el botón guardar

(async function () {
    //Declaracion "Global"
    const token = localStorage.getItem("token");
    // Cargar choferes en el select
    const listaUnidadesMoto = await cargarUnidades();
    const listaChoferes = await cargarChoferes();

     //Según cambie la unidad cambiar el chofer
     document.querySelector('#choferControlKm').addEventListener("change", function () {
        const idUnidad = document.querySelector('#choferControlKm').value;
        const unidadFiltrada = listaUnidadesMoto.find(unidad => unidad.id === parseInt(idUnidad));

        fillChoferes(listaChoferes, unidadFiltrada.choferDesignado);
        document.querySelector('#placaUnidad').value = unidadFiltrada.numeroUnidad;
        const kmS = document.querySelector('#KmS');
        kmS.value = unidadFiltrada.kilometrajeActual;
    
        // Agregar el evento blur para validar cuando el campo pierda el foco
        kmS.addEventListener('blur', function () {
            if (kmS.value === "" || parseInt(kmS.value) < unidadFiltrada.kilometrajeActual) {
                kmS.value = unidadFiltrada.kilometrajeActual;
            }
        });
    });
    //Obtener la identificacion del chofer para buscar la unidad con la que esta asginado.
    const usuario = await infoUser();

    //Verificamos que es rol Atap para mostrar solo el nombre del chofer ATAP y unidad asginada
    if(usuario.usuario.Rol === 5){
        //Aqui para llenar con la unidad y Chofer  del usuario
        fillUnitUser(listaChoferes,listaUnidadesMoto,usuario);


    }else{
        fillUnits(listaUnidadesMoto);
    }
   
   



// Función para obtener los valores de los campos del formulario
function getDataControlKm() {
    // Obtener el id del chofer y la unidad seleccionados del select
    const idChofer = parseInt(document.getElementById("driverControlKm").value);
    const idUnidad = parseInt(document.getElementById("choferControlKm").value);
    const fechaMantenimiento = formatDate(document.getElementById("dateControlKm").value);
    const kilometrosEntrada = parseInt(document.getElementById("KmE").value);
    const kilometrosSalida = parseInt(document.getElementById("KmS").value);
    let lugarVisitado;
    const numplaca = document.querySelector('#placaUnidad').value;
    if (lugarVisitadoSelect.value === 'Otro') {
        lugarVisitado = lugarVisitadoInput.value.trim();
    } else {
        lugarVisitado = lugarVisitadoSelect.value.trim();
        
    }
  

    // Verificar que todos los campos estén llenos
    if (isNaN(idChofer) || isNaN(idUnidad) || !fechaMantenimiento || isNaN(kilometrosEntrada) || isNaN(kilometrosSalida) || !lugarVisitado) {
        showToast("Ups!", "Por favor llene todos los campos");
        return;
    }

    // Verificar que los kilómetros de entrada no sean menores que los kilómetros de salida
    if (kilometrosEntrada < kilometrosSalida) {
        showToast("Error", "Los kilómetros de entrada no pueden ser menores que los kilómetros de salida");
        return;
    }

    const dataControlKm = {
        IdChofer: idChofer,
        IdUnidad: idUnidad,
        FechaMantenimiento: fechaMantenimiento,
        KilometrosSalida: kilometrosSalida,
        KilometrosEntrada: kilometrosEntrada,
        LugarVisitado: lugarVisitado
    }
     postDataControlKm(dataControlKm,numplaca);
}

//Funcion post 
async function postDataControlKm(dataControlKm,numplaca) {
    try {
        const API_URL = "https://backend-transporteccss.onrender.com/api/mantenimientoATAP/";
        const response = await axios.post(API_URL, dataControlKm, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        if(response){
            const unidadFind = await getUnidadPlaca(numplaca);
            if(unidadFind){
                await actulizarUnidad(unidadFind, dataControlKm.KilometrosEntrada,numplaca)

            }
           
        }
        showToast("Éxito", "Se ha guardado Correctamente.");
        setTimeout(function () {
            loadContent('formKilometerControl.html', 'mainContent');
          }, 500);
    } catch (error) {
        showToast("Error", "Hubo un error al guardar");
    }
}



async function getUnidadPlaca(numUnidad) {
    try {
        const API_URL = `https://backend-transporteccss.onrender.com/api/unidades/${numUnidad}`;
  
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        // Accede al objeto de respuesta
        const dataUnidad = response.data.unidades[0];
        return dataUnidad;
      

       
        
    } catch (error) {
        showToast("Error", "Hubo un error al cargar las unidades");
    }
}

async function actulizarUnidad( dataunidadplaca,kilometrajeActualizar,numplaca){
    try {
           // Preparar los datos de la unidad a actualizar
     const idTipoUnidad = parseInt(dataunidadplaca.idTipoUnidad);
     const idTipoRecurso = parseInt(dataunidadplaca.idTipoRecurso);
     const tipoFrecuenciaCambio = dataunidadplaca.tipoFrecuenciaCambio || null;
     const ultimoMantenimientoFecha = convertISOStringToDate(dataunidadplaca.ultimoMantenimientoFecha)|| null;
     const ultimoMantenimientoKilometraje =parseInt(dataunidadplaca.ultimoMantenimientoKilometraje) || null;
     const numeroUnidad = dataunidadplaca.numeroUnidad;
     const choferDesignado = parseInt(dataunidadplaca.choferDesignado);
     const fechaDekra = convertISOStringToDate(dataunidadplaca.fechaDekra);
     const capacidadTotal = parseInt(dataunidadplaca.capacidadTotal);
     const capacidadCamas = parseInt(dataunidadplaca.capacidadCamas);
     const capacidadSillas = parseInt(dataunidadplaca.capacidadSillas);
     const kilometrajeInicial = parseInt(dataunidadplaca.kilometrajeInicial);
     const kilometrajeActual = parseInt(kilometrajeActualizar);
     const adelanto = parseInt(dataunidadplaca.adelanto);
     const idEstado = parseInt(dataunidadplaca.idEstado);
     const valorFrecuenciaC = parseInt(dataunidadplaca.valorFrecuenciaC);
     const usuario = parseInt(dataunidadplaca.usuario);
 
   dataUnidad ={
       idTipoUnidad,
       idTipoRecurso,
       tipoFrecuenciaCambio,
       ultimoMantenimientoFecha,
       ultimoMantenimientoKilometraje,
       numeroUnidad,
       choferDesignado,
       fechaDekra,
       capacidadTotal,
       capacidadCamas,
       capacidadSillas,
       kilometrajeInicial,
       kilometrajeActual,
       adelanto,
       idEstado,
       valorFrecuenciaC,
       usuario
    }
       const response = axios.put(`https://backend-transporteccss.onrender.com/api/unidades/${numplaca}`, dataUnidad, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    }); 
        
    } catch (error) {
       showToast('Error','Inesperado.')
        
    }
   

  

}

//////FUNCIONALIDADES
// Función para formatear la fecha
function formatDate(date) {
    const d = new Date(date + 'T00:00:00');
    let month = '' + (d.getUTCMonth() + 1);
    let day = '' + d.getUTCDate();
    const year = d.getUTCFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

//Llenar Select unidades
function fillUnits(unidades){
     // Filtrar unidades de tipo id 3 (Motos)
     const motos = unidades.filter(unidad => unidad.idTipoUnidad === 3);

     // Obtener el elemento select
     const selectUnidades = document.getElementById("choferControlKm");

     // Limpiar el select
     selectUnidades.innerHTML = '';

     // Agregar una opción por defecto (opcional)
     const optionDefault = document.createElement("option");
     optionDefault.value = "";
     optionDefault.text = "Seleccione una unidad";
     selectUnidades.appendChild(optionDefault);

     // Agregar las unidades filtradas al select
     motos.forEach(moto => {
         const option = document.createElement("option");
         option.value = moto.id;
         option.text = moto.numeroUnidad;
         selectUnidades.appendChild(option);
     });

} 

async function cargarUnidades() {
    try {
        const API_URL = "https://backend-transporteccss.onrender.com/api/unidades";
  
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const unidades = response.data.unidades;
        return unidades;
    } catch (error) {
        showToast("Error", "Hubo un error al cargar las unidades");
    }
}


function fillChoferes (choferes,idChofer){
      // Obtener el elemento select
      const selectChoferes = document.getElementById("driverControlKm");

      const choferFiltrado  = choferes.find(chofer => chofer.idChofer === idChofer)
      // Limpiar el select
      selectChoferes.innerHTML = '';

      if(choferFiltrado){
        const option = document.createElement("option");
        option.value = choferFiltrado.idChofer
        option.text = `${choferFiltrado.nombre} ${choferFiltrado.apellido1} ${choferFiltrado.apellido2} `; 
        selectChoferes.appendChild(option);
      }

     /*  // Agregar los choferes al select
      choferFiltrado.forEach(chofer => {
          const option = document.createElement("option");
          option.value = chofer.idChofer
          option.text = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2} `; 
          selectChoferes.appendChild(option);
      }); */

}
async function cargarChoferes() {
    try {

        const API_URL = "https://backend-transporteccss.onrender.com/api/chofer";

        // Hacer la solicitud con el token de autorización
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const choferes = response.data.choferes;
        return choferes;

      
    } catch (error) {
        showToast("Error", "Hubo un error al cargar los choferes");
    }
}

//Llenar unidad por la que tiene asignada el chofer
function  fillUnitUser(listaChoferes,unidades,usuario){
    const choferusuarioFiltrado = listaChoferes.find(chofer => chofer.cedula === usuario.usuario.Identificacion)
    // Filtrar unidades de tipo id 3 (Motos)
    const moto = unidades.filter(unidad => unidad.idTipoUnidad === 3 && unidad.choferDesignado === choferusuarioFiltrado.idChofer);

    // Obtener el elemento select
    const selectUnidades = document.getElementById("choferControlKm");

    // Limpiar el select
    selectUnidades.innerHTML = '';
    // Agregar las unidades filtradas al select
    moto.forEach(moto => {
        const option = document.createElement("option");
        option.value = moto.id;
        option.text = moto.numeroUnidad;
        selectUnidades.appendChild(option);
    });
    // Selecciona el elemento con el ID choferControlKm
const choferControlKm = document.querySelector('#choferControlKm');

// Crea un nuevo evento de cambio
const event = new Event('change');

// Despacha (simula) el evento en el elemento seleccionado
choferControlKm.dispatchEvent(event);

}

//Calcular que no se menor al KmS y calcular qel recorrido  KM

const kmE = document.querySelector('#KmE');
const kmC = document.querySelector('#KmC');

kmE.addEventListener('blur', function () {
    const kmSValue = parseInt(document.querySelector('#KmS').value);
    const kmEValue = parseInt(kmE.value);

    if (isNaN(kmEValue) || kmEValue < kmSValue) {
        kmE.value = ""; // Restablecer el campo KmE si el valor es menor que KmS
        kmC.value = "";
        showToast('Kilometraje Entrada','No puede ser menor al Kilometraje Salida.')
    } else {
        kmC.value = kmEValue - kmSValue;
    }
});
const lugarVisitadoSelect = document.querySelector('#LugarVisitadoSelect');
const lugarVisitadoInput = document.querySelector('#LugarVisitadoInput');
const submitBtn = document.querySelector('#submitBtn');

lugarVisitadoSelect.addEventListener('change', function() {
    if (lugarVisitadoSelect.value === 'Otro') {
        lugarVisitadoInput.style.display = 'block';
        lugarVisitadoInput.required = true; // Hacer el input requerido
    } else {
        lugarVisitadoInput.style.display = 'none';
        lugarVisitadoInput.required = false; // Hacer el input no requerido
        lugarVisitadoInput.value = ''; // Limpiar el valor del input
    }
});
document.getElementById("formKilometerControl").addEventListener("submit", function (event) {
    event.preventDefault();
    getDataControlKm();
  
});
function convertISOStringToDate(isoString) {
    if(isoString ===null){
        return null;
    }
    // Crear una instancia de Date usando el string ISO
    const date = new Date(isoString);

    // Obtener el año, mes y día de la fecha
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const day = String(date.getUTCDate()).padStart(2, '0');

    // Formatear la fecha en 'YYYY-MM-DD'
    return `${year}-${month}-${day}`;
  }

   //Asginar fecha del sistema en el input date

   // Obtiene la fecha actual
   const today = new Date();
   // Formatea la fecha a YYYY-MM-DD
   const formattedDate = today.toISOString().split('T')[0];
   // Asigna la fecha formateada al valor del campo de fecha
   document.getElementById('dateControlKm').value = formattedDate;
   
  



    


})();