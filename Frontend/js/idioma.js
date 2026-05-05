const key = "15yXRuVBMdx6OU4KTebuwdWx1keZGJLnt8KABIUfvCFjE5pp7jAHJQQJ99CEACYeBjFXJ3w3AAAbACOGemsz";
const region = "eastus";
const endpoint = "https://api.cognitive.microsofttranslator.com";

// 🧠 cache para evitar llamadas repetidas
const cache = new Map();

// 🔤 función de traducción
async function traducir(texto, idioma) {
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

// 🌍 cambiar idioma de toda la web
async function cambiarIdioma(idioma) {
  const elementos = document.querySelectorAll("[data-i18n]");

  for (const el of elementos) {
    const original = el.getAttribute("data-original") || el.innerText;

    if (!el.getAttribute("data-original")) {
      el.setAttribute("data-original", original);
    }

    const traducido = await traducir(original, idioma);
    el.innerText = traducido;
  }
}

// 🇪🇸 botón español
document.addEventListener("DOMContentLoaded", () => {
  const btnEs = document.getElementById("btn-es");
  const btnEn = document.getElementById("btn-en");

  if (btnEs) {
    btnEs.addEventListener("click", () => {
      cambiarIdioma("es");
    });
  }

  if (btnEn) {
    btnEn.addEventListener("click", () => {
      cambiarIdioma("en");
    });
  }
});