document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveBtn').addEventListener('click', function () {
        var element = document.querySelector('.mt-3.fade-in'); // Adjust this selector to include all the content you want to export

        if (element) {
            var opt = {
                margin: 10,
                filename: 'viajes.pdf',
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save();
        } else {
            console.error('No se encontró el elemento para exportar a PDF');
        }
    });
});
