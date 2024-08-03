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
    var contra1 = document.getElementById("userPassword2").value;
    var contra2 = document.getElementById("userPassword3").value;
    if (contra1 === contra2 && contra1 !== "" && contra2 !== "") {
        showToast("¡Éxito!", "Contraseña actualizada correctamente");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 3500);
    } else {
        showToast("Atención", "Las contraseñas no coinciden.");
    }
});