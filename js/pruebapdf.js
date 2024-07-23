document.getElementById('saveBtn').addEventListener('click', function() {
    const token = localStorage.getItem('token');

    fetch("https://backend-transporteccss.onrender.com/api/cita", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("La solicitud a la API no fue exitosa");
        }
        return response.json();
    })
    .then((data) => {
        if (!data || !Array.isArray(data)) {
            throw new Error("Los datos recibidos de la API no son válidos");
        }

        // Dividir los datos en partes
        const firstPageData = data.slice(0, 3);
        const subsequentPagesData = data.slice(3);

        // Crear contenido HTML para cada parte
        const generateTableHTML = (data) => {
            let tableHTML = "<table style='width: 100%; border-collapse: collapse;'>";
            tableHTML += "<thead>";
            tableHTML += "<tr>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>ID Cita</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Paciente</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Acompañantes</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Ubicación Origen</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Destino</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Especialidad</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Condición</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Tipo Seguro</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Fecha</th>";
            tableHTML += "<th style='border: 1px solid #000; padding: 8px;'>Hora</th>";
            tableHTML += "</tr>";
            tableHTML += "</thead>";
            tableHTML += "<tbody>";

            data.forEach(function(cita) {
                var acompanantes = (cita.nombreCompletoAcompanante1 || 'N/A') + " / " + (cita.nombreCompletoAcompanante2 || 'N/A');
                tableHTML += "<tr>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + cita.idCita + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + cita.nombreCompletoPaciente + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + acompanantes + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + cita.ubicacionOrigen + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + cita.ubicacionDestino + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + cita.especialidad + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + cita.condicionCita + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + cita.tipoSeguro + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + new Date(cita.fechaCita).toLocaleDateString() + "</td>";
                tableHTML += "<td style='border: 1px solid #000; padding: 8px;'>" + cita.horaCita + "</td>";
                tableHTML += "</tr>";
            });

            tableHTML += "</tbody></table>";
            return tableHTML;
        };

        // Crear contenido HTML completo
        var tableHTML = "<h3>Caja Costarricense Seguro Social</h3>";
        tableHTML += "<h3>Área de Salud Upala</h3>";
        tableHTML += "<h3>Servicio Validación de Derechos - Transportes</h3>";
        tableHTML += "<h3>Lista de Citas</h3>";

        // Agregar datos de la primera página
        tableHTML += generateTableHTML(firstPageData);

        // Agregar datos de las siguientes páginas
        for (let i = 0; i < subsequentPagesData.length; i += 5) {
            tableHTML += '<div style="page-break-before: always;"></div>';
            tableHTML += generateTableHTML(subsequentPagesData.slice(i, i + 5));
        }

        // Crear un elemento temporal para convertirlo en PDF
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHTML;

        // Configuración de html2pdf
        var opt = {
            margin: [35, 10, 30, 10],
            filename: "citas.pdf",
            image: {
                type: "jpeg",
                quality: 1.0
            },
            html2canvas: {
                scale: 3,
                useCORS: true
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "landscape"
            }
        };

        // Función para agregar imagen como logo en el PDF
        function addLogoToPDF(pdf) {
            var totalPages = pdf.internal.getNumberOfPages();
            var logoWidth = 25;
            var logoMarginX = 10;
            var logoMarginY = 10;

            for (var i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 50, pdf.internal.pageSize.getHeight() - 10);
                var x = logoMarginX;
                var y = logoMarginY;
                pdf.addImage('img/logo_ccss_azul.png', 'PNG', x, y, logoWidth, 0);

                if (i > 1) {
                    opt.margin = [35, 10, 30, 10];
                    pdf.setPage(i);
                }
            }
        }

        // Generar PDF
        html2pdf()
            .set(opt)
            .from(tempDiv)
            .toPdf()
            .get('pdf')
            .then(function(pdf) {
                addLogoToPDF(pdf);
            })
            .save();
    })
    .catch((error) => {
        console.error("Error al obtener datos de la API:", error);
    });
});