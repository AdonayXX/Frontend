document.getElementById('exportar').addEventListener('click', function() {
    // Obtiene el contenido del div
    let content = document.getElementById('content').outerHTML;

    // Crea un blob con el contenido
    let blob = new Blob([content], { type: 'text/html' });

    // Crea un enlace para la descarga
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pagina.html';

    // Simula un click en el enlace para iniciar la descarga
    a.click();
});
