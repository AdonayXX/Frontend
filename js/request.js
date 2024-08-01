(function () {
    var url = 'https://backend-transporteccss.onrender.com/';
    async function getVales() {
        try {
            const response = await axios.get(`${url}api/vales`);
            const data = response.data;
            const vales = data.vales;

            const tableBody = document.querySelector('#tableRequestBody');
            tableBody.innerHTML = '';

            vales.slice().reverse().forEach(vale => {
                const fechaSolicitud = new Date(vale.Fecha_Solicitud);
                const fechaFormateada = fechaSolicitud.toISOString().split('T')[0];
                const row = `
                    <tr>
                        <td>${vale.IdVale}</td>
                        <td class="text-center">${fechaFormateada}</td>
                        <td>${vale.NombreSolicitante}</td>
                        <td>${vale.NombreMotivo}</td>
                        <td><div class="mx-auto text-start" style="width: 8rem">${processStatus(vale.NombreEstado)}</div></td> 
                        <td class="text-center">
                            <button onclick="handleCoordinateButton('${vale.IdVale}')" type="button" class="btn btn-outline-primary">Coordinar</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
            createTableRequest();
            ocultarSpinner();
        } catch (error) {
            console.error('Hubo un problema con la operación de obtención:', error);
        }
    }

    function createTableRequest() {

        const table = $('#tableRequest').DataTable({
            dom: "<'row'<'col-sm-6'l>" +
                "<'row'<'col-sm-12't>>" +
                "<'row'<'col-sm-6'i><'col-sm-6'p>>",
            ordering: false,
            searching: true,
            paging: true,
            lengthMenu: [30, 60, 90, 120], //paginado
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
            },
            caseInsensitive: true,
            smart: true
        });

        $('#searchVale').on('keyup', function () {
            let inputValue = $(this).val().toLowerCase();
            $('#tableRequest').DataTable().search(inputValue).draw();
        });

        $('#fechaVale').on('change', function () {
            let fechaInput = $(this).val();
            table.column(1).search(fechaInput).draw();
        });

        $('#seleccionar-estado').on('change', function () {
            let selectedUnit = $(this).val();
            if (selectedUnit === 'VerTodo') {
                table.column(4).search('').draw();
            } else {
                table.column(4).search(selectedUnit).draw();
            }
        });
    }

    function processStatus(status) {
        switch (status) {
            case "Pendiente":
                return '<span style="color: orange;font-size: 1.5rem;">■ </span>' + status;
                break;
            case "Rechazado":
                return '<span style="color: red; font-size: 1.5rem;">■ </span>' + status;
                break
            case "Aprobado":
                return '<span style="color: blue;font-size: 1.5rem;">■ </span>' + status;
                break
            case "Completado":
                return '<span style="color: green;font-size: 1.5rem;">■ </span>' + status;
                break
            default:
                return status;
        }
    }

    function handleCoordinateButton(idVale) {
        sessionStorage.setItem('selectedIdVale', idVale);
        loadContent('formVale.html', 'mainContent');
    }


    getVales();
    window.handleCoordinateButton = handleCoordinateButton;
})();

function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
}