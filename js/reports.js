

async function generalesPdf() {
    try {
        const pdfUrl = './documents/reporteGeneral.pdf';

        const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

        const fromDate = new Date(document.getElementById('from').value);
        const toDate = new Date(document.getElementById('to').value);

        if (fromDate > toDate) {
            showToast("Aviso", "La fecha de inicio no puede ser mayor a la fecha de fin.");
            return;
        }

        const token = localStorage.getItem('token');

        const headers = {
            'Authorization': `Bearer ${token}`
        };

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
            .reduce((sum, registro) => sum + parseFloat(registro.kilometrajeRecorrido), 0);

        const gasolinaKilometraje = datosRegistros
            .filter(registro => {
                const fecha = new Date(registro.fecha);
                return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Gasolina';
            })
            .reduce((sum, registro) => sum + parseFloat(registro.kilometrajeRecorrido), 0);

        const pacientes = datosCitas.filter(paciente => {
            const fechaCita = new Date(paciente.fechaCita);
            return fechaCita >= fromDate && fechaCita <= toDate && paciente.estadoCita === 'Finalizada';
        });


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

        firstPage.drawText(`${monthNameCapitalized}`, {
            x: 179,
            y: height - 180,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(`${monthNumber}`, {
            x: 287,
            y: height - 180,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(`${yearValue}`, {
            x: 200,
            y: height - 192,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

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



        const pdfBytes = await pdfDoc.save();
        const firstPageBytes = await pdfDoc.saveAsBase64({ pages: [0] });

        const blob = base64ToBlob(firstPageBytes, 'application/pdf');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reporte_ASU.pdf';
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


async function generalesExcel() {
    try {
        const fromDate = new Date(document.getElementById('from').value);
        const toDate = new Date(document.getElementById('to').value);

        if (fromDate > toDate) {
            showToast("Aviso", "La fecha de inicio no puede ser mayor a la fecha de fin.");
            return;
        }

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
            .reduce((sum, registro) => sum + parseFloat(registro.kilometrajeRecorrido), 0);

        const gasolinaKilometraje = datosRegistros
            .filter(registro => {
                const fecha = new Date(registro.fecha);
                return fecha >= fromDate && fecha <= toDate && registro.tipoCombustible === 'Gasolina';
            })
            .reduce((sum, registro) => sum + parseFloat(registro.kilometrajeRecorrido), 0);

        const pacientes = datosCitas.filter(paciente => {
            const fechaCita = new Date(paciente.fechaCita);
            return fechaCita >= fromDate && fechaCita <= toDate && paciente.estadoCita === 'Finalizada';
        });

        const response = await fetch('./documents/reporteGeneral.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);


        const worksheet = workbook.getWorksheet(1);

        const cellGasolinaLitros = 'N18:O18:P18:Q18';
        const cellDieselLitros = 'N19:O19:P19:Q19';
        const cellGasolinaKilometraje = 'N20:O20:P20:Q20';
        const cellDieselKilometraje = 'N21:O21:P21:Q21';
        const cellValesFiltrados = 'N22:O22:P22:Q22';
        const cellTotalFuncionariosPacientes = 'N23:O23:P23:Q23';
        const cellPacientes = 'N24:O24:P24:Q24';
        const cellTotalFuncionarios = 'N25:O25:P25:Q25';


        const cellGasolinaLitros2 = 'AH18:AI18';
        const cellDieselLitros2 = 'AH19:AI19';
        const cellGasolinaKilometraje2 = 'AH20:AI20';
        const cellDieselKilometraje2 = 'AH21:AI21';
        const cellValesFiltrados2 = 'AH22:AI22';
        const cellTotalFuncionariosPacientes2 = 'AH23:AI23';
        const cellPacientes2 = 'AH24:AI24';
        const cellTotalFuncionarios2 = 'AH25:AI25';

        const cellNumeroMes = 'O9:P9';
        const cellAno = 'F10:G10:H10:I10:J10:K10:L10';
        const cellMes = 'F9:G9:H9:I9:J9:K9';

        worksheet.getCell(cellGasolinaLitros).value = gasolinaLitros;
        worksheet.getCell(cellDieselLitros).value = dieselLitros;
        worksheet.getCell(cellGasolinaKilometraje).value = gasolinaKilometraje;
        worksheet.getCell(cellDieselKilometraje).value = dieselKilometraje;
        worksheet.getCell(cellValesFiltrados).value = valesFiltrados.length;
        worksheet.getCell(cellTotalFuncionariosPacientes).value = cantidadFuncionariosTrasladados + pacientes.length;
        worksheet.getCell(cellPacientes).value = pacientes.length;
        worksheet.getCell(cellTotalFuncionarios).value = cantidadFuncionariosTrasladados;

        worksheet.getCell(cellGasolinaLitros2).value = gasolinaLitros;
        worksheet.getCell(cellDieselLitros2).value = dieselLitros;
        worksheet.getCell(cellGasolinaKilometraje2).value = gasolinaKilometraje;
        worksheet.getCell(cellDieselKilometraje2).value = dieselKilometraje;
        worksheet.getCell(cellValesFiltrados2).value = valesFiltrados.length;
        worksheet.getCell(cellTotalFuncionariosPacientes2).value = cantidadFuncionariosTrasladados + pacientes.length;
        worksheet.getCell(cellPacientes2).value = pacientes.length;
        worksheet.getCell(cellTotalFuncionarios2).value = cantidadFuncionariosTrasladados;

        worksheet.getCell(cellNumeroMes).value = monthNumber;
        worksheet.getCell(cellAno).value = yearValue;
        worksheet.getCell(cellMes).value = monthNameCapitalized;

        const cellsToStyle = [
            cellPacientes, cellGasolinaLitros, cellDieselLitros,
            cellGasolinaKilometraje, cellDieselKilometraje,
            cellValesFiltrados, cellTotalFuncionariosPacientes,
            cellAno, cellMes, cellNumeroMes, cellTotalFuncionarios,
        ];


        cellsToStyle.forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.font = { name: 'Arial', bold: true, color: { argb: '#000000' }, size: 10 };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center' };
        });


        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reporte_ASU.xlsx';
        link.click();
    } catch (error) {
        console.error("Error al modificar el archivo Excel:", error);
        alert("Hubo un error al modificar el archivo Excel. Por favor, intente de nuevo.");
    }
}

//NO BORRAR

//MANTEMIENTO DE LOS REPORTES

// async function mantenimientoPdf() {
//     try {
//         const pdfUrl = './documents/reporteMantenimiento.pdf';

//         // Fetch existing PDF
//         const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
//         const existingPdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

//         // Create a new PDF document
//         const newPdfDoc = await PDFLib.PDFDocument.create();
//         const [templatePage] = await existingPdfDoc.copyPages(existingPdfDoc, [0]);

//         const fromDate = new Date(document.getElementById('fromMaintenance').value);
//         const toDate = new Date(document.getElementById('toMaintenance').value);
//         const idActividad = document.getElementById('actividad').value; // Asegúrate de tener este input en tu HTML
//         const unidad = document.getElementById('equipo').value; // Asegúrate de tener este input en tu HTML
    


//         if (fromDate > toDate) {
//             showToast("Aviso", "La fecha de inicio no puede ser mayor a la fecha de fin.");
//             return;
//         }
           
      
//         const fechaCreacion = new Date();
//         const fechaCreacionString = fechaCreacion.toLocaleDateString();
//         const horaCreacionString = fechaCreacion.toLocaleTimeString();

        
//         // Adjust dates by one day
//         const adjustedFromDate = new Date(fromDate);
//         adjustedFromDate.setDate(adjustedFromDate.getDate() + 1 );
//         const adjustedToDate = new Date(toDate);
//         adjustedToDate.setDate(adjustedToDate.getDate() + 1);

//         // Construct the API URL with the date range parameters
//             // Construct the API URL with the date range, activity ID, and unit parameters
//             let apiUrl = `https://backend-transporteccss.onrender.com/api/reporteMantenimiento/porFecha?fechaInicio=${fromDate.toISOString().split('T')[0]}&fechaFin=${toDate.toISOString().split('T')[0]}`;

//             if (idActividad) {
//                 apiUrl = `https://backend-transporteccss.onrender.com/api/reporteMantenimiento/porActividad?IdActividad=${idActividad}&fechaInicio=${fromDate.toISOString().split('T')[0]}&fechaFin=${toDate.toISOString().split('T')[0]}`;
//             }

//             if (unidad) {
//                 apiUrl = `https://backend-transporteccss.onrender.com/api/reporteMantenimiento/porUnidad?id=${unidad}&fechaInicio=${fromDate.toISOString().split('T')[0]}&fechaFin=${toDate.toISOString().split('T')[0]}`;
//             }    

//         const token = localStorage.getItem('token');
//         const headers = {
//             'Authorization': `Bearer ${token}`
//         };

    
//         // Get mantenimiento data from the API
//         const response = await axios.get(apiUrl, { headers });
//         const mantenimientos = response.data.mantenimiento;


//         // Embed font for adding text
//         const helveticaFont = await newPdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

//         // Create a page for each mantenimiento
//         for (const mantenimiento of mantenimientos) {
//             // Create a new page and add the template content
//             const [newPage] = await newPdfDoc.copyPages(existingPdfDoc, [0]);
//             newPdfDoc.addPage(newPage);

//             const { height } = newPage.getSize();

//             // Add maintenance details on the page
//             newPage.drawText(`De: ${adjustedFromDate.toLocaleDateString()} Hasta: ${adjustedToDate.toLocaleDateString()}`, {
//                 x: 321,
//                 y: height - 140,
//                 size: 10,
//                 font: helveticaFont,
//                 color: PDFLib.rgb(0, 0, 0),
//             });

//             newPage.drawText(`Creado el ${fechaCreacionString} a las ${horaCreacionString}`, {
//                 x: 590,
//                 y: height - 523,
//                 size: 8,
//                 font: helveticaFont,
//                 color: PDFLib.rgb(0, 0, 0),
//             });

//             //YA COLOCADO
//             newPage.drawText(`${mantenimiento.numeroUnidad}`, {
//                 x: 443,
//                 y: height - 247,
//                 size: 10,
//                 font: helveticaFont,
//                 color: PDFLib.rgb(0, 0, 0),
//             });
//             newPage.drawText(`${mantenimiento.kilometrajeActual}`, {
//                 x: 443,
//                 y: height - 260,
//                 size: 10,
//                 font: helveticaFont,
//                 color: PDFLib.rgb(0, 0, 0),
//             });
            
//             newPage.drawText(`${mantenimiento.KilometrajeMantenimiento}`, {
//                 x: 443,
//                 y: height - 273,
//                 size: 10,
//                 font: helveticaFont,
//                 color: PDFLib.rgb(0, 0, 0),
//             });
            

//             newPage.drawText(`${mantenimiento.Detalle}`, {
//                 x: 443,
//                 y: height - 295,
//                 size: 10,
//                 font: helveticaFont,
//                 color: PDFLib.rgb(0, 0, 0),
//             });

          
//             let actividadYPosition = height - 328;
//             mantenimiento.Actividades.forEach((actividad, index) => {
//                 const descripcion = `${actividad.Descripcion}`;
//                 const cantidad = `${actividad.Cantidad}`;
//                 const unidadMedida = `${actividad.UnidadMedida}`;
            
//                 newPage.drawText(descripcion, {
//                     x: 80,
//                     y: actividadYPosition,
//                     size: 10,
//                     font: helveticaFont,
//                     color: PDFLib.rgb(0, 0, 0),
//                 });
            

//                 newPage.drawText(cantidad, {
//                     x: 443,
//                     y: actividadYPosition,
//                     size: 10,
//                     font: helveticaFont,
//                     color: PDFLib.rgb(0, 0, 0),
//                 });
            
     
//                 newPage.drawText(unidadMedida, {
//                     x: 585, 
//                     y: actividadYPosition,
//                     size: 10,
//                     font: helveticaFont,
//                     color: PDFLib.rgb(0, 0, 0),
//                 });
            
//                 actividadYPosition -= 14;
//             });
//         }            

//         // Save the new PDF document
//         const pdfBytes = await newPdfDoc.save();

//         // Create a blob from the updated PDF and trigger download
//         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'Reportes_ASU_Mantenimiento.pdf';
//         link.click();

//     } catch (error) {
//         console.error('Error generating PDF:', error);
//     }
// }


// async function mantenimientoExcel() {
//     try {
//         const fromDate = new Date(document.getElementById('fromMaintenance').value);
//         const toDate = new Date(document.getElementById('toMaintenance').value);

//         if (fromDate > toDate) {
//             showToast("Aviso", "La fecha de inicio no puede ser mayor a la fecha de fin.");
//             return;
//         }

//         const token = localStorage.getItem('token');
//         const headers = { 'Authorization': `Bearer ${token}` };

//         const response1 = await axios.get('https://backend-transporteccss.onrender.com/api/vales', { headers });
//         const response2 = await axios.get('https://backend-transporteccss.onrender.com/api/registrocombustible', { headers });
//         const response3 = await axios.get('https://backend-transporteccss.onrender.com/api/cita', { headers });
//         const datosVales = response1.data.vales;
//         const datosRegistros = response2.data.registros;
//         const datosCitas = response3.data;


//         const adjustedFromDateE = new Date(fromDate);
//         adjustedFromDateE.setDate(adjustedFromDateE.getDate() + 1);

//         const adjustedToDate = new Date(toDate);
//         adjustedToDate.setDate(adjustedToDate.getDate() + 1);

//         const fechaCreacion = new Date();
//         const fechaCreacionString = fechaCreacion.toLocaleDateString();
//         const horaCreacionString = fechaCreacion.toLocaleTimeString();

//         const response = await fetch('./documents/reporteMantenimiento.xlsx');
//         const arrayBuffer = await response.arrayBuffer();
//         const workbook = new ExcelJS.Workbook();
//         await workbook.xlsx.load(arrayBuffer);


//         const worksheet = workbook.getWorksheet(1);


//         const cellfechaCreacion = 'L39:M39:N39:O39';
//         const cellrangoFecha = 'G7:H7:I7:J7';




//         worksheet.getCell(cellfechaCreacion).value = "Creado el " + fechaCreacionString + " a las " + horaCreacionString;
//         worksheet.getCell(cellrangoFecha).value = "De: " + adjustedFromDateE.toLocaleDateString() + " Hasta: " + adjustedToDate.toLocaleDateString();

//         const cellsToStyle = [
//             cellrangoFecha,

//         ];


//         cellsToStyle.forEach(cellAddress => {
//             const cell = worksheet.getCell(cellAddress);
//             cell.font = { name: 'Arial', bold: true, color: { argb: '#000000' }, size: 10 };
//             cell.border = {
//                 top: { style: 'thin' },
//                 left: { style: 'thin' },
//                 bottom: { style: 'thin' },
//                 right: { style: 'thin' }
//             };
//             cell.alignment = { horizontal: 'center' };
//         });


//         const buffer = await workbook.xlsx.writeBuffer();
//         const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = 'Reportes_ASU_Mantenimiento.xlsx';
//         link.click();
//     } catch (error) {
//         console.error("Error al modificar el archivo Excel:", error);
//         alert("Hubo un error al modificar el archivo Excel. Por favor, intente de nuevo.");
//     }
// }

//REPORTE DE VALES PDF




async function mantenimientoExcel() {
    try {
        const fromDate = new Date(document.getElementById('fromMaintenance').value);
        const toDate = new Date(document.getElementById('toMaintenance').value);

        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const response1 = await axios.get('https://backend-transporteccss.onrender.com/api/vales', { headers });
        const response2 = await axios.get('https://backend-transporteccss.onrender.com/api/registrocombustible', { headers });
        const response3 = await axios.get('https://backend-transporteccss.onrender.com/api/cita', { headers });
        const datosVales = response1.data.vales;
        const datosRegistros = response2.data.registros;
        const datosCitas = response3.data;


        const adjustedFromDateE = new Date(fromDate);
        adjustedFromDateE.setDate(adjustedFromDateE.getDate() + 1);

        const adjustedToDate = new Date(toDate);
        adjustedToDate.setDate(adjustedToDate.getDate() + 1);

        const fechaCreacion = new Date();
        const fechaCreacionString = fechaCreacion.toLocaleDateString();
        const horaCreacionString = fechaCreacion.toLocaleTimeString();

        const response = await fetch('/documents/reporteMantenimiento.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);


        const worksheet = workbook.getWorksheet(1);


        const cellfechaCreacion = 'L39:M39:N39:O39';
        const cellrangoFecha = 'G7:H7:I7:J7';




        worksheet.getCell(cellfechaCreacion).value = "Creado el " + fechaCreacionString + " a las " + horaCreacionString;
        worksheet.getCell(cellrangoFecha).value = "De: " + adjustedFromDateE.toLocaleDateString() + " Hasta: " + adjustedToDate.toLocaleDateString();

        const cellsToStyle = [
            cellrangoFecha,

        ];


        cellsToStyle.forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.font = { name: 'Arial', bold: true, color: { argb: '#000000' }, size: 10 };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center' };
        });


        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reportes_ASU_Mantenimiento.xlsx';
        link.click();
    } catch (error) {
        console.error("Error al modificar el archivo Excel:", error);
        alert("Hubo un error al modificar el archivo Excel. Por favor, intente de nuevo.");
    }
}

//REPORTE DE VALES EXCEL
async function exportarValeExcel() {
    try {
        const idVale = document.getElementById('idVale').value;
        let datosVale;
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        console.log(datosVale);
        try {
            const response = await axios.get(`https:/backend-transporteccss.onrender.com/api/vales/exportar/vale/${idVale}`, { headers });
            datosVale = response.data;
    

        } catch (apiError) {
            showToast("Error", "No se encontró el ID del vale. Por favor, verifique el número ingresado formato 2024-01.");
            return;
        }
        console.log(datosVale);

        const responseExcel = await fetch('documents/ReporteVale.xlsx');
        if (!responseExcel.ok) {
            throw new Error('No se pudo descargar el archivo Excel');
        }

        const arrayBuffer = await responseExcel.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet(1);
        const valeData = datosVale.vale;
        const fechaSolicitud = valeData.Fecha_Solicitud ? new Date(valeData.Fecha_Solicitud).toISOString().split('T')[0] : '';
        const horaSalida = valeData.Hora_Salida ? valeData.Hora_Salida.split(':').slice(0, 2).join(':') : '';
        const horaEntrada = valeData.HoraFinVale ? valeData.HoraFinVale.split(':').slice(0, 2).join(':') : '';
        

        worksheet.getCell('B8:C8').value = new Date().toISOString().split('T')[0];
        worksheet.getCell('K8').value = valeData.IdUnidadProgramatica || '';
        worksheet.getCell('F7:G7:H7:I7:J7').value = valeData.NombreUnidad || '';
        worksheet.getCell('I12:J12:K12').value = valeData.Acompanante1 || '';
        worksheet.getCell('I13:J13:K13').value = valeData.Acompanante2 || '';
        worksheet.getCell('I14:J14:K14').value = valeData.Acompanante3 || '';
        worksheet.getCell('I15:J15:K15').value = valeData.Acompanante4 || '';
        worksheet.getCell('I16:J16:K16').value = valeData.Acompanante5 || '';
        worksheet.getCell('B13:C13:D13:E13:F13:G13:H13').value = valeData.DescripcionMotivo;
        worksheet.getCell('G17:H17:I17:J17:K17').value = valeData.NombreSolicitante || '';
        worksheet.getCell('H18:I18:J18:K18').value = valeData.Detalle || '';
        worksheet.getCell('G25').value = horaSalida;
        worksheet.getCell('C25:D25:E25').value = fechaSolicitud;
        worksheet.getCell('C9').value = valeData.DescripcionDestino || '';
        worksheet.getCell('C9').value = valeData.NombreEbais || '';
        worksheet.getCell('C20').value = horaSalida;
        worksheet.getCell('C19').value = fechaSolicitud;
        worksheet.getCell('K25').value = horaEntrada || '';
        worksheet.getCell('C30').value = valeData.kilometrajeInicioVale || '';
        worksheet.getCell('G30').value = valeData.kilometrajeFinalVale || '';
        worksheet.getCell('E20').value = horaEntrada || '';
        worksheet.getCell('E19').value = fechaSolicitud;
        worksheet.getCell('I25').value = fechaSolicitud;
        worksheet.getCell('C30').value = valeData.kilometrajeInicioVale || '';
        worksheet.getCell('G26').value = valeData.EncargadoCordinador || '';
        worksheet.getCell('G28').value = 'Matias Gutierrez';
        worksheet.getCell('K5').value = 'AAWER';

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reporte_Vale.xlsx';
        link.click();
    } catch (error) {
        console.error("Error al exportar el archivo Excel:", error);
    }
}
//FIN DE REPORTE DE VALES EXCEL

//REPORTE DE VALES PDF

async function exportarValePdf() {
    try {
        const idVale = document.getElementById('idVale').value;
        let datosVale;
        try {
            const response = await axios.get(`https://backend-transporteccss.onrender.com/api/vales/${idVale}`);
            datosVale = response.data;
        } catch (apiError) {
            showToast("Error", "No se encontró el ID del vale. Por favor, verifique el número ingresado.");
            return;
        }

        const pdfUrl = './documents/ReporteValePDF.pdf';
        const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

        const worksheet = pdfDoc.getPages()[0];
        const { width, height } = worksheet.getSize();
        const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

        const valeData = datosVale.vale;
        const fechaSolicitud = new Date(valeData.Fecha_Solicitud).toISOString().split('T')[0];
        const horaSalida = valeData.Hora_Salida.split(':').slice(0, 2).join(':');

        worksheet.drawText(String(fechaSolicitud), {
            x: 75,
            y: height - 170,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.IdUnidadProgramatica || ''), {
            x: 480,
            y: height - 175,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.NombreUnidadProgramatica || ''), {
            x: 180,
            y: height - 175,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante1 || ''), {
            x: 405,
            y: height - 234,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante2 || ''), {
            x: 405,
            y: height - 248,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante3 || ''), {
            x: 405,
            y: height - 263,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante4 || ''), {
            x: 405,
            y: height - 278,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante5 || ''), {
            x: 405,
            y: height - 292,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.NombreMotivo || ''), {
            x: 260,
            y: height - 205,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.NombreSolicitante || ''), {
            x: 260,
            y: height - 307,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Detalle || ''), {
            x: 348,
            y: height - 325,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(horaSalida), {
            x: 115,
            y: height - 355,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(fechaSolicitud), {
            x: 115,
            y: height - 340,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(fechaSolicitud), {
            x: 90,
            y: height - 425,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(horaSalida), {
            x: 245,
            y: height - 425,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        const firstPageBytes = await pdfDoc.saveAsBase64({ pages: [0] });

        const blob = base64ToBlob(firstPageBytes, 'application/pdf');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reporte_Vale.pdf';

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
        console.error("Error al exportar el archivo PDF:", error);
    }
}
//FIN EXPORTAR VALE PDF

// REPORTE VEHICULAR 
        async function viajesPdf() {
            try {
                // Obtener las fechas del modal
                const fechaInicio = document.getElementById('fromViajes').value;
                const fechaFin = document.getElementById('toViajes').value;
                if (!fechaInicio || !fechaFin) {
                    showToast   ("Aviso",'Por favor, seleccione ambas fechas.');
                    return;
                }
                if (fechaInicio > fechaFin) {
                    showToast("Aviso", "La fecha de inicio no puede ser mayor a la fecha de fin.");
                    return;
                }
        
                // Obtener el token
                const token = localStorage.getItem('token');
        
                // Realizar la solicitud a la API usando Axios
                const response = await axios.post('https://backend-transporteccss.onrender.com/api/reporteViaje', {
                    fechaInicio,
                    fechaFin
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
        
                // Verificar si la respuesta contiene datos y si fue exitosa
                if (response.data && response.data.resultados && response.data.resultados.success) {
                    const citas = response.data.resultados.citas;
        
                    // Procesar los datos de las citas
                    const data = citas[0].map(item => ({
                        'Tipo de Vehiculo': item['Tipo de Vehiculo'],
                        'Cantidad de Viajes': item['Cantidad de Viajes'],
                        'Total de Kilometros': item['Total de Kilometros'],
                        'Total de Pacientes': item['Total de Pacientes']
                    }));
        
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF('landscape');
        
                    const logoUrl = './img/logo_ccss_azul.png';
                    const logoResponse = await fetch(logoUrl);
                    const logoBlob = await logoResponse.blob();
                    const reader = new FileReader();
        
                    reader.onload = function(event) {
                        const logoDataURL = event.target.result;
        
                        doc.addImage(logoDataURL, 'PNG', 10, 10, 30, 30);
                        doc.setFontSize(12);
        
                        // Obtener el ancho de la página
                        const pageWidth = doc.internal.pageSize.getWidth();
                        
                        // Textos a centrar
                        const textos = [
                            'Caja Costarricense de Seguro Social',
                            'Área de Salud Upala',
                            'Servicio de Transportes',
                            `Reporte de Viajes del ${fechaInicio} al ${fechaFin}`
                        ];
        
                        // Coordenadas Y para cada línea de texto
                        const coordenadasY = [20, 27, 34, 41];
        
                        // Iterar sobre los textos y calcular el centro
                        textos.forEach((texto, index) => {
                            const textWidth = doc.getTextWidth(texto);
                            const textX = (pageWidth - textWidth) / 2;
                            doc.text(texto, textX, coordenadasY[index]);
                        });
        
                        // Dibujar la línea separadora centrada
                        const lineWidth = 290 - 10;
                        const lineX = (pageWidth - lineWidth) / 2;
                        doc.line(lineX, 45, lineX + lineWidth, 45);
        
                        // Obtener la fecha y hora actual
                        const fechaActual = new Date();
                        const fecha = fechaActual.toLocaleDateString();
                        const hora = fechaActual.toLocaleTimeString();
        
                        // Añadir la tabla de datos
                        const encabezados = [
                            'Tipo de Vehiculo', 'Cantidad de Viajes', 'Total de Kilometros', 'Total de Pacientes'
                        ];
                        doc.autoTable({
                            startY: 50,
                            head: [encabezados],
                            body: data.map(row => encabezados.map(header => row[header] || '')),
                            headStyles: { fillColor: [9, 64, 121], textColor: [255, 255, 255] },
                            theme: 'grid',
                            didDrawPage: function (data) {
                                // Número de página en la parte inferior derecha
                                doc.setFontSize(10);
                                doc.text(`Página ${data.pageNumber}`, pageWidth - 20, doc.internal.pageSize.height - 10);
        
                                // Fecha y hora en la parte inferior izquierda
                                doc.text(`Fecha: ${fecha} Hora: ${hora}`, 10, doc.internal.pageSize.height - 10);
                            }
                        });
        
                        doc.save(`Reporte_Viajes_${fechaInicio}_${fechaFin}.pdf`);
                    };
        
                    reader.readAsDataURL(logoBlob);
                } else {
                    console.error('No se encontraron datos para el reporte o la solicitud no fue exitosa.');
                }
            } catch (error) {
                console.error('Error al exportar a PDF:', error);
            }
        }

        
        async function viajesExcel() {
            try {
                // Obtener las fechas del modal
                const fechaInicio = document.getElementById('fromViajes').value;
                const fechaFin = document.getElementById('toViajes').value;
                if (!fechaInicio || !fechaFin) {
                    showToast("Aviso",'Por favor, seleccione ambas fechas.');
                    return;
                }
                if (fechaInicio > fechaFin) {
                    showToast("Aviso", "La fecha de inicio no puede ser mayor a la fecha de fin.");
                    return;
                }
        

                // Obtener el token
                const token = localStorage.getItem('token');

                // Realizar la solicitud a la API usando Axios
                const response = await axios.post('https://backend-transporteccss.onrender.com/api/reporteViaje', {
                    fechaInicio,
                    fechaFin
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.resultados && response.data.resultados.success) {
                    const trips = response.data.resultados.citas[0];
                    
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet('Datos');

                    // Añadir una imagen (logo) a la izquierda
                    const logoUrl = './img/logo_ccss_azul.png'; // URL del logo
                    const logoResponse = await fetch(logoUrl);
                    const logoBuffer = await logoResponse.arrayBuffer();

                    const logoImage = workbook.addImage({
                        buffer: logoBuffer,
                        extension: 'png',
                    });

                    // Añadir la imagen en la primera columna
                    worksheet.addImage(logoImage, {
                        tl: { col: 0.5, row: 0.5 },
                        ext: { width: 100, height: 100 },
                    });

                    // Añadir la información de la empresa y el autor en una sola columna
                    worksheet.mergeCells('B2:E2'); // Ajusta el rango según el ancho necesario
                    worksheet.getCell('B2').value = 'Caja Costarricense de Seguro Social';
                    worksheet.mergeCells('B3:E3');
                    worksheet.getCell('B3').value = 'Área de Salud Upala';
                    worksheet.mergeCells('B4:E4');
                    worksheet.getCell('B4').value = 'Servicio de Transportes';
                    worksheet.mergeCells('B5:E5');
                    worksheet.getCell('B5').value = `Lista de Viajes del ${fechaInicio} al ${fechaFin}`;

                    // Asegúrate de centrar el texto en las celdas fusionadas
                    worksheet.getCell('B2').alignment = { horizontal: 'center', vertical: 'middle' };
                    worksheet.getCell('B3').alignment = { horizontal: 'center', vertical: 'middle' };
                    worksheet.getCell('B4').alignment = { horizontal: 'center', vertical: 'middle' };
                    worksheet.getCell('B5').alignment = { horizontal: 'center', vertical: 'middle' };

                    worksheet.addRow([]); // Añadir una fila en blanco para separar

                    // Añadir encabezados de datos con estilo
                    const headers = ['Tipo de Vehiculo', 'Cantidad de Viajes', 'Total de Kilometros', 'Total de Pacientes'];
                    const headerRow = worksheet.addRow(headers);
                    headerRow.eachCell((cell) => {
                        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                        cell.fill = { 
                            type: 'pattern', 
                            pattern: 'solid', 
                            fgColor: { argb: 'FF094079' } // Fondo azul
                        };
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    });

                    // Añadir datos de los viajes
                    trips.forEach(trip => {
                        const row = worksheet.addRow([
                            trip['Tipo de Vehiculo'],
                            trip['Cantidad de Viajes'],
                            trip['Total de Kilometros'],
                            trip['Total de Pacientes']
                        ]);

                        row.eachCell((cell) => {
                            cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        });
                    });

                    // Ajustar el ancho de las columnas y centrar
                    headers.forEach((header, index) => {
                        const col = worksheet.getColumn(index + 1);
                        col.width = 25;
                        col.alignment = { horizontal: 'center', vertical: 'middle' };
                    });

                    // Exportar el libro de trabajo como archivo Excel
                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Reporte_Asu_Viajes.xlsx`;
                    link.click();

                } else {
                    console.error('Error al obtener datos');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }


//NO BORRAR

// (() => {
//     let idActividadSeleccionada = null;
//     let idUnidadSeleccionada = null;
    
//     function cargarUnidadesActivas() {
//         const url = 'https://backend-transporteccss.onrender.com/api/unidades';
//         const token = localStorage.getItem('token');
    
//         axios.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//         .then(response => {
//             const unidades = response.data.unidades;
//             const unidadesActivas = unidades.filter(unidad => unidad.idEstado === 1);
//             const equipoSelect = document.getElementById('equipo');
    
//             equipoSelect.innerHTML = '<option value="" selected>Selecciona un equipo</option>';
    
//             unidadesActivas.forEach(unidad => {
//                 const option = document.createElement('option');
//                 option.value = unidad.id; // Aquí guardamos el id de la unidad
//                 option.textContent = `Unidad ${unidad.numeroUnidad}`;
//                 equipoSelect.appendChild(option);
//             });
    
//             // Manejar la selección del usuario
//             equipoSelect.addEventListener('change', function() {
//                 idUnidadSeleccionada = this.value; 
//             });
//         })
//         .catch(error => {
//             console.error('Error al obtener las unidades:', error);
//         });
//     }
//     function cargarActividades() {
//         const url = 'https://backend-transporteccss.onrender.com/api/actividad';
//         const token = localStorage.getItem('token');
    
//         axios.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         })
//         .then(response => {
//             const actividades = response.data.actividades;
//             const actividadSelect = document.getElementById('actividad');
    
//             actividadSelect.innerHTML = '<option value="" selected>Selecciona una actividad</option>';
    
//             actividades.forEach(actividad => {
//                 const option = document.createElement('option');
//                 option.value = actividad.IdActividad; // Aquí guardamos el IdActividad
//                 option.textContent = actividad.Descripcion;
//                 actividadSelect.appendChild(option);
//             });
    
//             // Manejar la selección del usuario
//             actividadSelect.addEventListener('change', function() {
//                 idActividadSeleccionada = this.value; 
//             });
//         })
//         .catch(error => {
//             console.error('Error al obtener las actividades:', error);
//         });
//     }
//     cargarActividades();
//     cargarUnidadesActivas();
// })();