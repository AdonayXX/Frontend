(function () {
    const token = localStorage.getItem('token');
    var url = 'https://backend-transporteccss.onrender.com/';
    const btnAdd = document.getElementById('btnGuardar');

    async function addManager() {
        try {
            const manager = {
                Nombre: document.getElementById('nombre').value,
                Cargo: document.getElementById('cargo').value,
                Contacto: document.getElementById('email').value,
            };
            const response = await axios.post(`${url}api/funcionarios`, manager, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showToast('Éxito', 'Encargado guardado con éxito.');
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error.response ? error.response.data : error.message);
            showToast('Error', 'Error al guardar el encargado.');
            return false;
        }
    }

    btnAdd.addEventListener('click', function () {
        addManager(); 
    });

    async function readChofer() {
        try {
            const response = await axios.get(`${url}api/chofer`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const choferes = response.data.choferes;
            let body = '<option selected disabled value="">Seleccione una opción</option>';
            choferes.forEach(chofer => {
                body += `<option value="${chofer.idChofer}">${chofer.nombre}</option>`;
            });
            document.getElementById('select-chofer').innerHTML = body;

        } catch (error) {
            console.error('No se cargaron los datos', error);
        }
    }

})();
