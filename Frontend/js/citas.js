import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("formCita");
    const listaCitas = document.getElementById("listaCitas");
    const servicioInput = document.getElementById("servicio");
    const servicioTexto = document.getElementById("servicioSeleccionado");
    const fechaInput = document.getElementById("fecha");
    const horaInput = document.getElementById("hora");

    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
        window.location.href = "/Frontend/index/inicio.html";
        return;
    }

    const { data: usuarioData } = await supabase
        .from("Usuarios")
        .select("id")
        .eq("auth_uuid", authData.user.id)
        .single();

    const usuarioId = usuarioData?.id;


    const urlParams = new URLSearchParams(window.location.search);
    const servicioId = urlParams.get("servicioId");

    if (!servicioId) {
        alert("No se recibió servicio. Vuelve a tratamientos.");
        return;
    }

    const { data: servicio, error } = await supabase
        .from("servicios")
        .select("id, nombre")
        .eq("id", servicioId)
        .single();

    if (error || !servicio) {
        console.error(error);
        alert("Servicio no encontrado en la base de datos");
        return;
    }

    servicioInput.value = servicio.id;
    servicioTexto.textContent = `Servicio: ${servicio.nombre}`;


    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fecha = fechaInput.value;
        const hora = horaInput.value;

        if (!fecha || !hora) {
            alert("Completa todos los campos");
            return;
        }

        const { error: citaError } = await supabase
            .from("Citas")
            .insert([{
                usuario_id: usuarioId,
                servicio_id: servicio.id,
                fecha_hora: `${fecha} ${hora}`
            }]);

        if (citaError) {
            console.error(citaError);
            alert("Error al crear cita");
            return;
        }

        alert("Cita creada correctamente");
        location.reload();
    });


    const { data } = await supabase
        .from("Citas")
        .select("*, servicios(nombre)")
        .eq("usuario_id", usuarioId)
        .order("id", { ascending: false });

    listaCitas.innerHTML = "";

    data?.forEach(cita => {
        const div = document.createElement("div");

        div.innerHTML = `
            <article>
                <strong>#${cita.id}</strong><br>
                Servicio: ${cita.servicios?.nombre || "N/A"}<br>
                ${cita.fecha_hora}
            </article>
            <hr>
        `;

        listaCitas.appendChild(div);
    });
});