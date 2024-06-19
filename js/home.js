async function mostrarProximosViajes() {
    try {
        const ahora = new Date();
        const ahoraUTC = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), ahora.getUTCHours(), ahora.getUTCMinutes(), ahora.getUTCSeconds()));
        const hoyUTC = ahoraUTC.toISOString().split('T')[0];

        const [destinosRespuesta, viajesRespuesta, unidadesRespuesta] = await axios.all([
            axios.get('https://backend-transporteccss.onrender.com/api/destinos'),
            axios.get('https://backend-transporteccss.onrender.com/api/viaje'),
            axios.get('https://backend-transporteccss.onrender.com/api/unidades')
        ]);

        if (!destinosRespuesta.data || !viajesRespuesta.data || !unidadesRespuesta.data) {
            throw new Error('Error al obtener los destinos, los viajes o las unidades');
        }

        const [destinos, dataViajes, dataUnidades] = await axios.all([
            destinosRespuesta.data,
            viajesRespuesta.data,
            unidadesRespuesta.data
        ]);

        const destinoMap = destinos.reduce((map, destino) => {
            map[destino.IdDestino] = destino.Descripcion.toLowerCase().replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
            return map;
        }, {});

        const unidadMap = dataUnidades.unidades.reduce((map, unidad) => {
            map[unidad.id] = unidad.numeroUnidad;
            return map;
        }, {});

        const viajes = dataViajes.viaje;

        const viajesHoyUTC = viajes.filter(viaje => {
            const fechaViaje = new Date(viaje.FechaCita);
            const fechaViajeUTC = new Date(Date.UTC(fechaViaje.getUTCFullYear(), fechaViaje.getUTCMonth(), fechaViaje.getUTCDate(), fechaViaje.getUTCHours(), fechaViaje.getUTCMinutes(), fechaViaje.getUTCSeconds()));
            const fechaViajeStr = fechaViajeUTC.toISOString().split('T')[0];
            return fechaViajeStr === hoyUTC && viaje.EstadoViaje === null;
        });

        const proximosViajesContainer = document.getElementById('proximosViajesContainer');
        proximosViajesContainer.innerHTML = '';

        if (viajesHoyUTC.length === 0) {
            const mensajeNoViajes = document.createElement('p');
            mensajeNoViajes.textContent = 'No hay viajes asignados para el día de hoy.';
            mensajeNoViajes.classList.add('text-center'); // Agregar clase para centrar texto
            proximosViajesContainer.appendChild(mensajeNoViajes);
        
        } else {
            viajesHoyUTC.forEach(viaje => {
                const viajeElement = document.createElement('div');
                viajeElement.classList.add('card', 'border-dark', 'mb-3', 'm-4', 'shadow-lg');
                viajeElement.style.maxWidth = '18rem';
                const destinoDescripcion = destinoMap[viaje.idUbicacionDestino] || viaje.idUbicacionDestino;
                const numeroUnidad = unidadMap[viaje.idUnidad] || viaje.idUnidad;

                viajeElement.innerHTML = `
                    <div class="headerviaje card-header text-center text-white" style="background-color: #094079;">
                        <h5 class="fw-bolder">Unidad ${numeroUnidad}</h5>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Fecha de viaje: ${new Date(viaje.FechaCita).toISOString().split('T')[0]}</h5>
                        <p class="card-text fs-5">Destino: ${destinoDescripcion}</p>
                    </div>
                `;
                proximosViajesContainer.appendChild(viajeElement);
            });
        }
    } catch (error) {
        console.error('Error al mostrar los próximos viajes:', error);
    }
}

mostrarProximosViajes();
