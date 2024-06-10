
function loadToastTemplate(callback) {
    fetch('toast-template.html')
        .then(response => response.text())
        .then(data => {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = data;
                if (callback) callback();
            } else {
                console.error('Toast container not found');
            }
        })
        .catch(error => console.error('Error loading toast template:', error));
}

function showToast(title, message) {
    const toastElement = document.getElementById('common-toast');
    if (toastElement) {
        document.getElementById('common-toast-title').innerText = title;
        document.getElementById('common-toast-body').innerText = message;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    } else {
        console.error('Toast element not found');
    }
}
document.getElementById('btn-rechazarSoli').onclick = function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    loadToastTemplate(function() {
        showToast('Solicitud Rechazada', 'La solicitud ha sido rechazada correctamente.');
    });
};

document.getElementById('btn-agregarSoli').onclick = function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    loadToastTemplate(function() {
        showToast('Solicitud Aceptada', 'La solicitud ha sido aceptada correctamente.');
    });
};