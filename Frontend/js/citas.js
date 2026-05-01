import { supabase } from "../../Database/supabaseClient.js";

// 🔥 Cambia esto a true si quieres ver TODAS las citas (debug)
const DEBUG_VER_TODAS = true;

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const nombreProducto = urlParams.get('servicio');

    if (nombreProducto) {
        const texto = document.getElementById("servicioSeleccionado");
        const input = document.getElementById("servicio");

        if (texto) texto.innerText = "Servicio: " + nombreProducto;
        if (input) input.value = nombreProducto;
    }

    const form = document.getElementById("formCita");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // 1. Obtener usuario autenticado
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Debes iniciar sesión para agendar una cita");
                return;
            }

            let servicioNombre = document.getElementById("servicio")?.value;
            let fecha = document.getElementById("fecha")?.value;
            let hora = document.getElementById("hora")?.value;

            if (!servicioNombre || !fecha || !hora) {
                alert("Por favor, completa todos los campos");
                return;
            }

            // 2. BUSCAR EL ID DEL SERVICIO (Traducción de texto a número)
            const { data: servicioData, error: errorServicio } = await supabase
                .from("servicios")
                .select("id")
                .ilike("nombre", `%${servicioNombre}%`)
                .single();

            if (errorServicio || !servicioData) {
                console.error("Servicio no encontrado:", errorServicio);
                alert("Error: No se pudo encontrar el ID del servicio '" + servicioNombre + "'");
                return;
            }

            const servicioIdReal = servicioData.id;
            let fechaHora = new Date(`${fecha}T${hora}`).toISOString();

            // 3. VERIFICAR DISPONIBILIDAD
            const { data: existentes, error: errorDispo } = await supabase
                .from("Citas")
                .select("id")
                .eq("fecha_hora", fechaHora);

            if (errorDispo) {
                console.error("Error disponibilidad:", errorDispo);
                alert("Error al verificar disponibilidad: " + errorDispo.message);
                return;
            }

            if (existentes.length > 0) {
                alert("Lo sentimos, este horario ya está ocupado");
                return;
            }

            // 4. ✅ INSERTAR (Con diagnóstico de errores detallado)
            const { error: errorInsert } = await supabase
                .from("Citas")
                .insert([{
                    servicio_id: servicioIdReal, 
                    fecha_hora: fechaHora,
                    usuario_id: user.id 
                }]);

            if (errorInsert) {
                console.error("Error detallado de Supabase:", errorInsert);
                // Esta alerta nos dirá el motivo real (RLS, columna inexistente, etc.)
                alert("Error de Base de Datos: " + errorInsert.message + " (Código: " + errorInsert.code + ")");
                return;
            }

            alert("¡Cita creada correctamente!");
            form.reset();
            mostrarHistorial();
        });
    }

    mostrarHistorial();
});

// --- FUNCIONES DE HISTORIAL Y GESTIÓN (Mantenidas intactas) ---

async function mostrarHistorial() {
    let lista = document.getElementById("listaCitas");
    if (!lista) return;

    lista.innerHTML = "Cargando...";

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !DEBUG_VER_TODAS) {
        lista.innerHTML = "Debes iniciar sesión para ver tus citas";
        return;
    }

    let query = supabase.from("Citas").select("*");

    if (!DEBUG_VER_TODAS && user) {
        query = query.eq("usuario_id", user.id); 
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetch:", error);
        lista.innerHTML = "Error cargando citas";
        return;
    }

    if (!data || data.length === 0) {
        lista.innerHTML = "No tienes citas agendadas";
        return;
    }

    lista.innerHTML = "";

    data.forEach((cita) => {
        if (!cita) return;

        let articulo = document.createElement("article");
        articulo.className = "cita-item";
        articulo.style = "border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 8px;";

        articulo.innerHTML = `
            <p><strong>ID Cita:</strong> ${cita.id}</p>
            <p><strong>Fecha y Hora:</strong> ${
                cita.fecha_hora
                    ? new Date(cita.fecha_hora).toLocaleString()
                    : "Sin fecha"
            }</p>
            <button onclick="cancelarCita(${cita.id})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Cancelar</button>
            <button onclick="actualizarCita(${cita.id})" style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px;">Editar</button>
        `;

        lista.appendChild(articulo);
    });
}

window.cancelarCita = async (id) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;

    const { error } = await supabase
        .from("Citas")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error delete:", error);
        alert("Error al eliminar la cita");
        return;
    }

    mostrarHistorial();
};

window.actualizarCita = async (id) => {
    const nuevaFecha = prompt("Ingresa la nueva fecha y hora (Formato: YYYY-MM-DD HH:MM)");
    if (!nuevaFecha) return;

    try {
        const fechaISO = new Date(nuevaFecha).toISOString();

        const { error } = await supabase
            .from("Citas")
            .update({ fecha_hora: fechaISO })
            .eq("id", id);

        if (error) {
            console.error("Error update:", error);
            alert("Error al actualizar la cita");
            return;
        }

        mostrarHistorial();
    } catch (e) {
        alert("El formato de fecha no es válido. Usa: YYYY-MM-DD HH:MM");
    }
};