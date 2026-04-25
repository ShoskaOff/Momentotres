import { supabase } from "../../Database/supabaseClient.js";


function verDetalle(tipo) {
    const t = tratamientos[tipo];
    document.getElementById("titulo").textContent = t.titulo;
    document.getElementById("imagen").src = t.imagen;
    document.getElementById("descripcionCorta").textContent = t.corta;
    document.getElementById("descripcion").textContent = t.descripcion;
    document.getElementById("precio").textContent = t.precio;

    

    const lista = document.getElementById("beneficios");
    lista.innerHTML = "";
    t.beneficios.forEach(b => {
        const li = document.createElement("li");
        li.textContent = b;
        lista.appendChild(li);
    });
    
    document.getElementById("modalDetalle").showModal();
}

function cerrarDetalle() {
    document.getElementById("modalDetalle").close();
}

function agendarServicio() {
    const titulo = document.getElementById("titulo").textContent;
    window.location.href = `citas.html?servicio=${encodeURIComponent(titulo)}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const btnDetalles = document.querySelectorAll(".btn-detalle");
    btnDetalles.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const tratamiento = e.currentTarget.getAttribute("data-tratamiento");
            verDetalle(tratamiento);
        });
    });

    document.getElementById("agendarBtn").addEventListener("click", agendarServicio);
    document.getElementById("cerrarBtn").addEventListener("click", cerrarDetalle);
});

const botonTema = document.getElementById("theme-toggle");

botonTema.addEventListener("click", ()=>{

document.body.classList.toggle("dark-mode");

if(document.body.classList.contains("dark-mode")){
    localStorage.setItem("modo","oscuro");
    botonTema.textContent = "☀️";
}else{
    localStorage.setItem("modo","claro");
    botonTema.textContent = "🌙";
}

});

window.onload = ()=>{

if(localStorage.getItem("modo") === "oscuro"){
    document.body.classList.add("dark-mode");
    botonTema.textContent = "☀️";
}

}; 
document.addEventListener("DOMContentLoaded", async () => {
  const servicios = await getServicios();
  console.log("SERVICIOS DESDE SUPABASE:", servicios);
}); 

export async function getServicios() {
  const { data, error } = await supabase
    .from("servicios")
    .select("*");

  if (error) {
    console.error("Error obteniendo servicios:", error);
    return [];
  }

  return data;
}


export async function crearServicio(servicio) {
  const { data, error } = await supabase
    .from("servicios")
    .insert([servicio])
    .select();

  if (error) {
    console.error("Error creando servicio:", error);
    return null;
  }

  return data;
}

export async function actualizarServicio(id, datos) {
  const { data, error } = await supabase
    .from("servicios")
    .update(datos)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error actualizando servicio:", error);
    return null;
  }

  return data;
}
export async function eliminarServicio(id) {
  const { error } = await supabase
    .from("servicios")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando servicio:", error);
    return false;
  }

  return true;
}