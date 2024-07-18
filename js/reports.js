// async function modificarPDF() {
//     try {
//         const pdfUrl = 'ppp.pdf'; // URL al PDF predefinido en tu servidor

//         // Cargar el PDF utilizando pdf-lib
//         const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

//         // Cargar el PDF existente
//         const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
//         const form = pdfDoc.getForm();

//         // Obtener los datos desde la API
//         const response = await fetch('https://backend-transporteccss.onrender.com/api/registrocombustible');
//         const datos = await response.json();

//         // Modificar el PDF
//         const firstPage = pdfDoc.getPages()[0];
//         const { width, height } = firstPage.getSize();

//         // Añadir texto dinámico al PDF
//         const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
//         firstPage.drawText(`Número de Registros: ${datos.registros.length}`, {
//             x: 50,
//             y: height - 500,
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         // Generar el PDF modificado
//         const pdfBytes = await pdfDoc.save();

//         // Descargar el PDF modificado
//         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'pdf_modificado.pdf';
//         link.click();

//         console.log('PDF modificado y descargado correctamente.');
//     } catch (error) {
//         console.error('Error al modificar el PDF:', error);
//     }
// }


// async function modificarPDF() {
//     try {
//         const pdfUrl = 'ppp.pdf'; // URL al PDF predefinido en tu servidor

//         // Cargar el PDF utilizando pdf-lib
//         const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

//         // Cargar el PDF existente
//         const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
//         const form = pdfDoc.getForm();

//         // Obtener las fechas del rango
//         const fromDate = new Date(document.getElementById('from').value);
//         const toDate = new Date(document.getElementById('to').value);

//         // Obtener los datos desde la API
//         const response = await fetch('https://backend-transporteccss.onrender.com/api/registrocombustible');
//         const datos = await response.json();



//         // Filtrar los registros según el rango de fechas
//         const registrosFiltrados = datos.registros.filter(registro => {
//             const fechaRegistro = new Date(registro.fecha);
//             return fechaRegistro >= fromDate && fechaRegistro <= toDate;
//         });

//         // Modificar el PDF
//         const firstPage = pdfDoc.getPages()[0];
//         const { width, height } = firstPage.getSize();

//         // Añadir texto dinámico al PDF
//         const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
//         firstPage.drawText(`Número de Registros: ${registrosFiltrados.length}`, {
//             x: 50,
//             y: height - 500,
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         // Generar el PDF modificado
//         const pdfBytes = await pdfDoc.save();

//         // Descargar el PDF modificado
//         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'pdf_modificado.pdf';
//         link.click();

//         console.log('PDF modificado y descargado correctamente.');
//     } catch (error) {
//         console.error('Error al modificar el PDF:', error);
//     }
// }

async function modificarPDF() {
    try {
        const pdfUrl = 'ppp.pdf'; // URL al PDF predefinido en tu servidor

        // Cargar el PDF utilizando pdf-lib
        const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

        // Cargar el PDF existente
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

        // Obtener las fechas del rango
        const fromDate = new Date(document.getElementById('from').value);
        const toDate = new Date(document.getElementById('to').value);

        // Obtener los datos desde la API
        const response = await axios.get('https://backend-transporteccss.onrender.com/api/vales');
        const datos = response.data;

        // Filtrar los vales según el rango de fechas y estado aprobado
        const registrosFiltrados = datos.vales.filter(vale => {
            const fechaSolicitud = new Date(vale.Fecha_Solicitud);
            return fechaSolicitud >= fromDate && fechaSolicitud <= toDate && vale.NombreEstado === 'Aprobado';
        });
        

        // Modificar el PDF
        const firstPage = pdfDoc.getPages()[0];
        const { width, height } = firstPage.getSize();

        // Añadir texto dinámico al PDF
        const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        firstPage.drawText(`${registrosFiltrados.length}`, {
            x: 280,
            y: height - 410,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // Generar el PDF modificado
        const pdfBytes = await pdfDoc.save();

        // Descargar el PDF modificado
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'pdf_modificado.pdf';
        link.click();

        console.log('PDF modificado y descargado correctamente.');
    } catch (error) {
        console.error('Error al modificar el PDF:', error);
    }
}
