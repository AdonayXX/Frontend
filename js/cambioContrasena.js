document.getElementById('togglePassword2').addEventListener('click', function () {
    const passwordField = document.getElementById('userPassword2');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.classList.toggle('bi-eye-slash');
    this.classList.toggle('bi-eye');
});

document.getElementById('togglePassword3').addEventListener('click', function () {
    const passwordField = document.getElementById('userPassword3');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.classList.toggle('bi-eye-slash');
    this.classList.toggle('bi-eye');
});

document.getElementById("confirmar").addEventListener("click", function (event) {
    event.preventDefault();

    var token = document.getElementById("token").value;
    var contra1 = document.getElementById("userPassword2").value;
    var contra2 = document.getElementById("userPassword3").value;

    var passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (contra1 !== contra2) {
        showToast("Atención", "Las contraseñas no coinciden.");
    } else if (!passwordPattern.test(contra1)) {
        showToast("Atención", "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.");
    } else {
        const payload = {
            token: token,
            Contrasena: contra1
        };

        axios.post('https://backend-transporteccss.onrender.com/api/reset-password/reset-password', payload)
            .then(function () {
                showToast("¡Éxito!", "Contraseña actualizada correctamente.");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 3000);
            })
            .catch(function () {
                showToast("Error", "No se pudo actualizar la contraseña.");
            });
    }
});
