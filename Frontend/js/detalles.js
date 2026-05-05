import { supabase } from '/Frontend/js/supabase.js';

// 🔗 Base solo para cuando la BD tenga nombres de archivo
const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Detalles%20Servicios/";

export async function cargarUnSoloProducto() {
    const contenedor = document.getElementById("contenedor-detalle");
    const parametrosURL = new URLSearchParams(window.location.search);
    const idServicio = parametrosURL.get("id");

    // 🔁 Redirección si no hay ID
    if (!idServicio) {
        window.location.href = "/Frontend/index/servicios.html";
        return;
    }

    // 🔎 Consulta a Supabase
    const { data: servicio, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('id', idServicio)
        .single();

    // ❌ Manejo de error
    if (error || !servicio) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>Tratamiento no encontrado</h2>
                <button onclick="window.location.href='/Frontend/index/servicios.html'" 
                    style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
                    Volver a Tratamientos
                </button>
            </div>`;
        return;
    }

    // 🖼️ Lógica inteligente para la imagen
    let imgFinal = "/Media/Logo.png";

    if (servicio.detalle_url) {
        if (servicio.detalle_url.startsWith("http")) {
            // ✔ Ya es URL completa
            imgFinal = servicio.detalle_url;
        } else {
            // ✔ Solo nombre de archivo
            imgFinal = URL_BASE_STORAGE + servicio.detalle_url;
        }
    }

    // 🧠 Debug (puedes quitar luego)
    console.log("Servicio:", servicio);
    console.log("detalle_url:", servicio.detalle_url);
    console.log("imgFinal:", imgFinal);

    // 🏷️ Título dinámico
    document.title = `${servicio.nombre} | Dentology`;

    // 🎨 Render HTML
    contenedor.innerHTML = `
        <article style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; text-align: center;">
            
            <img 
                src="${imgFinal}" 
                alt="${servicio.nombre}" 
                style="width: 100%; max-width: 500px; height: auto; border-radius: 10px; object-fit: cover; margin-bottom: 25px;"
                onerror="this.src='/Media/Logo.png';"
            >
            
            <h1 style="color: var(--primario); margin-bottom: 15px; font-size: 2.5rem;">
                ${servicio.nombre}
            </h1>
            
            <p style="font-size: 1.2rem; color: #555; margin-bottom: 25px; line-height: 1.6; text-align: justify;">
                ${servicio.descripcion 
                    ? servicio.descripcion 
                    : 'Consulta con nuestros especialistas para más información sobre este tratamiento.'}
            </p>
            
            <h2 style="color: #333; margin-bottom: 35px; font-size: 2rem;">
                $${servicio.precio ? servicio.precio.toLocaleString() : '0'}
            </h2>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                
                <button 
                    id="agendarBtn" 
                    data-servicio="${servicio.nombre}" 
                    style="background: var(--primario); color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; font-weight: bold;">
                    Agendar Cita
                </button>
                
                <button 
                    onclick="window.location.href='/Frontend/index/servicios.html'" 
                    style="background: #f0f0f0; color: #333; padding: 15px 30px; border: 1px solid #ccc; border-radius: 8px; font-size: 1.1rem; cursor: pointer;">
                    Volver a Tratamientos
                </button>
            </div>
        </article>
    `;
}