document.addEventListener('DOMContentLoaded', (event) => {
    let numAcompaniantes = 1;

    function agregarAcompaniante() {
        if (numAcompaniantes < 5) {
            numAcompaniantes++;
            const nuevoAcompaniante = `
                <div class="d-flex align-items-center mt-2">
                    <input type="text" id="acompañante${numAcompaniantes}" name="acompañante${numAcompaniantes}" class="form-control">
                    <button type="button" class="btn btn-danger btn-sm ms-1" onclick="eliminarAcompaniante(this)">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `;
            document.getElementById('acompaniantesContainer').insertAdjacentHTML('beforeend', nuevoAcompaniante);
            actualizarPosicionBotonAgregar();
        }
    }
    
    function eliminarAcompaniante(btnEliminar) {
        numAcompaniantes--;
        const divAcompaniante = btnEliminar.parentNode;
        divAcompaniante.parentNode.removeChild(divAcompaniante);
        actualizarPosicionBotonAgregar();
    }
    
    function actualizarPosicionBotonAgregar() {
        const btnAgregar = document.getElementById('btn-agregar');
        btnAgregar.style.marginLeft = `${numAcompaniantes * 35}px`;
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        const btnAgregar = document.getElementById('btn-agregar');
        btnAgregar.addEventListener('click', agregarAcompaniante);
    });
});