document.getElementById("confirmarCorreo").addEventListener("click", function (event) {
    event.preventDefault();
    var email = document.getElementById("emailUsuario").value;
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailPattern.test(email)) {
        const token = localStorage.getItem('token');

        axios.post('https://backend-transporteccss.onrender.com/api/reset-password/forgot-password',
            { Correo: email },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(function () {
                showToast("¡Éxito!", "Correo enviado exitosamente.");
                setTimeout(function () {
                    window.location.href = "cambioContrasena.html";
                }, 3000);
            })
            .catch(function () {
                showToast("Error", "No se pudo enviar el correo.");
            });
    } else {
        showToast("Atención", "Ingrese un correo válido.");
    }
});


// document.getElementById("confirmarCorreo").addEventListener("click", function (event) {
//     event.preventDefault();
//     var email = document.getElementById("emailUsuario").value;
//     var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//     if (emailPattern.test(email)) {
//         const token = localStorage.getItem('token');

//         axios.get('https://backend-transporteccss.onrender.com/api/usuario', {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//             .then(function (response) {
//                 var usuarios = response.data.usuarios;
//                 var usuario = usuarios.find(u => u.Correo === email);

//                 if (usuario && usuario.Estado !== 'Inactivo') {
//                     axios.post('https://backend-transporteccss.onrender.com/api/reset-password/forgot-password',
//                         { email: email },
//                         {
//                             headers: {
//                                 'Authorization': `Bearer ${token}`
//                             }
//                         })
//                         .then(function () {
//                             showToast("¡Éxito!", "Correo enviado exitosamente.");
//                             setTimeout(function () {
//                                 window.location.href = "cambioContrasena.html";
//                             }, 3000);
//                         })
//                         .catch(function () {
//                             showToast("Error", "No se pudo enviar el correo.");
//                         });
//                 } else {
//                     showToast("Atención", "El correo no existe o el usuario está inactivo.");
//                 }
//             })
//             .catch(function () {
//                 showToast("Error", "Hubo un problema al verificar el usuario.");
//             });
//     } else {
//         showToast("Atención", "Ingrese un correo válido.");
//     }
// });
