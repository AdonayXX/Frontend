(function () {
    var url = 'https://backend-transporteccss.onrender.com/';

    async function getVales() {
        try {
            const response = await axios.get(`${url}api/vales`);
            const data = response.data;
            const vales = data.vales;

            console.log("Datos de los vales:", vales);

            const tableBody = document.querySelector('#tableRequest');
            tableBody.innerHTML = '';

            vales.forEach(vale => {
                const fechaSolicitud = new Date(vale.Fecha_Solicitud);
                const fechaFormateada = fechaSolicitud.toISOString().split('T')[0];
                const row = `
                    <tr>
                        <td>${vale.IdVale}</td>
                        <td>${fechaFormateada}</td>
                        <td>${vale.NombreSolicitante}</td>
                        <td>${vale.Motivo}</td>
                        <td>${processStatus(vale.EstadoVale)}</td> 
                        <td class="text-center">
                            <button onclick="handleCoordinateButton('${vale.IdVale}')" type="button" class="btn btn-outline-secondary">Coordinar</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } catch (error) {
            console.error('Hubo un problema con la operación de obtención:', error);
        }
    }

    //Funcion para agregar el simbolo segun el estado en la tabla
    function processStatus(status){
        switch (status) {
            case "Pendiente":
                return '<span style="color: orange; ">! </span>'  + status;
            break;
            case "Cancelado":
                return '<span style="color: red; ">x </span>' + status;
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
