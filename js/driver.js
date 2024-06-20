(function() {
    var acompananteCount = 0;

    document.getElementById('btnAddAcompanante').addEventListener('click', function() {
        if (acompananteCount < 1) {
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

async function loadChoferes() {
    try {
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/chofer');
        const choferes = response.data.choferes;
        const tableBody = document.getElementById('choferTableBody');
        tableBody.innerHTML = '';

        choferes.forEach(chofer => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${chofer.nombre}</td>
                <td>${chofer.cedula}</td>
                <td>${chofer.apellido1}</td>
                <td>${chofer.apellido2 || ''}</td>
                <td>${chofer.contacto || ''}</td>
                <td>${chofer.tipoSangre}</td>
                <td>${chofer.tipoLicencia}</td>
                <td>${new Date(chofer.vencimientoLicencia).toLocaleDateString()}</td>
                <td>${chofer.contactoEmergencia || ''}</td>
                <td>${chofer.nombreContactoEmer || ''}</td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al obtener los choferes:', error);
        showToast('Error', 'Error al obtener los choferes.');
    }
}

loadChoferes();


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
        const contactoEmergencia = document.getElementById('contactoEmergencia').value || null;
        const nombreCE = document.getElementById('acompananteNombreN1').value || null;
        const apellido1CE = document.getElementById('apellido1CE').value || null;
        const apellido2CE = document.getElementById('apellido2CE').value || null;

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
            "contactoEmergencia": contactoEmergencia,
            "nombreCE": nombreCE,
            "apellido1CE": apellido1CE,
            "apellido2CE": apellido2CE,
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




// //post
// // const axios = require('axios');
// let dataChofer1 = {
//     cedula: 2082367743,
//     nombre: "Martin",
//     apellido1: "Lopez",
//     apellido2: "Umaña",
//     contacto: 70707655,
//     tipoSangre: "O-",
//     tipoLicencia: "B1",
//     vencimientoLicencia: "2028-11-30",  // Fecha corregida
//     contactoEmergencia: 88886564,
//     nombreCE: "Mario",
//     apellido1CE: "Duran",
//     apellido2CE: "Castro",
//     estadoChofer: "Activo"
// };

// axios.post('https://backend-transporteccss.onrender.com/api/chofer', dataChofer1)
//     .then(response => {
//         console.log(response.data);
//     })
//     .catch(error => {
//         if (error.response) {
//             console.log(error.response.data);
//         } else {
//             console.log(error.message);
//         }
//     });