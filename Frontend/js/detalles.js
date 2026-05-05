import { supabase } from '/Frontend/js/supabase.js';

// URL base corregida para el bucket "Imagenes" y la carpeta "Carpeta Servicios"
const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Carpeta%20Servicios/";

export async function cargarUnSoloProducto() {
    const contenedor = document.getElementById("contenedor-detalle");
    const parametrosURL = new URLSearchParams(window.location.search);
    const idServicio = parametrosURL.get("id");

    if (!idServicio) {
        window.location.href = "/Frontend/index/servicios.html";
        return;
    }

    // Consultamos la tabla 'servicios'
    const { data: servicio, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('id', idServicio)
        .single();

    if (error || !servicio) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>Tratamiento no encontrado</h2>
                <button onclick="window.location.href='/Frontend/index/servicios.html'" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Volver a Tratamientos</button>
            </div>`;
        return;
    }

    /* 
       CORRECCIÓN CLAVE: 
       1. Usamos 'imagen_url' porque así se llama la columna en tu base de datos.
       2. Usamos encodeURIComponent() para que nombres como "limpieza dental.png" 
          funcionen correctamente en la URL.
    */
    const nombreImagen = servicio.imagen_url ? servicio.imagen_url.trim() : "";
    
    const imgFinal = nombreImagen 
        ? URL_BASE_STORAGE + encodeURIComponent(nombreImagen) 
        : "/Media/Logo.png";

    document.title = `${servicio.nombre} | Dentology`;

    contenedor.innerHTML = `
        <article style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; text-align: center;">
            <img src="${imgFinal}" alt="${servicio.nombre}" 
                 style="width: 100%; max-width: 500px; height: auto; border-radius: 10px; object-fit: cover; margin-bottom: 25px;" 
                 onerror="this.src='/Media/Logo.png';">
            
            <h1 style="color: var(--primario); margin-bottom: 15px; font-size: 2.5rem;">${servicio.nombre}</h1>
            
            <p style="font-size: 1.2rem; color: #555; margin-bottom: 25px; line-height: 1.6; text-align: justify;">
                ${servicio.descripcion ? servicio.descripcion : 'Consulta con nuestros especialistas para más información sobre este tratamiento.'}
            </p>
            
            <h2 style="color: #333; margin-bottom: 35px; font-size: 2rem;">$${servicio.precio ? servicio.precio.toLocaleString() : '0'}</h2>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <button id="agendarBtn" data-servicio="${servicio.nombre}" style="background: var(--primario); color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; font-weight: bold;">
                    Agendar Cita
                </button>
                <button onclick="window.location.href='/Frontend/index/servicios.html'" style="background: #f0f0f0; color: #333; padding: 15px 30px; border: 1px solid #ccc; border-radius: 8px; font-size: 1.1rem; cursor: pointer;">
                    Volver a Tratamientos
                </button>
            </div>
        </article>
    `;
}