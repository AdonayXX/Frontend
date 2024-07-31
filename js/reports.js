
async function modificarPDF() {
    try {
        const pdfUrl = 'reporte.pdf';


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



        const fromDateInput = document.getElementById('from');
        const [year, month, day] = fromDateInput.value.split('-').map(Number);

        const fromDateValue = new Date(year, month - 1, day);

        const adjustedFromDateE = new Date(fromDateValue);
        adjustedFromDateE.setDate(adjustedFromDateE.getDate() + 1);

        const yearValue = fromDateValue.getFullYear();
        const monthNumber = fromDateValue.getMonth() + 1;
        const monthName = fromDateValue.toLocaleString('default', { month: 'long' });



        const firstPage = pdfDoc.getPages()[0];
        const { width, height } = firstPage.getSize();

        const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        const adjustedFromDate = new Date(fromDate);
        adjustedFromDate.setDate(adjustedFromDate.getDate() + 1);

        const adjustedToDate = new Date(toDate);
        adjustedToDate.setDate(adjustedToDate.getDate() + 1);

        const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        //YA ACOMODADO
        firstPage.drawText(`${monthNameCapitalized}`, {
            x: 179,
            y: height - 180,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        firstPage.drawText(`${monthNumber}`, {
            x: 287,
            y: height - 180,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        firstPage.drawText(`${yearValue}`, {
            x: 200,
            y: height - 192,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });


        firstPage.drawText(` De: ${adjustedFromDate.toLocaleDateString()} Hasta: ${adjustedToDate.toLocaleDateString()}`, {
            x: 331,
            y: height - 125,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });



        //YA ACOMODADO
        const gasolinaLitrosString = gasolinaLitros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const gasolinaLitrosWidth = helveticaFont.widthOfTextAtSize(gasolinaLitrosString, 8);
        const gasolinaLitrosX = 273 + (50 - gasolinaLitrosWidth) / 2;
        const gasolinaLitrosFormatted = gasolinaLitrosString.replace('.00', '');
        firstPage.drawText(gasolinaLitrosFormatted, {
            x: gasolinaLitrosX,
            y: height - 306,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const dieselLitrosString = dieselLitros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const dieselLitrosWidth = helveticaFont.widthOfTextAtSize(dieselLitrosString, 8);
        const dieselLitrosX = 273 + (50 - dieselLitrosWidth) / 2;
        const dieselLitrosFormatted = dieselLitrosString.replace('.00', '');
        firstPage.drawText(`${dieselLitrosFormatted}`, {
            x: dieselLitrosX,
            y: height - 317,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const gasolinaKilometrajeString = gasolinaKilometraje.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const gasolinaKilometrajeWidth = helveticaFont.widthOfTextAtSize(gasolinaKilometrajeString, 8);
        const gasolinaKilometrajeX = 273 + (50 - gasolinaKilometrajeWidth) / 2;
        const gasolinaKilometrajeFormatted = gasolinaKilometrajeString.replace('.00', '');

        firstPage.drawText(`${gasolinaKilometrajeFormatted}`, {
            x: gasolinaKilometrajeX,
            y: height - 329,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const dieselKilometrajeString = dieselKilometraje.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const dieselKilometrajeWidth = helveticaFont.widthOfTextAtSize(dieselKilometrajeString, 8);
        const dieselKilometrajeX = 273 + (50 - dieselKilometrajeWidth) / 2;
        const dieselKilometrajeFormatted = dieselKilometrajeString.replace('.00', '');

        firstPage.drawText(`${dieselKilometrajeFormatted}`, {
            x: dieselKilometrajeX,
            y: height - 342,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const valesLength = valesFiltrados.length;
        const valesWidth = helveticaFont.widthOfTextAtSize(valesLength.toString(), 8);
        const valesX = 267 + (50 - valesWidth) / 2;

        firstPage.drawText(valesLength.toString(), {
            x: valesX,
            y: height - 356,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const totalLength = cantidadFuncionariosTrasladados + pacientes.length;
        const totalWidth = helveticaFont.widthOfTextAtSize(totalLength.toString(), 8);
        const totalX = 267 + (50 - totalWidth) / 2;

        firstPage.drawText(totalLength.toString(), {
            x: totalX,
            y: height - 368,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const pacientesLength = pacientes.length;
        const pacientesWidth = helveticaFont.widthOfTextAtSize(pacientesLength.toString(), 8);
        const pacientesX = 267 + (50 - pacientesWidth) / 2;
        firstPage.drawText(pacientesLength.toString(), {
            x: pacientesX,
            y: height - 378,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const funcionariosLength = cantidadFuncionariosTrasladados.toString();
        const funcionariosWidth = helveticaFont.widthOfTextAtSize(funcionariosLength, 8);
        const funcionariosX = 267 + (50 - funcionariosWidth) / 2;

        firstPage.drawText(funcionariosLength, {
            x: funcionariosX,
            y: height - 390,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        // GENERALES 

        //YA ACOMODADO
        const gasolinaLitrosStringG = gasolinaLitros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const gasolinaLitrosWidthG = helveticaFont.widthOfTextAtSize(gasolinaLitrosStringG, 8);
        const gasolinaLitrosXG = 530 + (50 - gasolinaLitrosWidthG) / 2;
        const gasolinaLitrosFormattedG = gasolinaLitrosStringG.replace('.00', '');
        firstPage.drawText(gasolinaLitrosFormattedG, {
            x: gasolinaLitrosXG,
            y: height - 306,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const dieselLitrosStringG = dieselLitros.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const dieselLitrosWidthG = helveticaFont.widthOfTextAtSize(dieselLitrosStringG, 8);
        const dieselLitrosXG = 530 + (50 - dieselLitrosWidthG) / 2;
        const dieselLitrosFormattedG = dieselLitrosStringG.replace('.00', '');
        firstPage.drawText(`${dieselLitrosFormattedG}`, {
            x: dieselLitrosXG,
            y: height - 317,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const gasolinaKilometrajeStringG = gasolinaKilometraje.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const gasolinaKilometrajeWidthG = helveticaFont.widthOfTextAtSize(gasolinaKilometrajeStringG, 8);
        const gasolinaKilometrajeXG = 530 + (50 - gasolinaKilometrajeWidthG) / 2;
        const gasolinaKilometrajeFormattedG = gasolinaKilometrajeStringG.replace('.00', '');

        firstPage.drawText(`${gasolinaKilometrajeFormattedG}`, {
            x: gasolinaKilometrajeXG,
            y: height - 329,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const dieselKilometrajeStringG = dieselKilometraje.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const dieselKilometrajeWidthG = helveticaFont.widthOfTextAtSize(dieselKilometrajeStringG, 8);
        const dieselKilometrajeXG = 530 + (50 - dieselKilometrajeWidthG) / 2;
        const dieselKilometrajeFormattedG = dieselKilometrajeStringG.replace('.00', '');

        firstPage.drawText(`${dieselKilometrajeFormattedG}`, {
            x: dieselKilometrajeXG,
            y: height - 342,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const valesLengthG = valesFiltrados.length;
        const valesWidthG = helveticaFont.widthOfTextAtSize(valesLengthG.toString(), 8);
        const valesXG = 524 + (50 - valesWidthG) / 2;

        firstPage.drawText(valesLengthG.toString(), {
            x: valesXG,
            y: height - 356,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const totalLengthG = cantidadFuncionariosTrasladados + pacientes.length;
        const totalWidthG = helveticaFont.widthOfTextAtSize(totalLengthG.toString(), 8);
        const totalXG = 524 + (50 - totalWidthG) / 2;

        firstPage.drawText(totalLengthG.toString(), {
            x: totalXG,
            y: height - 368,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const pacientesLengthG = pacientes.length;
        const pacientesWidthG = helveticaFont.widthOfTextAtSize(pacientesLengthG.toString(), 8);
        const pacientesXG = 524 + (50 - pacientesWidthG) / 2;
        firstPage.drawText(pacientesLengthG.toString(), {
            x: pacientesXG,
            y: height - 378,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        //YA ACOMODADO
        const funcionariosLengthG = cantidadFuncionariosTrasladados.toString();
        const funcionariosWidthG = helveticaFont.widthOfTextAtSize(funcionariosLengthG, 8);
        const funcionariosXG = 524 + (50 - funcionariosWidthG) / 2;

        firstPage.drawText(funcionariosLengthG, {
            x: funcionariosXG,
            y: height - 390,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });


        firstPage.drawText(`0`, {
            x: 547,
            y: height - 402,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(`Creado el ${fechaCreacionString} a las ${horaCreacionString}`, {
            x: 590,
            y: height - 593,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });



        const pdfBytes = await pdfDoc.save();
        const firstPageBytes = await pdfDoc.saveAsBase64({ pages: [0] });

        const blob = base64ToBlob(firstPageBytes, 'application/pdf');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reportes_ASU.pdf';
        link.click();


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

async function modificarExcel() {
    try {
        const fromDate = new Date(document.getElementById('from').value);
        const toDate = new Date(document.getElementById('to').value);

        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const response1 = await axios.get('https://backend-transporteccss.onrender.com/api/vales', { headers });
        const response2 = await axios.get('https://backend-transporteccss.onrender.com/api/registrocombustible', { headers });
        const response3 = await axios.get('https://backend-transporteccss.onrender.com/api/cita', { headers });
        const datosVales = response1.data.vales;
        const datosRegistros = response2.data.registros;
        const datosCitas = response3.data;

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

        //preguntar si se quiere

        // const fechaCreacion = new Date();
        // const fechaCreacionString = fechaCreacion.toLocaleDateString();
        // const horaCreacionString = fechaCreacion.toLocaleTimeString();

        const fromDateInput = document.getElementById('from');
        const [year, month, day] = fromDateInput.value.split('-').map(Number);

        const fromDateValue = new Date(year, month - 1, day);

        const adjustedFromDateE = new Date(fromDateValue);
        adjustedFromDateE.setDate(adjustedFromDateE.getDate() + 1);

        const yearValue = fromDateValue.getFullYear();
        const monthNumber = fromDateValue.getMonth() + 1;
        const monthName = fromDateValue.toLocaleString('default', { month: 'long' });

        const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);


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

        const dieselKilometraje = datosRegistros
            .filter(registro => {
                const fecha = new Date(registro.fecha);
                return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Diesel';
            })
            .reduce((sum, registro) => sum + parseFloat(registro.kilometraje), 0);

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

        // Leer el archivo Excel existente con ExcelJS
        const response = await fetch('reporteExcel.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        // Obtener la primera hoja del libro
        const worksheet = workbook.getWorksheet(1);


        // Especificar celdas para los datos
        //YA COLOCADOS COLUMNA TOTAL


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



        // const cellFechaCreacion = 'A52';
        // const cellHoraCreacion = 'A53';

        // Agregar datos a las celdas especificadas

        //YA COLOCADOS COLUMNA TOTAL

        worksheet.getCell(cellGasolinaLitros).value = gasolinaLitros;
        worksheet.getCell(cellDieselLitros).value = dieselLitros;
        worksheet.getCell(cellGasolinaKilometraje).value = gasolinaKilometraje;
        worksheet.getCell(cellDieselKilometraje).value = dieselKilometraje;
        worksheet.getCell(cellValesFiltrados).value = valesFiltrados.length;
        worksheet.getCell(cellTotalFuncionariosPacientes).value = cantidadFuncionariosTrasladados + pacientes.length;
        worksheet.getCell(cellPacientes).value = pacientes.length;
        worksheet.getCell(cellTotalFuncionarios).value = cantidadFuncionariosTrasladados;


//         firstPage.drawText(`${cantidadFuncionariosTrasladados + pacientes.length}`, {
//             x: 284,
//             y: height - 445, 
//             size: 12,
//             font: helveticaFont,
//             color: PDFLib.rgb(0, 0, 0),
//         });


        //YA COLOCADOS COLUMNA GENERAL

        worksheet.getCell(cellGasolinaLitros2).value = gasolinaLitros;
        worksheet.getCell(cellDieselLitros2).value = dieselLitros;
        worksheet.getCell(cellGasolinaKilometraje2).value = gasolinaKilometraje;
        worksheet.getCell(cellDieselKilometraje2).value = dieselKilometraje;
        worksheet.getCell(cellValesFiltrados2).value = valesFiltrados.length;
        worksheet.getCell(cellTotalFuncionariosPacientes2).value = cantidadFuncionariosTrasladados + pacientes.length;
        worksheet.getCell(cellPacientes2).value = pacientes.length;
        worksheet.getCell(cellTotalFuncionarios2).value = cantidadFuncionariosTrasladados;



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

        //prueba fecha


        worksheet.getCell(cellNumeroMes).value = monthNumber;
        worksheet.getCell(cellAno).value = yearValue;
        worksheet.getCell(cellMes).value = monthNameCapitalized;


        // worksheet.getCell(cellFechaCreacion).value = fechaCreacionString;
        // worksheet.getCell(cellHoraCreacion).value = horaCreacionString;

        // Aplicar estilo a las celdas
        const cellsToStyle = [
            cellPacientes, cellGasolinaLitros, cellDieselLitros,
            cellGasolinaKilometraje, cellDieselKilometraje,
            cellValesFiltrados, cellTotalFuncionariosPacientes,
            cellAno, cellMes, cellNumeroMes, cellTotalFuncionarios,

            // cellFechaCreacion, cellHoraCreacion
        ];

        cellsToStyle.forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.font = { name: 'Arial', bold: true, color: { argb: '#000000' }, size: 8 };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center' };
        });

        // Guardar el archivo modificado
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reportes_ASU_Modificado.xlsx';
        link.click();
    } catch (error) {
        console.error("Error al modificar el archivo Excel:", error);
        alert("Hubo un error al modificar el archivo Excel. Por favor, intente de nuevo.");
    }
}

async function exportarVale() {
    try {
        // Obtener el ID del vale desde un input en el HTML
        const idVale = document.getElementById('idVale').value;

        let datosVale;
        try {
            // Obtener el vale específico por ID
            const response = await axios.get(`https://backend-transporteccss.onrender.com/api/vales/${idVale}`);
            datosVale = response.data;
        } catch (apiError) {
            console.error("Error al obtener el vale desde la API:", apiError);
            alert("Hubo un error al obtener los datos del vale. Por favor, intente de nuevo.");
            return;
        }

        if (!datosVale) {
            alert('No se encontró el vale con el ID especificado');
            return;
        }

        console.log('Datos del vale:', datosVale);

        // Descargar el archivo Excel
        const responseExcel = await fetch('reporteria/ReporteVale.xlsx');
        if (!responseExcel.ok) {
            throw new Error('No se pudo descargar el archivo Excel');
        }

        const arrayBuffer = await responseExcel.arrayBuffer();
        console.log('Archivo Excel descargado con éxito');

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        console.log('Archivo Excel cargado en ExcelJS');

        const worksheet = workbook.getWorksheet(1);

        // Llenar los datos del vale en el archivo Excel
        worksheet.getCell('B8:C8').value = datosVale.Fecha_Solicitud;
        worksheet.getCell('K8').value = datosVale.IdUnidadProgramatica;
        worksheet.getCell('K8').value = datosVale.NombreUnidadProgramatica;
        worksheet.getCell('I12:J12:K12').value = datosVale.Acompanante1;
        worksheet.getCell('I13:J13:K13').value = datosVale.Acompanante2;
        worksheet.getCell('I14:J14:K14').value = datosVale.Acompanante3;
        worksheet.getCell('I15:J15:K15').value = datosVale.Acompanante4;
        worksheet.getCell('I16:J16:K16').value = datosVale.Acompanante5;
        worksheet.getCell('B13:C13:D13:E13:F13:G13:H13').value = datosVale.NombreMotivo;
        worksheet.getCell('G17:H17:I17:J17:K17').value = datosVale.NombreSolicitante;
        worksheet.getCell('H18:I18:J18:K18').value = datosVale.Detalle;
        worksheet.getCell('G25').value = datosVale.Hora_Salida;
        worksheet.getCell('C25:D25:E25').value = datosVale.Fecha_Solicitud;

        // Generar el archivo Excel
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reporte_Vale.xlsx';
        link.click();
    } catch (error) {
        console.error("Error al exportar el archivo Excel:", error);
        alert("Hubo un error al exportar el archivo Excel. Por favor, intente de nuevo.");
    }
}
