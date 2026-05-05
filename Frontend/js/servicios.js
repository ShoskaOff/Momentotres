import { supabase } from '../../Database/supabaseClient.js';

const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Carpeta%20Servicios/";

async function cargarServicios() {
    const contenedorGeneral = document.querySelector('.contenedor-servicios:not(#servicios-destacados)');
    const contenedorLobby = document.getElementById('servicios-destacados');
    
    if (!contenedorGeneral && !contenedorLobby) return;

    const { data, error } = await supabase.from('servicios').select('*').order('nombre', { ascending: true });
    
    if (error) { 
        console.error(error.message); 
        return; 
    }

    if (data) {
        if (contenedorLobby) {
            const destacados = data.slice(0, 3);
            contenedorLobby.innerHTML = generarHTMLTarjetas(destacados, true);
        }

        if (contenedorGeneral) {
            contenedorGeneral.innerHTML = generarHTMLTarjetas(data, false);
        }
    }
}

function generarHTMLTarjetas(servicios, esLobby) {
    return servicios.map(s => {
        const rutaArchivo = `/Frontend/index/detalle.html?id=${s.id}`;
        
        // Manejo de imagen con espacios y URL de Supabase
        const nombreImagen = s.imagen_url ? s.imagen_url.trim() : "";
        const imgFinal = nombreImagen 
            ? URL_BASE_STORAGE + encodeURIComponent(nombreImagen) 
            : "/Media/Logo.png";

        if (esLobby) {
            return `
                <article>
                    <img src="${imgFinal}" alt="${s.nombre}" onerror="this.src='/Media/Logo.png';">
                    <h3>${s.nombre}</h3>
                    <p>${s.descripcion ? s.descripcion.substring(0, 60) + '...' : 'Tu sonrisa es nuestra prioridad.'}</p>
                    <a href="${rutaArchivo}" class="btn-detalle">Ver detalle</a>
                </article>
            `;
        } else {
            // VISTA DE TRATAMIENTOS: Solo Imagen, Nombre y Descripción (SIN PRECIO)
            return `
                <article class="servicio-card" style="background: white; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s; text-align: center;">
                    <a href="${rutaArchivo}" style="text-decoration: none; color: inherit; display: block; padding-bottom: 20px;">
                        <img src="${imgFinal}" alt="${s.nombre}" 
                             style="width: 100%; height: 200px; object-fit: cover; margin-bottom: 15px;"
                             onerror="this.src='/Media/Logo.png';">
                        
                        <div style="padding: 0 15px;">
                            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 1.25rem;">${s.nombre}</h3>
                            <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.4;">
                                ${s.descripcion ? s.descripcion.substring(0, 100) + '...' : 'Más información en el detalle.'}
                            </p>
                        </div>
                    </a>
                </article>
            `;
        }
    }).join('');
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarServicios();
    const form = document.getElementById("formServicio");
    if (form) form.addEventListener("submit", guardarServicio);
});

// Nota: Mantén tus funciones cargarCRUD y guardarServicio del archivo original.



async function cargarCRUD() {
    const lista = document.getElementById("listaCRUD");
    if (!lista) return;
    
    const { data } = await supabase.from('servicios').select('*').order('nombre', { ascending: true });
    
    if (data) {
        lista.innerHTML = data.map(s => `
            <article style="border:1px solid #ccc; padding:15px; margin-bottom:10px; border-radius:8px; display: flex; justify-content: space-between; align-items: center; background: #f9f9f9;">
                <div>
                    <strong>${s.nombre}</strong> <br>
                    <small style="color: #666;">$${s.precio ? s.precio.toLocaleString() : '0'}</small>
                </div>
                <button onclick="editarServicio('${s.id}', '${s.nombre}', ${s.precio}, '${s.descripcion || ''}', '${s.imagen_url || ''}')"
                        style="background: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
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

    const objetoServicio = { 
        nombre, 
        precio: parseFloat(precio), 
        descripcion, 
        imagen_url 
    };

    if (id) {
        await supabase.from('servicios').update(objetoServicio).eq('id', id);
    } else {
        await supabase.from('servicios').insert([objetoServicio]);
    }

    document.getElementById("formServicio").reset();
    document.getElementById("servicioId").value = "";
    alert("¡Servicio guardado!");
    
    await cargarServicios();
    await cargarCRUD();
    window.cerrarPanel();
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarServicios();
    
    const form = document.getElementById("formServicio");
    if (form) form.addEventListener("submit", guardarServicio);
    
    const btnAdmin = document.getElementById("btnAdmin");
    if (btnAdmin) {
        btnAdmin.addEventListener("click", () => {
            const panel = document.getElementById("panelCRUD");
            if (panel) {
                panel.showModal();
                cargarCRUD();
            }
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