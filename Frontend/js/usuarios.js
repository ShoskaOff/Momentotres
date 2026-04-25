import { supabase } from "../../Database/supabaseClient.js";

export async function getUsuarios() {
  return await supabase
    .from("usuarios")
    .select("*, roles(nombre)");
}

export async function crearUsuario(usuario) {
  return await supabase.from("usuarios").insert([usuario]);
}

export async function actualizarUsuario(id, datos) {
  return await supabase.from("usuarios").update(datos).eq("id", id);
}

export async function eliminarUsuario(id) {
  return await supabase.from("usuarios").delete().eq("id", id);
}