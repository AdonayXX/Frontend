 async function addPerson(personData) {
    
    try {
      const API_URL = 'http://localhost:56336/api/persona';
      const response = await axios.post(API_URL, personData);
      let personId=personData.Identificacion;
   await showPerson(personId);
    } catch (error) {
      console.error('Error al agregar el Persona:', error);
    }
  }  

  async function showPerson(personId){
    try{ 
       
        const API_URL = 'http://localhost:56336/api/persona';
        const response = await axios.get(API_URL);
        const personList = response.data.personas;
       
        const person = personList.find(p => p.Identificacion === personId);
    if (person) {
        let personId =person.Id
        const form = document.querySelector('#perfilPacienteForm');
     const selectedRadioButton = document.querySelector('input[name="encamado"]:checked');
     let selectedValue;

     if (selectedRadioButton) {
         selectedValue = selectedRadioButton.value;
     } 
        const patientData ={
            IdPersona: person.Id,
            Criticidad: "Baja",
            Encamado: selectedValue,
            Traslado: form.lugarSalida.value,
            Estado: "Activo"
        };
      addPatient(patientData);
    } else {
      console.log('Persona no encontrada.');
    }
    } catch (error) {
        console.error('Error al agregar la persona:', error);
      }
  }
  async function addPatient(patientData) {
    
    try {
      const API_URL = 'http://localhost:56336/api/paciente';
      const response = await axios.post(API_URL, patientData);
      showToast('Registro exitoso', 'Paciente Registrado correctamente.');
       document.querySelector('#perfilPacienteForm').reset();

    } catch (error) {
      console.error('Error al agregar el paciente:', error);
    }
  }  

    const formPatient = document.querySelector('#perfilPacienteForm');
    
    formPatient.addEventListener('submit', async (event) => {
      event.preventDefault();
      const personData = {
        Nombre: formPatient.nombre.value,
        Apellido1: formPatient.primerApellido.value,
        Apellido2: formPatient.segundoApellido.value,
        Identificacion: formPatient.identificacion.value,
        Tipo_identificacion: formPatient.tipoIdentificacion.value,
        Genero: formPatient.genero.value,
        Prelacion: formPatient.prelacion.checked, 
        Telefono1: formPatient.telefono1.value,
        Telefono2: formPatient.telefono2.value,
        Tipo_seguro: formPatient.tipoSeguro.value,
        Direccion: formPatient.direccion.value,
        Latitud: 0,
        Longitud: 0
      };
      addPerson(personData);
      
    });
