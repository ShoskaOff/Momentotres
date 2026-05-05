import { supabase } from "../../Database/supabaseClient.js";

const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Carpeta%20Servicios/";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const nombreProducto = urlParams.get('servicio');

    if (nombreProducto) {
        const texto = document.getElementById("servicioSeleccionado");
        const input = document.getElementById("servicio");
        // Agregamos data-i18n para que el servicio seleccionado también se traduzca
        if (texto) {
            texto.innerText = nombreProducto;
            texto.setAttribute("data-i18n", "");
        }
        if (input) input.value = nombreProducto;
    }

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
            const inicioRango = new Date(new Date(`${fecha}T${hora}`).getTime() - (3 * 60 * 60 * 1000)).toISOString();
            const finRango = new Date(new Date(`${fecha}T${hora}`).getTime() + (3 * 60 * 60 * 1000)).toISOString();

            const { data: citasEnRango } = await supabase
              .from("Citas")
              .select("id, fecha_hora")
               .gt("fecha_hora", inicioRango)
               .lt("fecha_hora", finRango)
              .limit(1);

            if (citasEnRango && citasEnRango.length > 0) {
                 alert("El doctor no está disponible. Las citas deben tener un margen de 3 horas entre sí.");
                 return;
            }

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

async function mostrarHistorial() {
    let lista = document.getElementById("listaCitas");
    if (!lista) return;

    lista.innerHTML = "<p style='color: white; text-align: center;' data-i18n>Cargando historial de citas...</p>";

    const { data, error } = await supabase
        .from("Citas")
        .select(`
            *,
            paciente:Usuarios!Citas_usuario_id_fkey1 (
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
        lista.innerHTML = `<p style='color: #ff4444;' data-i18n>Error al cargar el historial.</p>`;
        return;
    }

    pintarCitas(data, lista);
}

function pintarCitas(data, lista) {
    if (!data || data.length === 0) {
        lista.innerHTML = "<p style='color: white; text-align: center;' data-i18n>No tienes citas registradas.</p>";
        return;
    }

    lista.innerHTML = "";
    data.forEach((cita) => {
        const infoPaciente = cita.paciente || {};
        const infoServicio = cita.servicio || {};
        const nombrePaciente = infoPaciente.nombre || "Paciente";
        const nombreServicio = infoServicio.nombre || "Tratamiento";
        const imgNombre = infoServicio.imagen_url;
        const imgPath = imgNombre ? URL_BASE_STORAGE + imgNombre : "../../../Media/Logo.png";

        let articulo = document.createElement("article");
        articulo.style = "display: flex; gap: 20px; align-items: center; padding: 15px; background: white; border-radius: 12px; margin-bottom: 15px; color: #333; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";

        articulo.innerHTML = `
            <img src="${imgPath}" alt="${nombreServicio}" 
                 style="width: 110px; height: 110px; object-fit: cover; border-radius: 10px;"
                 onerror="this.src='../../../Media/Logo.png';">
            
            <section style="flex-grow: 1;">
                <h3 style="margin: 0 0 10px 0; color: #2196F3;" data-i18n>${nombreServicio}</h3>
                <p style="margin: 3px 0;"><strong data-i18n>👤 Paciente:</strong> ${nombrePaciente}</p>
                <p style="margin: 3px 0;"><strong data-i18n>📅 Fecha:</strong> ${new Date(cita.fecha_hora).toLocaleDateString()}</p>
                <p style="margin: 3px 0;"><strong data-i18n>⏰ Hora:</strong> ${new Date(cita.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </section>

            <section>
                <button onclick="cancelarCita(${cita.id})" 
                        style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight: bold;"
                        data-i18n>
                    Eliminar
                </button>
            </section>
        `;
        lista.appendChild(articulo);
    });

    // 🌍 ÚLTIMO PASO: Activar la traducción de Microsoft sobre los nuevos elementos
    if (typeof window.traducirPagina === 'function') {
        window.traducirPagina();
    }
}

window.cancelarCita = async (id) => {
    if (!confirm("¿Eliminar esta cita?")) return;
    const { error } = await supabase.from("Citas").delete().eq("id", id);
    if (error) alert("Error al eliminar");
    else mostrarHistorial();
};