const key = "15yXRuVBMdx6OU4KTebuwdWx1keZGJLnt8KABIUfvCFjE5pp7jAHJQQJ99CEACYeBjFXJ3w3AAAbACOGemsz";
const region = "eastus";
const endpoint = "https://api.cognitive.microsofttranslator.com";

// 🧠 cache para evitar llamadas repetidas
const cache = new Map();

// 🔤 función de traducción (Microsoft API)
async function traducir(texto, idioma) {
    if (!texto || texto.trim() === "") return texto;
    
    const cacheKey = `${texto}-${idioma}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

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
        console.error("Error traduciendo:", error);
        return texto; // fallback seguro
    }
}

// 🌍 Función Global para cambiar idioma
// La hacemos global (window.) para que tus otros JS puedan llamarla
window.traducirPagina = async function(idiomaForzado) {
    // 1. Determinar idioma (prioridad: parámetro > localStorage > defecto "es")
    const idioma = idiomaForzado || localStorage.getItem("idiomaSeleccionado") || "es";
    localStorage.setItem("idiomaSeleccionado", idioma);

    // 2. Buscar todos los elementos marcados para traducción
    const elementos = document.querySelectorAll("[data-i18n]");

    for (const el of elementos) {
        // Guardamos el texto original en un atributo para no perderlo al traducir varias veces
        let original = el.getAttribute("data-original");
        
        if (!original) {
            original = el.innerText.trim();
            el.setAttribute("data-original", original);
        }

        // Si el idioma es español y el original es español, restauramos y saltamos la API
        if (idioma === "es") {
            el.innerText = original;
            continue;
        }

        // Traducir usando la API
        const traducido = await traducir(original, idioma);
        el.innerText = traducido;
    }
}

// 🚀 Inicialización y Botones
document.addEventListener("DOMContentLoaded", () => {
    const btnEs = document.getElementById("btn-es");
    const btnEn = document.getElementById("btn-en");

    if (btnEs) {
        btnEs.addEventListener("click", () => window.traducirPagina("es"));
    }

    if (btnEn) {
        btnEn.addEventListener("click", () => window.traducirPagina("en"));
    }

    // Traducir automáticamente al cargar la página si ya había un idioma seleccionado
    const idiomaGuardado = localStorage.getItem("idiomaSeleccionado");
    if (idiomaGuardado && idiomaGuardado !== "es") {
        window.traducirPagina(idiomaGuardado);
    }
});