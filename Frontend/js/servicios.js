function verDetalle(tipo) {
    const t = tratamientos?.[tipo];

    if (!t) {
        alert("Tratamiento no encontrado");
        return;
    }

    document.getElementById("titulo").textContent = t.titulo || "";
    document.getElementById("imagen").src = t.imagen || "";
    document.getElementById("descripcionCorta").textContent = t.corta || "";
    document.getElementById("descripcion").textContent = t.descripcion || "";
    document.getElementById("precio").textContent = t.precio || "";

    const lista = document.getElementById("beneficios");
    lista.innerHTML = "";

    (t.beneficios || []).forEach(b => {
        const li = document.createElement("li");
        li.textContent = b;
        lista.appendChild(li);
    });

    const modal = document.getElementById("modalDetalle");
    if (modal) modal.showModal();
}

function cerrarDetalle() {
    document.getElementById("modalDetalle")?.close();
}


function agendarServicio(servicio) {

    if (!servicio || !servicio.id) {
        alert("Servicio no encontrado");
        return;
    }

    window.location.href =
        `/Frontend/index/citas.html?servicioId=${servicio.id}`;
}

document.addEventListener("DOMContentLoaded", () => {

    const btnDetalles = document.querySelectorAll(".btn-detalle");
    const agendarBtn = document.getElementById("agendarBtn");
    const cerrarBtn = document.getElementById("cerrarBtn");
    const botonTema = document.getElementById("theme-toggle");


    agendarBtn?.addEventListener("click", () => {

        // tomamos el ID desde el botón activo o del DOM
        const id = agendarBtn.dataset.id;

        if (!id) {
            alert("Servicio no encontrado");
            return;
        }

        agendarServicio({ id });
    });


    cerrarBtn?.addEventListener("click", cerrarDetalle);



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