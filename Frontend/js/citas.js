import { supabase } from "../../Database/supabaseClient.js";

// 1. CONFIGURACIÓN DE RUTAS (ID y carpeta verificados según tus capturas)
const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Carpeta%20Servicios/";

document.addEventListener("DOMContentLoaded", async () => {
    // GESTIÓN DE PARÁMETROS URL
    const urlParams = new URLSearchParams(window.location.search);
    const nombreProducto = urlParams.get('servicio');

    if (nombreProducto) {
        const texto = document.getElementById("servicioSeleccionado");
        const input = document.getElementById("servicio");
        if (texto) texto.innerText = "Servicio: " + nombreProducto;
        if (input) input.value = nombreProducto;
    }

    // FORMULARIO PARA AGENDAR CITA
    const form = document.getElementById("formCita");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Debes iniciar sesión para agendar una cita");
                return;
            }

            let servicioNombre = document.getElementById("servicio")?.value?.trim();
            let fecha = document.getElementById("fecha")?.value;
            let hora = document.getElementById("hora")?.value;

            if (!servicioNombre || !fecha || !hora) {
                alert("Por favor, completa todos los campos");
                return;
            }

            const { data: sData } = await supabase
                .from("servicios")
                .select("id")
                .ilike("nombre", `%${servicioNombre}%`)
                .single();

            if (!sData) {
                alert("Servicio no encontrado.");
                return;
            }

            const fechaHoraISO = new Date(`${fecha}T${hora}`).toISOString();

            const { error: errorInsert } = await supabase
                .from("Citas")
                .insert([{
                    servicio_id: sData.id, 
                    fecha_hora: fechaHoraISO,
                    usuario_id: user.id 
                }]);

            if (errorInsert) {
                alert("Error al agendar: " + errorInsert.message);
            } else {
                alert("¡Cita agendada correctamente!");
                form.reset();
                mostrarHistorial();
            }
        });
    }

    mostrarHistorial();
});

// 2. FUNCIÓN PARA MOSTRAR EL HISTORIAL
async function mostrarHistorial() {
    let lista = document.getElementById("listaCitas");
    if (!lista) return;

    lista.innerHTML = "<p style='color: white; text-align: center;'>Cargando historial de citas...</p>";

    const { data, error } = await supabase
  .from("Citas")
  .select(`
    *,
    paciente:Usuarios!Citas_usuario_id_fkey (
      nombre,
      correo
    ),
    servicio:servicios (
      nombre,
      imagen_url
    )
  `)
  .order('fecha_hora', { ascending: true });
   if (error) {
    console.error("Error en Supabase:", error);
    lista.innerHTML = `<p style='color: #ff4444;'>Error al cargar el historial.</p>`;
        return;
}
        
    
    

    pintarCitas(data, lista);
}

// 3. FUNCIÓN PARA DIBUJAR LAS TARJETAS
function pintarCitas(data, lista) {
    if (!data || data.length === 0) {
        lista.innerHTML = "<p style='color: white; text-align: center;'>No tienes citas registradas.</p>";
        return;
    }

    lista.innerHTML = "";
    data.forEach((cita) => {
        const infoPaciente = cita.paciente || {};
        const infoServicio = cita.servicio || {};
        
        const nombrePaciente = infoPaciente.nombre || "Paciente";
        const nombreServicio = infoServicio.nombre || "Tratamiento";
        
        // CORRECCIÓN: Usamos 'imagen_url' que es el nombre real de tu columna
        const imgNombre = infoServicio.imagen_url;
        const imgPath = imgNombre 
            ? URL_BASE_STORAGE + imgNombre 
            : "../../../Media/Logo.png";

        let articulo = document.createElement("article");
        articulo.style = "display: flex; gap: 20px; align-items: center; padding: 15px; background: white; border-radius: 12px; margin-bottom: 15px; color: #333; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";

        articulo.innerHTML = `
            <img src="${imgPath}" alt="${nombreServicio}" 
                 style="width: 110px; height: 110px; object-fit: cover; border-radius: 10px;"
                 onerror="this.src='../../../Media/Logo.png';">
            
            <section style="flex-grow: 1;">
                <h3 style="margin: 0 0 10px 0; color: #2196F3;">${nombreServicio}</h3>
                <p style="margin: 3px 0;"><strong>👤 Paciente:</strong> ${nombrePaciente}</p>
                <p style="margin: 3px 0;"><strong>📅 Fecha:</strong> ${new Date(cita.fecha_hora).toLocaleDateString()}</p>
                <p style="margin: 3px 0;"><strong>⏰ Hora:</strong> ${new Date(cita.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </section>

            <section>
                <button onclick="cancelarCita(${cita.id})" 
                        style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    Eliminar
                </button>
            </section>
        `;
        lista.appendChild(articulo);
    });
}

window.cancelarCita = async (id) => {
    if (!confirm("¿Eliminar esta cita?")) return;
    const { error } = await supabase.from("Citas").delete().eq("id", id);
    if (error) alert("Error al eliminar");
    else mostrarHistorial();
};