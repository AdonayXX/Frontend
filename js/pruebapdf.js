//EXPORTAR A LA TABLA DE VALES
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
//EXPORTAR A LA TABLA DE CITAS
function exportToPDF() {
    const token = localStorage.getItem('token');

    fetch("https://backend-transporteccss.onrender.com/api/cita", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data || !Array.isArray(data)) {
            throw new Error("Datos inválidos");
        }

        const generateTableHTML = (data) => {
            let tableHTML = `
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        word-wrap: break-word;
                        max-width: 200px;
                    }
                    th {
                        background-color: #004d84;
                        color: #fff;
                    }
                    h4 {
                        text-align: center;
                    }
                </style>
                <h4>Caja Costarricense Seguro Social</h4>
                <h4>Área de Salud Upala</h4>
                <h4>Servicio Validación de Derechos - Transportes</h4>
                <h4>Lista de Citas</h4>
                <table>
                    <thead>
                        <tr>
                            <th>ID Cita</th>
                            <th>Paciente</th>
                            <th>Acompañantes</th>
                            <th>Ubicación Origen</th>
                            <th>Destino</th>
                            <th>Especialidad</th>
                            <th>Condición</th>
                            <th>Tipo Seguro</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            data.forEach(cita => {
                var acompanantes = (cita.nombreCompletoAcompanante1 || 'N/A') + ' / ' + (cita.nombreCompletoAcompanante2 || 'N/A');
                tableHTML += `
                    <tr>
                        <td>${cita.idCita}</td>
                        <td>${cita.nombreCompletoPaciente}</td>
                        <td>${acompanantes}</td>
                        <td>${cita.ubicacionOrigen}</td>
                        <td>${cita.ubicacionDestino}</td>
                        <td>${cita.especialidad}</td>
                        <td>${cita.condicionCita}</td>
                        <td>${cita.tipoSeguro}</td>
                        <td>${new Date(cita.fechaCita).toLocaleDateString()}</td>
                        <td>${cita.horaCita}</td>
                    </tr>
                `;
            });
            tableHTML += `</tbody></table>`;
            return tableHTML;
        };

        let tableHTML = generateTableHTML(data);

        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHTML;

        var opt = {
            margin: [35, 10, 30, 10],
            filename: "citas.pdf",
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "landscape" }
        };

        html2pdf().set(opt).from(tempDiv).outputPdf().then(pdf => {
            // Agregar logo a cada página
            var totalPages = pdf.internal.getNumberOfPages();
            var logoWidth = 25;
            var logoMarginX = 10;
            var logoMarginY = 10;
            for (var i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.addImage('img/logo_ccss_azul.png', 'PNG', logoMarginX, logoMarginY, logoWidth, logoWidth);
            }
            pdf.save('citas.pdf');
        });
    })
    .catch(error => {
        console.error("Error:", error);
    });
}
//EXPORTAR A PDF UNIDADES
function exportToPDF(tableId, fileName) {
    const token = localStorage.getItem('token');
    const API_UNIDADES_URL = "https://backend-transporteccss.onrender.com/api/unidades";
    const API_TIPO_RECURSO_URL = "https://backend-transporteccss.onrender.com/api/tipoRecurso";
    const API_CHOFER_URL = "https://backend-transporteccss.onrender.com/api/chofer";
    const API_ESTADO_UNIDAD_URL = "https://backend-transporteccss.onrender.com/api/estadoUnidad";

    async function fetchData(url) {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`La solicitud a ${url} no fue exitosa`);
        }
        return response.json();
    }

    Promise.all([
        fetchData(API_UNIDADES_URL),
        fetchData(API_TIPO_RECURSO_URL),
        fetchData(API_CHOFER_URL),
        fetchData(API_ESTADO_UNIDAD_URL)
    ])
    .then(([unidadesData, tiposRecursoData, choferesData, estadosUnidadData]) => {
        const unidades = unidadesData.unidades;
        const tiposRecurso = tiposRecursoData.tiporecurso;
        const choferes = choferesData.choferes;
        const estadosUnidad = estadosUnidadData.estadosUnidad;

        const recursoMap = {};
        tiposRecurso.forEach(recurso => {
            recursoMap[recurso.idTipoRecurso] = recurso.recurso;
        });

        const choferMap = {};
        choferes.forEach(chofer => {
            choferMap[chofer.idChofer] = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
        });

        const estadoMap = {};
        estadosUnidad.forEach(estado => {
            estadoMap[estado.idEstado] = estado.estado;
        });

        // Generar dinámicamente el contenido de la tabla
        const generateTableHTML = (data) => {
            let tableHTML = `
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        word-wrap: break-word;
                        max-width: 200px;
                    }
                    th {
                        background-color: #094079;
                        color: white;
                    }
                    h4 {
                        text-align: center;
                    }
                </style>
                <h4>Caja Costarricense Seguro Social</h4>
                <h4>Área de Salud Upala</h4>
                <h4>Servicio Validación de Derechos - Transportes</h4>
                <h4>Lista de Unidades</h4>
                <table>
                    <thead>
                        <tr>
                            <th class="text-center">Número de Unidad</th>
                            <th class="text-center">Tipo de Recurso</th>
                            <th class="text-center">Chofer</th>
                            <th class="text-center">Kilometraje Inicial</th>
                            <th class="text-center">Kilometraje Actual</th>
                            <th class="text-center">Capacidad Total</th>
                            <th class="text-center">Fecha de DEKRA</th>
                            <th class="text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            data.forEach(unidad => {
                tableHTML += `
                    <tr>
                        <td class="text-center">${unidad.numeroUnidad || 'N/A'}</td>
                        <td class="text-center">${(recursoMap[unidad.idTipoRecurso] || 'N/A').toUpperCase()}</td>
                        <td class="text-center">${choferMap[unidad.choferDesignado] || 'N/A'}</td>
                        <td class="text-center">${unidad.kilometrajeInicial || 'N/A'}</td>
                        <td class="text-center">${unidad.kilometrajeActual || 'N/A'}</td>
                        <td class="text-center">${unidad.capacidadTotal || 'N/A'}</td>
                        <td class="text-center">${new Date(unidad.fechaDekra).toISOString().split('T')[0] || 'N/A'}</td>
                        <td class="text-center">${(estadoMap[unidad.idEstado] || 'N/A').toUpperCase()}</td>
                    </tr>
                `;
            });
            tableHTML += `</tbody></table>`;
            return tableHTML;
        };

        let tableHTML = generateTableHTML(unidades);

        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHTML;

        let opt = {
            margin: [35, 10, 30, 10],
            filename: `${fileName}.pdf`,
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: "mm", format: "a3", orientation: "portrait" }
        };

        function addLogoToPDF(pdf) {
            let totalPages = pdf.internal.getNumberOfPages();
            let logoWidth = 35;
            let logoMargin = 10;
            let currentDate = new Date();
            let formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
                pdf.text(formattedDate, 10, pdf.internal.pageSize.getHeight() - 10);
                pdf.addImage('img/logo_ccss_azul.png', 'PNG', logoMargin, logoMargin, logoWidth, logoWidth);
            }
        }

        html2pdf()
            .from(tempDiv)
            .set(opt)
            .toPdf()
            .get("pdf")
            .then(pdf => {
                addLogoToPDF(pdf);
                pdf.save(`${fileName}.pdf`);
            });
    })
    .catch(error => {
        console.error("Error al obtener datos desde la API o al generar el PDF:", error);
    });
}
"use strict";
//EXPORTAR PDF DE CHOFERES
"use strict";

async function exportToPDF(tableId, fileName) {
    const token = localStorage.getItem('token');
    const API_CHOFERES_URL = "https://backend-transporteccss.onrender.com/api/chofer";
    
    async function fetchData(url) {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`La solicitud a ${url} no fue exitosa`);
        }
        return response.json();
    }

    try {
        const choferesData = await fetchData(API_CHOFERES_URL);
        const choferes = choferesData.choferes;

        // Generar dinámicamente el contenido de la tabla
        const generateTableHTML = (data) => {
            let tableHTML = `
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        word-wrap: break-word;
                        max-width: 200px;
                    }
                    th {
                        background-color: #094079;
                        color: white;
                    }
                    h4 {
                        text-align: center;
                    }
                </style>
                <h4>Caja Costarricense Seguro Social</h4>
                <h4>Área de Salud Upala</h4>
                <h4>Servicio Validación de Derechos - Transportes</h4>
                <h4>Lista de Choferes</h4>
                <table>
                    <thead>
                        <tr>
                            <th class="text-center">Nombre Completo</th>
                            <th class="text-center">Cédula</th>
                            <th class="text-center">Teléfono</th>
                            <th class="text-center">Tipo Sangre</th>
                            <th class="text-center">Tipo Licencia</th>
                            <th class="text-center">Vencimiento Licencia</th>
                            <th class="text-center">Estado</th>
                            <th class="text-center">Contacto Emergencia</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            data.forEach(chofer => {
                let contactoEmergencia = `
                    ${chofer.nombreCE1 ? `${chofer.nombreCE1} ${chofer.apellido1CE1} ${chofer.apellido2CE1} (${chofer.contactoEmergencia1})` : ''}
                    ${chofer.nombreCE2 ? `${chofer.nombreCE2} ${chofer.apellido1CE2} ${chofer.apellido2CE2} (${chofer.contactoEmergencia2})` : ''}
                `;

                tableHTML += `
                    <tr>
                        <td class="text-center">${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}</td>
                        <td class="text-center">${chofer.cedula}</td>
                        <td class="text-center">${chofer.contacto}</td>
                        <td class="text-center">${chofer.tipoSangre}</td>
                        <td class="text-center">${chofer.tipoLicencia}</td>
                        <td class="text-center">${new Date(chofer.vencimientoLicencia).toISOString().split('T')[0]}</td>
                        <td class="text-center">${chofer.estadoChofer}</td>
                        <td class="text-center">${contactoEmergencia}</td>
                    </tr>
                `;
            });
            tableHTML += `</tbody></table>`;
            return tableHTML;
        };

        let tableHTML = generateTableHTML(choferes);

        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHTML;

        let opt = {
            margin: [35, 10, 30, 10],
            filename: `${fileName}.pdf`,
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };

        function addLogoToPDF(pdf) {
            let totalPages = pdf.internal.getNumberOfPages();
            let logoWidth = 35;
            let logoMargin = 10;
            let currentDate = new Date();
            let formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
                pdf.text(formattedDate, 10, pdf.internal.pageSize.getHeight() - 10);
                pdf.addImage('img/logo_ccss_azul.png', 'PNG', logoMargin, logoMargin, logoWidth, logoWidth);
            }
        }

        html2pdf()
            .from(tempDiv)
            .set(opt)
            .toPdf()
            .get("pdf")
            .then(pdf => {
                addLogoToPDF(pdf);
                pdf.save(`${fileName}.pdf`);
            })
            .catch(error => {
                console.error("Error al generar el PDF:", error);
            });

    } catch (error) {
        console.error("Error al obtener datos desde la API o al generar el PDF:", error);
    }
}

// Añadir evento al botón después de que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const btnExportarPDF = document.getElementById('btnChofer');
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', function() {
            exportToPDF('driverTable', 'Choferes');
        });
    }
});
//EXPORTAR PDF DE VIAJES
async function exportToPDF(tableId, fileName) {
    const token = localStorage.getItem('token');
    const API_VIAJES_URL = "https://backend-transporteccss.onrender.com/api/viaje/registro";
    
    // Obtener los valores de los filtros
    const unidad = document.getElementById('seleccionar-unidad').value;
    const chofer = document.getElementById('seleccionar-chofer').value;
    const fecha = document.getElementById('fechaViaje').value;

    // Construir la URL con los filtros
    const url = new URL(API_VIAJES_URL);
    if (unidad !== 'verTodoUnidad') url.searchParams.append('unidad', unidad);
    if (chofer !== 'verTodoChofer') url.searchParams.append('chofer', chofer);
    if (fecha) url.searchParams.append('fecha', fecha);

    async function fetchData(url) {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`La solicitud a ${url} no fue exitosa`);
        }
        return response.json();
    }

    try {
        const viajesData = await fetchData(url);
        const viajes = viajesData.registro;

        // Generar dinámicamente el contenido de la tabla
        const generateTableHTML = (data) => {
            let tableHTML = `
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        word-wrap: break-word;
                        max-width: 200px;
                    }
                    th {
                        background-color: #094079;
                        color: white;
                    }
                    h4 {
                        text-align: center;
                    }
                </style>
                <h4>Caja Costarricense Seguro Social</h4>
                <h4>Área de Salud Upala</h4>
                <h4>Servicio Validación de Derechos - Transportes</h4>
                <h4>Lista de Viajes</h4>
                <table>
                    <thead>
                        <tr>
                            <th class="text-center">IdViaje</th>
                            <th class="text-center">Unidad</th>
                            <th class="text-center">Chofer</th>
                            <th class="text-center">Ocupación</th>
                            <th class="text-center">Estado</th>
                            <th class="text-center">Fecha</th>
                            <th class="text-center">Destino</th>
                            <th class="text-center">Información</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            data.forEach(viaje => {
                const ocupacion = viaje.Ocupación; // Nombre
                const infoAdicional = `${viaje.idCita} | ${viaje.NombrePaciente}`;

                tableHTML += `
                    <tr>
                        <td class="text-center">${viaje.idViaje}</td>
                        <td class="text-center">${viaje.numeroUnidad}</td>
                        <td class="text-center">${viaje.NombreChofer}</td>
                        <td class="text-center">${ocupacion}</td>
                        <td class="text-center">${viaje.EstadoViaje}</td>
                        <td class="text-center">${viaje.fechaInicioViaje.split('T')[0]}</td>
                        <td class="text-center">${viaje.ubicacionDestino}</td>
                        <td class="text-center">${infoAdicional}</td>
                    </tr>
                `;
            });
            tableHTML += `</tbody></table>`;
            return tableHTML;
        };

        let tableHTML = generateTableHTML(viajes);

        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHTML;

        let opt = {
            margin: [35, 10, 30, 10],
            filename: `${fileName}.pdf`,
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };

        function addLogoToPDF(pdf) {
            let totalPages = pdf.internal.getNumberOfPages();
            let logoWidth = 35;
            let logoMargin = 10;
            let currentDate = new Date();
            let formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
                pdf.text(formattedDate, 10, pdf.internal.pageSize.getHeight() - 10);
                pdf.addImage('img/logo_ccss_azul.png', 'PNG', logoMargin, logoMargin, logoWidth, logoWidth);
            }
        }

        html2pdf()
            .from(tempDiv)
            .set(opt)
            .toPdf()
            .get("pdf")
            .then(pdf => {
                addLogoToPDF(pdf);
                pdf.save(`${fileName}.pdf`);
            })
            .catch(error => {
                console.error("Error al generar el PDF:", error);
            });

    } catch (error) {
        console.error("Error al obtener datos desde la API o al generar el PDF:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const btnExportarPDF = document.getElementById('btnViajes');
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', function() {
            exportToPDF('tablaViajes', 'Viajes');
        });
    }
});
//EXPORTAR MANTENIMIENTO
"use strict";

async function exportMaintenanceToPDF(tableId, fileName) {
    const token = localStorage.getItem('token');
    const API_MANTENIMIENTO_URL = "https://backend-transporteccss.onrender.com/api/mantenimiento";

    async function fetchData(url) {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`La solicitud a ${url} no fue exitosa`);
        }
        return response.json();
    }

    try {
        const mantenimientosData = await fetchData(API_MANTENIMIENTO_URL);
        const mantenimientos = mantenimientosData.mantenimientos;

        // Generar dinámicamente el contenido de la tabla
        const generateTableHTML = (data) => {
            let tableHTML = `
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        word-wrap: break-word;
                        max-width: 200px;
                    }
                    th {
                        background-color: #094079;
                        color: white;
                    }
                    h4 {
                        text-align: center;
                    }
                </style>
                <h4>Caja Costarricense Seguro Social</h4>
                <h4>Área de Salud Upala</h4>
                <h4>Servicio Validación de Derechos - Transportes</h4>
                <h4>Lista de Mantenimientos</h4>
                <table>
                    <thead>
                        <tr>
                            <th class="text-center">Unidad</th>
                            <th class="text-center">Chofer</th>
                            <th class="text-center">Fecha de Mantenimiento</th>
                            <th class="text-center">Kilometraje</th>
                            <th class="text-center">Tipo de Mantenimiento</th>
                            <th class="text-center">Observación</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            data.forEach(mantenimiento => {
                let fechaMantenimiento;
                try {
                    fechaMantenimiento = new Date(mantenimiento.fechaMantenimiento);
                    if (isNaN(fechaMantenimiento.getTime())) {
                        throw new Error("Fecha no válida");
                    }
                } catch (error) {
                    console.error(`Error con la fecha: ${mantenimiento.fechaMantenimiento}`, error);
                    fechaMantenimiento = new Date(); // Valor predeterminado
                }
                
                tableHTML += `
                    <tr>
                        <td class="text-center">${mantenimiento.unidad}</td>
                        <td class="text-center">${mantenimiento.chofer}</td>
                        <td class="text-center">${fechaMantenimiento.toISOString().split('T')[0]}</td>
                        <td class="text-center">${mantenimiento.kilometraje}</td>
                        <td class="text-center">${mantenimiento.tipoMantenimiento}</td>
                        <td class="text-center">${mantenimiento.observacion}</td>
                    </tr>
                `;
            });
            tableHTML += `</tbody></table>`;
            return tableHTML;
        };

        let tableHTML = generateTableHTML(mantenimientos);

        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHTML;

        let opt = {
            margin: [35, 10, 30, 10],
            filename: `${fileName}.pdf`,
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };

        function addLogoToPDF(pdf) {
            let totalPages = pdf.internal.getNumberOfPages();
            let logoWidth = 35;
            let logoMargin = 10;
            let currentDate = new Date();
            let formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
                pdf.text(formattedDate, 10, pdf.internal.pageSize.getHeight() - 10);
                pdf.addImage('img/logo_ccss_azul.png', 'PNG', logoMargin, logoMargin, logoWidth, logoWidth);
            }
        }

        html2pdf()
            .from(tempDiv)
            .set(opt)
            .toPdf()
            .get("pdf")
            .then(pdf => {
                addLogoToPDF(pdf);
                pdf.save(`${fileName}.pdf`);
            })
            .catch(error => {
                console.error("Error al generar el PDF:", error);
            });

    } catch (error) {
        console.error("Error al obtener datos desde la API o al generar el PDF:", error);
    }
}

// Añadir evento al botón después de que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const btnExportarPDF = document.getElementById('btnMan');
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', function() {
            exportMaintenanceToPDF('tableMaintenance', 'Mantenimientos');
        });
    }
});
