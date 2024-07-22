//Evento para guardar Personas/Pacientes/Acompañantes
document.querySelector('#guardarFormPatients').addEventListener('click', () => {
  let identificacionAcomp1 = document.querySelector('#acompananteIdentificacion1').value.trim();
  let identificacionAcomp2 = document.querySelector('#acompananteIdentificacion2').value.trim();
  let identificacionPerson = document.querySelector('#identificacion').value.trim();

  if (identificacionAcomp1 && identificacionAcomp2) {
    if (identificacionAcomp1 === identificacionAcomp2) {
      showToast('Error', 'Los dos acompañantes no pueden ser la misma persona.');
      return;
    }
  }
  addPersona();
});
//Capturar los datos de la persona
function addPersona() {
  try {
    const nombre = document.querySelector('#nombre').value.trim();
    const primerApellido = document.querySelector('#primerApellido').value.trim();
    const segundoApellido = document.querySelector('#segundoApellido').value.trim();
    const identificacion = document.querySelector('#identificacion').value.trim();
    const tipoIdentificacion = document.querySelector('#tipoIdentificacion').value.trim();
    const genero = document.querySelector('#genero').value.trim();
    const telefono1 = document.querySelector('#telefono1Hidden').value.trim();
    const telefono2 = document.querySelector('#telefono2Hidden').value.trim() || 0;
    const direccion = document.querySelector('#direccion').value.trim();
    const latitud = parseFloat(document.querySelector('#latitud').value.trim()) || 0;
    const longitud = parseFloat(document.querySelector('#longitud').value.trim()) || 0;
    const tipoSangre = document.querySelector('#tipoSangre').value.trim();
    if (!nombre || !primerApellido || !segundoApellido || !identificacion || !tipoIdentificacion || !genero ||
      !telefono1 || !direccion || !tipoSangre) {
      showToast('', 'Por favor, rellena todos los campos solicitados.');
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
      "Telefono2": telefono2,
      "Tipo_seguro": "N/A",
      "Direccion": direccion,
      "Latitud": latitud,
      "Longitud": longitud,
      "Tipo_sangre": tipoSangre
    }
    //Funcion para agregar persona
    addPerson(personaData);

  } catch (error) {
    showToast('Ups!', 'Ocurrio un problema con los campos del formulario.');
    console.error(error);

  }


}

//2 Obtener Persona si  ya existe
async function addPerson(personaData) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/persona';
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const listaPersonas = response.data.personas;
    const personaEncontrada = listaPersonas.find(persona => persona.Identificacion === personaData.Identificacion);
    if (personaEncontrada) {
      const IdPersonaCreada = personaEncontrada.Id;
      // getPatient(IdPersonaCreada);
      addDataPatient(IdPersonaCreada);
    } else {
      addPeople(personaData);
    }

  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error(error);
      showToast('Ups!', errorMessage);

    } else {
      showToast('Error', 'Hubo un problema al enviar los datos.');
      console.error(error);

    }
  }
}

//3 Agregar Persona
async function addPeople(personaData) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/persona';
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, personaData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const idPersona = response.data.persona.insertId;

    //getPatient(idPersona);
    addDataPatient(idPersona);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error(error);
      showToast('Ups!', errorMessage);

    } else {
      showToast('Error', 'hubo un problema al enviar los datos.');
      console.error(error);

    }
  }
}
document.querySelector('#telefono1').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});
document.querySelector('#telefono2').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});
document.querySelector('#acompananteTelefono1_1').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});
document.querySelector('#acompananteTelefono2_1').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});
document.querySelector('#acompananteTelefono1_2').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});
document.querySelector('#acompananteTelefono2_2').addEventListener('input', function (e) {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});

//4 Capturar Datos para Paciente
function addDataPatient(IdPersonaCreada) {
  const prioridad = JSON.stringify(document.getElementById('prioridad').checked ? true : false);
  const traslado = JSON.stringify(document.getElementById('prioridad').checked ? true : false);
  const lugarSalida = document.querySelector('#lugarSalida').value;
  const encamado = document.querySelector('#encamado').value;
  const pacienteData = {
    "IdPersona": IdPersonaCreada,
    "Criticidad": "N/A",
    "Encamado": encamado,
    "Traslado": traslado,
    "Prioridad": prioridad,
    "Estado": "Activo",
    "LugarSalida": lugarSalida,
  }

  addPatient(pacienteData);

}


//6
async function addPatient(pacienteData) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/paciente';
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, pacienteData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const idPaciente = (response.data.paciente.insertId);
    addCompanion(idPaciente);
    showToast('Paciente Registrado', 'El registro se ha realizado exitosamente.');
    loadContent('formPatient.html', 'mainContent');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error('Error específico:', errorMessage);
      showToast('Ups!', errorMessage);

    } else {
      showToast('Error', 'Hubo un problema al enviar los datos.');

    }
  }
}

//Capturar los datos de los acompñantes

function addCompanion(idPaciente) {
  const numAcompanantes = 2; // 


  for (let i = 1; i <= numAcompanantes; i++) {
    const acompananteNombre = document.querySelector(`#acompananteNombre${i}`).value.trim();
    const acompananteApellido1 = document.querySelector(`#acompananteApellido1_${i}`).value.trim();
    const acompananteApellido2 = document.querySelector(`#acompananteApellido2_${i}`).value.trim();
    const acompananteIdentificacion = document.querySelector(`#acompananteIdentificacion${i}`).value.trim();
    const acompananteTelefono1 = document.querySelector(`#acompananteTelefono1Hidden_${i}`).value.trim();
    const acompananteTelefono2 = document.querySelector(`#acompananteTelefono2Hidden_${i}`).value.trim() || 0;
    const acompananteParentesco = document.querySelector(`#acompananteParentesco${i}`).value.trim();

    if (acompananteNombre && acompananteApellido1 && acompananteApellido2 && acompananteIdentificacion &&
      acompananteTelefono1 && acompananteParentesco) {

      const companionData = {
        "IdPaciente": idPaciente,
        "Nombre": acompananteNombre,
        "Apellido1": acompananteApellido1,
        "Apellido2": acompananteApellido2,
        "Identificacion": acompananteIdentificacion,
        "Parentesco": acompananteParentesco,
        "Telefono1": acompananteTelefono1,
        "Telefono2": acompananteTelefono2


      };


      addComp(companionData);
    }
  }


}


//9: Registra un nuevo acompañante
async function addComp(companionData) {
  try {

    const API_URL = 'https://backend-transporteccss.onrender.com/api/acompanantes';
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, companionData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

  } catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error(error);
      showToast('Ups!', errorMessage);

    } else {
      showToast('Error', 'Hubo un problema al enviar los datos del acompañante.');
      console.error(error);

    }
  }
}


//Funcion de botones agregar acompañante
(function () {
  let acompananteCount = 0;

  function isAcompananteFilled(index) {
    const nombre = document.getElementById(`acompananteNombre${index}`).value;
    const apellido1 = document.getElementById(`acompananteApellido1_${index}`).value;
    const apellido2 = document.getElementById(`acompananteApellido2_${index}`).value;
    const identificacion = document.getElementById(`acompananteIdentificacion${index}`).value;
    const parentesco = document.getElementById(`acompananteParentesco${index}`).value;
    const telefono1 = document.getElementById(`acompananteTelefono${index}_1`).value;

    return nombre !== '' && apellido1 !== '' && apellido2 !== '' && identificacion !== '' && parentesco !== '' && telefono1 !== '';
  }

  function addAcompanante() {
    if (acompananteCount < 2) {
      if (acompananteCount === 0 || isAcompananteFilled(acompananteCount)) {
        acompananteCount++;
        document.getElementById('acompanante' + acompananteCount).style.display = 'block';
      } else {
        showToast('Ups!', 'Completa los datos del primer acompañante para ingresar uno nuevo.');
      }
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

  PhoneBtn.addEventListener('click', function () {
    togglePhone(PhoneBtn, acompananteTelefono2_1Div);
  });

  phonebtn2.addEventListener('click', function () {
    togglePhone(phonebtn2, acompananteTelefono2_2Div);
  });


  cambiarEstiloBoton(PhoneBtn, acompananteTelefono2_1Div);
  cambiarEstiloBoton(phonebtn2, acompananteTelefono2_2Div);
})();

// Funciones para máscara de inputs numéricos
function applyInputMask(elementId, hiddenElementId, mask) {
  let inputElement = document.getElementById(elementId);
  let hiddenElement = document.getElementById(hiddenElementId);
  let content = '';

  function updateValue() {
    inputElement.value = maskIt(mask, content);
    hiddenElement.value = content.replace(/\D/g, '');
    inputElement.setAttribute('data-hidden-value', hiddenElement.value);
  }

  inputElement.addEventListener('keydown', function (e) {
    if (e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      return;
    }

    e.preventDefault();

    if (e.key === 'Backspace') { // Backspace key
      content = content.substr(0, content.length - 1);
      updateValue();
      return;
    }

    if (isNumeric(e.key) && content.length < mask.length) {
      content += e.key;
      updateValue();
    }
  });

  inputElement.addEventListener('input', function (e) {
    let newValue = inputElement.value.replace(/\D/g, '');

    if (newValue.length < content.length) {
      content = content.substr(0, newValue.length);
    } else {
      content = newValue;
    }

    updateValue();
  });
}

function isNumeric(char) {
  return !isNaN(char - parseInt(char));
}

function maskIt(pattern, value) {
  let maskedValue = '';
  let valueIndex = 0;

  for (let patternIndex = 0; patternIndex < pattern.length; patternIndex++) {
    if (valueIndex >= value.length) {
      break;
    }

    if (pattern[patternIndex] === '0') {
      maskedValue += value[valueIndex];
      valueIndex++;
    } else {
      maskedValue += pattern[patternIndex];
    }
  }

  return maskedValue;
}

// Aplicar la máscara a los inputs
applyInputMask('telefono1', 'telefono1Hidden', '0000-0000');
applyInputMask('telefono2', 'telefono2Hidden', '0000-0000');
applyInputMask('acompananteTelefono1_1', 'acompananteTelefono1Hidden_1', '0000-0000');
applyInputMask('acompananteTelefono2_1', 'acompananteTelefono2Hidden_1', '0000-0000');
applyInputMask('acompananteTelefono1_2', 'acompananteTelefono1Hidden_2', '0000-0000');
applyInputMask('acompananteTelefono2_2', 'acompananteTelefono2Hidden_2', '0000-0000');

// Función para aplicar la máscara según el tipo de identificación seleccionado
function applyMaskBasedOnType() {
  let tipoIdentificacion = document.getElementById('tipoIdentificacion').value;
  let identificacionInput = document.getElementById('identificacion');
  let mask = '';

  switch (tipoIdentificacion) {
    case 'Cédula de Identidad':
      mask = '0-0000-0000';
      break;
    case 'Número de Asegurado':
      mask = '0000000000000000000000000';
      break;
    case 'Interno':
      mask = '2536-00000000000000000000';
      break;
    default:
      identificacionInput.removeAttribute('data-mask');
      break;
  }

  identificacionInput.value = '';
  applyIdentificationMask('identificacion', mask);
}

function applyIdentificationMask(elementId, mask) {
  let inputElement = document.getElementById(elementId);
  if (!inputElement) return;

  let content = '';

  function updateValue() {
    inputElement.value = maskIt(mask, content);
  }

  inputElement.addEventListener('input', function (e) {
    let newValue = this.value.replace(/\D/g, '');

    // Solo actualizar content si hay cambios en la longitud
    if (newValue.length < content.length) {
      content = content.substr(0, newValue.length);
    } else {
      content = newValue;
    }

    updateValue();
  });

  inputElement.addEventListener('keydown', function (e) {
    if (e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      return;
    }

    e.preventDefault();

    if (!mask) {
      mask = '';
    }

    if (e.key === 'Backspace') {
      content = content.substr(0, content.length - 1);
      updateValue();
      return;
    }

    if (isNumeric(e.key) && content.length < mask.length) {
      content += e.key;
      updateValue();
    }
  });

  // Inicializar el valor del campo
  updateValue();
}

document.getElementById('tipoIdentificacion').addEventListener('change', function () {
  applyMaskBasedOnType();
});

// Inicializar la máscara según el tipo de identificación seleccionado
applyMaskBasedOnType();
applyIdentificationMask('identificacion', ''); 


function toSentenceCase(str) {
  return str.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
}

document.querySelectorAll('input[type="text"]').forEach(input => {
  input.addEventListener('input', (event) => {
    const inputValue = event.target.value;
    event.target.value = toSentenceCase(inputValue);
  });
});
// Función para convertir solo la primera letra de cada oración a mayúscula
function toSentenceCase(str) {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function (c) {
    return c.toUpperCase();
  });
}

document.getElementById('direccion').addEventListener('input', (event) => {
  const inputValue = event.target.value;
  event.target.value = toSentenceCase(inputValue);
});

// Función para consultar la cédula cuando se pierde el foco del input de identificación
async function consultarCedulaOnBlur() {
  const tipoIdentificacion = document.getElementById('tipoIdentificacion').value;
  const identificacion = document.getElementById('identificacion').value.trim(); // Trim para eliminar espacios en blanco al inicio y final

  if (identificacion === '') {
    return;
  }

  const apiUrl = `https://apis.gometa.org/cedulas/${identificacion}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const persona = data.results[0];

      const nombreFormateado = formatNombre(persona.firstname);
      const primerApellidoFormateado = formatNombre(persona.lastname1);
      const segundoApellidoFormateado = persona.lastname2 ? formatNombre(persona.lastname2) : '';


      document.getElementById('nombre').value = nombreFormateado;
      document.getElementById('primerApellido').value = primerApellidoFormateado;
      document.getElementById('segundoApellido').value = segundoApellidoFormateado;
    } else {
      // showToast('Ups!', 'No se encontraron resultados para la cédula ingresada.');
      document.getElementById('nombre').value = '';
      document.getElementById('primerApellido').value = '';
      document.getElementById('segundoApellido').value = '';
    }
  } catch (error) {
    /* console.error('Error al consultar la API:', error);
    showToast('Ups!', 'Ocurrió un error al consultar la información. Por favor, inténtalo nuevamente.'); */
  }
}

function formatNombre(nombre) {
  const partesNombre = nombre.toLowerCase().split(' ');
  const nombreFormateado = partesNombre.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  return nombreFormateado;
}

// Agregar el evento blur al input de identificación
document.getElementById('identificacion').addEventListener('blur', consultarCedulaOnBlur);