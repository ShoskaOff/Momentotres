import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formContacto");
    const nombreInput = document.getElementById("nombre");
    const correoInput = document.getElementById("correo");
    const mensajeInput = document.getElementById("mensaje");

    if (!form) {
        console.error("No se encontró el formulario de contacto / Contact form not found");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // 🌍 Obtener idioma actual
        const idioma = localStorage.getItem('idioma') || 'es';

        const nombre = nombreInput ? nombreInput.value.trim() : "";
        const correo = correoInput ? correoInput.value.trim() : "";
        const mensaje = mensajeInput ? mensajeInput.value.trim() : "";

        if (!nombre || !correo || !mensaje) {
            const msgCampos = idioma === 'en' ? "Please fill in all fields" : "Completa todos los campos";
            alert(msgCampos);
            return;
        }

        // 📝 Preparar el mensaje de la notificación (bilingüe en la BD para el admin)
        const prefijoNotif = idioma === 'en' ? "New contact message from: " : "Nuevo mensaje de contacto de: ";

        const { error: insertError } = await supabase
            .from("Notificaciones")
            .insert([
                {
                    mensaje: prefijoNotif + correo
                }
            ]);

        if (insertError) {
            console.error(insertError);
            const msgError = idioma === 'en' ? "Error sending message" : "Error al enviar mensaje";
            alert(msgError);
            return;
        }

        const msgExito = idioma === 'en' ? "Message sent successfully" : "Mensaje enviado correctamente";
        alert(msgExito);
        form.reset();
    });
});