import { supabase } from "../../../Database/supabaseClient.js";

async function cargarServicios() {
  const { data } = await getServicios();

  const contenedor = document.getElementById("contenedorServicios");

  contenedor.innerHTML = "";

  data.forEach(s => {
    contenedor.innerHTML += `
      <div>
        <h3>${s.nombre}</h3>
        <p>${s.descripcion}</p>
      </div>
    `;
  });
}

cargarServicios();