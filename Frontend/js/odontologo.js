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
            listaServicios.innerHTML = "<p data-i18n='error_servicios'>Error cargando servicios</p>";
            if (window.traducirPagina) window.traducirPagina();
            return;
        }

        listaServicios.innerHTML = "";

        if (!data?.length) {
            listaServicios.innerHTML = "<p data-i18n='no_servicios'>No hay servicios</p>";
            if (window.traducirPagina) window.traducirPagina();
            return;
        }

        data.forEach((servicio) => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p>${servicio.nombre ?? ""}</p>
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

        if (window.traducirPagina) window.traducirPagina();

        document.querySelectorAll(".actualizar-precio").forEach(btn => {
            btn.addEventListener("click", async function () {

                const id = this.dataset.id;
                const input = document.querySelector(`.nuevo-precio[data-id="${id}"]`);

                if (!input) return;

                const nuevoPrecio = Number(input.value);

                if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
                    const msgValid = localStorage.getItem('idioma') === 'en' ? "Enter a valid price" : "Ingresa un precio válido";
                    alert(msgValid);
                    return;
                }

                const { error } = await supabase
                    .from("servicios")
                    .update({ precio: nuevoPrecio })
                    .eq("id", id);

                if (error) {
                    console.error(error);
                    const msgError = localStorage.getItem('idioma') === 'en' ? "Error updating price" : "Error actualizando precio";
                    alert(msgError);
                    return;
                }

                const msgOk = localStorage.getItem('idioma') === 'en' ? "Price updated" : "Precio actualizado";
                alert(msgOk);
                cargarServicios();
            });
        });
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
            listaCitas.innerHTML = "<p data-i18n='error_citas'>Error cargando citas</p>";
            if (window.traducirPagina) window.traducirPagina();
            return;
        }

        listaCitas.innerHTML = "";

        if (!data?.length) {
            listaCitas.innerHTML = "<p data-i18n='no_citas'>No hay citas</p>";
            if (window.traducirPagina) window.traducirPagina();
            return;
        }

        data.forEach(cita => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p><span data-i18n="cita_num">Cita</span> #${cita.id}</p>
                <p>${cita.fecha_hora ?? ""}</p>
                <hr>
            `;

            listaCitas.appendChild(div);
        });

        if (window.traducirPagina) window.traducirPagina();
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
            listaNotificaciones.innerHTML = "<p data-i18n='error_notificaciones'>Error cargando notificaciones</p>";
            if (window.traducirPagina) window.traducirPagina();
            return;
        }

        listaNotificaciones.innerHTML = "";

        if (!data?.length) {
            listaNotificaciones.innerHTML = "<p data-i18n='no_notificaciones'>No hay notificaciones</p>";
            if (window.traducirPagina) window.traducirPagina();
            return;
        }

        data.forEach(n => {
            const div = document.createElement("div");
            div.innerHTML = `<p>${n.mensaje ?? ""}</p><hr>`;
            listaNotificaciones.appendChild(div);
        });
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