import { supabase } from "../../Database/supabaseClient.js";

// Ruta base para las imágenes de los servicios en tu historial
const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Carpeta%20Servicios/";

document.addEventListener("DOMContentLoaded", async () => {
    // 1. CAPTURAR EL SERVICIO DE LA URL (Ej: ?servicio=Sellantes)
    const urlParams = new URLSearchParams(window.location.search);
    let nombreProducto = urlParams.get('servicio');
    const idioma = localStorage.getItem("idiomaSeleccionado") || "es";

    const textoAzul = document.getElementById("servicioSeleccionado"); // El h2/p visual
    const inputOculto = document.getElementById("servicio");           // El input del form

    // ✅ VALIDACIÓN PARA EVITAR EL "null"
    if (nombreProducto && nombreProducto !== "null" && nombreProducto !== "undefined") {
        const prefijo = idioma === 'en' ? "Service: " : "Servicio: ";
        if (textoAzul) textoAzul.innerText = prefijo + nombreProducto;
        if (inputOculto) inputOculto.value = nombreProducto;
    }

    // 2. LÓGICA DEL FORMULARIO DE AGENDAMIENTO
    const form = document.getElementById("formCita");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const currentLang = localStorage.getItem("idiomaSeleccionado") || 'es';

            // Verificar si el usuario está logueado
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert(currentLang === 'en' ? "Please log in first" : "Debes iniciar sesión para agendar");
                return;
            }

            const servicioNombre = document.getElementById("servicio")?.value;
            const fecha = document.getElementById("fecha")?.value;
            const hora = document.getElementById("hora")?.value;

            if (!servicioNombre || !fecha || !hora) {
                alert(currentLang === 'en' ? "Complete all fields" : "Completa todos los campos");
                return;
            }

            // Buscar el ID del servicio en la tabla 'servicios' usando el nombre
            const { data: sData, error: sError } = await supabase
                .from("servicios")
                .select("id")
                .ilike("nombre", `%${servicioNombre}%`)
                .single();

            if (sError || !sData) {
                alert(currentLang === 'en' ? "Service not found" : "Servicio no encontrado");
                return;
            }

            // Insertar la nueva cita
            const { error: errorInsert } = await supabase
                .from("Citas")
                .insert([{
                    servicio_id: sData.id, 
                    fecha_hora: new Date(`${fecha}T${hora}`).toISOString(),
                    usuario_id: user.id 
                }]);

            if (errorInsert) {
                alert("Error: " + errorInsert.message);
            } else {
                alert(currentLang === 'en' ? "Appointment scheduled!" : "¡Cita agendada con éxito!");
                form.reset();
                window.mostrarHistorial(); // Refrescar la lista de abajo
            }
        });
    }

    // Cargar el historial al entrar a la página
    window.mostrarHistorial();
});

// 3. FUNCIÓN PARA MOSTRAR EL HISTORIAL
window.mostrarHistorial = async function() {
    const lista = document.getElementById("listaCitas");
    if (!lista) return;

    const currentLang = localStorage.getItem("idiomaSeleccionado") || 'es';
    lista.innerHTML = `<p style="color:white; text-align:center;">${currentLang === 'en' ? 'Loading...' : 'Cargando...'}</p>`;

    const { data, error } = await supabase
        .from("Citas")
        .select(`
            *,
            paciente:Usuarios!Citas_usuario_id_fkey1 (nombre),
            servicio:servicios (nombre, imagen_url)
        `) 
        .order('fecha_hora', { ascending: true });

    if (error) {
        console.error("Error en historial:", error);
        return;
    }

    lista.innerHTML = "";
    if (data.length === 0) {
        lista.innerHTML = `<p style="color:white; text-align:center;">${currentLang === 'en' ? 'No appointments' : 'No tienes citas'}</p>`;
        return;
    }

    data.forEach((cita) => {
        const infoServicio = cita.servicio || {};
        const nombreServicio = infoServicio.nombre || "Tratamiento";
        const imgPath = infoServicio.imagen_url ? URL_BASE_STORAGE + infoServicio.imagen_url : "/Media/Logo.png";

        const articulo = document.createElement("article");
        articulo.style = "display: flex; gap: 20px; align-items: center; padding: 15px; background: white; border-radius: 12px; margin-bottom: 15px; color: #333; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";

        articulo.innerHTML = `
            <img src="${imgPath}" alt="${nombreServicio}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;" onerror="this.src='/Media/Logo.png';">
            <div style="flex-grow: 1;">
                <h3 style="margin:0; color:#2196F3;" data-i18n-dinamico>${nombreServicio}</h3>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(cita.fecha_hora).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Hora:</strong> ${new Date(cita.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <button onclick="cancelarCita(${cita.id})" style="background:#e74c3c; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-weight:bold;">
                Eliminar
            </button>
        `;
        lista.appendChild(articulo);
    });

    if (window.traducirPagina) window.traducirPagina();
};

// 4. FUNCIÓN PARA ELIMINAR CITA
window.cancelarCita = async (id) => {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta cita?");
    if (!confirmacion) return;

    const { error } = await supabase.from("Citas").delete().eq("id", id);
    if (!error) {
        window.mostrarHistorial();
    } else {
        alert("Error al eliminar: " + error.message);
    }
};