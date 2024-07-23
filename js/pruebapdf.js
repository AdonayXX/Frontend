

    fetch("https://backend-transporteccss.onrender.com/api/cita", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("La solicitud a la API no fue exitosa");
        }
        return response.json();
    })
    .then((data) => {
        if (!data || !Array.isArray(data)) {
            throw new Error("Los datos recibidos de la API no son válidos");
        }

        // Dividir los datos en partes
        const firstPageData = data.slice(0, 3);
        const subsequentPagesData = data.slice(3);

    // Simula un click en el enlace para iniciar la descarga
    a.click();
});
