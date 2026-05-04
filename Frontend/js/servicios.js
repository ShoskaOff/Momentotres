import { supabase } from '../../Database/supabaseClient.js';

// 1. URL BASE PARA IMÁGENES (ID: jdofaujfqsyiwauwttcd)
const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Carpeta%20Servicios/";

// --- 1. CARGA DE SERVICIOS (Vista Pública: Lobby y Tratamientos) ---
async function cargarServicios() {
    // Buscamos ambos posibles contenedores
    const contenedorGeneral = document.querySelector('.contenedor-servicios:not(#servicios-destacados)');
    const contenedorLobby = document.getElementById('servicios-destacados');
    
    if (!contenedorGeneral && !contenedorLobby) return;

    // Traemos los datos de la base de datos
    const { data, error } = await supabase.from('servicios').select('*').order('nombre', { ascending: true });
    
    if (error) { 
        console.error("Error:", error.message); 
        return; 
    }

    if (data) {
        // Si existe el contenedor del Lobby, le enviamos solo los primeros 3
        if (contenedorLobby) {
            const destacados = data.slice(0, 3);
            contenedorLobby.innerHTML = generarHTMLTarjetas(destacados, true);
        }

        // Si existe el contenedor de la página de servicios, le enviamos todos
        if (contenedorGeneral) {
            contenedorGeneral.innerHTML = generarHTMLTarjetas(data, false);
        }
    }
}

// Función auxiliar para generar el HTML (Evita repetir código)
function generarHTMLTarjetas(servicios, esLobby) {
    return servicios.map(s => {
        // Lógica para rutas de archivos HTML locales
        const nombreDB = s.nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        let nombreArchivo = "";
        if (nombreDB.includes("diseno") || nombreDB.includes("sonrisa")) {
            nombreArchivo = "diseñoSonrisa";
        } else if (nombreDB.includes("frenectomia") || nombreDB.includes("frenilectomia")) {
            nombreArchivo = "frenilectomia";
        } else if (nombreDB.includes("cordales")) {
            nombreArchivo = "cordales";
        } else {
            nombreArchivo = nombreDB.split(' ')[0];
        }

        // Ajuste de ruta según la ubicación del HTML
        const rutaArchivo = esLobby 
            ? `/Frontend/index/tratamientos/${nombreArchivo}.html` 
            : `./tratamientos/${nombreArchivo}.html`;

        const imgFinal = s.imagen_url 
            ? URL_BASE_STORAGE + s.imagen_url 
            : "../../../Media/Logo.png";

        // Estilo específico para el Lobby o para la lista general
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
            return `
                <article class="servicio-card" style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 20px;">
                    <a href="${rutaArchivo}" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 20px;">
                        <img src="${imgFinal}" alt="${s.nombre}" 
                             style="width: 120px; height: 120px; object-fit: cover; border-radius: 10px;"
                             onerror="this.src='../../../Media/Logo.png';">
                        
                        <div style="flex-grow: 1;">
                            <h3 style="margin: 0; color: #333;">${s.nombre}</h3>
                            <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">
                                ${s.descripcion ? s.descripcion.substring(0, 80) + '...' : 'Consulta con nuestros especialistas.'}
                            </p>
                        </div>
                    </a>
                </article>
            `;
        }
    }).join('');
}

// --- 2. CARGA DEL CRUD (Panel Administrativo) ---
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

// --- 3. GUARDAR / ACTUALIZAR ---
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

// --- 4. INICIALIZACIÓN ---
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

// FUNCIONES GLOBALES
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