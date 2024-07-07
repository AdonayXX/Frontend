getMaintenance();
//Obtener los matenimientos
async function getMaintenance() {
    try {
      const token = localStorage.getItem('token');
      const API_URL = 'http://localhost:18026/api/mantenimiento/';
  
      const response = await axios.get(API_URL, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
      const listMaintenance = response.data.mantenimientos;
      console.log(listMaintenance);
  
      $(document).ready(function () {
        if ($.fn.DataTable.isDataTable('#tableMaintenance')) {
          $('#tableMaintenance').DataTable().destroy();
        }
        fillMaintenance(listMaintenance);
        let table = $('#tableMaintenance').DataTable({
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
          smart: true
  
        });
        $('#searchMaintenance').on('keyup', function () {
          let inputValue = $(this).val().toLowerCase();
          table.search(inputValue).draw();
        });
  
  
  
      });
      ocultarSpinner();
    } catch (error) {
  
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        console.error('Error específico:', errorMessage);
        showToast('Ups!', errorMessage);
  
      }else{
        showToast('Error', 'Hubo un problema al obtener los manteniminetos' );
      }
    }
  }

  //llenar tabla mantenimiento
  function fillMaintenance(listMaintenance){
    try {
        const tableBody = document.querySelector('#maintenance-body');
        if (listMaintenance) {
    
          tableBody.innerHTML = '';
          const fragment = document.createDocumentFragment();
    
          listMaintenance.forEach(maintenance => {
              // Formatear la fecha en formato dd/mm/aaaa
              const formattedDate = formatDate(maintenance.FechaMantenimiento);
    
    
    
    
            const row = document.createElement('tr');    
            row.innerHTML = `
              <tr>
                <td >${maintenance.numeroUnidad}</td>
                <td >${maintenance.TipoUnidad} </td>
                <td >${formattedDate}</td>
                <td>${maintenance.DescripcionTarea}</td>
               <td class='text-center'>${maintenance.Cantidad}</td>
                <td class='text-center'>${maintenance.UnidadMedida}</td>
                <td class='text-center'>${maintenance.Estado}</td>
                <td class="actions">
                <button class="btn btn-outline-success btn-sm text-center" data-toggle="tooltip" data-placement="bottom" title="Estado: Finalizado">  <i class="bi bi-check"></i></button>
             <button class="btn btn-outline-warning btn-sm text-center" data-toggle="tooltip"  data-placement="bottom" title="Estado: Pendiente"><i class="bi bi-exclamation"></i></button>       
              </td>
              </tr>
            `;
            fragment.appendChild(row);
    
          });
    
          tableBody.appendChild(fragment);
    
    
    
    
        } else {
          throw new Error('Error al cargar los mantenimientos');
    
        }
    
      } catch (error) {
    
        console.error('There has been a problem:', error);
    
    
      }
    
  }

  //Funcion para formatear la fecha
function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Ocultar el spinner
function ocultarSpinner() {
    document.getElementById('spinnerContainer').style.display = 'none';
  }

// Mostrar el modal de mantenimiento luego de agregar actividades
  $(document).on('click', '#btnCloseTask', function() {
    $('#maintenanceModal').modal('show');
   
  });

  document.querySelector('#openTask').addEventListener('click',()=>{
    getActividades ();

  });

//Mostar Actividades
async function getActividades (){
  try {
    const token = localStorage.getItem('token');
    const API_URL = 'http://localhost:18026/api/actividadMantenimiento';

    const response = await axios.get(API_URL, {
      headers: {
          'Authorization': `Bearer ${token}`
      }
  });
    const listAct = response;
    console.log(listAct)
  } catch (error) {

    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.error;
      console.error('Error específico:', errorMessage);
      showToast('Ups!', errorMessage);

    }else{
      showToast('Error', 'Hubo un problema al obtener los manteniminetos' );
    }
  }

}
  
 
  