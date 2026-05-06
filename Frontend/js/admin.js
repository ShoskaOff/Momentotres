import { supabase as db } from '../../Database/supabaseClient.js';

// 1. CONFIGURACIÓN DE RUTA
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
            // Usamos llaves para el botón de toggle también
            btnToggle.setAttribute('data-i18n', expandido ? 'btn_ocultar_servicios' : 'btn_ver_mas');
            if (typeof window.traducirPagina === 'function') window.traducirPagina();
        });
    }

    // --- 2. CARGAR SERVICIOS (CON TRADUCCIÓN) ---
    async function cargarServicios() {
        if (!contenedor) return;
        try {
            const { data: servicios, error } = await db
                .from('servicios')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;

            if (!servicios || servicios.length === 0) {
                contenedor.innerHTML = '<p data-i18n="no_servicios">No hay tratamientos disponibles.</p>';
                return;
            }

            contenedor.innerHTML = servicios.map(s => {
                const idIdioma = s.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
                const imgFinal = s.imagen_url ? URL_BASE_STORAGE + s.imagen_url : "../../../Media/Logo.png";

                return `
                <section class="tarjeta-servicio">
                    <img src="${imgFinal}" alt="${s.nombre}" 
                         style="width:100px; height:100px; object-fit:cover; border-radius:8px;"
                         onerror="this.src='../../../Media/Logo.png';">
                    <h3 data-i18n="nombre_${idIdioma}">${s.nombre}</h3>
                    <p data-i18n="desc_${idIdioma}">${s.descripcion || 'Consulta con nuestros especialistas.'}</p>
                    <span class="precio">$${s.precio ? s.precio.toLocaleString() : '0'}</span>

                    <section class="acciones">
                        <button class="btn-editar" data-id="${s.id}" data-i18n="btn_editar_icon">✏️ Editar</button>
                        <button class="btn-borrar" data-id="${s.id}" style="color:darkred;" data-i18n="btn_borrar_icon">🗑️ Borrar</button>
                    </section>
                </section>
            `}).join('');

            // Eventos de botones
            document.querySelectorAll('#crud-contenedor-servicios .btn-editar').forEach(b => {
                b.onclick = () => prepararEdicion(b.dataset.id);
            });
            document.querySelectorAll('#crud-contenedor-servicios .btn-borrar').forEach(b => {
                b.onclick = () => eliminarServicio(b.dataset.id);
            });

            // 🌍 TRADUCIR CONTENIDO DINÁMICO
            if (typeof window.traducirPagina === 'function') window.traducirPagina();

        } catch (error) {
            console.error("Error cargando servicios:", error);
        }
    }

    // --- 3. CARGAR CITAS (CON TRADUCCIÓN) ---
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

            contenedorCitas.innerHTML = citas.map(c => {
                const sNombre = c.servicios?.nombre || '';
                const idServicioCita = sNombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');

                return `
                <section class="tarjeta-servicio"> 
                    <section class="info-cita">
                        <h3><span data-i18n="paciente_label">Paciente:</span> ${c.Usuarios?.nombre || 'Sin nombre'}</h3>
                        <p><strong data-i18n="servicio_label">Servicio:</strong> <span data-i18n="nombre_${idServicioCita}">${sNombre || 'No encontrado'}</span></p>
                        <p><strong data-i18n="fecha_label">Fecha:</strong> ${new Date(c.fecha_hora).toLocaleString()}</p>
                        <p><small>${c.Usuarios?.correo || ''}</small></p>
                    </section>
                    <section class="acciones">
                        <button class="btn-editar" onclick="reprogramarCita(${c.id}, '${c.fecha_hora}')" data-i18n="btn_reprogramar">✏️ Reprogramar</button>
                        <button class="btn-borrar" onclick="eliminarCitaAdmin(${c.id})" style="color:darkred;" data-i18n="btn_cancelar_cita">🗑️ Cancelar</button>
                    </section>
                </section>
            `}).join('');

            if (typeof window.traducirPagina === 'function') window.traducirPagina();

        } catch (error) {
            console.error("Error citas:", error);
        }
    }

    // --- 4. GUARDAR / EDITAR ---
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = inputId.value;
            const file = document.getElementById("imagenInput")?.files[0];
            let nombreArchivoParaBD = "";

            if (file) {
                const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
                const { error: upError } = await db.storage
                    .from('Imagenes')
                    .upload(`Carpeta Servicios/${fileName}`, file);
                
                if (!upError) nombreArchivoParaBD = fileName;
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