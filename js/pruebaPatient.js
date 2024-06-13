document.querySelector('#guardarFormPatients').addEventListener('click', function () {
    addPersona();
});

//1
function addPersona() {
    const nombre = document.querySelector('#nombre').value;
    const primerApellido = document.querySelector('#primerApellido').value;
    const segundoApellido = document.querySelector('#segundoApellido').value;
    const identificacion = document.querySelector('#identificacion').value;
    const tipoIdentificacion = document.querySelector('#tipoIdentificacion').value;
    const genero = document.querySelector('#genero').value;
    const telefono1 = document.querySelector('#telefono1').value;
    const telefono2 = document.querySelector('#telefono2').value;
    const tipoSeguro = document.querySelector('#tipoSeguro').value;
    const direccion = document.querySelector('#direccion').value;
    const latitud = parseFloat(document.querySelector('#latitud').value);
    const longitud = parseFloat(document.querySelector('#longitud').value);
    const tipoSangre = document.querySelector('#tipoSangre').value;

    const personaData = {
        "Nombre": nombre,
        "Apellido1": primerApellido,
        "Apellido2": segundoApellido,
        "Identificacion": identificacion,
        "Tipo_identificacion": tipoIdentificacion,
        "Genero": genero,
        "Telefono1": telefono1,
        "Telefono2": telefono2,
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
    } catch (error) {
        console.error(error);
    }
}

//7
function addCompanion(idPaciente) {
    const acompananteNombre1 = document.querySelector('#acompananteNombre1').value;
    const acompananteApellido1 = document.querySelector('#acompananteApellido1_1').value;
    const acompananteApellido2 = document.querySelector('#acompananteApellido2_1').value;
    const acompananteIdentificacion1 = document.querySelector('#acompananteIdentificacion1').value;
    const acompananteTelefono1_1 = document.querySelector('#acompananteTelefono1_1').value;
    const acompananteTelefono2_1 = document.querySelector('#acompananteTelefono2_1').value;
    const acompananteParentesco1 = document.querySelector('#acompananteParentesco1').value;

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
        console.log('Acompañante Encontrado', acompananteEncontrado);
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