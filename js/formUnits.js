"use strict";

(function () {
  const token = localStorage.getItem("token");
  const infoUsuario = infoUser();
  const idUsuario = infoUsuario.usuario.IdUsuario;

  if (!token) {
    window.location.href = "index.html";
  }

  const elements = {
    unitsForm: document.getElementById("unitsForm"),
    btnResourceType: document.getElementById("btnResourceType"),
    cerrarResourceType1: document.getElementById("cerrarResourceType1"),
    cerrarResourceType2: document.getElementById("cerrarResourceType2"),
    btnUnitType: document.getElementById("btnUnitType"),
    cerrarUnitType1: document.getElementById("cerrarUnitType1"),
    cerrarUnitType2: document.getElementById("cerrarUnitType2"),
    cleanButton: document.getElementById("clean-button"),
    unitNumber: document.getElementById("unitNumber"),
    unitType: document.getElementById("unitType"),
    capacityChairs: document.getElementById("capacityChairs"),
    capacityBeds: document.getElementById("capacityBeds"),
    advance: document.getElementById("advance"),
    assignedDriver: document.getElementById("assignedDriver"),
    resourceType: document.getElementById("resourceType"),
    addResource: document.getElementById("addResource"),
    addUnit: document.getElementById("addUnit"),
    addCapacity: document.getElementById("addCapacity"),
    status: document.getElementById("status"),
    dekraDate: document.getElementById("dekraDate"),
    maintenanceMileage: document.getElementById("maintenanceMileage"),
    periodicity: document.getElementById("periodicity"),
    initialMileage: document.getElementById("initialMileage"),
    currentMileage: document.getElementById("currentMileage"),
    totalCapacity: document.getElementById("totalCapacity"),
  };

  elements.unitsForm.addEventListener("submit", handleFormSubmit);
  elements.btnResourceType.addEventListener("click", handleResourceType);
  elements.btnUnitType.addEventListener("click", handleUnitType);
  elements.cleanButton.addEventListener("click", handleCleanButton);
  elements.unitNumber.addEventListener("blur", handleUnitNumberBlur);
  elements.unitType.addEventListener("change", updateCapacity);
  elements.capacityChairs.addEventListener("input", updateCapacity);
  elements.capacityBeds.addEventListener("input", updateCapacity);

  elements.advance.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "").concat("%");
  });

  elements.advance.addEventListener("focus", function () {
    const value = this.value.replace("%", "");
    this.value = value + "%";
    this.setSelectionRange(0, value.length);
  });

  elements.advance.addEventListener("blur", function () {
    const value = this.value.replace("%", "");
    this.value = value ? value + "%" : "";
  });

  function handleFormSubmit(event) {
    event.preventDefault();
    const { id } = event.submitter;
    if (id === "submit-unit-button") {
      postUnit();
    } else if (id === "update-unit-button") {
      putUnit();
    } else if (id === "delete-unit-button") {
      deleteUnit();
    }
  }

  function handleResourceType(event) {
    event.preventDefault();
    postResourceType();
  }

  function handleUnitType(event) {
    event.preventDefault();
    postUnitType();
  }

  function handleCleanButton(event) {
    event.preventDefault();
    clearForm();
  }

  function handleUnitNumberBlur(event) {
    event.preventDefault();
    getUnit();
  }

  function clearForm() {
    elements.unitsForm.reset();
    elements.unitType.selectedIndex = 0;
    elements.resourceType.selectedIndex = 0;
    elements.assignedDriver.selectedIndex = 0;
    elements.unitNumber.disabled = false;
    elements.unitType.disabled = false;
    elements.resourceType.disabled = false;
    elements.initialMileage.disabled = false;
    elements.cleanButton.style.display = "none";
    document.getElementById("update-unit-button").disabled = true;
    document.getElementById("submit-unit-button").disabled = false;
    document.getElementById("delete-unit-button").disabled = true;
    elements.capacityBeds.disabled = false;
  }

  function populateSelect(
    selectElement,
    items,
    defaultOptionText,
    textCallback,
    valueCallback,
    filterCallback
  ) {
    selectElement.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.textContent = defaultOptionText;
    defaultOption.value = "";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    selectElement.appendChild(defaultOption);

    items.filter(filterCallback || (() => true)).forEach((item) => {
      const option = document.createElement("option");
      option.textContent = textCallback(item);
      option.value = valueCallback(item);
      selectElement.appendChild(option);
    });
  }

  function getUnitDataFromForm() {
    return {
      numeroUnidad: elements.unitNumber.value.toUpperCase(),
      idTipoUnidad: parseInt(elements.unitType.value, 10),
      idTipoRecurso: parseInt(elements.resourceType.value, 10),
      choferDesignado: parseInt(elements.assignedDriver.value, 10),
      kilometrajeInicial: parseInt(elements.initialMileage.value, 10),
      kilometrajeActual: parseInt(elements.currentMileage.value, 10),
      capacidadSillas: parseInt(elements.capacityChairs.value, 10),
      capacidadCamas: parseInt(elements.capacityBeds.value, 10),
      capacidadTotal: parseInt(elements.totalCapacity.value, 10),
      fechaDekra: new Date(elements.dekraDate.value)
        .toISOString()
        .split("T")[0],
      idEstado: elements.status.value,
      tipoFrecuenciaCambio: null,
      ultimoMantenimientoFecha: null,
      ultimoMantenimientoKilometraje: elements.maintenanceMileage.value,
      valorFrecuenciaC: elements.periodicity.value,
      adelanto: getAdvanceValue(),
      usuario: idUsuario,
    };
  }

  function populateForm(unidad) {
    elements.unitNumber.value = unidad.numeroUnidad;
    elements.unitType.value = unidad.idTipoUnidad;
    elements.resourceType.value = unidad.idTipoRecurso;
    elements.assignedDriver.value = unidad.choferDesignado;
    elements.initialMileage.value = unidad.kilometrajeInicial;
    elements.currentMileage.value = unidad.kilometrajeActual;
    elements.capacityChairs.value = unidad.capacidadSillas;
    elements.capacityBeds.value = unidad.capacidadCamas;
    elements.totalCapacity.value = unidad.capacidadTotal;
    elements.dekraDate.value = new Date(unidad.fechaDekra)
      .toISOString()
      .split("T")[0];
    elements.status.value = unidad.idEstado;
    elements.maintenanceMileage.value = unidad.ultimoMantenimientoKilometraje;
    elements.periodicity.value = unidad.valorFrecuenciaC;
    elements.advance.value = unidad.adelanto ? unidad.adelanto + "%" : "";
  }

  async function updateCapacity() {
    const unitTypes = await getUnitType();
    const selectedOption =
      elements.unitType.options[elements.unitType.selectedIndex].text;
    const capacityChairs = parseInt(elements.capacityChairs.value, 10) || 0;
    const capacityBeds = parseInt(elements.capacityBeds.value, 10) || 0;

    const selectedUnitType = unitTypes.find(
      (unit) => unit.tipo === selectedOption
    );
    const totalCapacity = selectedUnitType
      ? capacityChairs + capacityBeds * 2
      : 0;

    elements.totalCapacity.value = totalCapacity;
  }

  function getAdvanceValue() {
    const advanceInput = elements.advance.value;
    return parseInt(advanceInput.replace("%", ""), 10);
  }

  async function getDrivers() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:18026/api/chofer", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const choferes = response.data.choferes;
      choferes.sort((a, b) => {
        const nameA = `${a.nombre} ${a.apellido1} ${a.apellido2}`.toUpperCase();
        const nameB = `${b.nombre} ${b.apellido1} ${b.apellido2}`.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      populateSelect(
        elements.assignedDriver,
        choferes,
        "Seleccionar chofer",
        (chofer) => `${chofer.nombre} ${chofer.apellido1} ${chofer.apellido2}`,
        (chofer) => chofer.idChofer,
        (chofer) => chofer.estadoChofer === "Activo"
      );
    } catch (error) {
      showToast("Error", "Error al obtener los choferes.");
    }
  }

  async function getResourceTypeSelect() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:18026/api/tiporecurso",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tiposRecurso = response.data.tiporecurso;
      populateSelect(
        elements.resourceType,
        tiposRecurso,
        "Seleccionar tipo de recurso",
        (recurso) => recurso.recurso,
        (recurso) => recurso.idTipoRecurso
      );
    } catch (error) {
      showToast("Error", "Error al obtener los tipos de recurso.");
    }
  }

  async function getUnitTypeSelect() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:18026/api/tipounidad",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tiposUnidad = response.data.tipounidad;
      populateSelect(
        elements.unitType,
        tiposUnidad,
        "Seleccionar tipo de unidad",
        (unidad) => unidad.tipo,
        (unidad) => unidad.idTipoUnidad
      );
    } catch (error) {
      showToast("Error", "Error al obtener los tipos de unidad.");
    }
  }

  async function getUnits() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:18026/api/unidades", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.unidades;
    } catch (error) {
      showToast("Error", "Error al obtener las unidades.");
      return [];
    }
  }

  async function getUnitType() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:18026/api/tipoUnidad",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.tipounidad;
    } catch (error) {
      showToast("Error", "Error al obtener el tipo de unidad.");
    }
  }

  async function getUnit() {
    const unitNumber = elements.unitNumber.value.toUpperCase();
    if (!unitNumber) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:18026/api/unidades/${unitNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const unidad = response.data.unidades.find(
        (unidad) => unidad.numeroUnidad === unitNumber
      );
      if (unidad && unidad.idEstado !== 5) {
        populateForm(unidad);
        elements.unitNumber.disabled = true;
        elements.unitType.disabled = true;
        elements.resourceType.disabled = true;
        elements.initialMileage.disabled = true;
        elements.cleanButton.style.display = "inline-block";
        document.getElementById("update-unit-button").disabled = false;
        document.getElementById("submit-unit-button").disabled = true;
        document.getElementById("delete-unit-button").disabled = false;
        elements.capacityBeds.disabled = false;
      }
    } catch (error) {
      clearForm();
      showToast("Error", "Error al obtener los datos de la unidad.");
    }
  }

  async function postUnit() {
    const data = getUnitDataFromForm();

    if (await validateForm(data)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:18026/api/unidades", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showToast(
        "Éxito",
        `La unidad "${data.numeroUnidad}" ha sido registrada exitosamente.`
      );
      clearForm();
    } catch (error) {
      showToast("Error", "Error al registrar la unidad.");
    }
  }

  async function putUnit() {
    const data = getUnitDataFromForm();
    const unitNumber = elements.unitNumber.value.toUpperCase();

    if (await validateForm(data)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:18026/api/unidades/${unitNumber}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showToast(
        "Éxito",
        `La unidad "${unitNumber}" ha sido actualizada exsitosamente.`
      );
      clearForm();
    } catch (error) {
      showToast("Error", "Error al actualizar la unidad.");
    }
  }

  async function deleteUnit() {
    const data = getUnitDataFromForm();
    const unitNumber = elements.unitNumber.value.toUpperCase();

    const confirmationMessage = document.getElementById(
      "deleteConfirmationMessage"
    );
    confirmationMessage.innerText = `¿Está seguro que desea eliminar la unidad "${unitNumber}"?`;

    const deleteModal = new bootstrap.Modal(
      document.getElementById("deleteUnitModal")
    );
    deleteModal.show();

    document.getElementById("confirmDelete").onclick = async function () {
      try {
        const token = localStorage.getItem("token");
        data.idEstado = 5;
        await axios.put(
          `http://localhost:18026/api/unidades/${unitNumber}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        showToast(
          "Éxito",
          `La unidad "${unitNumber}" ha sido eliminada exitosamente.`
        );
        clearForm();
        deleteModal.hide();
      } catch (error) {
        showToast("Error", "Error al eliminar la unidad.");
      }
    };
  }

  async function checkResourceType(tipoRecurso) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:18026/api/tiporecurso",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tiposRecurso = response.data.tiporecurso;
      return tiposRecurso.some((recurso) => recurso.recurso === tipoRecurso);
    } catch (error) {
      showToast("Error", "Error al verificar el tipo de recurso.");
      return false;
    }
  }

  async function postResourceType() {
    const data = { recurso: elements.addResource.value.toUpperCase() };
    const recursoExistente = await checkResourceType(data.recurso);

    if (data.recurso === "") {
      showToast("Error", "El campo no puede estar vacío.");
      return;
    }

    if (recursoExistente) {
      showToast(
        "Error",
        `El tipo de recurso "${data.recurso}" ya se encuentra registrado.`
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:18026/api/tiporecurso", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showToast(
        "Éxito",
        `El tipo de recurso "${data.recurso}" ha sido registrado exitosamente.`
      );
      getResourceTypeSelect();
      $("#addResourceModal").modal("hide");
      elements.addResource.value = "";
    } catch (error) {
      showToast("Error", "Error al registrar el tipo de recurso.");
    }
  }

  async function checkUnitType(tipoUnidad) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:18026/api/tipounidad",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tiposUnidad = response.data.tipounidad;
      return tiposUnidad.some((unidad) => unidad.tipo === tipoUnidad);
    } catch (error) {
      showToast("Error", "Error al verificar el tipo de unidad.");
      return false;
    }
  }

  async function postUnitType() {
    const data = {
      tipo: elements.addUnit.value.toUpperCase(),
      capacidad: elements.addCapacity.value,
    };
    const unidadExistente = await checkUnitType(data.tipo);

    if (data.tipo === "" || data.capacidad === "") {
      showToast("Error", "Los campos no pueden estar vacíos.");
      return;
    }

    if (unidadExistente) {
      showToast(
        "Error",
        `El tipo de unidad "${data.tipo}" ya se encuentra registrado.`
      );
      return;
    }

    if (data.capacidad < 1) {
      showToast("Error", "La capacidad de la unidad debe ser mayor que 0.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:18026/api/tipounidad", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showToast(
        "Éxito",
        `El tipo de unidad "${data.tipo}" ha sido registrado exitosamente.`
      );
      getUnitTypeSelect();
      $("#addUnitModal").modal("hide");
      elements.addUnit.value = "";
      elements.addCapacity.value = "";
    } catch (error) {
      showToast("Error", "Error al registrar el tipo de unidad.");
    }
  }

  async function validateForm(data) {
    const unidades = await getUnits();
    const unidadYChofer = unidades.find(
      (unidad) => unidad.choferDesignado === data.choferDesignado
    );
    const selectedChofer =
      elements.assignedDriver.options[elements.assignedDriver.selectedIndex]
        .text;
    const unitTypes = await getUnitType();
    const selectedOption =
      elements.unitType.options[elements.unitType.selectedIndex].text;
    const selectedUnitType = unitTypes.find(
      (unit) => unit.tipo === selectedOption
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (unidadYChofer && unidadYChofer.numeroUnidad !== data.numeroUnidad) {
      showToast(
        "Error",
        `El chofer "${selectedChofer}" ya está asignado a otra unidad.`
      );
      return true;
    }

    if (data.kilometrajeActual < data.kilometrajeInicial) {
      showToast(
        "Error",
        "El kilometraje actual no puede ser inferior al kilometraje inicial."
      );
      return true;
    }

    if (selectedUnitType && data.capacidadTotal > selectedUnitType.capacidad) {
      showToast(
        "Error",
        `La capacidad total de una unidad de tipo "${selectedOption}" no puede ser mayor que ${selectedUnitType.capacidad}.`
      );
      return true;
    }

    if (
      data.ultimoMantenimientoKilometraje !== null &&
      data.ultimoMantenimientoKilometraje > data.kilometrajeActual
    ) {
      showToast(
        "Error",
        "El último kilometraje de mantenimiento no puede ser superior al kilometraje actual."
      );
      return true;
    }

    if (data.adelanto < 20) {
      showToast(
        "Error",
        "El adelanto del mantenimiento no puede ser inferior al 20%."
      );
      return true;
    }

    if (new Date(data.fechaDekra) < today) {
      showToast(
        "Error",
        "La fecha de DEKRA no puede ser anterior a la fecha de hoy."
      );
      return true;
    }

    return false;
  }

  getDrivers();
  getResourceTypeSelect();
  getUnitTypeSelect();
})();
