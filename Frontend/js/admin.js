import { supabase as db } from '../../Database/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('crud-contenedor-servicios');
    const form = document.getElementById("formServicio");
    const panel = document.getElementById("panelCRUD");
    const btnNuevo = document.getElementById("btnNuevoServicio");
    const inputId = document.getElementById("servicioId");
    const btnToggle = document.getElementById("btnToggleServicios");

    let expandido = false;

    // --- 1. LÓGICA DEL BOTÓN TOGGLE (VER MÁS) ---
    if (btnToggle && contenedor) {
        btnToggle.addEventListener("click", () => {
            expandido = !expandido;
            contenedor.classList.toggle("expandido");
            btnToggle.textContent = expandido ? "Ocultar servicios" : "Ver mas +";
        });
    }

    // --- 2. CARGAR SERVICIOS (READ) ---
    async function cargarServicios() {
        if (!contenedor) return;
        try {
            const { data: servicios, error } = await db
                .from('servicios')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;

            if (!servicios || servicios.length === 0) {
                contenedor.innerHTML = '<p>No hay tratamientos disponibles.</p>';
                return;
            }

            contenedor.innerHTML = servicios.map(s => `
                <section class="tarjeta-servicio">
                    <img src="${s.imagen_url || 'https://via.placeholder.com/150?text=Sin+Imagen'}" alt="${s.nombre}" style="width:100px; height:100px; object-fit:cover;">
                    <h3>${s.nombre}</h3>
                    <p>${s.descripcion || 'Consulta con nuestros especialistas.'}</p>
                    <span class="precio">$${s.precio ? s.precio.toLocaleString() : '0'}</span>
                    <div class="acciones">
                        <button class="btn-editar" data-id="${s.id}">✏️ Editar</button>
                        <button class="btn-borrar" data-id="${s.id}" style="color:red;">🗑️ Borrar</button>
                    </div>
                </section>
            `).join('');

            // ASIGNAR EVENTOS A LOS BOTONES GENERADOS
            document.querySelectorAll('.btn-editar').forEach(b => {
                b.onclick = () => prepararEdicion(b.dataset.id);
            });
            document.querySelectorAll('.btn-borrar').forEach(b => {
                b.onclick = () => eliminarServicio(b.dataset.id);
            });

        } catch (error) {
            console.error("Error cargando servicios:", error);
            contenedor.innerHTML = '<p>Error al cargar los tratamientos.</p>';
        }
    }

    // --- 3. ELIMINAR (DELETE) ---
    async function eliminarServicio(id) {
        if (!confirm("¿Seguro que quieres eliminar este servicio?")) return;
        const { error } = await db.from('servicios').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else cargarServicios();
    }

    // --- 4. PREPARAR EDICIÓN (UPDATE - Llenar Form) ---
    async function prepararEdicion(id) {
        const { data: s, error } = await db.from('servicios').select('*').eq('id', id).single();
        if (error) return;

        inputId.value = s.id;
        document.getElementById("nombre").value = s.nombre;
        document.getElementById("precio").value = s.precio;
        document.getElementById("descripcion").value = s.descripcion;
        panel.showModal();
    }

    // --- 5. GUARDAR (CREATE O UPDATE) ---
    if (form) {
       form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = inputId.value;
    const file = document.getElementById("imagenInput")?.files[0];
    // Capturamos la URL que el usuario pudo haber pegado manualmente
    const urlEscrita = document.getElementById("imagen").value; 
    let imageUrl = "";

    // --- LÓGICA DE PRIORIDAD DE IMAGEN ---
    
    // 1. Si el usuario seleccionó un archivo local, lo subimos a Supabase Storage
    if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: upError } = await db.storage
            .from('Imagenes') // Nombre exacto de tu bucket
            .upload(fileName, file);
        
        if (upError) {
            alert("Error subiendo imagen: " + upError.message);
            return; // Detenemos si hay error en la subida
        } else {
            imageUrl = db.storage.from('Imagenes').getPublicUrl(fileName).data.publicUrl;
        }
    } 
    // 2. Si no hay archivo pero hay algo escrito en el campo de texto, usamos esa URL directamente
    else if (urlEscrita) {
        imageUrl = urlEscrita;
    }

    // --- PREPARACIÓN DE DATOS ---
    const datos = {
        nombre: document.getElementById("nombre").value,
        precio: parseFloat(document.getElementById("precio").value),
        descripcion: document.getElementById("descripcion").value
    };
    
    // Solo enviamos la imagen si se generó una URL (por archivo o por texto)
    if (imageUrl) {
        datos.imagen_url = imageUrl; // Usamos el nombre exacto de tu columna en Supabase
    }

    // --- GUARDAR EN BASE DE DATOS ---
    let res;
    if (id) {
        // Modo Edición
        res = await db.from('servicios').update(datos).eq('id', id);
    } else {
        // Modo Creación
        res = await db.from('servicios').insert([datos]);
    }

    if (res.error) {
        alert("Error al guardar: " + res.error.message);
    } else {
        alert(id ? "¡Servicio actualizado con éxito!" : "¡Servicio creado con éxito!");
        
        // Limpieza y cierre
        form.reset();
        inputId.value = "";
        panel.close();
        cargarServicios(); // Refrescamos la lista para ver los cambios
    }
});
    }

    if (btnNuevo && panel) {
        btnNuevo.addEventListener("click", () => {
            form.reset();
            inputId.value = "";
            panel.showModal();
        });
    }

    cargarServicios();
});
