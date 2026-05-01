import { supabase } from "../../Database/supabaseClient.js";

// 🔥 Cambia esto a true si quieres ver TODAS las citas (debug)
const DEBUG_VER_TODAS = true;

document.addEventListener("DOMContentLoaded", () => {
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

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("Debes iniciar sesión");
                return;
            }

            let servicioVal = document.getElementById("servicio")?.value;
            let fecha = document.getElementById("fecha")?.value;
            let hora = document.getElementById("hora")?.value;

            if (!servicioVal || !fecha || !hora) {
                alert("Completa todos los campos");
                return;
            }

            let fechaHora = new Date(`${fecha}T${hora}`).toISOString();

            // 🔍 Verificar disponibilidad usando 'id' (Nombre actual en image_815088.png)
            const { data: existentes, error: errorDispo } = await supabase
                .from("Citas")
                .select("id")
                .eq("fecha_hora", fechaHora);

            if (errorDispo) {
                console.error("Error disponibilidad:", errorDispo);
                alert("Error al verificar disponibilidad");
                return;
            }

            if (existentes.length > 0) {
                alert("Horario ocupado");
                return;
            }

            // ✅ INSERTAR
            const { error } = await supabase
                .from("Citas")
                .insert([{
                    servicio_id: parseInt(servicioVal),
                    fecha_hora: fechaHora,
                    usuario_id: user.id 
                }]);

            if (error) {
                console.error("Error insert:", error);
                alert("Error al guardar");
                return;
            }

            alert("Cita creada correctamente");
            form.reset();
            mostrarHistorial();
        });
    }

    mostrarHistorial();
});

// 🔥 HISTORIAL (CORREGIDO)
async function mostrarHistorial() {
    let lista = document.getElementById("listaCitas");
    if (!lista) return;

    lista.innerHTML = "Cargando...";

    // 1. Intentamos obtener al usuario
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Si no hay usuario y no estamos en modo debug, detenemos todo
    if (!user && !DEBUG_VER_TODAS) {
        lista.innerHTML = "Debes iniciar sesión";
        return;
    }

    // 3. Preparamos la consulta base
    let query = supabase.from("Citas").select("*");

    // 4. Aplicamos la lógica de filtrado (Punto 2 del Sprint)
    if (!DEBUG_VER_TODAS && user) {
        query = query.eq("usuario_id", user.id); 
    }

    // 5. Ejecutamos la consulta final
    const { data, error } = await query;

    if (error) {
        console.error("Error fetch:", error);
        lista.innerHTML = "Error cargando citas";
        return;
    }

    if (!data || data.length === 0) {
        lista.innerHTML = "No hay citas";
        return;
    }

    lista.innerHTML = "";

    data.forEach((cita) => {
        if (!cita) return;

        let articulo = document.createElement("article");
        articulo.className = "cita-item";

        // 🛠️ CAMBIO CLAVE: Usamos 'id' en lugar de 'identificación'
        articulo.innerHTML = `
            <p><strong>ID:</strong> ${cita.id ?? "N/A"}</p>
            <p><strong>Fecha:</strong> ${
                cita.fecha_hora
                    ? new Date(cita.fecha_hora).toLocaleString()
                    : "Sin fecha"
            }</p>
            <button onclick="cancelarCita(${cita.id})">Cancelar</button>
            <button onclick="actualizarCita(${cita.id})">Editar</button>
            <hr>
        `;

        lista.appendChild(articulo);
    });
}

// 🔥 CANCELAR
window.cancelarCita = async (id) => {
    if (!confirm("¿Cancelar cita?")) return;

    const { error } = await supabase
        .from("Citas")
        .delete()
        .eq("id", id); // Corregido a 'id'

    if (error) {
        console.error("Error delete:", error);
        alert("Error al eliminar");
        return;
    }

    mostrarHistorial();
};

// 🔥 ACTUALIZAR
window.actualizarCita = async (id) => {
    const nuevaFecha = prompt("Nueva fecha (YYYY-MM-DD HH:MM)");
    if (!nuevaFecha) return;

    try {
        const fechaISO = new Date(nuevaFecha).toISOString();

        const { error } = await supabase
            .from("Citas")
            .update({ fecha_hora: fechaISO })
            .eq("id", id); // Corregido a 'id'

        if (error) {
            console.error("Error update:", error);
            alert("Error al actualizar");
            return;
        }

        mostrarHistorial();
    } catch (e) {
        alert("Formato de fecha inválido");
    }
};
