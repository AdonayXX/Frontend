(function () {
    var url = 'https://backend-transporteccss.onrender.com/';

    async function getVales() {
        try {
            const response = await axios.get(`${url}api/vales`);
            const data = response.data;
            const vales = data.vales;

            console.log("Datos de los vales:", vales);

            const tableBody = document.querySelector('#tableVales');
            tableBody.innerHTML = '';

            vales.forEach(vale => {
                const fechaSolicitud = new Date(vale.Fecha_Solicitud);
                const fechaFormateada = fechaSolicitud.toISOString().split('T')[0];
                const row = `
                    <tr>
                        <td>${vale.NombreSolicitante}</td>
                        <td>${vale.NombreSalida}</td>
                        <td>${vale.NombreDestino}</td>
                        <td>${vale.Hora_Salida}</td>
                        <td class="text-center">
                            <button class="btn btn-outline-primary btn-sm full-width" data-bs-toggle="modal"
                                data-bs-target="#acompModal" onclick="loadAcompanantes('${vale.Acompanante1}', '${vale.Acompanante2}', '${vale.Acompanante3}', '${vale.Acompanante4}')">
                                <i class="bi bi-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } catch (error) {
            console.error('Hubo un problema con la operación de obtención:', error);
        }
    }

    window.loadAcompanantes = function (acomp1, acomp2, acomp3, acomp4) {
        const acompanantes = [acomp1, acomp2, acomp3, acomp4].filter(acomp => acomp);
        const acompTableBody = document.querySelector('#acompTableBody');
        acompTableBody.innerHTML = '';

        acompanantes.forEach(acomp => {
            const row = `<tr><td>${acomp}</td></tr>`;
            acompTableBody.innerHTML += row;
        });
    }

    getVales();
})();