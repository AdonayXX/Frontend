(function() {
    var acompananteCount = 0;

    document.getElementById('btnAddAcompanante').addEventListener('click', function() {
        if (acompananteCount < 2) {
            acompananteCount++;
            document.getElementById('acompanante' + acompananteCount).style.display = 'block';
        }
    });

    document.getElementById('btnRemoveAcompanante').addEventListener('click', function() {
        if (acompananteCount > 0) {
            document.getElementById('acompanante' + acompananteCount).style.display = 'none';
            acompananteCount--;
        }
    });
})();


// ---------------------------------POST------------------------------------------------ //


document.getElementById('btnGuardar').addEventListener('click', async function (event) {
    event.preventDefault();
    this.disabled = true;

    const guardarChofer = async () => {
        const cedula =  document.getElementById('cedula').value;
        const nombre = document.getElementById('nombre').value;
        const apellido1 = document.getElementById('apellido1').value;
        const apellido2 = document.getElementById('apellido2').value;
        const contacto = document.getElementById('contacto').value;
        const tipoSangre = document.getElementById('tipoSangre').value;
        const tipoLicencia = document.getElementById('tipoLicencia').value;
        const fechaVencimientoLicencia = document.getElementById('fechaVencimientoLicencia').value;
        const estadoChofer = document.getElementById('estado').value;

        //A1
        const contactoEmergencia = document.getElementById('contactoEmergencia').value || null;
        const nombreCE = document.getElementById('acompananteNombreN1').value || null;
        const apellido1CE = document.getElementById('apellido1CE1').value || null;
        const apellido2CE = document.getElementById('apellido2CE1').value || null;

        //A2
        const contactoEmergencia2 = document.getElementById('contactoEmergencia2').value || null;
        const nombreCE2 = document.getElementById('acompananteNombreN2').value || null;
        const apellido1CE2 = document.getElementById('apellido1CE2').value || null;
        const apellido2CE2 = document.getElementById('apellido2CE2').value || null;



        if (!cedula || !nombre || !apellido1 || !apellido2 || !tipoSangre || !tipoLicencia || !fechaVencimientoLicencia) {
            showToast('Error', 'Por favor, complete todos los campos requeridos.');
            this.disabled = false;
            return;
        }

        const choferData = {
            "cedula": cedula,
            "nombre": nombre,
            "apellido1": apellido1,
            "apellido2": apellido2,
            "contacto": contacto,
            "tipoSangre": tipoSangre,
            "tipoLicencia": tipoLicencia,
            "vencimientoLicencia": fechaVencimientoLicencia,
            "contactoEmergencia1": contactoEmergencia,
            "nombreCE1": nombreCE,
            "apellido1CE1": apellido1CE,
            "apellido2CE1": apellido2CE,
            "contactoEmergencia2": contactoEmergencia2,
            "nombreCE2": nombreCE2,
            "apellido1CE2": apellido1CE2,
            "apellido2CE2": apellido2CE2,
            "estadoChofer": estadoChofer
        };

        try {
            const response = await axios.post('https://backend-transporteccss.onrender.com/api/chofer',choferData);

            if (response.status === 201) {
                showToast('Éxito', 'Chofer registrado exitosamente.');
              
            }
        } catch (error) {
            console.error('Error al registrar el chofer:', error);
            showToast('Error', 'Error al registrar el chofer.');
            this.disabled = false;
        }
    }

    await guardarChofer();
});

// ---------------------------------GET------------------------------------------------ //

// document.getElementById('cedula').addEventListener('blur', async function (event) {
//     const cedula = this.value.trim();
//     await getChofer(cedula);
// });

// async function getChofer(cedula) {
//     try {
//         const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer');
//         const choferes = response.data.choferes;

//         const choferEncontrado = choferes.find(chofer => chofer.cedula === cedula);

//         if (choferEncontrado) {
//             document.getElementById('nombre').value = choferEncontrado.nombre || '';
//             document.getElementById('apellido1').value = choferEncontrado.apellido1 || '';
//             document.getElementById('apellido2').value = choferEncontrado.apellido2 || '';
//             document.getElementById('contacto').value = choferEncontrado.contacto || '';
//             document.getElementById('tipoSangre').value = choferEncontrado.tipoSangre || '';
//             document.getElementById('tipoLicencia').value = choferEncontrado.tipoLicencia || '';
//             document.getElementById('fechaVencimientoLicencia').value = choferEncontrado.vencimientoLicencia ? new Date(choferEncontrado.vencimientoLicencia).toISOString().split('T')[0] : '';
//             document.getElementById('estado').value = choferEncontrado.estadoChofer || '';
//             document.getElementById('acompananteNombreN1').value = choferEncontrado.nombreCE1 || ''; 
//             document.getElementById('apellido1CE1').value = choferEncontrado.apellido1CE1 || '';
//             document.getElementById('apellido2CE1').value = choferEncontrado.apellido2CE1 || '';
//             document.getElementById('contactoEmergencia').value = choferEncontrado.contactoEmergencia1 || '';
//             document.getElementById('acompananteNombreN2').value = choferEncontrado.nombreCE2 || ''; 
//             document.getElementById('apellido1CE2').value = choferEncontrado.apellido1CE2 || '';
//             document.getElementById('apellido2CE2').value = choferEncontrado.apellido2CE2 || '';
//             document.getElementById('contactoEmergencia2').value = choferEncontrado.contactoEmergencia2 || '';

//             document.getElementById('nombre').disabled = false;
//             document.getElementById('apellido1').disabled = false;
//             document.getElementById('apellido2').disabled = false;
//             document.getElementById('contacto').disabled = false;
//             document.getElementById('tipoLicencia').disabled = false;
//             document.getElementById('fechaVencimientoLicencia').disabled = false;
//             document.getElementById('estado').disabled = false;
//             document.getElementById('acompananteNombreN1').disabled = false;
//             document.getElementById('apellido1CE').disabled = false;
//             document.getElementById('apellido2CE').disabled = false;
//             document.getElementById('contactoEmergencia').disabled = false;

//             document.getElementById('acompananteNombreN2').disabled = false;
//             document.getElementById('apellido1CE2').disabled = false;
//             document.getElementById('apellido2CE2').disabled = false;
//             document.getElementById('contactoEmergencia2').disabled = false;

//             showToast('Datos del chofer', 'Datos del chofer cargados correctamente.');
//             return true;
//         } else {
//             showToast('Error', 'No se encontró ningún chofer con esa identificación.');
//             return false;
//         }
//     } catch (error) {
//         console.error('Error fetching driver data:', error);
//         showToast('Error', 'Error al obtener los datos del chofer.');
//         return false;
//     }
// }


// ---------------------------------PUT------------------------------------------------ //

// document.getElementById('btnActualizar').addEventListener('click', async function (event) {
//     event.preventDefault();
//     this.disabled = true;

//     const actualizarChofer = async () => {
//         const cedula = document.getElementById('cedula').value;
//         const nombre = document.getElementById('nombre').value;
//         const apellido1 = document.getElementById('apellido1').value;
//         const apellido2 = document.getElementById('apellido2').value;
//         const contacto = document.getElementById('contacto').value;
//         const tipoSangre = null // No se puede cambiar
//         const tipoLicencia = document.getElementById('tipoLicencia').value;
//         const fechaVencimientoLicencia = document.getElementById('fechaVencimientoLicencia').value;
//         const estadoChofer = document.getElementById('estado').value;
//         const contactoEmergencia = document.getElementById('contactoEmergencia').value || null;
//         const nombreCE = document.getElementById('acompananteNombreN1').value || null;
//         const apellido1CE = document.getElementById('apellido1CE').value || null;
//         const apellido2CE = document.getElementById('apellido2CE').value || null;

//         if (!cedula || !nombre || !apellido1 || !apellido2 || !tipoSangre || !tipoLicencia || !fechaVencimientoLicencia) {
//             showToast('Error', 'Por favor, complete todos los campos requeridos.');
//             this.disabled = false;
//             return;
//         }

//         const choferData = {
//             "nombre": nombre,
//             "apellido1": apellido1,
//             "apellido2": apellido2,
//             "contacto": contacto,
//             "tipoLicencia": null,
//             "vencimientoLicencia": "2025-12-31",
//             "contactoEmergencia": contactoEmergencia,
//             "nombreCE": nombreCE,
//             "apellido1CE": apellido1CE,
//             "apellido2CE": apellido2CE,
//             "estadoChofer": estadoChofer
//         };

//         try {
//             const response = await axios.put(`https://backend-transporteccss.onrender.com/api/chofer/${cedula}`, choferData);

//             if (response.status === 200) {
//                 showToast('Éxito', 'Chofer actualizado exitosamente.');
//                 this.disabled = false;
//                 limpiarCampos();
//                 setTimeout(() => {
//                     loadContent('fromdriver.html', 'mainContent');
//                 }, 2000);
//             }
//         } catch (error) {
//             console.error('Error al actualizar el chofer:', error);
//             showToast('Error', 'Error al actualizar el chofer.');
//             this.disabled = false;
//         }
//     }

//     await actualizarChofer();
// });




// ---------------------------------LIMPIAR CAMPOS------------------------------------------------ //

// FUNION PARA LIMPIAR TODOS LOS CAMPOS

function limpiarCampos() {

    document.getElementById('cedula').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('apellido1').value = '';
    document.getElementById('apellido2').value = '';
    document.getElementById('contacto').value = '';
    document.getElementById('tipoSangre').value = '';
    document.getElementById('tipoLicencia').value = '';
    document.getElementById('fechaVencimientoLicencia').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('acompananteNombreN1').value = '';
    document.getElementById('apellido1CE').value = '';
    document.getElementById('apellido2CE').value = '';
    document.getElementById('contactoEmergencia').value = '';

    document.getElementById('nombre').disabled = false;
    document.getElementById('apellido1').disabled = false;
    document.getElementById('apellido2').disabled = false;
    document.getElementById('contacto').disabled = false;
    document.getElementById('tipoLicencia').disabled = false;
    document.getElementById('fechaVencimientoLicencia').disabled = false;
    document.getElementById('estado').disabled = false;
    document.getElementById('acompananteNombreN1').disabled = false;
    document.getElementById('apellido1CE').disabled = false;
    document.getElementById('apellido2CE').disabled = false;
    document.getElementById('contactoEmergencia').disabled = false;

}

// let updatedDataChofer = {
//     nombre: "Alexio",
//     apellido1: "Hidalgo",
//     apellido2: "Martinez",
//     contacto: 87545678,
//     tipoSangre: "O+",
//     tipoLicencia: null,
//     vencimientoLicencia: "2024-09-06",
//     contactoEmergencia: 84665748,
//     nombreCE: "Guillermo",
//     apellido1CE: "Soliz",
//     apellido2CE: "Valverde",
//     estadoChofer: "Activo"
// };

// const cedulaChofer = "654667798";

// axios.put(`https://backend-transporteccss.onrender.com/api/chofer/${cedulaChofer}`, updatedDataChofer, {
//     headers: {
//         'Content-Type': 'application/json'
//     }
// })
// .then(response => {
//     console.log(response.data);
// })
// .catch(error => {
//     if (error.response) {
//         console.error('Error response data:', error.response.data);
//         console.error('Error response status:', error.response.status);
//         console.error('Error response headers:', error.response.headers);
//     } else if (error.request) {
//         console.error('Error request:', error.request);
//     } else {
//         console.error('Error message:', error.message);
//     }
// });


const dataChofer1 = {
    cedula: "123",
    nombre: "Alexio",
    apellido1: "Hidalgo",
    apellido2: "Martinez",
    contacto: 87545678,
    tipoSangre: "O+",
    tipoLicencia: null,
    vencimientoLicencia: "2024-09-06",
    contactoEmergencia1: 84665748,
    nombreCE1: "Guillermo",
    apellido1CE1: "Soliz",
    apellido2CE1: "Valverde",
    contactoEmergencia2: null, // Si no hay un segundo contacto de emergencia, puedes dejarlo como null
    nombreCE2: null,
    apellido1CE2: null,
    apellido2CE2: null,
    estadoChofer: "Activo"
}

axios.post('https://backend-transporteccss.onrender.com/api/chofer', dataChofer1)
   .then(response => {

     console.log(response.data);
     console.log("chofer registrado exitosamente");
  })
  .catch(error => {
    if (error.response) {
      console.log(error.response.data);
      console.log("chofer no registrado")
    } else {
      console.log(error.message);
}});