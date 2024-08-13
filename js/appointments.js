

(function () {
   

getRutas();
getEspecialidadesByDestino();
document.getElementById('identificacion').addEventListener('blur', async function (event) {
    event.preventDefault();
    const identificacion = this.value.trim();


    if (identificacion) {
        const pacienteActivo = await getPacienteCita(identificacion);
        if (pacienteActivo) {
            await getAcompanantes(identificacion);
        }
    } else {
        showToast('Aviso', 'Por favor, ingrese una identificación.');

    }
});

    async function getPacienteCita(identificacion) {
        try {

            const token = localStorage.getItem('token');
            const API_URL = `https://backend-transporteccss.onrender.com/api/paciente`;
            const response = await axios.get(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            pacientes = response.data.pacientes;
            const pacienteEncontrado = pacientes.find(paciente => paciente.Identificacion === identificacion && paciente.Estado === 'Activo');

            if (pacienteEncontrado) {
                idPaciente = pacienteEncontrado.IdPaciente;
                document.getElementById('nombre').value = pacienteEncontrado.Nombre || '';
                document.getElementById('primerApellido').value = pacienteEncontrado.Apellido1 || '';
                document.getElementById('segundoApellido').value = pacienteEncontrado.Apellido2 || '';
                document.getElementById('telefonos').value = pacienteEncontrado.Telefono2 ? `${pacienteEncontrado.Telefono1 || ''} / ${pacienteEncontrado.Telefono2}` : pacienteEncontrado.Telefono1 || '';  
                document.getElementById('provincia').value = pacienteEncontrado.Provincia || '';
                document.getElementById('canton').value = pacienteEncontrado.Canton || '';
                document.getElementById('distrito').value = pacienteEncontrado.Distrito || '';
                document.getElementById('barrio').value = pacienteEncontrado.Barrio || '';    
                document.getElementById('direccion').value = pacienteEncontrado.OtrasSenas || '';    

                const prioridadCheckbox = document.getElementById('prelacion');
                prioridadCheckbox.checked = pacienteEncontrado.Prioridad === 1;

                const origenSelect = document.getElementById('origen');
                origenSelect.value = pacienteEncontrado.LugarSalida;


                showToast('Datos del paciente', 'Datos del paciente cargados correctamente.');
                return true;
            } else {
                showToast('Aviso', 'No se encontró ningún paciente con esa identificación.');
                return false;
            }
        } catch (error) {
            showToast('Error', 'Error al obtener los datos del paciente.');
            return false;
        }
    }

    async function getAcompanantes(identificacion) {
        try {


            const token = localStorage.getItem('token');
            const API_URL_ACOMPANANTE = `https://backend-transporteccss.onrender.com/api/paciente/acompanantes/seguro/${identificacion}`;
            const response = await axios.get(API_URL_ACOMPANANTE, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            acompanantes = response.data.acompanantes;

            const acompanante1Select = document.getElementById('acompananteNombre1');
            const acompanante2Select = document.getElementById('acompananteNombre2');

            acompanante1Select.innerHTML = '<option value="">Seleccionar Acompañante</option>';
            acompanante2Select.innerHTML = '<option value="">Seleccionar Acompañante</option>';

            if (acompanantes && acompanantes.length > 0) {
                acompanantes.forEach(acompanante => {
                    const option = document.createElement('option');
                    option.text = acompanante.Nombre;
                    option.value = acompanante.Nombre;
                    acompanante1Select.add(option);
                    acompanante2Select.add(option.cloneNode(true));
                });

                acompanante2Select.disabled = true;

                setTimeout(() => {
                    showToast('Acompañantes', 'Acompañantes cargados correctamente.');
                }, 1000);
            } else {
                setTimeout(() => {
                    showToast('Acompañantes', 'No se encontraron acompañantes para este paciente.');
                }, 1000);
            }
        } catch (error) {
            showToast('Error', 'Error al obtener los datos de los acompañantes.');
        }
    }

    function showAcompananteDetails(event, nombreField, apellido1Field, telefonoField, parentescoField) {
        const selectedOption = event.target.value;
        if (!acompanantes || acompanantes.length === 0) {
            showToast('Acompañantes', 'No se encontraron acompañantes para este paciente.');
            return;
        }

        const acompanante = acompanantes.find(acompanante => acompanante.Nombre === selectedOption);
        if (acompanante) {
            nombreField.value = acompanante.Nombre || '';
            apellido1Field.value = acompanante.Apellido1 || '';
            telefonoField.value = acompanante.Telefono2 ? `${acompanante.Telefono1} / ${acompanante.Telefono2}` : acompanante.Telefono1 || '';  parentescoField.value = acompanante.Parentesco || '';
            parentescoField.value = acompanante.Parentesco || '';
        } else {
            showToast('Acompañantes', 'No se encontró información para el acompañante seleccionado.');
        }
    }

    function handleAcompanante1Change(event) {
        const acompanante2Select = document.getElementById('acompananteNombre2');
        const selectedValue1 = event.target.value;

        if (selectedValue1 === "") {
            limpiarCamposAcompanantes();
            acompanante2Select.disabled = true;
            acompanante2Select.value = "";
            return;
        }

        acompanante2Select.disabled = false;
        acompanante2Select.querySelectorAll('option').forEach(option => {
            option.disabled = option.value === selectedValue1;
        });

        if (acompanantes && acompanantes.length === 2) {
            acompanante2Select.disabled = acompanantes[0].Nombre !== selectedValue1 && acompanantes[1].Nombre !== selectedValue1;
        }

        showAcompananteDetails(event, document.getElementById('acompananteNombre1'), document.getElementById('acompananteApellido1_1'), document.getElementById('acompananteTelefono1_1'), document.getElementById('acompananteParentesco1'));
    }

    function handleAcompanante2Change(event) {
        const acompanante1Select = document.getElementById('acompananteNombre1');
        const selectedValue2 = event.target.value;

        if (selectedValue2 === "") {
            limpiarCamposAcompanantes();
            acompanante1Select.disabled = false;
            return;
        }

        acompanante1Select.disabled = true;
        acompanante1Select.querySelectorAll('option').forEach(option => {
            option.disabled = option.value === selectedValue2;
        });

        if (acompanantes.length === 2) {
            acompanante1Select.disabled = acompanantes[0].Nombre !== selectedValue2 && acompanantes[1].Nombre !== selectedValue2;
        }

        showAcompananteDetails(event, document.getElementById('acompananteNombre2'), document.getElementById('acompananteApellido1_2'), document.getElementById('acompananteTelefono1_2'), document.getElementById('acompananteParentesco2'));
    }

    document.getElementById('acompananteNombre1').addEventListener('change', handleAcompanante1Change);
    document.getElementById('acompananteNombre2').addEventListener('change', handleAcompanante2Change);


    function limpiarCamposAcompanantes() {
        document.getElementById('acompananteNombre1').value = '';
        document.getElementById('acompananteApellido1_1').value = '';
        document.getElementById('acompananteTelefono1_1').value = '';
        document.getElementById('acompananteParentesco1').value = '';

        document.getElementById('acompananteNombre2').value = '';
        document.getElementById('acompananteApellido1_2').value = '';
        document.getElementById('acompananteTelefono1_2').value = '';
        document.getElementById('acompananteParentesco2').value = '';
    }
    function limpiarCampos() {
        document.getElementById('identificacion').value = '';
        document.getElementById('nombre').value = '';
        document.getElementById('primerApellido').value = '';
        document.getElementById('segundoApellido').value = '';
        document.getElementById('telefonos').value = '';
        document.getElementById('direccion').value = '';
        document.getElementById('camilla').checked = false;
        document.getElementById('prelacion').checked = false;
        document.getElementById('diagnostico').value = '';
        document.getElementById('fechaCita').value = '';
        document.getElementById('horaCita').value = '';
        document.getElementById('especialidad').value = '';
        document.getElementById('destino').value = '';
        document.getElementById('origen').value = '';
        limpiarCamposAcompanantes();
    }


    document.getElementById('btnGuardar').addEventListener('click', async function (event) {

        event.preventDefault();
        this.disabled = true;

        const guardarCita = async () => {
          
            const diagnostico = document.getElementById('diagnostico').value;
            const fechaCita = document.getElementById('fechaCita').value;
            const horaCitaInput = document.getElementById('horaCita').value;
            const horaCita = `${horaCitaInput}:00`;
            const idUbicacionDestino = document.getElementById('destino').value;
            const idEspecialidad = document.getElementById('especialidad').value;
            const tipoSeguro = document.getElementById('tipoSeguro').value;

            const provincia = document.getElementById('provincia').value;
            const canton = document.getElementById('canton').value;
            const distrito= document.getElementById('distrito').value;
            const barrio = document.getElementById('barrio').value;
            const direccion = document.getElementById('direccion').value;

            if (!diagnostico || !fechaCita || !horaCitaInput || !idUbicacionDestino || !tipoSeguro || !idEspecialidad) {
                const camposFaltantes = [];
                if (!diagnostico) camposFaltantes.push('Diagnóstico');
                if (!fechaCita) camposFaltantes.push('Fecha de cita');
                if (!horaCitaInput) camposFaltantes.push('Hora de cita');
                if (!idUbicacionDestino) camposFaltantes.push('Destino');
                if (!tipoSeguro) camposFaltantes.push('Tipo de seguro');
                if(!idEspecialidad) camposFaltantes.push('Especialidad');

                const mensaje = `Por favor, complete los siguientes campos requeridos: ${camposFaltantes.join(', ')}.`;
                showToast('Aviso', mensaje);
                document.getElementById('btnGuardar').disabled = false;
                return;
            }

            const acompanante1Nombre = document.getElementById('acompananteNombre1').value;
            const acompanante2Nombre = document.getElementById('acompananteNombre2').value;

            const idAcompanante1 = acompanante1Nombre ? acompanantes.find(acompanante => acompanante.Nombre === acompanante1Nombre)?.IdAcompanante : null;
            const idAcompanante2 = acompanante2Nombre ? acompanantes.find(acompanante => acompanante.Nombre === acompanante2Nombre)?.IdAcompanante : null;

            const ubicacionOrigen = document.getElementById('traslado').value;
            const camillaCheckbox = document.getElementById('camilla');
            const prioridadCheckbox = document.getElementById('prelacion');
            const camilla = camillaCheckbox.checked ? 'Requerido' : 'No requerido';
            const prioridad = prioridadCheckbox.checked ? 'Alta' : 'Baja';
            const salida = document.getElementById('origen').value;

            const citaData = {
                "idPaciente": idPaciente,
                "idAcompanante1": idAcompanante1,
                "idAcompanante2": idAcompanante2,
                "idUbicacionDestino": idUbicacionDestino,
                "idEspecialidad": idEspecialidad,
                "ubicacionOrigen": ubicacionOrigen,
                "camilla": camilla,
                "prioridad": prioridad,
                "condicionCita": "",
                "tipoSeguro": tipoSeguro,
                "diagnostico": diagnostico,
                "fechaCita": fechaCita,
                "horaCita": horaCita,
                "transladoCita": salida,
                "idUsuario": idUsuario,
                "provincia" : provincia,
                "canton": canton,
                "distrito": distrito,
                "barrio": barrio,
                "direccionExacta": direccion

            };

            try {
                const token = localStorage.getItem('token');
                const response = await axios.post('https://backend-transporteccss.onrender.com/api/cita', 
                    citaData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                showToast('Cita', 'Cita guardada correctamente.');
                limpiarCampos();
                setTimeout(() => {
                    loadContent('formAppointment.html', 'mainContent');
                }, 1450);
            } catch (error) {
                document.getElementById('btnGuardar').disabled = false;
                showToast('Error', 'Error al guardar la cita.');
            }
        }
        await guardarCita();

    });

    function infoUser() {
        try {
          const token = localStorage.getItem('token');
          const decodedToken = jwt_decode(token);
          return (decodedToken);
        } catch (error) {
          showToast('Error', 'Ocurrio un problema al obtener los datos del usuario')
        }
    
      }
      const infoUsuario = infoUser();
      const idUsuario = infoUsuario.usuario.IdUsuario;  


function getRutas() {
    const selectDestino = document.getElementById('destino');

    const token = localStorage.getItem('token');
    axios.get('https://backend-transporteccss.onrender.com/api/rutaEspecialidad',{
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            const rutas = response.data;
            rutas.forEach(ruta => {
                const option = document.createElement('option');
                option.value = ruta.IdRuta;
                option.textContent = ruta.Descripcion;
                selectDestino.appendChild(option);
            });
        })
        .catch(error => {
        });
}

function getEspecialidadesByDestino(IdRuta) {
    const selectEspecialidad = document.getElementById('especialidad');
    selectEspecialidad.innerHTML = ''; 

    const defaultOption = document.createElement('option');
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.value = '';
    defaultOption.textContent = '-- Seleccione una especialidad --';
    selectEspecialidad.appendChild(defaultOption);

    const token = localStorage.getItem('token');
    axios.get(`https://backend-transporteccss.onrender.com/api/rutaEspecialidad/${IdRuta}`,{
        headers: {
            'Authorization': `Bearer ${token}`
        }

    })
        .then(response => {
            const especialidades = response.data;
            especialidades.forEach(especialidad => {
                const option = document.createElement('option');
                option.value = especialidad.idEspecialidad;
                option.textContent = especialidad.Especialidad;
                selectEspecialidad.appendChild(option);
            });
        })
        .catch(error => {
        });
}

document.getElementById('destino').addEventListener('change', function () {
    const IdRuta = this.value;
    getEspecialidadesByDestino(IdRuta);
});


document.getElementById('identificacion').addEventListener('input', function () {
    applyMask();
});


function applyMask() {
    const tipoIdentificacion = document.getElementById('tipoIdentificacion').value;
    const identificacion = document.getElementById('identificacion');
    let value = identificacion.value.replace(/\D/g, ''); 

    if (tipoIdentificacion === 'Cedula de Identidad') {
        let formattedValue = '';
        if (value.length > 0) {
            formattedValue = value.slice(0, 1); 
            if (value.length > 1) {
                formattedValue += '-' + value.slice(1, 5); 
            }
            if (value.length > 5) {
                formattedValue += '-' + value.slice(5, 9); 
            }
        }
        identificacion.value = formattedValue;
        identificacion.maxLength = 12;
    } else if (tipoIdentificacion === 'Número de Asegurado') {
        
        identificacion.value = value;
        identificacion.maxLength = 20;

    } else if (tipoIdentificacion === 'Interno') {

        let formattedValue = '';
        if (value.length > 0) {
            formattedValue = value.slice(0, 4); 
            if (value.length > 4) {
                formattedValue += '-' + value.slice(4, 19); 
            }
        }
        identificacion.value = formattedValue;
        identificacion.maxLength = 19; 
    }
}
        document.getElementById('tipoIdentificacion').addEventListener('change', applyMask);
        document.getElementById('identificacion').addEventListener('input', applyMask);
        applyMask();

})();