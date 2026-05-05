import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const listaServicios = document.getElementById("listaServicios");
    const listaCitas = document.getElementById("listaCitas");
    const listaNotificaciones = document.getElementById("listaNotificaciones");

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
        window.location.href = "/Frontend/index/inicio.html";
        return;
    }

    // Función auxiliar para forzar la traducción
    const ejecutarTraduccion = () => {
        if (typeof window.traducirPagina === 'function') {
            window.traducirPagina();
        }
    };

    // =========================
    // NAVEGACIÓN SECCIONES
    // =========================
    window.mostrarSeccion = (seccion) => {
        document.querySelectorAll("main section").forEach(sec => {
            sec.style.display = "none";
        });

        const vista = document.getElementById(seccion);
        if (vista) vista.style.display = "block";
    };

    // =========================
    // LOGOUT GLOBAL
    // =========================
    window.logout = async () => {
        await supabase.auth.signOut();

        localStorage.removeItem("usuario_id");
        localStorage.removeItem("rol_id");
        localStorage.removeItem("auth_uuid");

        window.location.href = "/Frontend/index/inicio.html";
    };

    // =========================
    // SERVICIOS
    // =========================
    async function cargarServicios() {
        if (!listaServicios) return;

        const { data, error } = await supabase
            .from("servicios")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error(error);
            listaServicios.innerHTML = `<p data-i18n="error_carga_servicios">Error cargando servicios</p>`;
            return;
        }

        listaServicios.innerHTML = "";

        if (!data?.length) {
            listaServicios.innerHTML = `<p data-i18n="sin_servicios">No hay servicios</p>`;
            return;
        }

        data.forEach((servicio) => {
            const idIdioma = servicio.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
            const div = document.createElement("div");

            div.innerHTML = `
                <p data-i18n="nombre_${idIdioma}">${servicio.nombre ?? ""}</p>
                <p><span data-i18n="precio_actual">Precio actual</span>: ${servicio.precio ?? 0}</p>

                <input type="number"
                    class="nuevo-precio"
                    data-id="${servicio.id}"
                    data-i18n-placeholder="placeholder_nuevo_precio"
                    placeholder="Nuevo precio">

                <button class="actualizar-precio" data-id="${servicio.id}" data-i18n="btn_actualizar_precio">
                    Actualizar Precio
                </button>

                <hr>
            `;

            listaServicios.appendChild(div);
        });

        // Eventos para botones
        document.querySelectorAll(".actualizar-precio").forEach(btn => {
            btn.addEventListener("click", async function () {
                const id = this.dataset.id;
                const input = document.querySelector(`.nuevo-precio[data-id="${id}"]`);
                if (!input) return;

                const nuevoPrecio = Number(input.value);

                if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
                    alert(window.currentLang === 'en' ? "Enter a valid price" : "Ingresa un precio válido");
                    return;
                }

                const { error } = await supabase
                    .from("servicios")
                    .update({ precio: nuevoPrecio })
                    .eq("id", id);

                if (error) {
                    alert(window.currentLang === 'en' ? "Error updating price" : "Error actualizando precio");
                    return;
                }

                alert(window.currentLang === 'en' ? "Price updated" : "Precio actualizado");
                cargarServicios();
            });
        });

        ejecutarTraduccion();
    }

    // =========================
    // CITAS
    // =========================
    async function cargarCitas() {
        if (!listaCitas) return;

        const { data, error } = await supabase
            .from("Citas")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error(error);
            listaCitas.innerHTML = `<p data-i18n="error_carga_citas">Error cargando citas</p>`;
            return;
        }

        listaCitas.innerHTML = "";

        if (!data?.length) {
            listaCitas.innerHTML = `<p data-i18n="sin_citas">No hay citas</p>`;
            return;
        }

        data.forEach(cita => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p><span data-i18n="cita_label">Cita</span> #${cita.id}</p>
                <p>${cita.fecha_hora ?? ""}</p>
                <hr>
            `;

            listaCitas.appendChild(div);
        });

        ejecutarTraduccion();
    }

    // =========================
    // NOTIFICACIONES
    // =========================
    async function cargarNotificaciones() {
        if (!listaNotificaciones) return;

        const { data, error } = await supabase
            .from("Notificaciones")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error(error);
            listaNotificaciones.innerHTML = `<p data-i18n="error_carga_notif">Error cargando notificaciones</p>`;
            return;
        }

        listaNotificaciones.innerHTML = "";

        if (!data?.length) {
            listaNotificaciones.innerHTML = `<p data-i18n="sin_notif">No hay notificaciones</p>`;
            return;
        }

        data.forEach(n => {
            const div = document.createElement("div");
            div.innerHTML = `<p>${n.mensaje ?? ""}</p><hr>`;
            listaNotificaciones.appendChild(div);
        });

        ejecutarTraduccion();
    }

    // =========================
    // INIT
    // =========================
    await cargarServicios();
    await cargarCitas();
    await cargarNotificaciones();

    // mostrar inicio por defecto
    document.querySelectorAll("main section").forEach(sec => {
        sec.style.display = "none";
    }); 

    document.getElementById("inicioPanel").style.display = "block";
});