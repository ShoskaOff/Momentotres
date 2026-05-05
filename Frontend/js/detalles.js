import { supabase } from '/Frontend/js/supabase.js';

const URL_BASE_STORAGE = "https://jdofaujfqsyiwauwttcd.supabase.co/storage/v1/object/public/Imagenes/Detalles%20Servicios/";

export async function cargarUnSoloProducto() {
    const contenedor = document.getElementById("contenedor-detalle");
    if (!contenedor) return;

    const parametrosURL = new URLSearchParams(window.location.search);
    const idServicio = parametrosURL.get("id");
    
    // 🌍 Sincronizamos con la clave correcta del traductor
    const idioma = localStorage.getItem('idiomaSeleccionado') || 'es';

    if (!idServicio) {
        window.location.href = "/Frontend/index/servicios.html";
        return;
    }

    const { data: servicio, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('id', idServicio)
        .single();

    if (error || !servicio) {
        const tituloError = idioma === 'en' ? "Treatment not found" : "Tratamiento no encontrado";
        const btnVolver = idioma === 'en' ? "Back to Treatments" : "Volver a Tratamientos";
        
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>${tituloError}</h2>
                <button onclick="window.location.href='/Frontend/index/servicios.html'" 
                    style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
                    ${btnVolver}
                </button>
            </div>`;
        return;
    }

    // 🖼️ Lógica para la imagen
    let imgFinal = "/Media/Logo.png";
    if (servicio.detalle_url) {
        imgFinal = servicio.detalle_url.startsWith("http") 
            ? servicio.detalle_url 
            : URL_BASE_STORAGE + servicio.detalle_url;
    }

    // ✅ CORRECCIÓN: Usamos directamente 'nombre' y 'descripcion' que son las columnas reales.
    // El atributo 'data-i18n-dinamico' en el HTML se encargará de traducirlos.
    const nombreAMostrar = servicio.nombre;
    const descripcionAMostrar = servicio.descripcion;

    document.title = `${nombreAMostrar} | Dentology`;

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
                alt="${nombreAMostrar}" 
                style="width: 100%; max-width: 500px; height: auto; border-radius: 10px; object-fit: cover; margin-bottom: 25px;"
                onerror="this.src='/Media/Logo.png';"
            >
            
            <h1 style="color: var(--primario); margin-bottom: 15px; font-size: 2.5rem;" data-i18n-dinamico>
                ${nombreAMostrar}
            </h1>
            
            <p style="font-size: 1.2rem; color: #555; margin-bottom: 25px; line-height: 1.6; text-align: justify;" data-i18n-dinamico>
                ${descripcionAMostrar || 'Consulta con nuestros especialistas.'}
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
        background: #99e9e2;
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

    // 🌍 Traducir botones y textos dinámicos
    if (window.traducirPagina) window.traducirPagina();

    // ✅ CORRECCIÓN EN EL EVENTO: Nos aseguramos de enviar el nombre real para que no llegue 'null'
    const agendarBtn = document.getElementById("agendarBtn");
    if (agendarBtn) {
        agendarBtn.onclick = () => {
            // Enviamos el nombre del servicio obtenido de la base de datos
            window.location.href = `/Frontend/index/PaginaUsuario/usuario.html?servicio=${encodeURIComponent(nombreAMostrar)}`;
        };
    }
}

// ... al final de cargarUnSoloProducto ...
const agendarBtn = document.getElementById("agendarBtn");
if (agendarBtn) {
    agendarBtn.onclick = () => {
        // ✅ Aseguramos que usamos servicio.nombre que es el que viene de Supabase
        const nombreParaEnviar = servicio.nombre; 
        
        if (nombreParaEnviar) {
            window.location.href = `/Frontend/index/PaginaUsuario/usuario.html?servicio=${encodeURIComponent(nombreParaEnviar)}`;
        } else {
            console.error("No se encontró el nombre del servicio para enviar");
            window.location.href = `/Frontend/index/PaginaUsuario/usuario.html`;
        }
    };
}