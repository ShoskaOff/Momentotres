import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    
    // 🌍 Idioma actual
    const idioma = localStorage.getItem('idioma') || 'es';

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        window.location.href = "/Frontend/index/inicio.html";
        return;
    }

    const authUUID = data.user.id;

    const { data: usuarioData, error: usuarioError } = await supabase
        .from("Usuarios")
        .select("id, rol_id")
        .eq("auth_uuid", authUUID)
        .single();

    if (usuarioError || !usuarioData) {
        console.error(usuarioError);
        const msgNoUsuario = idioma === 'en' ? "User not found" : "Usuario no encontrado";
        alert(msgNoUsuario);
        window.location.href = "/Frontend/index/inicio.html";
        return;
    }

    // Guardar datos en Storage
    localStorage.setItem("usuario_id", usuarioData.id);
    localStorage.setItem("rol_id", usuarioData.rol_id);
    localStorage.setItem("auth_uuid", authUUID);

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async () => {
            const { error: logoutError } = await supabase.auth.signOut();

            if (logoutError) {
                console.error(logoutError);
                const msgErrorLogout = idioma === 'en' ? "Error signing out" : "Error al cerrar sesión";
                alert(msgErrorLogout);
                return;
            }

            // Limpiar datos sensibles
            localStorage.removeItem("usuario_id");
            localStorage.removeItem("rol_id");
            localStorage.removeItem("auth_uuid");

            window.location.href = "/Frontend/index/inicio.html";
        });
    }
});