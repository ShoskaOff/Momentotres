import { supabase } from "../../Database/supabaseClient.js";

// ==========================
// 🔐 LOGIN (AGREGADO)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  // Si no existe el form, no hace nada (permite reutilizar este archivo)
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const clave = document.getElementById("clave").value;

    console.log("EMAIL:", correo);
    console.log("PASSWORD:", clave);

    // 🔐 LOGIN
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave
    });

    if (loginError) {
      console.error(loginError);
      alert("Error al iniciar sesión");
      return;
    }

    console.log("✅ Login exitoso");

    // 🔥 OBTENER USUARIO
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      alert("No se pudo obtener el usuario");
      return;
    }

    const userId = userData.user.id;

    // 🔥 IMPORTANTE: RESPETA EL NOMBRE REAL DE TU TABLA
    const { data: usuario, error: usuarioError } = await supabase
      .from("Usuarios") // 👈 OJO: mayúscula
      .select("rol_id")
      .eq("auth_uuid", userId)
      .maybeSingle();

    if (usuarioError || !usuario) {
      console.error(usuarioError);
      alert("Usuario no registrado en BD");
      return;
    }

    // 🔥 REDIRECCIÓN
    if (usuario.rol_id === 1) {
      window.location.href = "/Frontend/index/PaginaAdmin/admin.html";
    } else {
      window.location.href = "/Frontend/index/PaginaUsuario/usuario.html";
    }
  });
});

// ==========================
// 📦 TUS FUNCIONES (NO SE TOCAN)
export async function getUsuarios() {
  return await supabase
    .from("Usuarios") // 👈 corregido
    .select("*, roles(nombre)");
}

export async function crearUsuario(usuario) {
  return await supabase.from("Usuarios").insert([usuario]);
}

export async function actualizarUsuario(id, datos) {
  return await supabase.from("Usuarios").update(datos).eq("id", id);
}

export async function eliminarUsuario(id) {
  return await supabase.from("Usuarios").delete().eq("id", id);
}
