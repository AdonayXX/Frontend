document.getElementById("confirmarToken").addEventListener("click", function (event) {
    event.preventDefault();
    var token = document.getElementById("tokenUsuario").value
    if (token !== "") {
        showToast("¡Éxito!", "Correo enviado exitosamente.");
        window.location.href = "cambioContrasena.html";
    } else {
        showToast("Atención", "El campo es obligatorio.");

    }
});