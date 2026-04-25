import { supabase } from "../../Database/supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
const nombreProducto = urlParams.get('servicio');

console.log("Servicio recibido:", nombreProducto);

if (nombreProducto) {
    document.getElementById("servicioSeleccionado").innerText =
        "Servicio: " + nombreProducto;

    document.getElementById("servicio").value = nombreProducto;
}

  const form = document.getElementById("formCita");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    let servicioVal = document.getElementById("servicio").value;
    let fecha = document.getElementById("fecha").value;
    let hora = document.getElementById("hora").value;

    let fechaHora = `${fecha}T${hora}:00`;

    if (!servicioVal || !fecha || !hora) {
      alert("Completa todos los campos");
      return;
    }

   const { data: rolData, error: rolError } = await supabase
  .from("Roles")
  .select("nombre")
  .single();

if (rolError) {
  console.log("Error obteniendo rol:", rolError);
  alert("No se pudo verificar el rol del usuario");
  return;
}

const esAdmin = rolData?.nombre === "admin";

if (!esAdmin) {
  alert("Solo el administrador puede agendar citas");
  return;
}

console.log("Fecha:", fecha);
console.log("Hora:", hora);
console.log("fecha_hora:", fechaHora);


if (error) {
  console.log("ERROR DISPONIBILIDAD:");
  console.log(JSON.stringify(error, null, 2));
  alert("Error al verificar disponibilidad");
  return;
}

if (existentes && existentes.length > 0) {
  alert("Esta cita ya está ocupada");
  return;
}
    
   

const { error: insertError } = await supabase.from("Citas").insert([
  {
    servicio_id: parseInt(servicioVal),
    fecha_hora: fechaHora,
    user_id: user.id
  }
]);

if (insertError) {
  console.log(JSON.stringify(insertError, null, 2));
  alert("Error al guardar");
  return;
}

    alert("Cita agendada con éxito");

    mostrarHistorial();
  });

  mostrarHistorial();
});

async function mostrarHistorial() {
  let lista = document.getElementById("listaCitas");
  lista.innerHTML = "";

  const { data, error } = await supabase
    .from("Citas")
    .select(`
      *,
      Servicio!Citas_servicio_id_fkey1(nombre)
    `);

  
  if (error) {
  console.error("ERROR COMPLETO:");
  console.log(JSON.stringify(error, null, 2));
  return;
}

  
  if (!data || data.length === 0) {
    lista.innerHTML = "<p>No hay citas aún</p>";
    return;
  }

  data.forEach((cita) => {
    let articulo = document.createElement("article");

    articulo.innerHTML = `
      <strong>${cita.Servicio?.nombre}</strong><br>
      ${cita.fecha}<br>
      ${cita.hora}<br>
    `;

    lista.appendChild(articulo);
  });
}

window.cancelarCita = async (id) => {

  if (!confirm("¿Seguro que quieres cancelar esta cita?")) return;

  const { error } = await supabase
    .from("Citas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  mostrarHistorial();
};

async function actualizarCita(id) {
  const nuevaFecha = prompt("Nueva fecha:");

  await supabase
    .from("Citas")
    .update({ fecha: nuevaFecha })
    .eq("id", id);

  mostrarHistorial();
}