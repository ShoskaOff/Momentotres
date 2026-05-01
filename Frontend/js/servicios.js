import { supabase } from '../../Database/supabaseClient.js';

// --- 1. CARGA DE SERVICIOS (Con traductor ultra-específico) ---
async function cargarServicios() {
    const contenedor = document.querySelector('.contenedor-servicios');
    if (!contenedor) return;

    const { data, error } = await supabase.from('servicios').select('*');
    if (error) { 
        console.error("Error:", error.message); 
        return; 
    }

    if (data) {
        contenedor.innerHTML = data.map(s => {
            // Limpiamos el nombre de la DB (minúsculas y sin tildes)
            const nombreDB = s.nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            let nombreArchivo = "";

            // --- TRADUCTOR DEFINITIVO ---
            if (nombreDB.includes("diseno") || nombreDB.includes("sonrisa")) {
                nombreArchivo = "diseñoSonrisa"; // Debe ser igual a tu archivo en VS Code
            } else if (nombreDB.includes("frenectomia") || nombreDB.includes("frenilectomia")) {
                nombreArchivo = "frenilectomia";
            } else if (nombreDB.includes("cordales")) {
                nombreArchivo = "cordales";
            } else {
                // Para carillas, limpieza, coronas, etc.
                nombreArchivo = nombreDB.split(' ')[0];
            }

            const rutaArchivo = `./tratamientos/${nombreArchivo}.html`;

            return `
                <article class="servicio-card">
                    <a href="${rutaArchivo}" style="text-decoration: none; color: inherit; display: block;">
                        <h3>${s.nombre}</h3>
                        <p>${s.descripcion ? s.descripcion.substring(0, 80) + '...' : ''}</p>
                        <p><strong>$${s.precio}</strong></p>
                        ${s.imagen_url ? `<img src="${s.imagen_url}" alt="${s.nombre}" style="max-width:100%; border-radius:8px;">` : ''}
                    </a>
                </article>
            `;
        }).join('');
    }
}

// --- El resto del código (CRUD y Inicialización) se mantiene igual ---

async function cargarCRUD() {
    const lista = document.getElementById("listaCRUD");
    if (!lista) return;
    const { data } = await supabase.from('servicios').select('*');
    if (data) {
        lista.innerHTML = data.map(s => `
            <article style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:8px;">
                <strong>${s.nombre}</strong> - $${s.precio}
                <br>
                <button onclick="editarServicio('${s.id}', '${s.nombre}', ${s.precio}, '${s.descripcion || ''}', '${s.imagen_url || ''}')">
                    Editar
                </button>
            </article>
        `).join('');
    }
}

async function guardarServicio(e) {
    e.preventDefault();
    const id = document.getElementById("servicioId").value;
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const descripcion = document.getElementById("descripcion").value;
    const imagen_url = document.getElementById("imagen").value;
    const objetoServicio = { nombre, precio, descripcion, imagen_url };
    if (id) {
        await supabase.from('servicios').update(objetoServicio).eq('id', id);
    } else {
        await supabase.from('servicios').insert([objetoServicio]);
    }
    document.getElementById("formServicio").reset();
    document.getElementById("servicioId").value = "";
    cargarServicios();
    cargarCRUD();
    window.cerrarPanel();
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarServicios();
    const form = document.getElementById("formServicio");
    if (form) form.addEventListener("submit", guardarServicio);
    const btnAdmin = document.getElementById("btnAdmin");
    if (btnAdmin) {
        btnAdmin.addEventListener("click", () => {
            document.getElementById("panelCRUD").showModal();
            cargarCRUD();
        });
    }
});

window.editarServicio = (id, nombre, precio, descripcion, imagen_url) => {
    document.getElementById("servicioId").value = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("precio").value = precio;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("imagen").value = imagen_url;
};

window.cerrarPanel = () => {
    const panel = document.getElementById("panelCRUD");
    if (panel) panel.close();
};