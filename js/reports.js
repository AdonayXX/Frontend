// async function modificarPDF() {
//     try {
//         const pdfUrl = 'reporte.pdf'; // URL al PDF predefinido en tu servidor

//         // Cargar el PDF utilizando pdf-lib
//         const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

//         // Cargar el PDF existente
//         const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

//         // Obtener las fechas del rango
//         const fromDate = new Date(document.getElementById('from').value);
//         const toDate = new Date(document.getElementById('to').value);

//         // Obtener el token desde el localStorage
//         const token = localStorage.getItem('token');

//         // Configurar los encabezados con el token
//         const headers = {
//             'Authorization': `Bearer ${token}`
//         };

//         // Obtener los datos desde la API
//         const response1 = await axios.get('https://backend-transporteccss.onrender.com/api/vales', { headers });
//         const response2 = await axios.get('https://backend-transporteccss.onrender.com/api/registrocombustible', { headers });
//         const response3 = await axios.get('https://backend-transporteccss.onrender.com/api/cita', { headers });
//         const datosVales = response1.data.vales;
//         const datosRegistros = response2.data.registros;
//         const datosCitas = response3.data;


    
//         // Filtrar los vales según el rango de fechas y estado aprobado
//         const valesFiltrados = datosVales.filter(vale => {
//             const fechaSolicitud = new Date(vale.Fecha_Solicitud);
//             return fechaSolicitud >= fromDate && fechaSolicitud <= toDate && vale.NombreEstado === 'Aprobado';
//         });
        
      
//         const cantidadFuncionariosTrasladados = valesFiltrados.reduce((sum, vale) => {
//             let count = 0;
//             if (vale.Acompanante1) count++;
//             if (vale.Acompanante2) count++;
//             if (vale.Acompanante3) count++;
//             if (vale.Acompanante4) count++;
//             if (vale.Acompanante5) count++;
//             return sum + count;
//         }, 0);

        //mostrar la fecha y hora de creacion del pdf
        const fechaCreacion = new Date();
        const fechaCreacionString = fechaCreacion.toLocaleDateString();
        const horaCreacionString = fechaCreacion.toLocaleTimeString();



//         // Filtrar los registros según el rango de fechas y tipo de combustible
//         const gasolinaLitros = datosRegistros
//             .filter(registro => {
//                 const fecha = new Date(registro.fecha);
//                 return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Gasolina';
//             })
//             .reduce((sum, registro) => sum + parseFloat(registro.litrosAproximados), 0);

//         const dieselLitros = datosRegistros
//             .filter(registro => {
//                 const fecha = new Date(registro.fecha);
//                 return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Diesel';
//             })
//             .reduce((sum, registro) => sum + parseFloat(registro.litrosAproximados), 0);

//             //diesel
//         const dieselKilometraje = datosRegistros
//             .filter(registro => {
//                 const fecha = new Date(registro.fecha);
//                 return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Diesel';
//             })
//             .reduce((sum, registro) => sum + parseFloat(registro.kilometraje), 0);

//             //GASOLINA
//             const gasolinaKilometraje = datosRegistros
//             .filter(registro => {
//                 const fecha = new Date(registro.fecha);
//                 return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Gasolina';
//             })
//             .reduce((sum, registro) => sum + parseFloat(registro.kilometraje), 0);

//         const pacientes = datosCitas.filter(paciente => {
//                 const fechaCita = new Date(paciente.fechaCita);
//                 return fechaCita >= fromDate && fechaCita <= toDate && paciente.estadoCita === 'Finalizada';
//             });

//         // Obtener la fecha del sistema
//         const systemDate = new Date();
//         const monthNumber = systemDate.getMonth() + 1; // getMonth() devuelve el mes (0-11), por lo que sumamos 1
//         const monthName = systemDate.toLocaleString('default', { month: 'long' });
//         const year = systemDate.getFullYear();

//         // Modificar el PDF
//         const firstPage = pdfDoc.getPages()[0];
//         const { width, height } = firstPage.getSize();

//         // Añadir texto dinámico al PDF
//         const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
//         const adjustedFromDate = new Date(fromDate);
//         adjustedFromDate.setDate(adjustedFromDate.getDate() + 1);
        
//         const adjustedToDate = new Date(toDate);
//         adjustedToDate.setDate(adjustedToDate.getDate() + 1);
        
//         const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

//         // YA COLOCADA CORRECTAMENTE
//         firstPage.drawText(`${monthNameCapitalized}`, {
//             x: 167, 
//             y: height - 221, 
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         // YA COLOCADA CORRECTAMENTE
//         firstPage.drawText(`${monthNumber}`, {
//             x: 324, 
//             y: height - 221, 
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         // YA COLOCADA CORRECTAMENTE
//         firstPage.drawText(`${year}`, {
//             x: 186, 
//             y: height - 235, 
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });
//         // YA COLOCADA CORRECTAMENTE
//         firstPage.drawText(`${valesFiltrados.length}`, {
//             x: 284,
//             y: height - 428,
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         // YA COLOCADA CORRECTAMENTE
//         firstPage.drawText(`${gasolinaLitros.toFixed(2)} L`, {
//             x: 284,
//             y: 240,
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         // YA COLOCADA CORRECTAMENTE
//         firstPage.drawText(`${dieselLitros.toFixed(2)} L`, {
//             x: 284,
//             y: height - 376,
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         // YA COLOCADA CORRECTAMENTE
//         firstPage.drawText(`${pacientes.length}`, {
//             x: 284,
//             y: height - 466,
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });
        
//         firstPage.drawText(`${cantidadFuncionariosTrasladados}`, {
//             x: 284,
//             y: height - 489, 
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         firstPage.drawText(`${cantidadFuncionariosTrasladados + pacientes.length}`, {
//             x: 284,
//             y: height - 445, 
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         // Generales 
//         firstPage.drawText(`${pacientes.length}`, {
//             x: 597,
//             y: height - 466,
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         firstPage.drawText(`${cantidadFuncionariosTrasladados}`, {
//             x: 597,
//             y: height - 489, 
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         firstPage.drawText(`${cantidadFuncionariosTrasladados + pacientes.length}`, {
//             x: 597,
//             y: height - 444, 
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });

//         firstPage.drawText(`${gasolinaKilometraje}`, {
//             x: 284,
//             y: height - 393,
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });
        
//         // Generar el PDF modificado
//         // Descargar solo la primera página del PDF modificado
//         const pdfBytes = await pdfDoc.save();
//         const firstPageBytes = await pdfDoc.saveAsBase64({ pages: [0] });

//         const blob = base64ToBlob(firstPageBytes, 'application/pdf');
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'Reportes_ASU.pdf';
//         link.click();


//         // Función para convertir base64 a Blob
//         function base64ToBlob(base64, type) {
//             const binaryString = window.atob(base64);
//             const len = binaryString.length;
//             const bytes = new Uint8Array(len);
//             for (let i = 0; i < len; ++i) {
//                 bytes[i] = binaryString.charCodeAt(i);
//             }
//             return new Blob([bytes], { type });
//         }

//     } catch (error) {
//     }
// }
