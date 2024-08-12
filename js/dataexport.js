async function exportToExcel(tableId, page) {
    // Obtener el id de la tabla
    let table = document.getElementById(tableId);

    // Convertir la tabla de HTML en un array de objetos
    let data = [];
    let dRows = table.querySelectorAll('tr');
    let encabezados = [];

    // Recorrer las filas de la tabla
    for (var i = 0; i < dRows.length; i++) {
        var celdas = dRows[i].querySelectorAll('th, td');
        if (i === 0) {
            // Procesa el encabezado
            for (var j = 0; j < celdas.length; j++) {
                encabezados.push(celdas[j].innerText);
            }
        } else {
            // Procesa las filas de datos
            var fila = {};
            for (var j = 0; j < celdas.length; j++) {
                fila[encabezados[j]] = celdas[j].innerText;
            }
            data.push(fila);
        }
    }

    // Definir las columnas a eliminar según el ID de la tabla
    let columnasAEliminar = new Set();
    switch (tableId) {
         // Definir la tabla y las columnas que no se van a mostrar
        case 'TableAppointment':
            columnasAEliminar = new Set(['Información', 'Editar']);
            break;
        case 'tableTrips':
            columnasAEliminar = new Set(['Seleccionar', 'Acciones']);
            break;
        case 'tableMaintenance':
            columnasAEliminar = new Set(['Detalle', 'Acciones']);
            break;
        case 'tablaViajes':
            columnasAEliminar = new Set(['Información']);
            break;
        case 'driverTable':
            columnasAEliminar = new Set(['Contacto Emergencia']);
            break;
        case 'tablePatient':
            columnasAEliminar = new Set(['Dirección','Ubicación','Acompañante','Acciones']);
            break;
        case 'tableControlKm':
            columnasAEliminar = new Set(['Acciones']);
            break;
           
        
            
        default:
            columnasAEliminar = null; // Marcar que no se requieren cambios
            break;
    }

    //Validar que columnasAEliminar no sea Null, si no se debe de aplicar cambios
    if (columnasAEliminar) {
        // Se filtran los encabezados que se encuentran y se eliminan los que pasaron por columnasAEliminar
        encabezados = encabezados.filter(encabezado => !columnasAEliminar.has(encabezado));

        // Eliminar las columnas de los datos
        data = data.map(row => {
            for (let columna of columnasAEliminar) {
                delete row[columna];
            }
            return row;
        });
    }

    // Crea un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    // Define el estilo para los encabezados de datos
    const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFFFF' } }, // Letra blanca
        fill: { 
            type: 'pattern', 
            pattern: 'solid', 
            fgColor: { argb: 'FF094079' } // Fondo azul
        },
        alignment: { horizontal: 'center', vertical: 'middle' }
    };

     // Define el estilo para la imagen
     const imageStyle = {
        alignment: { horizontal: 'left', vertical: 'middle' }
    };

    // Añadir una imagen (logo) a la izquierda
    const logoUrl = '/img/logo_ccss_azul.png'; // URL del logo
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
     worksheet.getCell('B5').value = `Lista de ${page}`;

     // Asegúrate de centrar el texto en las celdas fusionadas
     worksheet.getCell('B1').alignment = { horizontal: 'center', vertical: 'middle' };
     worksheet.getCell('B2').alignment = { horizontal: 'center', vertical: 'middle' };
     worksheet.getCell('B3').alignment = { horizontal: 'center', vertical: 'middle' };
     worksheet.getCell('B4').alignment = { horizontal: 'center', vertical: 'middle' };

     worksheet.addRow([]); // Añadir una fila en blanco para separar

     // Añadir encabezados de datos con estilo
     let headerRow = worksheet.addRow(encabezados);
     headerRow.eachCell({ includeEmpty: true }, (cell) => {
         cell.style = headerStyle;
     });

     // Añadir datos de la tabla
     data.forEach(row => {
         worksheet.addRow(encabezados.map(header => row[header] || ''));
     });

     // Ajustar el ancho de las columnas y centrar
     encabezados.forEach((header, index) => {
         const col = worksheet.getColumn(index + 1);
         col.width = 25;
         col.alignment = { horizontal: 'center', vertical: 'middle' };
     });

    // Exportar el libro de trabajo como archivo Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${page}.xlsx`;
        link.click();
    });
}
