async function modificarPDF() {
    try {
        const pdfUrl = 'reporte.pdf'; // URL al PDF predefinido en tu servidor

        // Cargar el PDF utilizando pdf-lib
        const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

        // Cargar el PDF existente
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

        // Obtener las fechas del rango
        const fromDate = new Date(document.getElementById('from').value);
        const toDate = new Date(document.getElementById('to').value);

        // Obtener el token desde el localStorage
        const token = localStorage.getItem('token');

        // Configurar los encabezados con el token
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Obtener los datos desde la API
        const response1 = await axios.get('https://backend-transporteccss.onrender.com/api/vales', { headers });
        const response2 = await axios.get('https://backend-transporteccss.onrender.com/api/registrocombustible', { headers });
        const response3 = await axios.get('https://backend-transporteccss.onrender.com/api/cita', { headers });
        const datosVales = response1.data.vales;
        const datosRegistros = response2.data.registros;
        const datosCitas = response3.data;


    
        // Filtrar los vales según el rango de fechas y estado aprobado
        const valesFiltrados = datosVales.filter(vale => {
            const fechaSolicitud = new Date(vale.Fecha_Solicitud);
            return fechaSolicitud >= fromDate && fechaSolicitud <= toDate && vale.NombreEstado === 'Aprobado';
        });
        
      
        const cantidadFuncionariosTrasladados = valesFiltrados.reduce((sum, vale) => {
            let count = 0;
            if (vale.Acompanante1) count++;
            if (vale.Acompanante2) count++;
            if (vale.Acompanante3) count++;
            if (vale.Acompanante4) count++;
            if (vale.Acompanante5) count++;
            return sum + count;
        }, 0);

        //mostrar la fecha y hora de creacion del pdf
        const fechaCreacion = new Date();
        const fechaCreacionString = fechaCreacion.toLocaleDateString();
        const horaCreacionString = fechaCreacion.toLocaleTimeString();



        // Filtrar los registros según el rango de fechas y tipo de combustible
        const gasolinaLitros = datosRegistros
            .filter(registro => {
                const fecha = new Date(registro.fecha);
                return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Gasolina';
            })
            .reduce((sum, registro) => sum + parseFloat(registro.litrosAproximados), 0);

        const dieselLitros = datosRegistros
            .filter(registro => {
                const fecha = new Date(registro.fecha);
                return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Diesel';
            })
            .reduce((sum, registro) => sum + parseFloat(registro.litrosAproximados), 0);

            //diesel
        const dieselKilometraje = datosRegistros
            .filter(registro => {
                const fecha = new Date(registro.fecha);
                return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Diesel';
            })
            .reduce((sum, registro) => sum + parseFloat(registro.kilometraje), 0);

            //GASOLINA
            const gasolinaKilometraje = datosRegistros
            .filter(registro => {
                const fecha = new Date(registro.fecha);
                return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Gasolina';
            })
            .reduce((sum, registro) => sum + parseFloat(registro.kilometraje), 0);

        const pacientes = datosCitas.filter(paciente => {
                const fechaCita = new Date(paciente.fechaCita);
                return fechaCita >= fromDate && fechaCita <= toDate && paciente.estadoCita === 'Finalizada';
            });

        // Obtener la fecha del sistema
        const systemDate = new Date();
        const monthNumber = systemDate.getMonth() + 1; // getMonth() devuelve el mes (0-11), por lo que sumamos 1
        const monthName = systemDate.toLocaleString('default', { month: 'long' });
        const year = systemDate.getFullYear();

        // Modificar el PDF
        const firstPage = pdfDoc.getPages()[0];
        const { width, height } = firstPage.getSize();

        // Añadir texto dinámico al PDF
        const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        const adjustedFromDate = new Date(fromDate);
        adjustedFromDate.setDate(adjustedFromDate.getDate() + 1);
        
        const adjustedToDate = new Date(toDate);
        adjustedToDate.setDate(adjustedToDate.getDate() + 1);
        
        const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        // YA COLOCADA CORRECTAMENTE
        firstPage.drawText(`${monthNameCapitalized}`, {
            x: 167, 
            y: height - 221, 
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // YA COLOCADA CORRECTAMENTE
        firstPage.drawText(`${monthNumber}`, {
            x: 324, 
            y: height - 221, 
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // YA COLOCADA CORRECTAMENTE
        firstPage.drawText(`${year}`, {
            x: 186, 
            y: height - 235, 
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // YA COLOCADA CORRECTAMENTE
        firstPage.drawText(` De: ${adjustedFromDate.toLocaleDateString()} Hasta: ${adjustedToDate.toLocaleDateString()}`, {
            x: 329,
            y: 445,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // YA COLOCADA CORRECTAMENTE
        firstPage.drawText(`${valesFiltrados.length}`, {
            x: 284,
            y: height - 428,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // YA COLOCADA CORRECTAMENTE
        firstPage.drawText(`${gasolinaLitros.toFixed(2)} L`, {
            x: 284,
            y: 240,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // YA COLOCADA CORRECTAMENTE
        firstPage.drawText(`${dieselLitros.toFixed(2)} L`, {
            x: 284,
            y: height - 376,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // YA COLOCADA CORRECTAMENTE
        firstPage.drawText(`${pacientes.length}`, {
            x: 284,
            y: height - 466,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });
        
        firstPage.drawText(`${cantidadFuncionariosTrasladados}`, {
            x: 284,
            y: height - 489, 
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(`${cantidadFuncionariosTrasladados + pacientes.length}`, {
            x: 284,
            y: height - 445, 
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // Generales 
        firstPage.drawText(`${pacientes.length}`, {
            x: 597,
            y: height - 466,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(`${cantidadFuncionariosTrasladados}`, {
            x: 597,
            y: height - 489, 
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(`${cantidadFuncionariosTrasladados + pacientes.length}`, {
            x: 597,
            y: height - 444, 
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(`${gasolinaKilometraje}`, {
            x: 284,
            y: height - 393,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });
        
        firstPage.drawText(`${dieselKilometraje}`, {
            x: 284,
            y: height - 410,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });
        firstPage.drawText(`Creado el ${fechaCreacionString} a las ${horaCreacionString}`, {
            x: 584,
            y: height - 540,
            size: 12,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });


        // Generar el PDF modificado
        // Descargar solo la primera página del PDF modificado
        const pdfBytes = await pdfDoc.save();
        const firstPageBytes = await pdfDoc.saveAsBase64({ pages: [0] });

        const blob = base64ToBlob(firstPageBytes, 'application/pdf');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reportes_ASU.pdf';
        link.click();


        // Función para convertir base64 a Blob
        function base64ToBlob(base64, type) {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; ++i) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return new Blob([bytes], { type });
        }

    } catch (error) {
    }
}

//VALES

// function exportarViajes() {
//  const token = localStorage.getItem('token');
//     fetch("https://backend-transporteccss.onrender.com/api/viaje", {
//         headers: {
//             Authorization: `Bearer ${token}`
//         }
//     })
//         .then((response) => {
//             if (!response.ok) {
//                 throw new Error("La solicitud a la API no fue exitosa");
//             }
//             return response.json();
//         })
//         .then((data) => {
//       if (!data || !data.viaje || !Array.isArray(data.viaje)) {
//         throw new Error("Los datos recibidos de la API no son válidos");
//       }

//       // Generar dinámicamente el contenido de la tabla solo para los viajes
//       var tableHTML = "<h3>Caja Costarricense Seguro Social</h3>";
//       tableHTML += "<h3>Área de Salud Upala</h3>";
//       tableHTML += "<h3>Servicio Validación de Derechos - Transportes</h3>";
//       tableHTML += "<h3>Lista de Viajes Efectuados</h3>";
//       tableHTML += "<table>";
//       tableHTML += "<thead><tr><th>ID Viaje</th><th>Unidad</th><th>Chofer</th><th>Ocupación</th><th>Estado</th><th>Fecha Inicio</th><th>Fecha Fin</th><th>Destino</th><th>Citas Asociadas</th></tr></thead>";
//       tableHTML += "<tbody>";

//       // Construir filas de la tabla con los datos de los viajes
//       data.viaje.forEach(function (viaje) {
//         tableHTML += "<tr>";
//         tableHTML += "<td>" + viaje.idViaje + "</td>";
//         tableHTML += "<td>" + viaje.idUnidad + "</td>";
//         tableHTML += "<td>" + viaje.idChofer + "</td>";
//         tableHTML += "<td>" + viaje.Ocupacion + "</td>";
//         tableHTML += "<td>" + viaje.EstadoViaje + "</td>";
//         tableHTML += "<td>" + new Date(viaje.fechaInicioViaje).toLocaleDateString() + "</td>";
//         tableHTML += "<td>" + new Date(viaje.Fecha_Fin).toLocaleDateString() + "</td>";
//         tableHTML += "<td>" + viaje.Destino + "</td>";
//         tableHTML += "<td>" + viaje.Citas_Asociadas + "</td>";
//         tableHTML += "</tr>";
//       });

//       tableHTML += "</tbody></table>";

//       // Crear un elemento temporal para convertirlo en PDF
//       var tempDiv = document.createElement("div");
//       tempDiv.innerHTML = tableHTML;

//       // Configuración de html2pdf
//       var opt = {
//         margin: 10, // Márgenes en mm
//         filename: "viajes.pdf",
//         image: { type: "jpeg", quality: 1.0 },
//         html2canvas: { scale: 3 },
//         jsPDF: { unit: "mm", format: "a3", orientation: "portrait" },
//       };

//       // Función para agregar imagen como logo en el PDF
//       function addLogoToPDF(pdf) {
//         var totalPages = pdf.internal.getNumberOfPages();
//         var logoWidth = 25; // Ancho de la imagen del logo en milímetros
//         var logoMarginX = 10; // Margen desde el borde izquierdo en milímetros
//         var logoMarginY = 5; // Margen desde el borde superior en milímetros

//         for (var i = 1; i <= totalPages; i++) {
//           pdf.setPage(i);
//           pdf.setFontSize(10);
//           pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 50, pdf.internal.pageSize.getHeight() - 10); // Texto en la parte inferior derecha

//           // Calcular posición de la imagen
//           var x = logoMarginX; // Posición X desde el borde izquierdo
//           var y = logoMarginY; // Posición Y desde el borde superior

//           // Ajustar tamaño de la imagen como logo en la esquina superior izquierda
//           pdf.addImage('img/logo_ccss_azul.png', 'PNG', x, y, logoWidth, 0); // Altura automática
//         }
//       }

//       // Crear PDF y descargarlo
//       html2pdf()
//         .from(tempDiv)
//         .set(opt)
//         .toPdf()
//         .get("pdf")
//         .then(function (pdf) {
//           addLogoToPDF(pdf);
//           pdf.save();
//         });
//     })
//     .catch((error) =>
//       console.error("Error al obtener datos desde la API o al generar el PDF:", error)
//     );
// }


// function exportarCitas() {
//     const token = localStorage.getItem('token');
//     fetch("https://backend-transporteccss.onrender.com/api/cita", {
//         headers: {
//             Authorization: `Bearer ${token}`
//         }
//     })
//     .then((response) => {
//         if (!response.ok) {
//             throw new Error("La solicitud a la API no fue exitosa");
//         }
//         return response.json();
//     })
//     .then((data) => {
//         if (!data || !Array.isArray(data)) {
//             throw new Error("Los datos recibidos de la API no son válidos");
//         }

//         // Generar dinámicamente el contenido de la tabla solo para las citas
//         var tableHTML = "<h3>Caja Costarricense Seguro Social</h3>";
//         tableHTML += "<h3>Área de Salud Upala</h3>";
//         tableHTML += "<h3>Servicio Validación de Derechos - Transportes</h3>";
//         tableHTML += "<h3>Lista de Citas Efectuadas</h3>";
//         tableHTML += "<table>";
//         tableHTML += "<thead><tr><th>ID Cita</th><th>Nombre Paciente</th><th>Acompañante 1</th><th>Acompañante 2</th><th>Ubicación Origen</th><th>Ubicación Destino</th><th>Especialidad</th><th>Condición</th><th>Tipo Seguro</th><th>Diagnóstico</th><th>Estado</th><th>Traslado</th><th>Fecha</th><th>Hora</th><th>Ausente</th></tr></thead>";
//         tableHTML += "<tbody>";

//         // Construir filas de la tabla con los datos de las citas
//         data.forEach(function (cita) {
//             tableHTML += "<tr>";
//             tableHTML += "<td>" + cita.idCita + "</td>";
//             tableHTML += "<td>" + cita.nombreCompletoPaciente + "</td>";
//             tableHTML += "<td>" + (cita.nombreCompletoAcompanante1 || 'N/A') + "</td>";
//             tableHTML += "<td>" + (cita.nombreCompletoAcompanante2 || 'N/A') + "</td>";
//             tableHTML += "<td>" + cita.ubicacionOrigen + "</td>";
//             tableHTML += "<td>" + cita.ubicacionDestino + "</td>";
//             tableHTML += "<td>" + cita.especialidad + "</td>";
//             tableHTML += "<td>" + cita.condicionCita + "</td>";
//             tableHTML += "<td>" + cita.tipoSeguro + "</td>";
//             tableHTML += "<td>" + cita.diagnostico + "</td>";
//             tableHTML += "<td>" + cita.estadoCita + "</td>";
//             tableHTML += "<td>" + cita.transladoCita + "</td>";
//             tableHTML += "<td>" + new Date(cita.fechaCita).toLocaleDateString() + "</td>";
//             tableHTML += "<td>" + cita.horaCita + "</td>";
//             tableHTML += "<td>" + (cita.ausente || 'N/A') + "</td>";
//             tableHTML += "</tr>";
//         });

//         tableHTML += "</tbody></table>";

//         // Crear un elemento temporal para convertirlo en PDF
//         var tempDiv = document.createElement("div");
//         tempDiv.innerHTML = tableHTML;

//         // Configuración de html2pdf
//         var opt = {
//             margin: 10, // Márgenes en mm
//             filename: "citas.pdf",
//             image: { type: "jpeg", quality: 1.0 },
//             html2canvas: { scale: 3 },
//             jsPDF: { unit: "mm", format: "a3", orientation: "portrait" },
//         };

//         // Función para agregar imagen como logo en el PDF
//         function addLogoToPDF(pdf) {
//             var totalPages = pdf.internal.getNumberOfPages();
//             var logoWidth = 25; // Ancho de la imagen del logo en milímetros
//             var logoMarginX = 10; // Margen desde el borde izquierdo en milímetros
//             var logoMarginY = 5; // Margen desde el borde superior en milímetros

//             for (var i = 1; i <= totalPages; i++) {
//                 pdf.setPage(i);
//                 pdf.setFontSize(10);
//                 pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 50, pdf.internal.pageSize.getHeight() - 10); // Texto en la parte inferior derecha

//                 // Calcular posición de la imagen
//                 var x = logoMarginX; // Posición X desde el borde izquierdo
//                 var y = logoMarginY; // Posición Y desde el borde superior

//                 // Ajustar tamaño de la imagen como logo en la esquina superior izquierda
//                 pdf.addImage('img/logo_ccss_azul.png', 'PNG', x, y, logoWidth, 0); // Altura automática
//             }
//         }

//         // Crear PDF y descargarlo
//         html2pdf()
//             .from(tempDiv)
//             .set(opt)
//             .toPdf()
//             .get("pdf")
//             .then(function (pdf) {
//                 addLogoToPDF(pdf);
//                 pdf.save();
//             });
//     })
//     .catch((error) =>
//         console.error("Error al obtener datos desde la API o al generar el PDF:", error)
//     );
// }
