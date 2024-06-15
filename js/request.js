//Funcion para cargar API
var url = 'https://backend-transporteccss.onrender.com/';
AxiosData();
function AxiosData() {
    axios.get(`${url}api/acompanantes`)
        .then(response => {
            console.log(response.data);
            LlenarAcompanante(response.data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}