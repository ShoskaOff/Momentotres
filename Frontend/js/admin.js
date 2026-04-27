import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const listaUsuarios = document.getElementById("listaUsuarios");
    const listaServicios = document.getElementById("listaServicios");
    const listaCitas = document.getElementById("listaCitas");
    const listaNotificaciones = document.getElementById("listaNotificaciones");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
        window.location.href = "/Frontend/index/inicio.html";
        return;
    }

    async function cargarUsuarios() {
        if (!listaUsuarios) return;

        const { data, error } = await supabase
            .from("Usuarios")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error(error);
            listaUsuarios.innerHTML = "<p>Error cargando usuarios</p>";
            return;
        }

        listaUsuarios.innerHTML = "";

        if (!data || data.length === 0) {
            listaUsuarios.innerHTML = "<p>No hay usuarios</p>";
            return;
        }

        data.forEach((usuario) => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p>Usuario ID: ${usuario.id}</p>
                <p>Rol ID: ${usuario.rol_id}</p>
                <button class="eliminar-usuario" data-id="${usuario.id}">
                    Eliminar
                </button>
                <hr>
            `;

            listaUsuarios.appendChild(div);
        });

        document.querySelectorAll(".eliminar-usuario").forEach((btn) => {
            btn.addEventListener("click", async function () {
                const id = this.dataset.id;

                const { error } = await supabase
                    .from("Usuarios")
                    .delete()
                    .eq("id", id);

                if (error) {
                    console.error(error);
                    alert("Error eliminando usuario");
                    return;
                }

                cargarUsuarios();
            });
        });
    }

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

        if (!data || data.length === 0) {
            listaServicios.innerHTML = "<p>No hay servicios</p>";
            return;
        }

        data.forEach((servicio) => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p>${servicio.nombre || ""}</p>
                <p>Precio: ${servicio.precio || 0}</p>
                <button class="eliminar-servicio" data-id="${servicio.id}">
                    Eliminar
                </button>
                <hr>
            `;

            listaServicios.appendChild(div);
        });

        document.querySelectorAll(".eliminar-servicio").forEach((btn) => {
            btn.addEventListener("click", async function () {
                const id = this.dataset.id;

                const { error } = await supabase
                    .from("servicios")
                    .delete()
                    .eq("id", id);

                if (error) {
                    console.error(error);
                    alert("Error eliminando servicio");
                    return;
                }

                cargarServicios();
            });
        });
    }

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

        if (!data || data.length === 0) {
            listaCitas.innerHTML = "<p>No hay citas</p>";
            return;
        }

        data.forEach((cita) => {
            const div = document.createElement("div");

            div.innerHTML = `
                <p>Cita #${cita.id}</p>
                <p>${cita.fecha_hora || ""}</p>
                <button class="eliminar-cita" data-id="${cita.id}">
                    Eliminar
                </button>
                <hr>
            `;

            listaCitas.appendChild(div);
        });

        document.querySelectorAll(".eliminar-cita").forEach((btn) => {
            btn.addEventListener("click", async function () {
                const id = this.dataset.id;

                const { error } = await supabase
                    .from("Citas")
                    .delete()
                    .eq("id", id);

                if (error) {
                    console.error(error);
                    alert("Error eliminando cita");
                    return;
                }

                cargarCitas();
            });
        });
    }

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

        if (!data || data.length === 0) {
            listaNotificaciones.innerHTML = "<p>No hay notificaciones</p>";
            return;
        }

        data.forEach((n) => {
            const div = document.createElement("div");
            div.innerHTML = `<p>${n.mensaje || ""}</p><hr>`;
            listaNotificaciones.appendChild(div);
        });
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async () => {
            await supabase.auth.signOut();

            localStorage.removeItem("usuario_id");
            localStorage.removeItem("rol_id");
            localStorage.removeItem("auth_uuid");

            window.location.href = "/Frontend/index/inicio.html";
        });
    }

    await cargarUsuarios();
    await cargarServicios();
    await cargarCitas();
    await cargarNotificaciones();
});