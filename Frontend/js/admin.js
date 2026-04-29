
import { supabase as db } from '../../Database/supabaseClient.js'; 



document.addEventListener('DOMContentLoaded', async () => {
  
    const contenedor = document.getElementById('crud-contenedor-servicios');
    const form = document.getElementById("formServicio");
    const panel = document.getElementById("panelCRUD");
    const btnNuevo = document.getElementById("btnNuevoServicio");

    const btnToggle = document.getElementById("btnToggleServicios");

let expandido = false;

if (btnToggle && contenedor) {
    btnToggle.addEventListener("click", () => {
        expandido = !expandido;

        contenedor.classList.toggle("expandido");

        btnToggle.textContent = expandido
            ? "Ocultar servicios"
            : "ver mas ";
    });
}

   
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
                    <h3>${s.nombre}</h3>
                    <p>${s.descripcion || 'Consulta con nuestros especialistas.'}</p>
                    <span class="precio">$${s.precio ? s.precio.toLocaleString() : '0'}</span>
                    

                </section>
            `).join('');
        } catch (error) {
            console.error("Error cargando servicios:", error);
            contenedor.innerHTML = '<p>Error al cargar los tratamientos.</p>';
        }
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            form.classList.add("gestion_servicios");
            const nuevoServicio = {
                nombre: document.getElementById("nombre").value,
                precio: parseFloat(document.getElementById("precio").value),
                descripcion: document.getElementById("descripcion").value, 
            };

            const { error } = await db.from('servicios').insert([nuevoServicio]);

            if (error) {
                alert("Error al guardar: " + error.message);
                console.error(error);
            } else {
                alert("¡Servicio agregado con éxito!");
                form.reset();
                if (panel) panel.close();
                cargarServicios(); // Recarga la lista
            }
        });
    }

    if (btnNuevo && panel) {
        btnNuevo.addEventListener("click", () => panel.showModal());
    }

    cargarServicios();
});
