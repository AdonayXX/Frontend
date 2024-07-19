Promise.all([
    mostrarProximosViajes(),
    mostrarFecha(),
    contarCitasHome(),
    mostrarChoferesPorVencer(),
    mostrarUnidadesPorDekra(),
    mostrarUnidadesPorKilometraje(),

]);


//CAMBIAR TODA LA FUNCION CUANDO SE TENGA LA RUTA DE LA API
async function mostrarProximosViajes() {
    try {
        const ahora = new Date();
        ahora.setHours(0, 0, 0, 0); // Setear la hora a las 00:00:00
        const hoyUTC = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), 0, 0, 0));
        const hoyUTCStr = hoyUTC.toISOString().split('T')[0];

        const fechaFormateada = hoyUTCStr.split('-').reverse().join('-');
        document.getElementById('fecha').textContent = fechaFormateada;

        const token = localStorage.getItem('token');
        const viajesRespuesta = await axios.get('https://backend-transporteccss.onrender.com/api/viaje/destinos',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!viajesRespuesta.data) {
            throw new Error('Error al obtener los viajes');
        }

        const dataViajes = viajesRespuesta.data;
        const viajes = dataViajes.viaje;

        const viajesHoyUTC = viajes.filter(viaje => {
            const fechaViaje = new Date(viaje.fechaInicioViaje);
            const fechaViajeUTC = new Date(Date.UTC(fechaViaje.getUTCFullYear(), fechaViaje.getUTCMonth(), fechaViaje.getUTCDate(), 0, 0, 0));
            const fechaViajeStr = fechaViajeUTC.toISOString().split('T')[0];
            return fechaViajeStr === hoyUTCStr && viaje.EstadoViaje === "Iniciado";
        });

        const proximosViajesContainer = document.getElementById('proximosViajesContainer');
        proximosViajesContainer.innerHTML = '';

        if (viajesHoyUTC.length === 0) {
            const mensajeNoViajes = document.createElement('p');
            mensajeNoViajes.textContent = 'No hay viajes asignados para el día de hoy.';
            mensajeNoViajes.classList.add('text-center');
            proximosViajesContainer.appendChild(mensajeNoViajes);

        } else {
            const viajesPorDestino = viajesHoyUTC.reduce((acc, viaje) => {
                if (!acc[viaje.ubicacionDestino]) {
                    acc[viaje.ubicacionDestino] = [];
                }
                acc[viaje.ubicacionDestino].push(viaje);
                return acc;
            }, {});

            Object.keys(viajesPorDestino).forEach(destino => {
                const viajesDestino = viajesPorDestino[destino];
                const viaje = viajesDestino[0];

                const viajeElement = document.createElement('div');
                viajeElement.classList.add('card', 'border-dark', 'mb-3', 'm-4', 'shadow');
                viajeElement.style.maxWidth = '18rem';

                const letraMayuscula = (string) => {
                    const words = string.split(' ');
                    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                    return capitalizedWords.join(' ');
                };

                viajeElement.innerHTML = `
                    <div class="headerviaje card-header text-center text-white position-relative" style="background-color: #094079;">
                        <h5 class="fw-bolder">UNIDAD ${viaje.numeroUnidad}</h5>
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title">Fecha de viaje:</h5>
                        <h5 class="card-title">${new Date(viaje.fechaInicioViaje).toISOString().split('T')[0]}</h5>
                        <p class="card-text fs-5">Destino: ${letraMayuscula(viaje.ubicacionDestino)}</p>
                          ${viajesDestino.length > 1 ? `<span class="badge position-absolute bottom-0 end-0" style="background-color: #094079; border-radius: 50%; margin:5px;" >${viajesDestino.length}</span>` : ''}
                    </div>
                `;
                proximosViajesContainer.appendChild(viajeElement);
            });
        }

    } catch (error) {
        console.error('Error al mostrar los próximos viajes:', error);
    }
}

async function mostrarFecha() {
    try {
        const ahora = new Date();
        ahora.setHours(0, 0, 0, 0); // Setear la hora a las 00:00:00
        const ahoraUTC = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), ahora.getUTCHours(), ahora.getUTCMinutes(), ahora.getUTCSeconds()));
        const hoyUTC = ahoraUTC.toISOString().split('T')[0];

        const fechaFormateada = hoyUTC.split('-').reverse().join('-');
        document.getElementById('fecha').textContent = fechaFormateada;
    } catch (error) {
        console.error('Error al mostrar la fecha:', error);
    }
}


async function contarCitasHome() {
    try {
        const year = new Date().getFullYear().toString();

        // Obtener datos de citas
        const token = localStorage.getItem('token');

        const citasRespuesta = await axios.get('https://backend-transporteccss.onrender.com/api/cita',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!citasRespuesta.data) {
            throw new Error('Error al obtener las citas');
        }
        const dataCitas = citasRespuesta.data;

        // Obtener datos de viajes
        const viajesRespuesta = await axios.get('https://backend-transporteccss.onrender.com/api/viaje',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!viajesRespuesta.data) {
            throw new Error('Error al obtener los viajes');
        }
        const dataViajes = viajesRespuesta.data.viaje;

        // Filtrar citas finalizadas y canceladas
        const citasFinalizadas = dataCitas.filter(cita => {
            const citaYear = cita.idCita.split('-')[0];
            return cita.estadoCita === 'Finalizada' && citaYear === year;
        });

        const citasCanceladas = dataCitas.filter(cita => {
            const citaYear = cita.idCita.split('-')[0];
            return cita.estadoCita === 'Cancelada' && citaYear === year;
        });

        // Filtrar viajes finalizados
        const viajesFinalizados = dataViajes.filter(viaje => {
            const viajeYear = viaje.idViaje.split('-')[0];
            return viaje.EstadoViaje === "Finalizado" && viajeYear === year;
        });

        // Mostrar conteos en el DOM
        document.getElementById('contadorCitasFinalizadas').textContent = citasFinalizadas.length;
        document.getElementById('contadorCitasCanceladas').textContent = citasCanceladas.length;
        document.getElementById('contadorViajesFinalizados').textContent = viajesFinalizados.length;

    } catch (error) {
        console.error('Error al contar las citas y viajes:', error);
    }
}


async function mostrarUnidadesPorDekra() {
    try {
        const ahora = new Date();
        const hoyUTC = ahora.toISOString().split('T')[0];

        const token = localStorage.getItem('token');
        const unidadesRespuesta = await axios.get('https://backend-transporteccss.onrender.com/api/unidades',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!unidadesRespuesta.data) {
            throw new Error('Error al obtener las unidades');
        }

        const dataUnidades = unidadesRespuesta.data;

        const unidadesPorVencer = dataUnidades.unidades.filter(unidad => {
            const fechaVencimiento = new Date(unidad.fechaDekra);
            const diasRestantes = Math.floor((fechaVencimiento - ahora) / (1000 * 60 * 60 * 24));
            return diasRestantes < 30 && diasRestantes > 0 && unidad.idEstado === 1;
        });

        const unidadesPorVencerContainer = document.getElementById('proximosDekra');
        unidadesPorVencerContainer.innerHTML = '';

        if (unidadesPorVencer.length === 0) {
            console.log('No hay unidades cuya fecha de revisión de Dekra vence en menos de 30 días.');

        } else {
            const tituloFechasDekra = document.createElement('h5');
            tituloFechasDekra.textContent = 'Fechas de Dekra';
            tituloFechasDekra.classList.add('text-center','mb-4', 'rounded' );
            unidadesPorVencerContainer.appendChild(tituloFechasDekra);

            unidadesPorVencer.forEach(unidad => {
                const unidadElement = document.createElement('div');
                unidadElement.classList.add('card', 'border-dark', 'mb-3', 'm-2', 'shadow');
                unidadElement.style.maxWidth = '18rem';
                unidadElement.innerHTML = `
                    <div class="headerunidad card-header text-center text-white" style="background-color: #097F4A;">
                        <h5 class="fw-bolder">Unidad ${unidad.numeroUnidad}</h5>
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title">Fecha de Revisión: </h5>
                        <h5 class="card-title">${unidad.fechaDekra.split('T')[0]}</h5>
                    </div>
                `;
                unidadesPorVencerContainer.appendChild(unidadElement);
            });
        }
    } catch (error) {
        console.error('Error al mostrar las unidades por vencer:', error);
    }
}

async function mostrarChoferesPorVencer() {
    try {
        const ahora = new Date();

        const token = localStorage.getItem('token');

        const choferesRespuesta = await axios.get('https://backend-transporteccss.onrender.com/api/chofer',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!choferesRespuesta.data) {
            throw new Error('Error al obtener los choferes');
        }

        const dataChoferes = choferesRespuesta.data;

        const choferesPorVencer = dataChoferes.choferes.filter(chofer => {
            const fechaVencimiento = new Date(chofer.vencimientoLicencia);
            const diasRestantes = Math.floor((fechaVencimiento - ahora) / (1000 * 60 * 60 * 24));
            return diasRestantes <= 30 && diasRestantes > 0 && chofer.estadoChofer === "Activo";
        });

        const choferesPorVencerContainer = document.getElementById('proximoschoferes');
        choferesPorVencerContainer.innerHTML = '';

        if (choferesPorVencer.length === 0) {
            console.log('No hay choferes cuya fecha de vencimiento de licencia vence en menos de 30 días.');
        } else {
            const tituloFechasChofer = document.createElement('h5');
            tituloFechasChofer.textContent = 'Fechas de Vencimiento de Licencia';
            tituloFechasChofer.classList.add('text-center', 'mb-4', 'mt-5', 'rounded');
            choferesPorVencerContainer.appendChild(tituloFechasChofer);

            choferesPorVencer.forEach(chofer => {
                const fechaVencimiento = new Date(chofer.vencimientoLicencia);
                const diasRestantes = Math.floor((fechaVencimiento - ahora) / (1000 * 60 * 60 * 24));

                const choferElement = document.createElement('div');
                choferElement.classList.add('card', 'border-dark', 'mb-3', 'm-4', 'shadow');
                choferElement.style.maxWidth = '18rem';
                choferElement.innerHTML = `
                    <div class="headerchofer card-header text-center text-white" style="background-color: #4267ad;">
                        <h5 class="fw-bolder">${chofer.nombre} ${chofer.apellido1}</h5>
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title">Fecha de Vencimiento de Licencia: </h5>
                        <h5 class="card-title">${chofer.vencimientoLicencia.split('T')[0]}</h5>
                        <h5 class="card-title">Días restantes: ${diasRestantes}</h5>
                    </div>
                `;
                choferesPorVencerContainer.appendChild(choferElement);
            });
        }
    } catch (error) {
        console.error('Error al mostrar los choferes por vencer:', error);
    }
}


async function mostrarUnidadesPorKilometraje() {
    try {
        const ahora = new Date();
        const hoyUTC = ahora.toISOString().split('T')[0];

        const token = localStorage.getItem('token');
        const unidadesRespuesta = await axios.get('https://backend-transporteccss.onrender.com/api/unidades',{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!unidadesRespuesta.data) {
            throw new Error('Error al obtener las unidades');
        }

        const dataUnidades = unidadesRespuesta.data.unidades;

        const unidadesPorKilometraje = dataUnidades.filter(unidad => {
            if (unidad.idEstado === 1) {
                const ultimoKilometraje = unidad.ultimoMantenimientoKilometraje || unidad.kilometrajeInicial;
                const kilometrajeActual = unidad.kilometrajeActual;
                const frecuenciaKilometraje = unidad.valorFrecuenciaC;
                const adelantoKilometraje = frecuenciaKilometraje * (unidad.adelanto / 100);

                return (kilometrajeActual - ultimoKilometraje) >= frecuenciaKilometraje - adelantoKilometraje;
            }
            return false;
        });

        const unidadesPorKilometrajeContainer = document.getElementById('proximosMantenimientoKilometraje');
        unidadesPorKilometrajeContainer.innerHTML = '';

        if (unidadesPorKilometraje.length === 0) {
            console.log('No hay unidades próximas a necesitar mantenimiento por kilometraje.');
        } else {
            const tituloMantenimientoKilometraje = document.createElement('h5');
            tituloMantenimientoKilometraje.textContent = 'Mantenimiento por Kilometraje';
            tituloMantenimientoKilometraje.classList.add('text-center', 'mt-4', 'mb-4', 'rounded');
            unidadesPorKilometrajeContainer.appendChild(tituloMantenimientoKilometraje);

            unidadesPorKilometraje.forEach(unidad => {
                const unidadElement = document.createElement('div');
                unidadElement.classList.add('card', 'border-dark', 'mb-3', 'm-4', 'shadow');
                unidadElement.style.maxWidth = '18rem';
                unidadElement.innerHTML = `
                    <div class="headerunidad card-header text-center text-white" style="background-color: #42ad89;">
                        <h5 class="fw-bolder">Unidad ${unidad.numeroUnidad}</h5>
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title">Último Kilometraje: ${unidad.ultimoMantenimientoKilometraje || unidad.kilometrajeInicial}</h5>
                        <h5 class="card-title">Kilometraje Actual: ${unidad.kilometrajeActual}</h5>
                        <h5 class="card-title">Próximo Mantenimiento: ${(unidad.ultimoMantenimientoKilometraje || unidad.kilometrajeInicial) + unidad.valorFrecuenciaC}</h5>
                    </div>
                `;
                unidadesPorKilometrajeContainer.appendChild(unidadElement);
            });
        }
    } catch (error) {
        console.error('Error al mostrar las unidades por kilometraje:', error);
    }
}
