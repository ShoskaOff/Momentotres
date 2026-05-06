import { supabase } from "/Frontend/js/supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  // Función auxiliar para obtener textos traducidos en JS
  function obtenerTraduccion(llave, textoPorDefecto) {
    if (window.traducciones && window.traducciones[window.currentLang] && window.traducciones[window.currentLang][llave]) {
      return window.traducciones[window.currentLang][llave];
    }
    return textoPorDefecto;
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const clave = document.getElementById("clave").value.trim();

    if (!correo || !clave) {
      alert(obtenerTraduccion("error_campos_vacios", "Completa todos los campos"));
      return;
    }

    // 🔐 LOGIN
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave
    });

    if (loginError) {
      console.error(loginError);
      alert(obtenerTraduccion("error_login", "Error al iniciar sesión"));
      return;
    }

    console.log("✅ Login exitoso");

    // 🔥 OBTENER USUARIO AUTH
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      alert(obtenerTraduccion("error_obtener_usuario", "No se pudo obtener el usuario"));
      return;
    }

    const userId = userData.user.id;

    // 🔥 BUSCAR EN BD
    let { data: usuario, error: usuarioError } = await supabase
      .from("Usuarios")
      .select("rol_id")
      .eq("auth_uuid", userId)
      .maybeSingle();

    if (usuarioError) {
      console.error("❌ Error BD:", usuarioError);
      alert(obtenerTraduccion("error_bd", "Error consultando base de datos"));
      return;
    }

    if (!usuario) {
      let rol = 2;
      if (correo === "admin@tudominio.com") {
        rol = 1;
      }

      const { error: insertError } = await supabase.from("Usuarios").insert([
        {
          auth_uuid: userId,
          rol_id: rol
        }
      ]);

      if (insertError) {
        console.error("❌ Error creando usuario:", insertError);
        alert(obtenerTraduccion("error_sincronizacion", "Error sincronizando usuario con base de datos"));
        return;
      }

      const { data: nuevoUsuario, error: reloadError } = await supabase
        .from("Usuarios")
        .select("rol_id")
        .eq("auth_uuid", userId)
        .maybeSingle();

      if (reloadError || !nuevoUsuario) {
        alert(obtenerTraduccion("error_validar", "No se pudo validar usuario"));
        return;
      }

      usuario = nuevoUsuario;
    }

    // 🔥 REDIRECCIÓN POR ROL
    if (usuario.rol_id === 1) {
      window.location.href = "/Frontend/index/PaginaAdmin/admin.html";
    } else {
      window.location.href = "/Frontend/index/PaginaUsuario/usuario.html";
    }
  });
});