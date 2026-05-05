import { supabase } from "../../Database/supabaseClient.js";

const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Carpeta%20Servicios/";

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const nombreProducto = urlParams.get('servicio');
    
    // Sincronización de idioma
    const idioma = localStorage.getItem("idiomaSeleccionado") || "es";

    const texto = document.getElementById("servicioSeleccionado");
    const input = document.getElementById("servicio");

    // ✅ LÓGICA DE CONEXIÓN DE TRATAMIENTO
    if (nombreProducto && nombreProducto !== "null" && nombreProducto !== "undefined") {
        const nombreDecodificado = decodeURIComponent(nombreProducto);
        
        if (texto) {
            // 1. IMPORTANTE: Quitamos el atributo data-i18n para que el traductor no lo resetee
            texto.removeAttribute("data-i18n"); 
            
            // 2. Ponemos el texto manualmente según el idioma
            const prefijo = idioma === 'en' ? "Service: " : "Servicio: ";
            texto.innerText = prefijo + nombreDecodificado;
        }

        if (input) {
            input.value = nombreDecodificado;
        }
    }

    const form = document.getElementById("formCita");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const currentLang = localStorage.getItem("idiomaSeleccionado") || 'es';

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                const msgLogin = currentLang === 'en' ? "You must log in to schedule an appointment" : "Debes iniciar sesión para agendar una cita";
                alert(msgLogin);
                return;
            }

            let servicioNombre = document.getElementById("servicio")?.value?.trim();
            let fecha = document.getElementById("fecha")?.value;
            let hora = document.getElementById("hora")?.value;

            if (!servicioNombre || !fecha || !hora) {
                const msgCampos = currentLang === 'en' ? "Please complete all fields" : "Por favor, completa todos los campos";
                alert(msgCampos);
                return;
            }

            const { data: sData } = await supabase
                .from("servicios")
                .select("id")
                .ilike("nombre", `%${servicioNombre}%`)
                .single();

            if (!sData) {
                const msgNoServicio = currentLang === 'en' ? "Service not found." : "Servicio no encontrado.";
                alert(msgNoServicio);
                return;
            }

            const fechaHoraISO = new Date(`${fecha}T${hora}`).toISOString();
            const inicioRango = new Date(new Date(`${fecha}T${hora}`).getTime() - (3 * 60 * 60 * 1000)).toISOString();
            const finRango = new Date(new Date(`${fecha}T${hora}`).getTime() + (3 * 60 * 60 * 1000)).toISOString();

            const { data: citasEnRango } = await supabase
              .from("Citas")
              .select("id")
               .gt("fecha_hora", inicioRango) 
               .lt("fecha_hora", finRango)    
             .limit(1); 

            if (citasEnRango && citasEnRango.length > 0) {
                 const msgDispo = currentLang === 'en' ? "The doctor is not available at that time." : "El doctor no está disponible en ese horario.";
                 alert(msgDispo);
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
                alert("Error: " + errorInsert.message);
            } else {
                const msgExito = currentLang === 'en' ? "Appointment scheduled!" : "¡Cita agendada!";
                alert(msgExito);
                form.reset();
                window.mostrarHistorial(); 
            }
        });
    }

    window.mostrarHistorial();
});

window.mostrarHistorial = async function() {
    let lista = document.getElementById("listaCitas");
    if (!lista) return;

    const currentLang = localStorage.getItem("idiomaSeleccionado") || 'es';
    lista.innerHTML = `<p style='color: white; text-align: center;'>${currentLang === 'en' ? 'Loading...' : 'Cargando...'}</p>`;

    const { data, error } = await supabase
        .from("Citas")
        .select(`
            *,
            paciente:Usuarios!Citas_usuario_id_fkey1 (nombre),
            servicio:servicios (nombre, imagen_url)
        `)
        .order('fecha_hora', { ascending: true });

    if (error) {
        console.error("Error cargando historial:", error);
        lista.innerHTML = `<p style='color: #ff4444;'>Error.</p>`;
        return;
    }

    pintarCitas(data, lista);
}

function pintarCitas(data, lista) {
    const currentLang = localStorage.getItem("idiomaSeleccionado") || 'es';

    if (!data || data.length === 0) {
        const msgVacio = currentLang === 'en' ? "No appointments found." : "No tienes citas registradas.";
        lista.innerHTML = `<p style='color: white; text-align: center;'>${msgVacio}</p>`;
        return;
    }

    lista.innerHTML = "";
    data.forEach((cita) => {
        const infoServicio = cita.servicio || {};
        const nombreServicio = infoServicio.nombre || "Tratamiento";
        const imgPath = infoServicio.imagen_url ? URL_BASE_STORAGE + infoServicio.imagen_url : "../../../Media/Logo.png";

        let articulo = document.createElement("article");
        articulo.style = "display: flex; gap: 20px; align-items: center; padding: 15px; background: white; border-radius: 12px; margin-bottom: 15px; color: #333; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";

        articulo.innerHTML = `
            <img src="${imgPath}" alt="${nombreServicio}" 
                 style="width: 110px; height: 110px; object-fit: cover; border-radius: 10px;"
                 onerror="this.src='../../../Media/Logo.png';">
            
            <section style="flex-grow: 1;">
                <h3 style="margin: 0 0 10px 0; color: #2196F3;" data-i18n-dinamico>${nombreServicio}</h3>
                <p style="margin: 3px 0;"><strong data-i18n="cita_paciente">👤 Paciente:</strong> ${cita.paciente?.nombre || '---'}</p>
                <p style="margin: 3px 0;"><strong data-i18n="cita_fecha">📅 Fecha:</strong> ${new Date(cita.fecha_hora).toLocaleDateString()}</p>
                <p style="margin: 3px 0;"><strong data-i18n="cita_hora">⏰ Hora:</strong> ${new Date(cita.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </section>

            <section>
                <button onclick="cancelarCita(${cita.id})" 
                        data-i18n="eliminar"
                        style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    Eliminar
                </button>
            </section>
        `;
        lista.appendChild(articulo);
    });

    if (window.traducirPagina) {
        setTimeout(() => window.traducirPagina(), 100);
    }
}

window.cancelarCita = async (id) => {
    const currentLang = localStorage.getItem("idiomaSeleccionado") || 'es';
    const msgConfirm = currentLang === 'en' ? "Delete this appointment?" : "¿Eliminar esta cita?";
    if (!confirm(msgConfirm)) return;

    const { error } = await supabase.from("Citas").delete().eq("id", id);
    if (!error) window.mostrarHistorial();
};