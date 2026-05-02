import { supabase } from '../../Database/supabaseClient.js';

// --- 1. CARGA DE SERVICIOS (Página principal) ---
async function cargarServicios() {
    const contenedor = document.querySelector('.contenedor-servicios');
    if (!contenedor) return;

    const { data, error } = await supabase.from('servicios').select('*');
    if (error) { console.error("Error:", error.message); return; }

    if (data) {
        contenedor.innerHTML = data.map(s => `
            <article>
                <h3>${s.nombre}</h3>
                <p>${s.descripcion}</p>
                <p><strong>$${s.precio}</strong></p>
                ${s.imagen_url ? `<img src="${s.imagen_url}" alt="${s.nombre}" style="max-width:200px;">` : ''}
            </article>
        `).join('');
    }
}

// --- 2. LÓGICA CRUD (Panel Admin) ---
async function cargarCRUD() {
    const lista = document.getElementById("listaCRUD");
    if (!lista) return;

    const { data } = await supabase.from('servicios').select('*');
    lista.innerHTML = data.map(s => `
        <article style="border:1px solid #ccc; padding:5px; margin-bottom:5px;">
            ${s.nombre} - $${s.precio}
            <button onclick="editarServicio('${s.id}', '${s.nombre}', ${s.precio}, '${s.descripcion}', '${s.imagen}')">Editar</button>
        </article>
    `).join('');
}

// --- 3. GUARDAR SERVICIO ---
async function guardarServicio(e) {
    e.preventDefault();
    const id = document.getElementById("servicioId").value;
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const descripcion = document.getElementById("descripcion").value;
    const imagen = document.getElementById("imagen").value;

    if (id) {
        await supabase.from('servicios').update({ nombre, precio, descripcion, imagen }).eq('id', id);
    } else {
        await supabase.from('servicios').insert([{ nombre, precio, descripcion, imagen }]);
    }

    document.getElementById("formServicio").reset();
    document.getElementById("servicioId").value = "";
    cargarServicios();
    cargarCRUD();
}

// --- 4. INICIALIZACIÓN ÚNICA ---
document.addEventListener("DOMContentLoaded", async () => {
    // Carga inicial
    await cargarServicios();

    // Evento del formulario
    const form = document.getElementById("formServicio");
    if (form) form.addEventListener("submit", guardarServicio);

    // Lógica Admin
    const btnAdmin = document.getElementById("btnAdmin");
    if (btnAdmin) {
        btnAdmin.addEventListener("click", () => {
            document.getElementById("panelCRUD").showModal();
            cargarCRUD();
        });
    }
});


window.editarServicio = (id, nombre, precio, descripcion, imagen) => {
    document.getElementById("servicioId").value = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("precio").value = precio;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("imagen").value = imagen;
};

// Función global para cerrar
window.cerrarPanel = () => document.getElementById("panelCRUD").close();
