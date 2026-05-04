import { supabase as db } from '../../Database/supabaseClient.js';

// 1. CONFIGURACIÓN DE RUTA (ID verificado: jdofaujfqsyiwauwttcd)
const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Carpeta%20Servicios/";

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('crud-contenedor-servicios');
    const contenedorCitas = document.getElementById('crud-contenedor-citas');
    const form = document.getElementById("formServicio");
    const panel = document.getElementById("panelCRUD");
    const btnNuevo = document.getElementById("btnNuevoServicio");
    const inputId = document.getElementById("servicioId");
    const btnToggle = document.getElementById("btnToggleServicios");

    let expandido = false;

    if (btnToggle && contenedor) {
        btnToggle.addEventListener("click", () => {
            expandido = !expandido;
            contenedor.classList.toggle("expandido");
            btnToggle.textContent = expandido ? "Ocultar servicios" : "Ver mas +";
        });
    }

    // --- 2. CARGAR SERVICIOS (CORREGIDO PARA IMÁGENES) ---
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

            contenedor.innerHTML = servicios.map(s => {
                // Si la columna imagen_url tiene el nombre del archivo, le pegamos la URL base
                // Si está vacía, usamos el logo por defecto
                const imgFinal = s.imagen_url 
                    ? URL_BASE_STORAGE + s.imagen_url 
                    : "../../../Media/Logo.png";

                return `
                <section class="tarjeta-servicio">
                    <img src="${imgFinal}" alt="${s.nombre}" 
                         style="width:100px; height:100px; object-fit:cover; border-radius:8px;"
                         onerror="this.src='../../../Media/Logo.png';">
                    <h3>${s.nombre}</h3>
                    <p>${s.descripcion || 'Consulta con nuestros especialistas.'}</p>
                    <span class="precio">$${s.precio ? s.precio.toLocaleString() : '0'}</span>

                    <section class="acciones">
                        <button class="btn-editar" data-id="${s.id}">✏️ Editar</button>
                        <button class="btn-borrar" data-id="${s.id}"style="color:darkred;">🗑️ Borrar</button>
                    </section>
                </section>
            `}).join('');

            document.querySelectorAll('#crud-contenedor-servicios .btn-editar').forEach(b => {
                b.onclick = () => prepararEdicion(b.dataset.id);
            });
            document.querySelectorAll('#crud-contenedor-servicios .btn-borrar').forEach(b => {
                b.onclick = () => eliminarServicio(b.dataset.id);
            });

        } catch (error) {
            console.error("Error cargando servicios:", error);
        }
    }

    // --- 3. CARGAR CITAS ---
    async function cargarCitasAdmin() {
        if (!contenedorCitas) return;
        try {
            let { data: citas, error } = await db
                .from('Citas')
                .select(`
                    id,
                    fecha_hora,
                    Usuarios:Usuarios!Citas_usuario_id_fkey1 ( nombre, correo ),
                    servicios:servicio_id ( nombre )
                `)
                .order('fecha_hora', { ascending: true });

            if (error) throw error;

            contenedorCitas.innerHTML = citas.map(c => `
                <section class="tarjeta-servicio"> 
                    <section class="info-cita">
                        <h3>Paciente: ${c.Usuarios?.nombre || 'Sin nombre'}</h3>
                        <p><strong>Servicio:</strong> ${c.servicios?.nombre || 'No encontrado'}</p>
                        <p><strong>Fecha:</strong> ${new Date(c.fecha_hora).toLocaleString()}</p>
                        <p><small>${c.Usuarios?.correo || ''}</small></p>
                    </section>
                    <section class="acciones">
                        <button class="btn-editar" onclick="reprogramarCita(${c.id}, '${c.fecha_hora}')">✏️ Reprogramar</button>
                        <button class="btn-borrar" onclick="eliminarCitaAdmin(${c.id})" style="color:darkred;">🗑️ Cancelar</button>
                    </section>
                </section>
            `).join('');
        } catch (error) {
            console.error("Error citas:", error);
        }
    }

    // --- 4. GUARDAR / EDITAR (CON SUBIDA DE ARCHIVOS) ---
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = inputId.value;
            const file = document.getElementById("imagenInput")?.files[0];
            let nombreArchivoParaBD = "";

            // Si el usuario sube un archivo nuevo
            if (file) {
                const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
                const { error: upError } = await db.storage
                    .from('Imagenes')
                    .upload(`Carpeta Servicios/${fileName}`, file);
                
                if (!upError) {
                    nombreArchivoParaBD = fileName;
                } else {
                    console.error("Error subida:", upError);
                }
            }

            const datos = {
                nombre: document.getElementById("nombre").value,
                precio: parseFloat(document.getElementById("precio").value),
                descripcion: document.getElementById("descripcion").value
            };
            
            
            if (nombreArchivoParaBD) datos.imagen_url = nombreArchivoParaBD;

            const res = id 
                ? await db.from('servicios').update(datos).eq('id', id)
                : await db.from('servicios').insert([datos]);

            if (res.error) alert("Error: " + res.error.message);
            else {
                alert("Guardado correctamente");
                form.reset();
                panel.close();
                cargarServicios();
            }
        });
    }

    // Funciones globales
    window.eliminarCitaAdmin = async (id) => {
        if (!confirm("¿Cancelar cita?")) return;
        await db.from('Citas').delete().eq('id', id);
        cargarCitasAdmin();
    };

    window.reprogramarCita = async (id, fechaActual) => {
        const nuevaFecha = prompt("Nueva fecha (YYYY-MM-DD HH:MM):", new Date(fechaActual).toISOString().slice(0,16));
        if (!nuevaFecha) return;
        await db.from('Citas').update({ fecha_hora: new Date(nuevaFecha).toISOString() }).eq('id', id);
        cargarCitasAdmin();
    };

    if (btnNuevo) {
        btnNuevo.onclick = () => {
            form.reset();
            inputId.value = "";
            panel.showModal();
        };
    }

    async function eliminarServicio(id) {
        if (confirm("¿Eliminar servicio?")) {
            await db.from('servicios').delete().eq('id', id);
            cargarServicios();
        }
    }

    async function prepararEdicion(id) {
        const { data: s } = await db.from('servicios').select('*').eq('id', id).single();
        if (s) {
            inputId.value = s.id;
            document.getElementById("nombre").value = s.nombre;
            document.getElementById("precio").value = s.precio;
            document.getElementById("descripcion").value = s.descripcion;
            panel.showModal();
        }
    }

    cargarServicios();
    cargarCitasAdmin();
});