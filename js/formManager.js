(function () {
  const token = localStorage.getItem("token");
  var url = "http://localhost:18026/";
  const btnAdd = document.getElementById("btnGuardar");
  const btnRead = document.getElementById("btnBuscar");
  const btnUpdate = document.getElementById("btnActualizar");
  const btnClear = document.getElementById("btnClear");
  const btnDelete = document.getElementById("btnEliminar");

  async function addManager() {
    exists = false;
    ced = document.getElementById("id").value;
    nombre = document.getElementById("nombre").value;
    apellidos = document.getElementById("apellidos").value;
    cargo = document.getElementById("cargo").value;
    contacto = document.getElementById("contacto").value;
    email = document.getElementById("email").value;

    const response2 = await axios.get(`${url}api/funcionarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const managers = response2.data.funcionarios;
    managers.forEach((manager) => {
      if (manager.Cedula == ced) {
        exists = true;
      }
    });
    if (exists == false) {
      if (
        ced !== null &&
        ced !== "" &&
        nombre !== null &&
        nombre !== "" &&
        apellidos !== null &&
        apellidos !== "" &&
        cargo !== null &&
        cargo !== "" &&
        contacto !== null &&
        contacto !== "" &&
        email !== null &&
        email !== ""
      ) {
        try {
          const manager = {
            Cedula: ced,
            Nombre: nombre,
            Apellidos: apellidos,
            Cargo: cargo,
            Contacto: contacto,
            Correo: email,
          };
          const response = await axios.post(`${url}api/funcionarios`, manager, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          showToast("Éxito", "Encargado guardado con éxito.");
          return true;
        } catch (error) {
          console.error(
            "Error al guardar datos:",
            error.response ? error.response.data : error.message
          );
          showToast("Error", "Error al guardar el encargado.");
          return false;
        }
      } else {
        showToast("Error", "Completa la información necesaria");
      }
    } else {
      showToast("Error", "Cedula ya existente");
    }
  }

  async function readManager() {
    id = document.getElementById("id").value;
    if (id) {
      try {
        const response = await axios.get(`${url}api/funcionarios`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const managers = response.data.funcionarios;
        managers.forEach((manager) => {
          if (manager.Cedula == id) {
            document.getElementById("nombre").value = manager.Nombre;
            document.getElementById("apellidos").value = manager.Apellidos;
            document.getElementById("cargo").value = manager.Cargo;
            document.getElementById("contacto").value = manager.Contacto;
            document.getElementById("email").value = manager.Correo;
            return true;
          }
        });
      } catch (error) {
        console.error(
          "Error al buscar datos",
          error.response ? error.response.data : error.message
        );
        showToast("Error", "Error al buscar el encargado.");
        return false;
      }
    } else {
      showToast(
        "Error al buscar",
        "Digite el numero de cédula para buscar el encargado"
      );
    }
  }

  async function deleteManager() {
    const id = document.getElementById("id").value;
    let exists = false;
    if (id) {
      try {
        const response2 = await axios.get(`${url}api/funcionarios`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const managers = response2.data.funcionarios;
        managers.forEach((manager) => {
          if (manager.Cedula == id) {
            exists = true;
          }
        });
        if (exists) {
          const response = await axios.delete(
            `${url}api/funcionarios/cedula/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          document.getElementById("id").value = "";
          document.getElementById("nombre").value = "";
          document.getElementById("apellidos").value = "";
          document.getElementById("cargo").value = "";
          document.getElementById("contacto").value = "";
          document.getElementById("email").value = "";
          showToast("Éxito", "Encargado eliminado con éxito.");
        } else {
          showToast("Error", "Encargado no encontrado.");
        }
      } catch (error) {
        console.error(
          "Error al eliminar encargado:",
          error.response ? error.response.data : error.message
        );
        showToast("Error", "Error al eliminar el encargado.");
        return false;
      }
    } else {
      showToast(
        "Error",
        "Digite el número de cédula para buscar el encargado."
      );
    }
  }

  async function updateManager() {
    const ced = document.getElementById("id").value;
    const nombre = document.getElementById("nombre").value;
    const apellidos = document.getElementById("apellidos").value;
    const cargo = document.getElementById("cargo").value;
    const contacto = document.getElementById("contacto").value;
    const email = document.getElementById("email").value;

    if (ced && nombre && apellidos && cargo && contacto && email) {
      try {
        const manager = {
          Cedula: ced,
          Nombre: nombre,
          Apellidos: apellidos,
          Cargo: cargo,
          Contacto: contacto,
          Correo: email,
        };
        const response = await axios.put(
          `${url}api/funcionarios/cedula/${ced}`,
          manager,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        showToast("Éxito", "Encargado actualizado con éxito.");
        return true;
      } catch (error) {
        console.error(
          "Error al actualizar datos:",
          error.response ? error.response.data : error.message
        );
        console.error(
          "Detalles del error:",
          error.response ? error.response : error
        );
        showToast("Error", "Error al actualizar el encargado.");
        return false;
      }
    } else {
      showToast("Error", "Completa la información necesaria");
    }
  }

  btnAdd.addEventListener("click", function () {
    addManager();
  });

  btnRead.addEventListener("click", function () {
    event.preventDefault();
    readManager();
  });

  btnUpdate.addEventListener("click", function () {
    event.preventDefault();
    updateManager();
  });

  btnClear.addEventListener("click", function () {
    event.preventDefault();
    document.getElementById("id").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("apellidos").value = "";
    document.getElementById("cargo").value = "";
    document.getElementById("contacto").value = "";
    document.getElementById("email").value = "";
  });

  btnDelete.addEventListener("click", function () {
    event.preventDefault();
    deleteManager();
  });
})();
