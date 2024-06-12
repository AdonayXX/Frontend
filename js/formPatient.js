    document.getElementById('perfilPacienteForm').addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Formulario enviado")

<<<<<<< Updated upstream
        const formData = new FormData(event.target);
        const personaData = {
            Nombre: formData.get('nombre'),
            Apellido1: formData.get('primerApellido'),
            Apellido2: formData.get('segundoApellido'),
            Identificacion: formData.get('identificacion'),
            Tipo_identificacion: formData.get('tipoIdentificacion'),
            Genero: formData.get('genero'),
            Prelacion: "true",
            Telefono1: formData.get('telefono1'),
            Telefono2: formData.get('telefono2'),
            Tipo_seguro: formData.get('tipoSeguro'),
            Direccion: formData.get('direccion'),
            Latitud: 0,
            Longitud: 0
=======
  async function showPerson(pe5rsonId){
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
>>>>>>> Stashed changes
        };
        console.log('Datos de la persona:', personaData);
        // Enviar datos a la tabla persona
        axios.post('http://localhost:56336/api/persona', personaData)
            .then(response => {
                const personaId = response.data.Id; // Asumiendo que el ID de la persona se encuentra en response.data.id
                console.log('Persona guardada exitosamente:', personaId);

                // Preparar datos para la tabla pacientes
                const pacienteData = {
                    idPersona: personaId, // Utilizando el id de la persona obtenido
                    criticidad: formData.get('criticidad'),
                    encamado: formData.get('encamado'),
                    traslado: formData.get('traslado'),
                    estado: formData.get('estado')
                };

                // Enviar datos a la tabla pacientes
                return axios.post('http://localhost:56336/api/pacientes', pacienteData);
            })
            .then(response => {
                console.log('Paciente guardado exitosamente:', response.data);

                // Preparar datos para la tabla acompañantes
                const acompananteData = {
                    idPersona: response.data.idPersona, // Utilizando el id de la persona obtenido
                    nombre: formData.get('nombre_acompanante'),
                    apellido1: formData.get('primerApellido_acompanante'),
                    apellido2: formData.get('segundoApellido_acompanante'),
                    identificacion: formData.get('identificacion_acompanante'),
                    tipo_identificacion: formData.get('tipo_identificacion_acompanante'),
                    genero: formData.get('genero_acompanante'),
                    telefono1: formData.get('telefono1_acompanante'),
                    telefono2: formData.get('telefono2_acompanante'),
                    parentesco: formData.get('parentesco'),
                    estado: formData.get('estado_acompanante')
                };

                // Enviar datos a la tabla acompañantes
                return axios.post('http://localhost:56336/api/acompanantes', acompananteData);
            })
            .then(response => {
                console.log('Acompañante guardado exitosamente:', response.data);
                // Aquí puedes agregar lógica adicional como redireccionar o mostrar un mensaje de éxito
            })
            .catch(error => {
                console.error('Error en el proceso:', error);
                // Manejo del error
            });
    });