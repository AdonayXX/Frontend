document
  .getElementById("confirmarCorreo")
  .addEventListener("click", function (event) {
    event.preventDefault();
    var email = document.getElementById("emailUsuario").value;
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailPattern.test(email)) {
      const token = localStorage.getItem("token");

      axios
        .post(
          "http://localhost:18026/api/reset-password/forgot-password",
          { Correo: email },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(function () {
          showToast("¡Éxito!", "Correo enviado exitosamente.");
          setTimeout(function () {
            window.location.href = "cambioContrasena.html";
          }, 2500);
        })
        .catch(function () {
          showToast("Error", "El correo no existe.");
        });
    } else {
      showToast("Atención", "Ingrese un correo válido.");
    }
  });
