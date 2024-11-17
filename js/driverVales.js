"use strict";

// revisar la hora que se está obteniendo y envianco al backend

(async function () {
  let valeActual;
  let valeIdSeleccionado;
  let revisionIdSeleccionado;
  let kilometrajeActualUnidad;
  let cedulaChofer;
  const btnInicioViajeVale = document.getElementById("btnInitTripDriver");
  const btnFinalizarViajeVale = document.getElementById("finalizarViajeBtn");
  const btnPreFinalizarViajeVale = document.getElementById(
    "btnFinalizarJornada"
  );
  const btnPreIniciarViajeVale = document.getElementById("btnIniciarJornada");
  const inputKilometrajeFinal = document.getElementById("kilometrajeFinal");

  btnInicioViajeVale.disabled = true;
  btnFinalizarViajeVale.disabled = true;
  btnPreFinalizarViajeVale.disabled = true;
  btnPreIniciarViajeVale.disabled = true;

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token no encontrado en localStorage");
    window.location.href = "index.html";
    return;
  }

  async function infoUser() {
    try {
      const userInfo = jwt_decode(token);

      return userInfo;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      showToast(
        "Error",
        "Ocurrió un problema al obtener los datos del usuario"
      );
      throw error;
    }
  }

  // async function obtenerUnidadAsignada(identificacion) {
  //   const API_CHOFERES_CON_UNIDADES =
  //     "http://localhost:18026/api/chofer/unidades";
  //   try {
  //     const response = await axios.get(API_CHOFERES_CON_UNIDADES, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     return response.data.choferesConUnidades.find(
  //       (chofer) => chofer.cedula === identificacion
  //     );
  //   } catch (error) {
  //     console.error("Error al obtener la unidad asignada:", error);
  //     showToast("Error", "Ocurrió un problema al obtener la unidad asignada");
  //     throw error;
  //   }
  // }

  async function obtenerIdUnidad(numeroUnidad) {
    const API_UNIDADES = "http://localhost:18026/api/unidades/numeroUnidad";
    try {
      const response = await axios.get(API_UNIDADES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const unidad = response.data.unidades;
      console.log(unidad);
      kilometrajeActualUnidad = unidad.kilometrajeActual;
      return unidad.id;
    } catch (error) {
      console.error("Error al obtener el id de la unidad asignada:", error);
      showToast(
        "Error",
        "Ocurrió un problema al obtener el id de la unidad asignada"
      );
      throw error;
    }
  }

  // async function obtenerVales(idUnidad, fecha) {
  //   const API_VALES = `http://localhost:18026/api/viajeVale/${idUnidad}/${fecha}`;
  //   console.log(API_VALES);
  //   try {
  //     const response = await axios.get(API_VALES, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const vales = response.data.Data?.Data || [];

  //     if (!Array.isArray(vales)) {
  //       throw new Error("La respuesta no contiene un array de vales");
  //     }

  //     const valesNoFinalizados = vales.filter(
  //       (vale) => vale.Estado !== "Finalizado"
  //     );
  //     mostrarVales(valesNoFinalizados);
  //   } catch (error) {
  //     console.error("Error al obtener los vales:", error);
  //     showToast("Error", "Ocurrió un problema al obtener los vales");
  //     throw error;
  //   }
  // }

  // Función para obtener la fecha de hoy en el formato 'YYYY-MM-DD'
  function obtenerFechaActual() {
    // Crear un objeto de fecha para la hora actual
    const hoy = new Date();

    // Obtener el año, mes y día en la hora local (Costa Rica está en UTC-6)
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0"); // getMonth() devuelve 0-11
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  async function obtenerValesConChofer(cedula, fecha) {
    if (!token) {
      console.error("Error: El token no está definido.");
      showToast("Error", "El token de autorización es inválido o no existe");
      return;
    }

    if (!cedula || !fecha) {
      console.error("Error: Cédula o fecha no están definidas.");
      showToast("Error", "Debes proporcionar una cédula y una fecha válidas");
      return;
    }

    const API_VALES = `http://localhost:18026/api/viajeVale/choferesVale/${cedula}/${fecha}`;
    console.log("Llamada a API:", API_VALES);

    try {
      const response = await axios.get(API_VALES, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const vales = response.data.data;

      if (vales.length === 0) {
        showToast("Información", "El chofer no tiene viajes vales para hoy");
      } else {
        mostrarVales(vales);
        console.log("Vales obtenidos:", vales);
      }
    } catch (error) {
      console.error("Error al obtener los vales:", error.message);
      showToast("Error", "Ocurrió un problema al obtener los vales");
      throw error;
    }
  }
  // Definimos la función 'setIniciarValeData' antes de llamar a 'mostrarVales'

  // Función para mostrar los vales en la tabla
  // Función para mostrar los vales en la tabla
  // Función para mostrar los vales en la tabla
  function mostrarVales(vales) {
    const valesTableBody = document.getElementById("valesTableBody");
    if (!valesTableBody) {
      console.error("Elemento 'valesTableBody' no encontrado");
      return;
    }

    valesTableBody.innerHTML = "";

    vales.forEach((vale) => {
      // Verifica si el EstadoId es 2 o 4
      const isEstadoFinalizable = vale.EstadoId === 4;
      const isEstadoIniciable = vale.EstadoId === 2;

      // Solo procesa el vale si el EstadoId es 2 o 4
      if (isEstadoFinalizable || isEstadoIniciable) {
        valeActual = isEstadoFinalizable ? vale : valeActual;

        // Crea una fila y añade una clase Bootstrap según el estado
        const row = document.createElement("tr");
        row.className = isEstadoFinalizable ? "table-primary" : ""; // Cambia `table-primary` por otra clase si prefieres otro color

        let destino = vale.DestinoId || vale.DestinoEbais || "N/A";
        let salida = vale.SalidaId || vale.SalidaEbais || "N/A";

        const acompanantes =
          [
            vale.Acompanante1,
            vale.Acompanante2,
            vale.Acompanante3,
            vale.Acompanante4,
          ]
            .filter((a) => a)
            .join(", ") || "No hay acompañantes";

        row.innerHTML = `
          <td>${vale.numeroUnidad}</td> 
          <td>${vale.MotivoDescripcion}</td> 
          <td>${salida}</td>
          <td>${destino}</td>
          <td>${vale.Fecha_Solicitud.split("T")[0]}</td>
          <td>${vale.Hora_Salida}</td>
          <td>
            <button class="btn btn-outline-info btn-sm" onclick="mostrarAcompanantes('${acompanantes}')">
              <i class="bi bi-eye"></i>
            </button>
          </td>
          <td>
            <button class="btn btn-outline-primary btn-sm ${
              isEstadoFinalizable ? "btn-success" : ""
            }"
              data-bs-toggle="modal" data-bs-target="#iniciarValeModal"
              ${isEstadoFinalizable ? "disabled" : ""}
              onclick="setIniciarValeData('${vale.IdVale}', '${
          vale.kilometrajeActual
        }')">
              ${isEstadoFinalizable ? "Iniciado" : "Iniciar"}
            </button>
            ${
              isEstadoFinalizable
                ? `<button data-bs-toggle="modal" data-bs-target="#finalizarValeModal" 
                    class="btn btn-outline-danger btn-sm">
                    Finalizar
                  </button>`
                : ""
            }
          </td>
        `;
        valesTableBody.appendChild(row);
      }
    });
  }

  window.setIniciarValeData = function (IdVale, kilometrajeActual) {
    const btnIniciarValeConfirm = document.getElementById(
      "btnIniciarValeConfirm"
    );
    btnIniciarValeConfirm.onclick = function () {
      window.iniciarVale(IdVale, kilometrajeActual);
    };
  };

  window.mostrarAcompanantes = function (acompanantes) {
    const acompanantesContenido = document.getElementById(
      "acompanantesContenido"
    );
    if (acompanantesContenido) {
      acompanantesContenido.innerText = acompanantes;
      const modal = new bootstrap.Modal(
        document.getElementById("acompanantesModal")
      );
      modal.show();
    }
  };

  async function inicializarPagina() {
    try {
      const infoUsuario = await infoUser();
      const Identificacion = infoUsuario?.usuario?.Identificacion;
      const rol = infoUsuario?.usuario?.Rol;
      cedulaChofer = infoUsuario.usuario.Identificacion;

      if (rol !== 2) {
        showToast(
          "Error",
          "Acceso denegado: Solo los chóferes pueden usar este módulo."
        );
        return;
      }
      let fechaHoy = obtenerFechaActual();
      obtenerValesConChofer(cedulaChofer, fechaHoy);
      // const unidadAsignada = await obtenerUnidadAsignada(Identificacion);
      // if (unidadAsignada) {
      //   const unidadAsignadaElement =
      //     document.getElementById("unidadAsignadaVale");
      //   if (unidadAsignadaElement) {
      //     unidadAsignadaElement.value = unidadAsignada.numeroUnidad;
      //   } else {
      //     console.error("Elemento 'unidadAsignadaVale' no encontrado");
      //   }

      // const idUnidad = await obtenerIdUnidad(unidadAsignada.numeroUnidad);
      // if (idUnidad) {
      //   const today = new Date();
      //   const fechaValue = `${today.getFullYear()}-${String(
      //     today.getMonth() + 1
      //   ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      //   const fechaElement = document.getElementById("fechaVale");
      //   if (fechaElement) {
      //     fechaElement.value = fechaValue;
      //   } else {
      //     console.error("Elemento 'fechaVale' no encontrado");
      //   }

      //   await obtenerVales(idUnidad, fechaValue);
      //   idUnidadObtenida = idUnidad;
      //   await botones();
      // } else {
      //   showToast(
      //     "Error",
      //     "No se encontró la unidad asignada para el chófer logueado"
      //   );
      // }
    } catch (error) {
      console.error("Error al inicializar la página:", error);
      showToast("Error", "Ocurrió un problema al cargar la página");
    }
  }

  window.iniciarVale = async function (IdVale, kilometrajeActual) {
    try {
      const valeInfo = await axios.get(
        `http://localhost:18026/api/viajeVale/disponibilidad/${cedulaChofer}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (valeInfo.data.success) {
        crearViaje(IdVale, kilometrajeActual);
      } else {
        showToast("Denegado", "Actualmente tiene un Vale iniciado");
      }
    } catch (error) {
      console.error("Error al iniciar el vale:", error);
      showToast("Error", "Ocurrió un problema al iniciar el vale");
    }
  };

  async function crearViaje(IdVale, kilometrajeActual) {
    const data = {
      IdVale: IdVale,
      kilometrajeInicial: kilometrajeActual,
      fechaInicio: obtenerFechaActual(),
      horaInicio: obtenerHoraActualCostaRica(),
    };

    console.log(data);
    try {
      const response = await axios.post(
        `http://localhost:18026/api/viajeVale/iniciarViajeVale`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.error("Error al obtener los vales:", error.message);
      showToast("Error", "Ocurrió un problema al obtener los vales");
      throw error;
    }
  }

  function obtenerHoraActualCostaRica() {
    const ahora = new Date();

    // Formateador de hora en la zona horaria de Costa Rica
    const opciones = {
      timeZone: "America/Costa_Rica",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    return new Intl.DateTimeFormat("es-CR", opciones).format(ahora);
  }

  window.seleccionarVale = async function (vale) {
    valeIdSeleccionado = idVale;
    idUnidadObtenida = numeroUnidad;
    // validarKilometrajeFinal();
  };

  async function obtenerKmUnidad(numeroUnidad) {
    const API_UNIDAD = `http://localhost:18026/api/unidades/kilometraje/${numeroUnidad}`;
    try {
      const response = await axios.get(API_UNIDAD, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { kilometrajeActual } = response.data.unidad[0] || {};
      const kilometrajeUnidad = kilometrajeActual || 0;

      console.log(kilometrajeUnidad);
      return kilometrajeUnidad;
    } catch (error) {
      console.error("Error al obtener Kilometros:", error);
      //showToast("Error", "Ocurrió un problema al obtener los vales");
      throw error;
    }
  }

  // Función para manejar la validación y el envío de datos
  window.finalizarVale = async function () {
    const idVale = valeActual.IdVale;
    const horaFinViaje = obtenerHoraActualCostaRica();
    const kilometrajeFinal = document.getElementById("kilometrajeFinal").value;
    const horasExtras = document.getElementById("horasExtras").value;
    const viaticos = document.getElementById("viaticos").value;
    const numeroUnidad = valeActual.numeroUnidad;

    // Validación de campos requeridos
    if (!idVale) {
      alert("Por favor, complete el ID del Vale.");
      return;
    }
    if (!horaFinViaje) {
      alert("Por favor, complete la Hora de Fin del Viaje.");
      return;
    }
    if (
      (!kilometrajeFinal || kilometrajeFinal <= valeActual.kilometrajeActual) &&
      kilometrajeFinal > valeActual.kilometrajeActual + 2000
    ) {
      alert("Por favor, complete el Kilometraje Final.");
      return;
    }
    if (!viaticos) {
      alert("Por favor, complete los Viáticos.");
      return;
    }
    if (!numeroUnidad) {
      alert("Por favor, complete el Número de Unidad.");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:18026/api/viajeVale/finalizar",
        {
          idVale: idVale,
          horaFinViaje: horaFinViaje,
          kilometrajeFinal: kilometrajeFinal,
          horasExtras: horasExtras,
          viaticos: viaticos,
          numeroUnidad: numeroUnidad,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluye el token en el encabezado
          },
        }
      );

      if (response.status === 200) {
        alert("Vale finalizado con éxito");
        // Cerrar modal y recargar tabla o actualizar vista
        $("#confirmarFinalizarValeModal").modal("hide");
        // Actualizar la vista de vales aquí, si es necesario
      }
    } catch (error) {
      console.error("Error al finalizar el vale:", error);
      alert("Hubo un error al finalizar el vale.");
    }
  };

  // document
  //   .getElementById("btnConfirmarFinalizarVale")
  //   .addEventListener("click", finalizarVale);

  // async function confirmarFinalizarVale(idUnidad, fecha) {
  //   if (!valeIdSeleccionado || !revisionIdSeleccionado) {
  //     showToast("Error", "No se ha seleccionado un vale para finalizar");
  //     return;
  //   }

  //   await finalizarVale(valeIdSeleccionado, revisionIdSeleccionado);
  // }
  // window.iniciarJornada = async function () {
  //   const API_INICIARJORNADA =
  //     "http://localhost:18026/api/viajeVale/iniciarViajevale";
  //   const currentDate = new Date();
  //   const timeZoneOffset = currentDate.getTimezoneOffset() * 60000;
  //   const costaRicaTime = new Date(currentDate.getTime() - timeZoneOffset);
  //   const horaInicio = costaRicaTime.toISOString().split("T")[1].split(".")[0];
  //   const today = new Date();
  //   const fecha = `${today.getFullYear()}-${String(
  //     today.getMonth() + 1
  //   ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  //   try {
  //     const data = await axios.put(
  //       API_INICIARJORNADA,
  //       {
  //         idUnidad: idUnidadObtenida,
  //         Estado: "En curso",
  //         fechaInicio: fecha,
  //         horaInicio: horaInicio,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     // console.log(data);
  //   } catch (error) {
  //     console.error("Error al iniciar la jornada:", error);
  //     showToast("Error", "Ocurrió un problema al iniciar la jornada");
  //   } finally {
  //     loadContent("tableDriverVales.html", "mainContent");
  //   }
  // };

  // window.finalizarJornada = async function () {
  //   const today = new Date();
  //   const fecha = `${today.getFullYear()}-${String(
  //     today.getMonth() + 1
  //   ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  //   // console.log(fecha)
  //   const currentDate = new Date();
  //   const timeZoneOffset = currentDate.getTimezoneOffset() * 60000;
  //   const costaRicaTime = new Date(currentDate.getTime() - timeZoneOffset);
  //   const finJornada = costaRicaTime.toISOString().split("T")[1].split(".")[0];
  //   const horaFin = finJornada;
  //   // console.log(horaFin);
  //   const API_OBTENER_ESTADO = `http://localhost:18026/api/viajeVale/viaje/ViajeVale/${idUnidadObtenida}/${fecha}`;
  //   // console.log(API_OBTENER_ESTADO);
  //   const API_FINALIZARJORNADA =
  //     "http://localhost:18026/api/viajeVale/viaje/finalizar";

  //   try {
  //     const response = await axios.get(API_OBTENER_ESTADO, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     // console.log(response.data.Data.Data[0].idViajeVale);
  //     try {
  //       const data = await axios.put(
  //         API_FINALIZARJORNADA,
  //         {
  //           idViajeVale: response.data.Data.Data[0].idViajeVale,
  //           EstadoViaje: "Finalizado",
  //           horaFinViaje: horaFin,
  //         },
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       // console.log(data);
  //     } catch (error) {
  //       console.error("Error al iniciar la jornada:", error);
  //       showToast("Error", "Ocurrió un problema al iniciar la jornada");
  //     }
  //   } catch (error) {
  //     console.error("Error al iniciar la jornada:", error);
  //     showToast("Error", "Ocurrió un problema al iniciar la jornada");
  //   } finally {
  //     loadContent("tableDriverVales.html", "mainContent");
  //   }
  // };

  // async function botones() {
  //   const today = new Date();
  //   const fecha = `${today.getFullYear()}-${String(
  //     today.getMonth() + 1
  //   ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  //   // console.log(fecha)
  //   const API_OBTENER_ESTADO = `http://localhost:18026/api/viajeVale/viaje/ViajeVale/${idUnidadObtenida}/${fecha}`;
  //   try {
  //     const response = await axios.get(API_OBTENER_ESTADO, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     // console.log(response.data.Data.Data[0].EstadoViaje);

  //     if (response.data.Data.Data[0].EstadoViaje === "Iniciado") {
  //       btnInicioViajeVale.disabled = false;
  //       btnPreIniciarViajeVale.disabled = false;
  //     }

  //     if (response.data.Data.Data[0].EstadoViaje === "En curso") {
  //       btnFinalizarViajeVale.disabled = false;
  //       btnPreFinalizarViajeVale.disabled = false;
  //     }
  //   } catch (error) {
  //     console.error("Error al obtener los viajes:", error);
  //     showToast("Error", "Ocurrió un problema al obtener los viajes");
  //     throw error;
  //   }
  // }

  function validarKilometrajeFinal(kilometrajeActualUnidad) {
    inputKilometrajeFinal.value = kilometrajeActualUnidad;
    inputKilometrajeFinal.min = kilometrajeActualUnidad;

    finalizarValeForm.addEventListener("submit", function (event) {
      if (
        parseFloat(inputKilometrajeFinal.value) <
        parseFloat(kilometrajeActualUnidad)
      ) {
        event.preventDefault();
        showToast(
          "Error",
          "El kilometraje final no puede ser menor que el kilometraje actual."
        );
      }
    });
  }

  validarKilometrajeFinal(kilometrajeActualUnidad);

  btnPreFinalizarViajeVale.addEventListener("click", finalizarJornada);
  //btnIniciarJornada.addEventListener("click", iniciarJornada);

  await inicializarPagina();
})();
