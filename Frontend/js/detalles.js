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

    // 🎨 Render HTML (SE MANTIENE TODO + CARRITO AGREGADO)
    contenedor.style.display = "flex";
    contenedor.style.justifyContent = "center";
    contenedor.style.alignItems = "center";
    contenedor.style.minHeight = "80vh";

    contenedor.innerHTML = `
        <article style="background: white;
    background: white;
    padding: 40px;
    display:flex;
     justify-content:center;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    max-width: 800px;
    margin: 0 auto;
    text-align: center;">
            
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

            <section class="producto" 
            data-id="${servicio.id}" 
            data-nombre="${servicio.nombre}" 
             data-precio="${servicio.precio}">
    
    <button class="btn-agregar"
        style="
            width: 100%;
        max-width: 280px;
        padding: 14px;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        cursor: pointer;
        font-weight: bold;
        background: #ddacd7;
        color: white;
        transition: 0.3s;
    "
    onmouseover="
        this.style.transform='scale(1.05)';
        this.style.boxShadow='0 0 15px rgba(180, 88, 88, 0.7)';
    "
    onmouseout="
        this.style.transform='scale(1)';
        this.style.boxShadow='none';
    "
    >
         Agregar al carrito
    </button>
</section>
            
            <section style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
                
                <button 
                    id="agendarBtn" 
                    data-servicio="${servicio.nombre}" 
                    style="
                        width: 100%;
                        max-width: 280px;
                        padding: 14px;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        cursor: pointer;
                        font-weight: bold;
                        background: linear-gradient(45deg, #5b5f97, #787cc4);
                        color: white;
                        transition: 0.3s;
                    "
    onmouseover="
        this.style.transform='scale(1.05)';
        this.style.boxShadow='0 0 15px rgba(14, 1, 1, 0.7)';
    "
    onmouseout="
        this.style.transform='scale(1)';
        this.style.boxShadow='none';
    "
            >
     Agendar Cita
                </button>
                
                <button 
                    onclick="window.location.href='/Frontend/index/servicios.html'" 
                    style="
        width: 100%;
        max-width: 280px;
        padding: 14px;
        border-radius: 10px;
        font-size: 1rem;
        cursor: pointer;
        background: #f2f2f2;
        color: #333;
        border: 1px solid #ccc;
        transition: 0.3s;
    "
    onmouseover="
        this.style.transform='scale(1.05)';
        this.style.boxShadow='0 0 15px rgba(180, 88, 88, 0.7)';
    "
    onmouseout="
        this.style.transform='scale(1)';
        this.style.boxShadow='none';
    "
>
    ⬅ Volver a Tratamientos
                </button>
            </section>
        </article>
    `;
}