/**
 * DENTOLOGY - Sistema de Traducción Inteligente (Microsoft API + Supabase Integration)
 */

const key = "15yXRuVBMdx6OU4KTebuwdWx1keZGJLnt8KABIUfvCFjE5pp7jAHJQQJ99CEACYeBjFXJ3w3AAAbACOGemsz";
const region = "eastus";
const endpoint = "https://api.cognitive.microsofttranslator.com";

// 🧠 Cache para evitar consumo innecesario de la API
const cache = new Map();

/**
 * Función que conecta con el servicio de Microsoft Azure
 */
async function traducir(texto, idioma) {
    if (!texto || texto.trim() === "") return texto;
    
    const cacheKey = `${texto}-${idioma}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const res = await fetch(
            `${endpoint}/translate?api-version=3.0&to=${idioma}`,
            {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": key,
                    "Ocp-Apim-Subscription-Region": region,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify([{ Text: texto }])
            }
        );

        const data = await res.json();
        const traduccion = data[0].translations[0].text;

        cache.set(cacheKey, traduccion);
        return traduccion;

    } catch (error) {
        console.error("Error en el servicio de traducción:", error);
        return texto; // En caso de error, muestra el original
    }
}

/**
 * Función Principal Global
 * Traduce elementos estáticos y refresca contenido dinámico (tarjetas)
 */
window.traducirPagina = async function(idiomaForzado) {
    // 1. Sincronizar idioma en LocalStorage (usamos ambas llaves por compatibilidad)
    const idioma = idiomaForzado || localStorage.getItem("idiomaSeleccionado") || "es";
    localStorage.setItem("idiomaSeleccionado", idioma);
    localStorage.setItem("idioma", idioma); 

    // 2. Traducir elementos marcados (Estáticos [data-i18n] y Dinámicos [data-i18n-dinamico])
    const elementos = document.querySelectorAll("[data-i18n], [data-i18n-dinamico]");

    for (const el of elementos) {
        let original = el.getAttribute("data-original");
        
        // Si es la primera vez que se traduce, guardamos el texto original
        if (!original) {
            original = el.innerText.trim();
            el.setAttribute("data-original", original);
        }

        // Si volvemos al español, restauramos el texto original sin llamar a la API
        if (idioma === "es") {
            el.innerText = original;
            continue;
        }

        // Traducir mediante API
        const traducido = await traducir(original, idioma);
        el.innerText = traducido;
    }

    // 🚩 3. REFRESCAR TARJETAS DE SERVICIOS
    // Si la función cargarServicios existe en el JS de servicios, la llamamos para re-renderizar
    if (typeof window.cargarServicios === 'function') {
        if (!window.estaRecargandoServicios) {
            window.estaRecargandoServicios = true;
            console.log("Actualizando tarjetas al idioma:", idioma);
            await window.cargarServicios();
            window.estaRecargandoServicios = false;
        }
    }
}

/**
 * Configuración de Eventos y Carga Inicial
 */
document.addEventListener("DOMContentLoaded", () => {
    const btnEs = document.getElementById("btn-es");
    const btnEn = document.getElementById("btn-en");

    // Listeners para los botones de banderas/idioma
    if (btnEs) {
        btnEs.addEventListener("click", (e) => {
            e.preventDefault();
            window.traducirPagina("es");
        });
    }

    if (btnEn) {
        btnEn.addEventListener("click", (e) => {
            e.preventDefault();
            window.traducirPagina("en");
        });
    }

    // Ejecución automática al cargar si hay una preferencia guardada
    const idiomaGuardado = localStorage.getItem("idiomaSeleccionado");
    if (idiomaGuardado && idiomaGuardado !== "es") {
        window.traducirPagina(idiomaGuardado);
    }
});