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

    var sqlKeywords = [
        'INSERT', 'UPDATE', 'DELETE', 'SELECT', 'DROP', 'CREATE', 'ALTER',
        'TRUNCATE', 'RENAME', 'GRANT', 'REVOKE', 'MERGE', 'EXPLAIN',
        'SHOW', 'DESCRIBE', 'USE', 'CALL', 'MASTER', 'DENY', 'TABLE', 'WHERE', 'FROM'
    ];

    var tokenUpper = token.toUpperCase();

    for (var i = 0; i < sqlKeywords.length; i++) {
        if (tokenUpper.includes(sqlKeywords[i])) {
            showToast("Atención", "El token contiene caracteres inválidos, por favor ingrese un valor válido.");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
            return;
        }
    }

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
                    window.location.href = "index.html";
                }, 2500);
            })
            .catch(function () {
                showToast("Error", "No se pudo actualizar la contraseña.");
            });
    }
});
