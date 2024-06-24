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
                        <td>${fechaFormateada}</td>
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
        } catch (error) {
            console.error('Hubo un problema con la operación de obtención:', error);
        }
    }

    function createTableRequest() {
        $('#tableRequest').DataTable({
            dom: "<'row'<'col-md-6'l>" +
                "<'row'<'col-md-12't>>" +
                "<'row justify-content-between'<'col-md-6'i><'col-md-6'p>>",
            ordering: false,
            searching: true,
            paging: true,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json'
            },
            caseInsensitive: true,
            smart: true,
            columnDefs: [
                { className: 'text-center', targets: '_all' }
            ]
        });
    }

    //Funcion para agregar el simbolo segun el estado en la tabla
    function processStatus(status){
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
            default:
                return status;
        }
    }

    function handleCoordinateButton(idVale) {
        sessionStorage.setItem('selectedIdVale', idVale);
        loadContent('formVale.html', 'mainContent');
    }

    document.getElementById('searchVale').addEventListener('keyup', function () {
        let input = document.getElementById('searchVale').value.trim().toLowerCase();
        let table = document.getElementById('tableRequest');
        let rows = table.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            let dateCell = rows[i].getElementsByTagName('td')[1];
            if (dateCell) {
                let dateText = dateCell.textContent || dateCell.innerText;
                if (dateText.toLowerCase().includes(input)) {
                    rows[i].style.display = '';
                } else {
                    rows[i].style.display = 'none';
                }
            }
        }
    });

    getVales();
    window.handleCoordinateButton = handleCoordinateButton;
})();
