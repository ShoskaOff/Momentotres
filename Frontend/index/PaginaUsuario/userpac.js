// 🔌 IMPORTANTE: conexión a Supabase
// 👉 Aquí va tu import real cuando lo conecten
// import { supabase } from "../../Database/supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {

    const lista = document.getElementById("listaCitas");

    lista.innerHTML = "<p data-i18n='cargando_citas'>Cargando citas...</p>";

    // 🔐 ESPACIO PARA LOGIN
    // 👉 Aquí luego deben traer el usuario logueado
    /*
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "/Frontend/index/inicio.html";
        return;
    }
    */

    // 🔴 TEMPORAL (simulación mientras backend está listo)
    const citasSimuladas = [
        {
            servicio: "Limpieza dental",
            fecha: "2026-05-01",
            hora: "10:00 AM",
            estado: "pendiente"
        },
        {
            servicio: "Ortodoncia",
            fecha: "2026-05-03",
            hora: "2:00 PM",
            estado: "confirmada"
        }
    ];

    renderizarCitas(citasSimuladas);


    // 🔌 CONEXIÓN REAL (cuando usen Supabase)
    /*
    const { data, error } = await supabase
        .from("Citas")
        .select(`
            *,
            Servicio(nombre)
        `)
        .eq("user_id", user.id);

    if (error) {
        console.error(error);
        lista.innerHTML = "<p>Error cargando citas</p>";
        return;
    }

    renderizarCitas(data);
    */
});


// Renderizado
const renderizarCitas = (citas) => {
    const lista = document.getElementById("listaCitas");

    lista.innerHTML = "";

    if (!citas || citas.length === 0) {
        lista.innerHTML = "<p data-i18n='sin_citas'>No tienes citas registradas</p>";
        return;
    }

    citas.forEach(cita => {
        const card = document.createElement("div");
        card.classList.add("cita-card");

        card.innerHTML = `
            <h3>${cita.servicio || cita.Servicio?.nombre}</h3>
            <p><strong data-i18n="cita_fecha">Fecha:</strong> ${cita.fecha}</p>
            <p><strong data-i18n="cita_hora">Hora:</strong> ${cita.hora}</p>
            <p class="estado ${cita.estado || "pendiente"}" data-i18n="estado_${cita.estado || "pendiente"}">
                ${(cita.estado || "pendiente").toUpperCase()}
            </p>
        `;

        lista.appendChild(card);
    });

    // Añadimos la ejecución de la traducción al final sin alterar la estructura
    if (typeof traducirPagina === "function") {
        traducirPagina();
    }
};