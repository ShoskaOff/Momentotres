

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