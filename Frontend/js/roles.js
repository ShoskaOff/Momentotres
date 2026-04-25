import { supabase } from "../../Database/supabaseClient.js";

export async function getRoles() {
  return await supabase.from("roles").select("*");
}

export async function crearRol(rol) {
  return await supabase.from("roles").insert([rol]);
}

export async function actualizarRol(id, datos) {
  return await supabase.from("roles").update(datos).eq("id", id);
}

export async function eliminarRol(id) {
  return await supabase.from("roles").delete().eq("id", id);
}