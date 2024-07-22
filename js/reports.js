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
//         firstPage.drawText(`${adjustedFromDate.toLocaleDateString()} - ${adjustedToDate.toLocaleDateString()}`, {
//             x: 357,
//             y: 445,
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
        
//         firstPage.drawText(`${dieselKilometraje}`, {
//             x: 284,
//             y: height - 410,
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
document.getElementById("exportar").addEventListener("click", function () {
    fetch("https://backend-transporteccss.onrender.com/api/vales")
      .then((response) => {
        if (!response.ok) {
          throw new Error("La solicitud a la API no fue exitosa");
        }
        return response.json();
      })
      .then((data) => {
        // Generar dinámicamente el contenido de la tabla
        var tableHTML = "<h1>CCSS</h1>";
        tableHTML += "<h3>Lista de Solicitudes de Vales</h3>";
        tableHTML += "<table>";
        tableHTML +=
          "<thead><tr><th>ID Vale</th><th>Nombre Solicitante</th><th>Nombre Salida</th><th>Nombre Destino</th><th>Fecha Solicitud</th><th>Detalle</th><th>Estado</th></tr></thead>";
        tableHTML += "<tbody>";

        // Construir filas de la tabla con los datos de la API
        data.vales.forEach(function (vale) {
          tableHTML += "<tr>";
          tableHTML += "<td>" + vale.IdVale + "</td>";
          tableHTML += "<td>" + vale.NombreSolicitante + "</td>";
          tableHTML += "<td>" + vale.NombreSalida + "</td>";
          tableHTML += "<td>" + vale.NombreDestino + "</td>";
          tableHTML +=
            "<td>" +
            new Date(vale.Fecha_Solicitud).toLocaleDateString() +
            "</td>";
          tableHTML += "<td>" + vale.Detalle + "</td>";
          tableHTML += "<td>" + vale.NombreEstado + "</td>";
          tableHTML += "</tr>";
        });

        tableHTML += "</tbody></table>";

        // Crear un elemento temporal para convertirlo en PDF
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHTML;

        // Configuración de html2pdf
        var opt = {
          margin: 10, // Márgenes en mm
          filename: "vales.pdf",
          image: { type: "jpeg", quality: 1.0 },
          html2canvas: { scale: 3 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        // Función para agregar imagen como logo en el PDF
        function addLogoToPDF(pdf) {
var totalPages = pdf.internal.getNumberOfPages();
var logoWidth = 35; // Ancho de la imagen del logo en milímetros
var logoMargin = 2; // Margen desde el borde en milímetros

for (var i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
    
    // Calcular posición de la imagen
    var x = pdf.internal.pageSize.getWidth() - logoMargin - logoWidth; // Posición X desde el borde derecho
    var y = logoMargin; // Posición Y desde el borde superior
    
    // Ajustar tamaño de la imagen como logo en la esquina superior derecha
    pdf.addImage('img/logo_ccss_azul.png', 'PNG', x, y, logoWidth, 0); // Altura automática
}
}
        // Crear PDF y descargarlo
        html2pdf()
          .from(tempDiv)
          .set(opt)
          .toPdf()
          .get("pdf")
          .then(function (pdf) {
            addLogoToPDF(pdf);
          })
          .save();
      })
      .catch((error) =>
        console.error(
          "Error al obtener datos desde la API o al generar el PDF:",
          error
        )
      );
  });
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