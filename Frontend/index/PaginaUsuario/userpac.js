// 🔌 IMPORTANTE: conexión a Supabase
import { supabase } from "/Frontend/js/supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const lista = document.getElementById("listaCitas");

    if (lista) {
        lista.innerHTML = "<p data-i18n='cargando'>Cargando citas...</p>";
    }

    // 🔐 OBTENER USUARIO LOGUEADO
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        window.location.href = "/Frontend/index/inicio.html";
        return;
    }

    // 🔌 CONEXIÓN REAL CON SUPABASE
    const { data, error } = await supabase
        .from("Citas")
        .select(`
            *,
            servicios:servicio_id ( nombre, imagen_url )
        `)
        .eq("usuario_id", user.id) // Ajusta si tu columna se llama user_id
        .order("fecha_hora", { ascending: true });

    if (error) {
        console.error(error);
        lista.innerHTML = "<p data-i18n='error_carga_citas'>Error cargando citas</p>";
        return;
    }

    renderizarCitas(data);
});

// Renderizado con Soporte Multilingüe
const renderizarCitas = (citas) => {
    const lista = document.getElementById("listaCitas");
    if (!lista) return;

    lista.innerHTML = "";

    if (!citas || citas.length === 0) {
        lista.innerHTML = "<p data-i18n='sin_citas'>No tienes citas registradas</p>";
        return;
    }

    citas.forEach(cita => {
        // Obtenemos el nombre del servicio (de la relación con la tabla servicios)
        const sNombre = cita.servicios?.nombre || "Servicio";
        
        // Creamos la llave para el diccionario (ej: "nombre_limpieza_dental")
        const idIdioma = sNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
        
        // Manejo de fecha y hora desde el campo fecha_hora de la BD
        const fechaObj = new Date(cita.fecha_hora);
        const fLabel = fechaObj.toLocaleDateString();
        const hLabel = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const estadoCita = cita.estado || "pendiente";

        const card = document.createElement("div");
        card.classList.add("cita-card");

        card.innerHTML = `
            <h3 data-i18n="nombre_${idIdioma}">${sNombre}</h3>
            <p><strong data-i18n="fecha_label">Fecha:</strong> ${fLabel}</p>
            <p><strong data-i18n="hora_label">Hora:</strong> ${hLabel}</p>
            <p class="estado ${estadoCita}">
                <span data-i18n="estado_${estadoCita.toLowerCase()}">${estadoCita.toUpperCase()}</span>
            </p>
        `;

        lista.appendChild(card);
    });

    // 🌍 DISPARAR TRADUCCIÓN después de crear las tarjetas
    if (typeof window.traducirPagina === 'function') {
        window.traducirPagina();
    }
};