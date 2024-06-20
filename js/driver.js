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

    const form = document.getElementById('formChofer');

    const dataChofer1 = {
        cedula: form.cedula.value,
        nombre: form.nombre.value,
        apellido1: form.apellido1.value,
        apellido2: form.apellido2.value,
        contacto: form.contacto.value,
        tipoSangre: form.tipoSangre.value,
        tipoLicencia: form.tipoLicencia.value,
        vencimientoLicencia: form.fechaVencimientoLicencia.value,
        contactoEmergencia: form.contactoEmergencia.value,
        nombreCE: form.acompananteNombreN1.value,
        apellido1CE: form.apellido1CE.value,
        apellido2CE: form.apellido2CE.value,
        estadoChofer: "Activo"
    };

    if (!dataChofer1.cedula || !dataChofer1.nombre || !dataChofer1.apellido1 || !dataChofer1.apellido2 || 
        !dataChofer1.contacto || !dataChofer1.tipoSangre || !dataChofer1.tipoLicencia || 
        !dataChofer1.vencimientoLicencia || !dataChofer1.contactoEmergencia || !dataChofer1.nombreCE || 
        !dataChofer1.apellido1CE || !dataChofer1.apellido2CE) {
        showToast('Error', 'Por favor, complete todos los campos requeridos.');
        this.disabled = false;
        return;
    }

    try {
        const response = await axios.post('https://backend-transporteccss.onrender.com/api/chofer', dataChofer1);
        showToast('Chofer', 'Chofer guardado correctamente.');
        limpiarCampos();
        setTimeout(() => {
            loadContent('formDriver.html', 'mainContent');
        }, 1450);
    } catch (error) {
        console.error('Error al guardar el chofer:', error);
        this.disabled = false;
        showToast('Error', 'Error al guardar el chofer.');
    }
});
// //post
// // const axios = require('axios');
// let dataChofer1 = {
//     cedula: "200760987",
//     nombre: "Juan",
//     apellido1: "Lopez",
//     apellido2: "Umaña",
//     contacto: 70707655,
//     tipoSangre: "O-",
//     tipoLicencia: "B2",
//     vencimientoLicencia: "2028-11-30",  // Fecha corregida
//     contactoEmergencia: 88886564,
//     nombreCE: "Ricardo",
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
