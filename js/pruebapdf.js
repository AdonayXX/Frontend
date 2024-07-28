document.getElementById("saveBtn").addEventListener("click", function () {
    var selectedState = document.getElementById("seleccionar-estado").value;
    var selectedDate = document.getElementById("fechaVale").value;

    fetch("https://backend-transporteccss.onrender.com/api/vales")
        .then((response) => {
            if (!response.ok) {
                throw new Error("La solicitud a la API no fue exitosa");
            }
            return response.json();
        })
        .then((data) => {
            // Filtrar los datos según el estado y la fecha seleccionados
            var filteredData = data.vales.filter(function (vale) {
                var matchState = selectedState === "VerTodo" || vale.NombreEstado === selectedState;
                var matchDate = !selectedDate || new Date(vale.Fecha_Solicitud).toISOString().split('T')[0] === selectedDate;
                return matchState && matchDate;
            });

            // Generar dinámicamente el contenido de la tabla
            var tableHTML = `
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    th,
                    td {
                        border: 1px solid #ddd;
                        color: #000;
                        padding: 8px;
                        text-align: left;
                        word-wrap: break-word;
                        max-width: 200px;
                    }

                    th {
                        background-color: #004d84;
                        color: #fff;
                    }
                        h4{
                        align-items: center;
                        text-align: center;
                        }
                </style>
                <h4>Caja Costarricense Seguro Social</h4>
                <h4>Área de Salud Upala</h4>
                <h4>Servicio Validación de Derechos - Transportes</h4>
                <h4>Lista de Solicitudes de Vales</h4>
                <table>
                    <thead>
                        <tr>
                            <th>ID Vale</th>
                            <th>Fecha Solicitud</th>
                            <th>Nombre Solicitante</th>
                            <th>Motivo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // Construir filas de la tabla con los datos filtrados
            filteredData.forEach(function (vale) {
                tableHTML += `
                    <tr>
                        <td>${vale.IdVale}</td>
                        <td>${new Date(vale.Fecha_Solicitud).toLocaleDateString()}</td>
                        <td>${vale.NombreSolicitante}</td>
                        <td>${vale.NombreMotivo}</td>
                        <td>${vale.NombreEstado}</td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table>`;

            // Crear un elemento temporal para convertirlo en PDF
            var tempDiv = document.createElement("div");
            tempDiv.innerHTML = tableHTML;

            // Configuración de html2pdf
            var opt = {
                margin: 10, // Márgenes en mm
                filename: "vales.pdf",
                image: { type: "jpeg", quality: 1.0 },
                html2canvas: { scale: 3 },
                jsPDF: { unit: "mm", format: "a3", orientation: "portrait" },
            };

            // Función para agregar imagen como logo en el PDF
            function addLogoToPDF(pdf) {
                var totalPages = pdf.internal.getNumberOfPages();
                var logoWidth = 35; // Ancho de la imagen del logo en milímetros
                var logoMargin = 2; // Margen desde el borde en milímetros

                // Obtener la fecha y hora actual
                var currentDate = new Date();
                var day = String(currentDate.getDate()).padStart(2, '0');
                var month = String(currentDate.getMonth() + 1).padStart(2, '0');
                var year = currentDate.getFullYear();
                var hours = String(currentDate.getHours()).padStart(2, '0');
                var minutes = String(currentDate.getMinutes()).padStart(2, '0');
                var seconds = String(currentDate.getSeconds()).padStart(2, '0');
                var formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

                for (var i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(10);
                    pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
                    pdf.text(formattedDate, 10, pdf.internal.pageSize.getHeight() - 10); // Agregar fecha y hora en la esquina inferior izquierda

                    // Posicionar el logo en la esquina superior izquierda
                    var x = logoMargin; // Posición X desde el borde izquierdo
                    var y = logoMargin; // Posición Y desde el borde superior

                    // Ajustar tamaño de la imagen como logo en la esquina superior izquierda
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
            console.error("Error al obtener datos desde la API o al generar el PDF:", error)
        );
});

