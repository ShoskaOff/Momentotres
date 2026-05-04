import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    try {
        // 🔹 1. Obtener usuario autenticado
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
            window.location.href = "/Frontend/index/inicio.html";
            return;
        }

        const authUUID = data.user.id;

        // 🔹 2. Buscar usuario en tu tabla
        const { data: usuarioData, error: usuarioError } = await supabase
            .from("Usuarios")
            .select("id, rol_id")
            .eq("auth_uuid", authUUID)
            .single();

        if (usuarioError || !usuarioData) {
            console.error("Error usuario:", usuarioError);
            alert("Usuario no encontrado");
            window.location.href = "/Frontend/index/inicio.html";
            return;
        }

        // 🔹 3. Guardar en localStorage
        localStorage.setItem("usuario_id", usuarioData.id);
        localStorage.setItem("rol_id", usuarioData.rol_id);
        localStorage.setItem("auth_uuid", authUUID);

        // 🔹 4. Evento cerrar sesión
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener("click", async () => {

                const { error: logoutError } = await supabase.auth.signOut();

                if (logoutError) {
                    console.error("Error logout:", logoutError);
                    alert("Error al cerrar sesión");
                    return;
                }

                // Limpiar sesión
                localStorage.clear();

                window.location.href = "/Frontend/index/inicio.html";
            });
        }

    } catch (err) {
        console.error("Error general:", err);
        window.location.href = "/Frontend/index/inicio.html";
    }
});
