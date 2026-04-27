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
            listaServicios.innerHTML = "<p>Error cargando servicios</p>";
            return;
        }

        listaServicios.innerHTML = "";

        if (!data?.length) {
            listaServicios.innerHTML = "<p>No hay servicios</p>";
            return;
        }

        data.forEach((servicio) => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p>${servicio.nombre ?? ""}</p>
                <p>Precio actual: ${servicio.precio ?? 0}</p>

                <input type="number"
                    class="nuevo-precio"
                    data-id="${servicio.id}"
                    placeholder="Nuevo precio">

                <button class="actualizar-precio" data-id="${servicio.id}">
                    Actualizar Precio
                </button>

                <hr>
            `;

            listaServicios.appendChild(div);
        });

        document.querySelectorAll(".actualizar-precio").forEach(btn => {
            btn.addEventListener("click", async function () {

                const id = this.dataset.id;
                const input = document.querySelector(`.nuevo-precio[data-id="${id}"]`);

                if (!input) return;

                const nuevoPrecio = Number(input.value);

                if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
                    alert("Ingresa un precio válido");
                    return;
                }

                const { error } = await supabase
                    .from("servicios")
                    .update({ precio: nuevoPrecio })
                    .eq("id", id);

                if (error) {
                    console.error(error);
                    alert("Error actualizando precio");
                    return;
                }

                alert("Precio actualizado");
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
            listaCitas.innerHTML = "<p>Error cargando citas</p>";
            return;
        }

        listaCitas.innerHTML = "";

        if (!data?.length) {
            listaCitas.innerHTML = "<p>No hay citas</p>";
            return;
        }

        data.forEach(cita => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p>Cita #${cita.id}</p>
                <p>${cita.fecha_hora ?? ""}</p>
                <hr>
            `;

            listaCitas.appendChild(div);
        });
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
            listaNotificaciones.innerHTML = "<p>Error cargando notificaciones</p>";
            return;
        }

        listaNotificaciones.innerHTML = "";

        if (!data?.length) {
            listaNotificaciones.innerHTML = "<p>No hay notificaciones</p>";
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