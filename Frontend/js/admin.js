import { supabase as db } from '../../Database/supabaseClient.js';

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

    // 🌍 Sincronización de idioma global
    const getIdioma = () => localStorage.getItem('idiomaSeleccionado') || 'es';

    if (btnToggle && contenedor) {
        btnToggle.addEventListener("click", () => {
            expandido = !expandido;
            contenedor.classList.toggle("expandido");
            const idioma = getIdioma();
            if (expandido) {
                btnToggle.textContent = idioma === 'en' ? "Hide services" : "Ocultar servicios";
            } else {
                btnToggle.textContent = idioma === 'en' ? "See more +" : "Ver mas +";
            }
        });
    }

    // --- 2. CARGAR SERVICIOS (CATÁLOGO ADMIN) ---
    async function cargarServicios() {
        if (!contenedor) return;
        try {
            const { data: servicios, error } = await db
                .from('servicios')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;

            if (!servicios || servicios.length === 0) {
                contenedor.innerHTML = '<p data-i18n="no_tratamientos">No hay tratamientos disponibles.</p>';
                return;
            }

            const idioma = getIdioma();

            contenedor.innerHTML = servicios.map(s => {
                const imgFinal = s.imagen_url 
                    ? URL_BASE_STORAGE + s.imagen_url 
                    : "../../../Media/Logo.png";

                // 🌍 Lógica Bilingüe para el catálogo
                const nombreAMostrar = (idioma === 'en' && s.nombre_en) ? s.nombre_en : s.nombre;
                const descAMostrar = (idioma === 'en' && s.descripcion_en) ? s.descripcion_en : (s.descripcion || 'Consulta con nuestros especialistas.');

                return `
                <section class="tarjeta-servicio">
                    <img src="${imgFinal}" alt="${nombreAMostrar}" 
                         style="width:100px; height:100px; object-fit:cover; border-radius:8px;"
                         onerror="this.src='../../../Media/Logo.png';">
                    
                    <h3 data-i18n-dinamico>${nombreAMostrar}</h3>
                    <p data-i18n-dinamico>${descAMostrar}</p>
                    <span class="precio">$${s.precio ? s.precio.toLocaleString() : '0'}</span>

                    <section class="acciones">
                        <button class="btn-editar" data-id="${s.id}" data-i18n="btn_editar">✏️ Editar</button>
                        <button class="btn-borrar" data-id="${s.id}" style="color:darkred;" data-i18n="btn_borrar">🗑️ Borrar</button>
                    </section> section>
            `}).join('');

            if (window.traducirPagina) window.traducirPagina();

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

    // --- 3. CARGAR CITAS (GESTIÓN ADMIN) ---
    async function cargarCitasAdmin() {
        if (!contenedorCitas) return;
        try {
            let { data: citas, error } = await db
                .from('Citas')
                .select(`
                    id,
                    fecha_hora,
                    Usuarios:Usuarios!Citas_usuario_id_fkey1 ( nombre, correo ),
                    servicios:servicio_id ( nombre, nombre_en )
                `)
                .order('fecha_hora', { ascending: true });

            if (error) throw error;

            const idioma = getIdioma();

            contenedorCitas.innerHTML = citas.map(c => {
                // 🌍 Traducir el nombre del servicio dentro de la cita
                const nombreServicioCita = (idioma === 'en' && c.servicios?.nombre_en) 
                    ? c.servicios.nombre_en 
                    : (c.servicios?.nombre || 'No encontrado');

                return `
                <section class="tarjeta-servicio"> 
                    <section class="info-cita">
                        <h3><span data-i18n="admin_paciente">Paciente</span>: ${c.Usuarios?.nombre || 'Sin nombre'}</h3>
                        <p><strong data-i18n="admin_servicio">Servicio:</strong> <span data-i18n-dinamico>${nombreServicioCita}</span></p>
                        <p><strong data-i18n="admin_fecha">Fecha:</strong> ${new Date(c.fecha_hora).toLocaleString()}</p>
                        <p><small>${c.Usuarios?.correo || ''}</small></p>
                    </section>
                    <section class="acciones">
                        <button class="btn-editar" data-i18n="btn_reprogramar" onclick="reprogramarCita(${c.id}, '${c.fecha_hora}')">✏️ Reprogramar</button>
                        <button class="btn-borrar" data-i18n="btn_cancelar" onclick="eliminarCitaAdmin(${c.id})" style="color:darkred;">🗑️ Cancelar</button>
                    </section> section>
            `}).join('');

            if (window.traducirPagina) window.traducirPagina();

        } catch (error) {
            console.error("Error citas:", error);
        }
    }

    // --- 4. GUARDAR / EDITAR (CON ALERTAS BILINGÜES) ---
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
                
                if (!upError) {
                    nombreArchivoParaBD = fileName;
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

            if (res.error) {
                alert("Error: " + res.error.message);
            } else {
                const idioma = getIdioma();
                const msgGuardado = idioma === 'en' ? "Saved successfully" : "Guardado correctamente";
                alert(msgGuardado);
                form.reset();
                panel.close();
                cargarServicios();
            }
        });
    }

    // --- FUNCIONES GLOBALES (VENTANAS DE CONFIRMACIÓN BILINGÜES) ---
    window.eliminarCitaAdmin = async (id) => {
        const idioma = getIdioma();
        const msgCancel = idioma === 'en' ? "Cancel appointment?" : "¿Cancelar cita?";
        if (!confirm(msgCancel)) return;
        await db.from('Citas').delete().eq('id', id);
        cargarCitasAdmin();
    };

    window.reprogramarCita = async (id, fechaActual) => {
        const idioma = getIdioma();
        const msgPrompt = idioma === 'en' ? "New date (YYYY-MM-DD HH:MM):" : "Nueva fecha (YYYY-MM-DD HH:MM):";
        const nuevaFecha = prompt(msgPrompt, new Date(fechaActual).toISOString().slice(0,16));
        if (!nuevaFecha) return;
        await db.from('Citas').update({ fecha_hora: new Date(nuevaFecha).toISOString() }).eq('id', id);
        cargarCitasAdmin();
    };

    // Inicialización
    cargarServicios();
    cargarCitasAdmin();
    
    // 🌍 Exportar funciones para que el traductor las invoque si es necesario refrescar
    window.cargarServiciosAdmin = cargarServicios;
    window.cargarCitasAdmin = cargarCitasAdmin;
});