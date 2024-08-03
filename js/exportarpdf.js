
async function exportToPDF(tableId, page) {
    try {
        let table = document.getElementById(tableId);
        if (!table) {
            console.error(`No se encontró una tabla con el ID: ${tableId}`);
            return;
        }

        let data = [];
        let dRows = table.querySelectorAll('tr');
        let encabezados = [];

        for (var i = 0; i < dRows.length; i++) {
            var celdas = dRows[i].querySelectorAll('th, td');
            if (i === 0) {
                for (var j = 0; j < celdas.length; j++) {
                    encabezados.push(celdas[j].innerText);
                }
            } else {
                var fila = {};
                for (var j = 0; j < celdas.length; j++) {
                    fila[encabezados[j]] = celdas[j].innerText;
                }
                data.push(fila);
            }
        }

        let columnasAEliminar = new Set();
        switch (tableId) {
            case 'TableAppointment':
                columnasAEliminar = new Set(['Información', 'Editar']);
                break;
            case 'tablaViajes':
                columnasAEliminar = new Set(['Seleccionar', 'Información']);
                break;
            case 'unitTable':
                columnasAEliminar = new Set(['Detalle', 'Acciones']);
                break;
            case 'tableControlKm':
                columnasAEliminar = new Set(['Acciones']);
                break;
            case 'tablePatient':
                columnasAEliminar = new Set(['Dirección', 'Ubicación','Acompañante','Acciones']);
                break;
            case 'tableRequest':
                columnasAEliminar = new Set(['Coordinar']);
                break;
            case 'driverTable':
                columnasAEliminar = new Set(['Contacto Emergencia']);
                break;
            case 'fuelTable':
                columnasAEliminar = new Set([]);
                break;
            case 'tableMaintenance':
                columnasAEliminar = new Set(['Acciones', 'Observación']);
                break;
            default:
                console.log("No se requiere modificar");
                columnasAEliminar = null;
                break;
        }

        if (columnasAEliminar) {
            encabezados = encabezados.filter(encabezado => !columnasAEliminar.has(encabezado));
            data = data.map(row => {
                for (let columna of columnasAEliminar) {
                    delete row[columna];
                }
                return row;
            });
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        const logoUrl = '/img/logo_ccss_azul.png';
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
                `Lista de ${page}`
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

            doc.save(`${page}.pdf`);
        };

        reader.readAsDataURL(logoBlob);
    } catch (error) {
        console.error('Error al exportar a PDF:', error);
    }
}
