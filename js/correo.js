document.getElementById("confirmarCorreo").addEventListener("click", function (event) {
    event.preventDefault();
    var email = document.getElementById("emailUsuario").value;
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(email)) {
        showToast("¡Éxito!", "Correo enviado exitosamente.");
        window.location.href = "ingresarToken.html";
    } else {
        showToast("Atención", "Ingrese un correo válido.");

    }
});