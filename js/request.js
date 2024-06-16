async function getVales() {
    try {
        const response = await axios.get(`${url}api/vales`);
        const vales = response.data; 
        console.log("Datos de los vales:", vales);
        
        const tableBody = document.querySelector('#tableRequest'); 
        tableBody.innerHTML = '';

        vales.forEach(vale => {
            const row = `
                <tr>
                    <td>${vale.IdVale}</td>
                    <td>${vale.Fecha_Solicitud}</td>
                    <td>${vale.NombreSolicitante}</td>
                    <td>${vale.Motivo}</td>
                    <td>${vale.EstadoVale}</td> 
                    <td class="text-center">
                        <button onclick="loadContent('formVale.html', 'mainContent')" type="button" class="btn btn-outline-secondary">Coordinar</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Hubo un problema con la operación de obtención:', error);
       
    }
    getVales();
}
