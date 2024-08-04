

async function generalesPdf() {
    try {
        const pdfUrl = '/documents/reporteGeneral.pdf';

        const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

        const fromDate = new Date(document.getElementById('from').value);
        const toDate = new Date(document.getElementById('to').value);

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

        const response = await fetch('/documents/reporteGeneral.xlsx');
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


//MANTEMIENTO DE LOS REPORTES

async function mantenimientoPdf() {
    try {
        const pdfUrl = '/documents/reporteMantenimiento.pdf';

        const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

        const fromDate = new Date(document.getElementById('fromMaintenance').value);
        const toDate = new Date(document.getElementById('toMaintenance').value);

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



        const fechaCreacion = new Date();
        const fechaCreacionString = fechaCreacion.toLocaleDateString();
        const horaCreacionString = fechaCreacion.toLocaleTimeString();



        const firstPage = pdfDoc.getPages()[0];
        const { width, height } = firstPage.getSize();

        const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        const adjustedFromDate = new Date(fromDate);
        adjustedFromDate.setDate(adjustedFromDate.getDate() + 1);

        const adjustedToDate = new Date(toDate);
        adjustedToDate.setDate(adjustedToDate.getDate() + 1);


        firstPage.drawText(` De: ${adjustedFromDate.toLocaleDateString()} Hasta: ${adjustedToDate.toLocaleDateString()}`, {
            x: 321,
            y: height - 140,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(`Creado el ${fechaCreacionString} a las ${horaCreacionString}`, {
            x: 590,
            y: height - 523,
            size: 8,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });





        const pdfBytes = await pdfDoc.save();
        const firstPageBytes = await pdfDoc.saveAsBase64({ pages: [0] });

        const blob = base64ToBlob(firstPageBytes, 'application/pdf');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Reportes_ASU_Mantenimiento.pdf';
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

//REPORTE DE VALES
async function exportarValeExcel() {
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

        console.log('Datos del vale:', datosVale);
        const responseExcel = await fetch('documents/ReporteVale.xlsx');
        if (!responseExcel.ok) {
            throw new Error('No se pudo descargar el archivo Excel');
        }

        const arrayBuffer = await responseExcel.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet(1);
        const valeData = datosVale.vale;
        const fechaSolicitud = new Date(valeData.Fecha_Solicitud).toISOString().split('T')[0];
        const horaSalida = valeData.Hora_Salida.split(':').slice(0, 2).join(':');

        worksheet.getCell('B8:C8').value = fechaSolicitud;
        worksheet.getCell('K8').value = valeData.IdUnidadProgramatica;
        worksheet.getCell('F7:G7:H7:I7:J7').value = valeData.NombreUnidadProgramatica;
        worksheet.getCell('I12:J12:K12').value = valeData.Acompanante1;
        worksheet.getCell('I13:J13:K13').value = valeData.Acompanante2;
        worksheet.getCell('I14:J14:K14').value = valeData.Acompanante3;
        worksheet.getCell('I15:J15:K15').value = valeData.Acompanante4;
        worksheet.getCell('I16:J16:K16').value = valeData.Acompanante5;
        worksheet.getCell('B13:C13:D13:E13:F13:G13:H13').value = valeData.NombreMotivo;
        worksheet.getCell('G17:H17:I17:J17:K17').value = valeData.NombreSolicitante;
        worksheet.getCell('H18:I18:J18:K18').value = valeData.Detalle;
        worksheet.getCell('G25').value = horaSalida;
        worksheet.getCell('C25:D25:E25').value = fechaSolicitud;
        worksheet.getCell('C9').value = valeData.NombreDestino;
        worksheet.getCell('C9').value = valeData.NombreDestinoEbais;
        worksheet.getCell('C20').value = horaSalida;
        worksheet.getCell('C19').value = fechaSolicitud;

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

        const pdfUrl = '/documents/ReporteValePDF.pdf';
        const existingPdfBytes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes.data);

        const worksheet = pdfDoc.getPages()[0];
        const { width, height } = worksheet.getSize();
        const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

        const valeData = datosVale.vale;
        const fechaSolicitud = new Date(valeData.Fecha_Solicitud).toISOString().split('T')[0];
        const horaSalida = valeData.Hora_Salida.split(':').slice(0, 2).join(':');

        worksheet.drawText(String(fechaSolicitud), {
            x: 120,
            y: height - 140,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.IdUnidadProgramatica || ''), {
            x: 120,
            y: height - 152,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.NombreUnidadProgramatica || ''), {
            x: 120,
            y: height - 164,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante1 || ''), {
            x: 120,
            y: height - 176,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante2 || ''), {
            x: 120,
            y: height - 188,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante3 || ''), {
            x: 120,
            y: height - 200,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante4 || ''), {
            x: 120,
            y: height - 212,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Acompanante5 || ''), {
            x: 120,
            y: height - 224,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.NombreMotivo || ''), {
            x: 120,
            y: height - 236,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.NombreSolicitante || ''), {
            x: 120,
            y: height - 248,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(valeData.Detalle || ''), {
            x: 120,
            y: height - 260,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(horaSalida), {
            x: 120,
            y: height - 272,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(fechaSolicitud), {
            x: 120,
            y: height - 284,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(fechaSolicitud), {
            x: 120,
            y: height - 284,
            size: 10,
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        worksheet.drawText(String(horaSalida), {
            x: 120,
            y: height - 272,
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
