(function () {
  const token = localStorage.getItem("token");
  const idVale = sessionStorage.getItem("selectedIdVale");
  var url = "http://localhost:18026/";
  //BOTONES
  const btnAdd = document.getElementById("btn-agregarSoli");
  const btnimprimirVale = document.getElementById("btn-imprimirVale");
  const btnCancel = document.getElementById("btn-rechazarSoli");
  blockBtn();
  btnimprimirVale.disabled = true;
  let isCero = 1;

  if (idVale) {
    readVale(idVale);
    sessionStorage.removeItem("selectedIdVale");
    readUnidad();
    readManager();
  } else {
    console.error("No se encontró el ID del vale en sessionStorage.");
  }

  async function readVale(id) {
    try {
      const response = await axios.get(`${url}api/vales/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const vale = response.data.vale;
      const response2 = await axios.get(`${url}api/revicionVale`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const coordinates = response2.data.revicionVales;

      let salida = vale.NombreSalida || vale.NombreSalidaEbais;
      let destino = vale.NombreDestino || vale.NombreDestinoEbais;

      const fechaSolicitud = new Date(vale.Fecha_Solicitud);
      const fechaFormateada = fechaSolicitud.toISOString().split("T")[0];
      await readChofer(vale.Chofer === 1 ? 1 : 0);
      document.getElementById("input-id").value = id;
      document.getElementById("input-up").value = vale.NombreUnidadProgramatica;
      document.getElementById("input-solicitante").value =
        vale.NombreSolicitante;
      document.getElementById("input-servicio").value = vale.NombreServicio;
      document.getElementById("input-motivo").value = vale.NombreMotivo;
      document.getElementById("input-horaSalida").value = vale.Hora_Salida;
      document.getElementById("input-fechaReq").value = fechaFormateada;
      document.getElementById("txa-detalle").value = vale.Detalle;
      document.getElementById("input-salida").value = salida;
      document.getElementById("input-destino").value = destino;

      const estadoId = vale.EstadoId;
      if (estadoId !== 1) {
        blockBtn();
        disableSelects();
        showToast("Vale Revisado", "No se pueden modificar datos.");
      } else {
        enableBtn();
      }
      acompanantes(vale);

      coordinates.forEach((coordinate) => {
        if (id === coordinate.IdVale) {
          const selectPlaca = document.getElementById("select-placa");
          const selectChofer = document.getElementById("select-chofer");
          const selectEncargado = document.getElementById("select-encargado");

          selectPlaca.value = coordinate.IdUnidad;
          selectChofer.value = coordinate.IdChofer;
          selectEncargado.value = coordinate.Encargado;

          btnAdd.disabled = true;
          disableSelects();
        }
      });
    } catch (error) {
      console.error("Error fetching vale data:", error);
    }
  }

  function disableSelects() {
    document.getElementById("select-placa").disabled = true;
    document.getElementById("select-chofer").disabled = true;
    document.getElementById("select-encargado").disabled = true;
  }

  // function selects() {
  //     const selectElement = document.getElementById('select-chofer');
  //     const newOption = document.createElement('option');
  //     newOption.id = '0';
  //     newOption.value = '0';
  //     newOption.textContent = 'Chofer ASU';
  //     selectElement.appendChild(newOption);
  //     selectElement.value = '0';
  //     selectElement.disabled = true;
  //     isCero = 0;
  // }

  function acompanantes(vale) {
    if (vale.Acompanante1 != null) {
      const acompDiv1 = document.getElementById("input-acompanante1");
      const div1 = document.getElementById("div1");
      div1.style.display = "block";
      acompDiv1.value = vale.Acompanante1;
    }
    if (vale.Acompanante2 != null) {
      const acompDiv1 = document.getElementById("input-acompanante2");
      const div1 = document.getElementById("div2");
      div1.style.display = "block";
      acompDiv1.value = vale.Acompanante2;
    }
    if (vale.Acompanante3 != null) {
      const acompDiv1 = document.getElementById("input-acompanante3");
      const div1 = document.getElementById("div3");
      div1.style.display = "block";
      acompDiv1.value = vale.Acompanante3;
    }
    if (vale.Acompanante4 != null) {
      const acompDiv1 = document.getElementById("input-acompanante4");
      const div1 = document.getElementById("div4");
      div1.style.display = "block";
      acompDiv1.value = vale.Acompanante4;
    }
    if (vale.Acompanante5 != null) {
      const acompDiv1 = document.getElementById("input-acompanante5");
      const div1 = document.getElementById("div5");
      div1.style.display = "block";
      acompDiv1.value = vale.Acompanante5;
    }
  }

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const día = String(hoy.getDate()).padStart(2, "0");

    return `${año}-${mes}-${día}`;
  };
  const obtenerHoraActual = () => {
    const hoy = new Date();
    const horas = String(hoy.getHours()).padStart(2, "0");
    const minutos = String(hoy.getMinutes()).padStart(2, "0");

    return `${horas}:${minutos}`;
  };
  async function addCoordinate() {
    const idVale = document.getElementById("input-id").value;
    const idUnidad = document.getElementById("select-placa").value;
    const idChofer = document.getElementById("select-chofer").value;
    const encargado = document.getElementById("select-encargado").value;

    if (!idVale || !idUnidad || !idChofer || !encargado) {
      showToast(
        "Advertencia",
        "Por favor, selecciona todos los campos requeridos."
      );
      return false;
    }

    const coordinate = {
      IdVale: idVale,
      IdUnidad: idUnidad,
      IdChofer: idChofer,
      Encargado: encargado,
      FechaRevision: obtenerFechaActual(),
      HoraRevision: obtenerHoraActual(),
      Observaciones: "Agregando datos",
    };

    if (typeof isCero !== "undefined" && isCero === 0) {
      coordinate.IdChofer = 25;
    }

    console.log(coordinate);
    try {
      const response = await axios.post(`${url}api/revicionVale`, coordinate, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      if (response.status === 200 || response.status == 201) {
        return true;
      } else {
        showToast("Error", "Error en el servidor. Intenta de nuevo.");
        return false;
      }
    } catch (error) {
      if (error.response) {
        console.error("Error al guardar datos:", error.response.data);
      } else if (error.request) {
        console.error(
          "Error al guardar datos: No se recibió respuesta del servidor",
          error.request
        );
      } else {
        console.error("Error al guardar datos:", error.message);
      }
      showToast("Error", "Error al guardar la revisión.");
      return false;
    }
  }

  btnAdd.addEventListener("click", async function () {
    if (await addCoordinate()) {
      const selectPlaca = document.getElementById("select-placa");
      const selectChofer = document.getElementById("select-chofer");
      const selectEncargado = document.getElementById("select-encargado");
      selectPlaca.disabled = true;
      selectChofer.disabled = true;
      selectEncargado.disabled = true;
      showToast("Datos Agregados", "Los datos se han guardado correctamente");
      const newIdEstado = 2;
      const valueId = document.getElementById("input-id").value;
      newStatus(valueId, newIdEstado);
      blockBtn();
    }
  });

  async function readChofer(callChofer) {
    let body, urlChofer;
    if (callChofer === 0) {
      urlChofer = "api/chofer/autorizados";
    } else {
      urlChofer = "api/chofer";
    }

    try {
      const response = await axios.get(`${url}${urlChofer}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const choferes = response.data.choferes;
      body =
        '<option selected disabled value="">Seleccione una opción</option>';
      choferes.forEach((chofer) => {
        body += `<option value="${chofer.idChofer}">${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}</option>`;
      });
      document.getElementById("select-chofer").innerHTML = body;
    } catch (error) {
      console.error("No se cargaron los datos", error);
    }
    return;
  }

  document
    .getElementById("select-placa")
    .addEventListener("change", async function () {
      const selectedValue = this.value; // Valor seleccionado

      try {
        // Petición GET a la API con el valor seleccionado
        const response = await axios.get(
          `${url}api/unidades/id/${selectedValue}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Token de autorización
            },
          }
        );

        const unidadAsignada = response.data.unidade; // Datos recibidos de la API
        console.log(unidadAsignada); // Imprimir en consola

        // Crear un nuevo optgroup para los choferes asignados
        const choferesGroup = document.createElement("optgroup");
        choferesGroup.label = "Choferes asignados";

        // Suponiendo que los datos de chofer están en unidadAsignada.choferes
        unidadAsignada.forEach((chofer) => {
          const option = document.createElement("option");
          option.value = chofer.idChofer;
          option.textContent = `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`;
          choferesGroup.appendChild(option);
        });

        // Eliminar el optgroup anterior, si existe, para no duplicar
        const existingGroup = document.querySelector(
          "#select-chofer optgroup[label='Choferes asignados']"
        );
        if (existingGroup) existingGroup.remove();

        // Añadir el nuevo grupo de choferes asignados al inicio del select
        const selectChofer = document.getElementById("select-chofer");
        selectChofer.insertBefore(choferesGroup, selectChofer.firstChild);
      } catch (error) {
        console.error("No se cargaron los datos", error); // Manejo de errores
      }
    });

  async function readManager() {
    try {
      const response = await axios.get(`${url}api/funcionarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const managers = response.data.funcionarios;
      let body =
        '<option selected disabled value="">Seleccione una opción</option>';
      managers.forEach((manager) => {
        body += `<option value="${manager.Nombre} ${manager.Apellidos}">${manager.Nombre} ${manager.Apellidos}</option>`;
      });
      document.getElementById("select-encargado").innerHTML = body;
    } catch (error) {
      console.error("No se cargaron los datos", error);
    }
  }
  async function readUnidad() {
    try {
      const response = await axios.get(`${url}api/unidades`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const unidades = response.data.unidades;
      const selectPlaca = document.getElementById("select-placa");

      // Inicializar el contenido del select con la opción predeterminada
      let body = '<option selected disabled value="">Seleccionar</option>';

      // Agregar un encabezado como opción para "Choferes asignados"
      body += "<option disabled>Choferes asignados</option>"; // Subtítulo

      // Agregar opciones de las unidades
      unidades.forEach((unidad) => {
        body += `<option value="${unidad.id}">${unidad.tipoUnidadNombre} / ${unidad.numeroUnidad}</option>`;
      });

      // Actualizar el contenido del select
      selectPlaca.innerHTML = body;
    } catch (error) {
      console.error("No se cargaron los datos", error);
    }
  }

  async function newStatus(valueId, newIdEstado) {
    try {
      const valUrl = `${url}api/vales/actualizarEstado/${valueId}/${newIdEstado}`;
      const response = await axios.put(valUrl);

      if (newIdEstado === 2) {
      } else {
        blockBtn();
      }
    } catch (error) {
      console.error("Error al actualizar el campo:", error);
      throw error;
    }
  }

  btnCancel.addEventListener("click", function () {
    event.preventDefault();
    const newIdEstado = 3;
    const valueId = document.getElementById("input-id").value;
    newStatus(valueId, newIdEstado);
    const selectPlaca = document.getElementById("select-placa");
    const selectChofer = document.getElementById("select-chofer");
    const selectEncargado = document.getElementById("select-encargado");
    selectPlaca.disabled = true;
    selectChofer.disabled = true;
    selectEncargado.disabled = true;
  });

  function blockBtn() {
    btnCancel.disabled = true;
    btnAdd.disabled = true;
    btnimprimirVale.disabled = false;
  }

  function enableBtn() {
    btnCancel.disabled = false;
    btnAdd.disabled = false;
    btnimprimirVale.disabled = true;
  }

  btnimprimirVale.addEventListener("click", async function () {
    exportarValeExcel(idVale);
  });

  async function exportarValeExcel(idVale) {
    try {
      if (!idVale) {
        showToast(
          "Error",
          "Este campo no debe estar vacio ingrese el ID del vale que desea exportar."
        );
        return;
      }

      let datosVale;
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const response = await axios.get(
          `http://localhost:18026/api/vales/exportar/vale/${idVale}`,
          { headers }
        );
        datosVale = response.data;
      } catch (apiError) {
        showToast(
          "Error",
          "No se encontró el ID del vale. Por favor, verifique el número ingresado formato 2024-01."
        );
        return;
      }

      const responseExcel = await fetch("documents/ReporteVale.xlsx");
      if (!responseExcel.ok) {
        throw new Error("No se pudo descargar el archivo Excel");
      }

      const arrayBuffer = await responseExcel.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.getWorksheet(1);
      worksheet.name = `${idVale}`;

      const valeData = datosVale.vale;
      const fechaSolicitud = valeData.Fecha_Solicitud
        ? new Date(valeData.Fecha_Solicitud).toISOString().split("T")[0]
        : "";
      const horaSalida = valeData.Hora_Salida
        ? valeData.Hora_Salida.split(":").slice(0, 2).join(":")
        : "";
      const horaEntrada = valeData.HoraFinVale
        ? valeData.HoraFinVale.split(":").slice(0, 2).join(":")
        : "";

      let destino = valeData.DescripcionDestino || valeData.NombreEbais;

      worksheet.getCell("B8:C8").value = new Date().toISOString().split("T")[0];
      worksheet.getCell("K8").value = valeData.IdUnidadProgramatica || "";
      worksheet.getCell("F7:G7:H7:I7:J7").value = valeData.NombreUnidad || "";
      worksheet.getCell("I12:J12:K12").value = valeData.Acompanante1 || "";
      worksheet.getCell("I13:J13:K13").value = valeData.Acompanante2 || "";
      worksheet.getCell("I14:J14:K14").value = valeData.Acompanante3 || "";
      worksheet.getCell("I15:J15:K15").value = valeData.Acompanante4 || "";
      worksheet.getCell("I16:J16:K16").value = valeData.Acompanante5 || "";
      worksheet.getCell("B13:C13:D13:E13:F13:G13:H13").value =
        valeData.DescripcionMotivo;
      worksheet.getCell("G17:H17:I17:J17:K17").value =
        valeData.NombreSolicitante || "";
      worksheet.getCell("H18:I18:J18:K18").value = valeData.Detalle || "";
      worksheet.getCell("G25").value = horaSalida;
      worksheet.getCell("C25:D25:E25").value = fechaSolicitud;
      worksheet.getCell("C9").value = destino || "";
      worksheet.getCell("C20").value = horaSalida;
      worksheet.getCell("C19").value = fechaSolicitud;
      worksheet.getCell("K25").value = horaEntrada || "";
      worksheet.getCell("C30").value = valeData.kilometrajeInicioVale || "";
      worksheet.getCell("G30").value = valeData.kilometrajeFinalVale || "";
      worksheet.getCell("E20").value = horaEntrada || "";
      worksheet.getCell("E19").value = fechaSolicitud;
      worksheet.getCell("I25").value = fechaSolicitud;
      worksheet.getCell("C30").value = valeData.kilometrajeInicioVale || "";
      worksheet.getCell("G26").value = valeData.EncargadoCordinador || "";
      worksheet.getCell("G28").value = valeData.NombreCompletoChofer || "";
      worksheet.getCell("K5").value = valeData.numeroUnidad || "";
      worksheet.getCell("C30").value = `${
        valeData.KilometrajeInicialViaje || ""
      } km`;
      worksheet.getCell("G30").value = `${
        valeData.KilometrajeFinalViaje || ""
      } km`;

      worksheet.getCell("K25").value = valeData.HoraFinViaje || "";
      worksheet.getCell("E20").value = valeData.HoraFinViaje || "";

      // Export the workbook
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Reporte_Vale_${idVale}.xlsx`;
      link.click();
    } catch (error) {
      console.error("Error al exportar el archivo Excel:", error);
    }
  }

  /*
//Funcion para mandar el usuario
function infoUser() {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwt_decode(token);
      return (decodedToken);
    } catch (error) {
      console.error(error);
      showToast('Error', 'Ocurrio un problema al obtener loss datos del usuario')
 
    }
 
  }
  const infoUsuario = infoUser();
  const idUsuario = infoUsuario.usuario.IdUsuario;
*/
})();
