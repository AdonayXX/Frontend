

document.querySelector('#guardarFormPatients').addEventListener('click', function () {
  addPersona();
});

//1
function addPersona() {
  const nombre = document.querySelector('#nombre').value.trim();
  const primerApellido = document.querySelector('#primerApellido').value.trim();
  const segundoApellido = document.querySelector('#segundoApellido').value.trim();
  const identificacion = document.querySelector('#identificacion').value.trim();
  const tipoIdentificacion = document.querySelector('#tipoIdentificacion').value.trim();
  const genero = document.querySelector('#genero').value.trim();
  const telefono1 = document.querySelector('#telefono1').value.trim();
  const telefono2 = document.querySelector('#telefono2').value.trim()||0;
  const tipoSeguro = document.querySelector('#tipoSeguro').value.trim();
  const direccion = document.querySelector('#direccion').value.trim();
  const latitud = parseFloat(document.querySelector('#latitud').value.trim())||0;
  const longitud = parseFloat(document.querySelector('#longitud').value.trim())||0;
  const tipoSangre = document.querySelector('#tipoSangre').value.trim();
  if (!nombre || !primerApellido || !segundoApellido || !identificacion || !tipoIdentificacion || !genero || 
    !telefono1  || !tipoSeguro || !direccion || !tipoSangre) {
    alert("Por favor, rellena todos los campos solicitados.");
    return;
}


  

  

  const personaData = {
      "Nombre": nombre,
      "Apellido1": primerApellido,
      "Apellido2": segundoApellido,
      "Identificacion": identificacion,
      "Tipo_identificacion": tipoIdentificacion,
      "Genero": genero,
      "Telefono1": telefono1,
      "Telefono2": telefono2 ,
      "Tipo_seguro": tipoSeguro,
      "Direccion": direccion,
      "Latitud": latitud,
      "Longitud": longitud,
      "Tipo_sangre": tipoSangre
  }
  console.log(personaData);
  addPerson(personaData);
}

//2
async function addPerson(personaData) {
  try {
      const API_URL = 'http://localhost:18026/api/persona';
      const response = await axios.get(API_URL);
      const listaPersonas = response.data.personas;
      const personaEncontrada = listaPersonas.find(persona => persona.Identificacion === personaData.Identificacion);
      if (personaEncontrada) {
          console.log('Persona encontrada', personaEncontrada);
          const IdPersonaCreada = personaEncontrada.Id;
          obtenerPaciente(IdPersonaCreada);
      } else {
          addPeople(personaData);
      }
      console.log(response.data.personas);
  } catch (error) {
      console.error(error);
  }
}

//3
async function addPeople(personaData) {
  try {
      const API_URL = 'http://localhost:18026/api/persona';
      const response = await axios.post(API_URL, personaData);
      console.log(response.data);
      console.log(response.data.persona.insertId);
      const idPersona = response.data.persona.insertId;
      obtenerPaciente(idPersona);
  } catch (error) {
      console.error(error);
  }
}

//4
function addPatient(IdPersonaCreada) {
  const prioridad = document.querySelector('#prioridad').checked;
  const lugarSalida = document.querySelector('#lugarSalida').value;
  const encamado = document.querySelector('#encamado').value;

  const pacienteData = {
      "IdPersona": IdPersonaCreada,
      "Criticidad": "null",
      "Encamado": encamado,
      "Traslado": lugarSalida,
      "Prioridad": prioridad,
      "Estado": "Activo"
  }
  agregarPaciente(pacienteData);
  console.log(pacienteData);
}

//5
async function obtenerPaciente(IdPersonaCreada) {
  try {
      const API_URL = 'http://localhost:18026/api/paciente';
      const response = await axios.get(API_URL);
      const listaPacientes = response.data.pacientes;
      console.log(listaPacientes);
      const pacienteEncontrado = listaPacientes.find(paciente => paciente.IdPersona === IdPersonaCreada);
      if (pacienteEncontrado) {
          console.log('Paciente encontrado', pacienteEncontrado);
          alert('El paciente ya se encuentra registrado.');
      } if (!pacienteEncontrado) {
          addPatient(IdPersonaCreada);
      }
  } catch (error) {
      console.error(error);
  }
}

//6
async function agregarPaciente(pacienteData) {
  try {
      const API_URL = 'http://localhost:18026/api/paciente';
      const response = await axios.post(API_URL, pacienteData);
      const listaPacientes = response.data;
      console.log(listaPacientes);
      const idPaciente = (response.data.paciente.insertId);
      console.log(idPaciente);
      addCompanion(idPaciente);
      showToast('Paciente Registrado', 'El registro se ha realizado exitosamente.');
  } catch (error) {
      console.error(error);
  }
}

//7
/* function addCompanion(idPaciente) {
  const acompananteNombre1 = document.querySelector('#acompananteNombre1').value.trim();
  const acompananteApellido1 = document.querySelector('#acompananteApellido1_1').value.trim();
  const acompananteApellido2 = document.querySelector('#acompananteApellido2_1').value.trim();
  const acompananteIdentificacion1 = document.querySelector('#acompananteIdentificacion1').value.trim();
  const acompananteTelefono1_1 = document.querySelector('#acompananteTelefono1_1').value.trim();
  const acompananteTelefono2_1 = document.querySelector('#acompananteTelefono2_1').value.trim()||0;
  const acompananteParentesco1 = document.querySelector('#acompananteParentesco1').value;



    if (!acompananteNombre1 || !acompananteApellido1 || !acompananteApellido2 || !acompananteIdentificacion1 ||
        !acompananteTelefono1_1 || !acompananteParentesco1) {
          alert("Por favor, rellena todos los campos solicitados.");
          return;
        
         

    }else{
      const companionData = {
        "IdPaciente": idPaciente,
        "Nombre": acompananteNombre1,
        "Apellido1": acompananteApellido1,
        "Apellido2": acompananteApellido2,
        "Identificacion": acompananteIdentificacion1,
        "Telefono1": acompananteTelefono1_1,
        "Telefono2": acompananteTelefono2_1,
        "Parentesco": acompananteParentesco1,
        "Estado": "Activo"
      }
      obtenerAcompanante(companionData);

    }
   
    
    const acompananteNombre2 = document.querySelector('#acompananteNombre2').value.trim();
    const acompananteApellido1_2 = document.querySelector('#acompananteApellido1_2').value.trim();
    const acompananteApellido2_2 = document.querySelector('#acompananteApellido2_2').value.trim();
    const acompananteIdentificacion2 = document.querySelector('#acompananteIdentificacion2').value.trim();
    const acompananteTelefono1_2 = document.querySelector('#acompananteTelefono1_2').value.trim();
    const acompananteTelefono2_2 = document.querySelector('#acompananteTelefono2_2').value.trim()||0;
    const acompananteParentesco2 = document.querySelector('#acompananteParentesco2').value;

if (!acompananteNombre2 || !acompananteApellido1_2 || !acompananteApellido2_2 || !acompananteIdentificacion2 ||
  !acompananteTelefono1_2  || !acompananteParentesco2) {
    alert("Por favor, rellena todos los campos solicitados.");
    return;
  
  
} else {
  const companionData2 = {
    "IdPaciente": idPaciente,
    "Nombre": acompananteNombre2,
    "Apellido1": acompananteApellido1_2,
    "Apellido2": acompananteApellido2_2,
    "Identificacion": acompananteIdentificacion2,
    "Telefono1": acompananteTelefono1_2,
    "Telefono2": acompananteTelefono2_2,
    "Parentesco": acompananteParentesco2,
    "Estado": "Activo"
  }
  obtenerAcompanante(companionData2);
  
}

 
} */

function addCompanion(idPaciente) {
  const numAcompanantes = 2; // Número máximo de acompañantes a manejar
  
  for (let i = 1; i <= numAcompanantes; i++) {
    const acompananteNombre = document.querySelector(`#acompananteNombre${i}`).value.trim();
    const acompananteApellido1 = document.querySelector(`#acompananteApellido1_${i}`).value.trim();
    const acompananteApellido2 = document.querySelector(`#acompananteApellido2_${i}`).value.trim();
    const acompananteIdentificacion = document.querySelector(`#acompananteIdentificacion${i}`).value.trim();
    const acompananteTelefono1 = document.querySelector(`#acompananteTelefono1_${i}`).value.trim();
    const acompananteTelefono2 = document.querySelector(`#acompananteTelefono2_${i}`).value.trim() || 0;
    const acompananteParentesco = document.querySelector(`#acompananteParentesco${i}`).value.trim();

    if (acompananteNombre || acompananteApellido1 || acompananteApellido2 || acompananteIdentificacion ||
        acompananteTelefono1 || acompananteTelefono2 !== '0' || acompananteParentesco) {

      const companionData = {
        "IdPaciente": idPaciente,
        "Nombre": acompananteNombre,
        "Apellido1": acompananteApellido1,
        "Apellido2": acompananteApellido2,
        "Identificacion": acompananteIdentificacion,
        "Telefono1": acompananteTelefono1,
        "Telefono2": acompananteTelefono2,
        "Parentesco": acompananteParentesco,
        "Estado": "Activo"
      };

 
      obtenerAcompanante(companionData);
    }
  }
}

//8: Verifica si el acompañante ya está registrado
async function obtenerAcompanante(companionData){
  try {
    const API_URL = 'http://localhost:18026/api/acompanante';
    const response = await axios.get(API_URL);
    const listaAcompanantes = response.data.acompanantes;
    console.log(listaAcompanantes);
    const acompananteEncontrado = listaAcompanantes.find(acompanante => acompanante.Identificacion === companionData.Identificacion && acompanante.IdPaciente === companionData.IdPaciente );
    console.log(companionData);
    if (acompananteEncontrado){
      alert('El acompañante ya esta registrado al paciente.');
    }else{
      console.log('Acompañante no encontrado', acompananteEncontrado);
      agregarAcompanante(companionData);
    }
  } catch (error) {
    
  }
}

//9: Registra un nuevo acompañante
async function agregarAcompanante(companionData) {
  try {
    console.log(companionData);
    const API_URL = 'http://localhost:18026/api/acompanante';
    const response = await axios.post(API_URL, companionData);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}


//Funcion de botones agregar pacientes
(function() {
  let acompananteCount = 0;

  function addAcompanante() {
      if (acompananteCount < 2) {
          acompananteCount++;
          document.getElementById('acompanante' + acompananteCount).style.display = 'block';
      }
  }

  function removeAcompanante() {
      if (acompananteCount > 0) {
          document.getElementById('acompanante' + acompananteCount).style.display = 'none';
          acompananteCount--;
      }
  }

  function cambiarEstiloBoton(btn, div) {
      if (div.style.display === 'none' || div.style.display === '') {
          btn.style.backgroundColor = '#198754';
      } else {
          btn.style.backgroundColor = '#DC3545';
      }
  }

  function togglePhone(btn, div) {
      if (div.style.display === 'none' || div.style.display === '') {
          div.style.display = 'block';
          btn.innerHTML = '<i class="bi bi-telephone-minus-fill"></i>';
      } else {
          div.style.display = 'none';
          btn.innerHTML = '<i class="bi bi-telephone-plus-fill"></i>';
      }
      cambiarEstiloBoton(btn, div);
  }

  document.getElementById('addAcompananteBtn').addEventListener('click', addAcompanante);
  document.getElementById('removeAcompananteBtn').addEventListener('click', removeAcompanante);

  const PhoneBtn = document.getElementById('PhoneBtn1');
  const phonebtn2 = document.getElementById('PhoneBtn2');
  const acompananteTelefono2_1Div = document.getElementById('acompanantePhone');
  const acompananteTelefono2_2Div = document.getElementById('acompanantePhone2');

  PhoneBtn.addEventListener('click', function() {
      togglePhone(PhoneBtn, acompananteTelefono2_1Div);
  });

  phonebtn2.addEventListener('click', function() {
      togglePhone(phonebtn2, acompananteTelefono2_2Div);
  });

  // Inicializa el estilo de los botones
  cambiarEstiloBoton(PhoneBtn, acompananteTelefono2_1Div);
  cambiarEstiloBoton(phonebtn2, acompananteTelefono2_2Div);
})();
