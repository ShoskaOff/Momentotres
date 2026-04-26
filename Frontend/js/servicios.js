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
 document.getElementById("btnAdmin").addEventListener("click", async () => {
    document.getElementById("panelCRUD").showModal();
    cargarCRUD();
});
window.cerrarPanel = function() {
    document.getElementById("panelCRUD").close();
};
async function obtenerRol() {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("Roles")
        .select("nombre")
        .eq("id", user.user.id)
        .single();

    return data?.rol;
}
document.addEventListener("DOMContentLoaded", async () => {
    const rol = await obtenerRol();

    if (rol !== "admin") {
        document.getElementById("btnAdmin").style.display = "none";
    }
});