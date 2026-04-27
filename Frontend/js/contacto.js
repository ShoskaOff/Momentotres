import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formContacto");
    const nombreInput = document.getElementById("nombre");
    const correoInput = document.getElementById("correo");
    const mensajeInput = document.getElementById("mensaje");

    if (!form) {
        console.error("No se encontró el formulario de contacto");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nombre = nombreInput ? nombreInput.value.trim() : "";
        const correo = correoInput ? correoInput.value.trim() : "";
        const mensaje = mensajeInput ? mensajeInput.value.trim() : "";

        if (!nombre || !correo || !mensaje) {
            alert("Completa todos los campos");
            return;
        }

        const { error: insertError } = await supabase
            .from("Notificaciones")
            .insert([
                {
                    mensaje: "Nuevo mensaje de contacto de: " + correo
                }
            ]);

        if (insertError) {
            console.error(insertError);
            alert("Error al enviar mensaje");
            return;
        }

        alert("Mensaje enviado correctamente");
        form.reset();
    });
});