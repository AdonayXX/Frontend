
document.getElementById('1').addEventListener('submit', function (event) {
  event.preventDefault();
  addPersona();
});

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
    const tipoSeguro = document.querySelector('#tipoSeguro').value.trim();
    const direccion = document.querySelector('#direccion').value.trim();
    const latitud = parseFloat(document.querySelector('#latitud').value.trim()) || 0;
    const longitud = parseFloat(document.querySelector('#longitud').value.trim()) || 0;
    const tipoSangre = document.querySelector('#tipoSangre').value.trim();
    // const seguroVencimiento = document.querySelector('#fechaVencimientoSeguro').value.trim();
    if (!nombre || !primerApellido || !segundoApellido || !identificacion || !tipoIdentificacion || !genero ||
      !telefono1 || !tipoSeguro || !direccion || !tipoSangre) {
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
      "Telefono2": telefono2,
      "Tipo_seguro": tipoSeguro,
      // "FechaVencimientoSeguro":seguroVencimiento,
      "Direccion": direccion,
      "Latitud": latitud,
      "Longitud": longitud,
      "Tipo_sangre": tipoSangre
    }
    console.log(personaData);
    addPerson(personaData);

  } catch (error) {
    showToast('Ups!', 'Ocurrio un problema al enviar los datos.');
    console.error(error);

  }


}

//2
async function addPerson(personaData) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/persona';
    const response = await axios.get(API_URL);
    const listaPersonas = response.data.personas;
    const personaEncontrada = listaPersonas.find(persona => persona.Identificacion === personaData.Identificacion);
    if (personaEncontrada) {
      const IdPersonaCreada = personaEncontrada.Id;
      getPatient(IdPersonaCreada);
    } else {
      addPeople(personaData);
    }

  } catch (error) {
    showToast('Ups!', 'Ocurrio un problema durante el envio de los datos.');
    console.error(error);
  }
}

//3
async function addPeople(personaData) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/persona';
    const response = await axios.post(API_URL, personaData);
    const idPersona = response.data.persona.insertId;
    getPatient(idPersona);
  } catch (error) {
    showToast('Ups!', 'Ocurrio un problema durante el envio de los datos.');
    console.error(error);
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

//4
function addDataPatient(IdPersonaCreada) {
  const prioridad = JSON.stringify(document.getElementById('prioridad').checked ? true : false);
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
  addPatient(pacienteData);

}

//5
async function getPatient(IdPersonaCreada) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/paciente';
    const response = await axios.get(API_URL);
    const listaPacientes = response.data.pacientes;
    const pacienteEncontrado = listaPacientes.find(paciente => paciente.IdPersona === IdPersonaCreada);
    if (pacienteEncontrado) {
      showToast('Ups!', 'El paciente ya se encuentra registrado')

    } if (!pacienteEncontrado) {
      addDataPatient(IdPersonaCreada);
    }
  } catch (error) {
    showToast('Ups!', 'Ocurrio un problema durante el envio de los datos.');
    console.error(error);
  }
}

//6
async function addPatient(pacienteData) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/paciente';
    const response = await axios.post(API_URL, pacienteData);
    const idPaciente = (response.data.paciente.insertId);
    addCompanion(idPaciente);
    showToast('Paciente Registrado', 'El registro se ha realizado exitosamente.');
  } catch (error) {
    showToast('Ups!', 'Ocurrio un problema durante el envio de los datos.');
    console.error(error);


  }
}


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
        "Telefono1": acompananteTelefono1,
        "Telefono2": acompananteTelefono2,
        "Parentesco": acompananteParentesco,
        "Estado": "Activo"
      };


      getComp(companionData);
    }
  }

  document.getElementById('1').reset();
}

//8: Verifica si el acompañante ya está registrado
async function getComp(companionData) {
  try {
    const API_URL = 'https://backend-transporteccss.onrender.com/api/acompanantes';
    const response = await axios.get(API_URL);
    const listaAcompanantes = response.data.acompanantes;
    const acompananteEncontrado = listaAcompanantes.find(acompanante => acompanante.Identificacion === companionData.Identificacion && acompanante.IdPaciente === companionData.IdPaciente);
    if (acompananteEncontrado) {
      alert('El acompañante ya esta registrado al paciente.');
    } else {
      addComp(companionData);
    }
  } catch (error) {
    showToast('Ups!', 'Ocurrio un problema durante el envio de los datos.');
    console.error(error);

  }
}

//9: Registra un nuevo acompañante
async function addComp(companionData) {
  try {

    const API_URL = 'https://backend-transporteccss.onrender.com/api/acompanantes';
    const response = await axios.post(API_URL, companionData);
  } catch (error) {
    showToast('Ups!', 'Ocurrio un problema durante el envio de los datos.');
    console.error(error);

  }
}


//Funcion de botones agregar pacientes
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

//Funciones para mascara de inputs numericos
function applyInputMask(elementId, hiddenElementId, mask) {
  let inputElement = document.getElementById(elementId);
  let hiddenElement = document.getElementById(hiddenElementId);
  let content = '';

  inputElement.addEventListener('keydown', function(e) {
      if (e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
          return;
      }
      
      e.preventDefault();
      
      if (isNumeric(e.key) && content.length < mask.length) {
          content += e.key;
      }
      
      if (e.keyCode == 8) { // Backspace key
          if (content.length > 0) {
              content = content.substr(0, content.length - 1);
          }
      }
      
      inputElement.value = maskIt(mask, content);
      hiddenElement.value = content.replace(/\D/g, '');
      
      
      inputElement.setAttribute('data-hidden-value', hiddenElement.value);
  });

  inputElement.addEventListener('input', function(e) {
      
      hiddenElement.value = inputElement.value.replace(/\D/g, '');
      
      inputElement.setAttribute('data-hidden-value', hiddenElement.value);
  });
}

function isNumeric(char) {
  return !isNaN(char - parseInt(char));
}

function maskIt(pattern, value) {
  let position = 0;
  let masked = '';
  
  for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '0' && position < value.length) {
          masked += value[position];
          position++;
      } else if (pattern[i] === '0') {
          masked += '0';
      } else {
          masked += pattern[i];
      }
  }
  
  return masked;
}

// Aplicar la máscara a los inputs
applyInputMask('telefono1', 'telefono1Hidden', '0000-0000');
applyInputMask('telefono2', 'telefono2Hidden', '0000-0000');
applyInputMask('acompananteTelefono1_1', 'acompananteTelefono1Hidden_1', '0000-0000');
applyInputMask('acompananteTelefono2_1', 'acompananteTelefono2Hidden_1', '0000-0000');
applyInputMask('acompananteTelefono1_2', 'acompananteTelefono1Hidden_2', '0000-0000');
applyInputMask('acompananteTelefono2_2', 'acompananteTelefono2Hidden_2', '0000-0000');