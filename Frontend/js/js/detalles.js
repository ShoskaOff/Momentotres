// ==============================
// IDIOMA ACTUAL
// ==============================
let idiomaActual = "es";


// ==============================
// TEXTOS GENERALES
// ==============================
const textos = {
  es: {
    tituloPagina: "Tratamientos Odontológicos",
    verDetalle: "Ver detalle",
    cerrar: "Cerrar"
  },
  en: {
    tituloPagina: "Dental Treatments",
    verDetalle: "View details",
    cerrar: "Close"
  }
};


// ==============================
// BASE DE DATOS MULTI-IDIOMA
// ==============================
const tratamientos = {

  blanqueamiento: {
    es: {
      titulo: "Blanqueamiento Dental",
      corta: "Dientes más blancos",
      descripcion: "Aclara varios tonos del diente.",
      beneficios: ["Resultados rápidos", "Seguro", "Mejora estética"],
      precio: "Precio: $120.000 COP"
    },
    en: {
      titulo: "Teeth Whitening",
      corta: "Whiter teeth",
      descripcion: "Whitens several shades of your teeth.",
      beneficios: ["Fast results", "Safe", "Better appearance"],
      precio: "Price: $120,000 COP"
    },
    imagen: "https://via.placeholder.com/400x200"
  },

  limpieza: {
    es: {
      titulo: "Limpieza Dental",
      corta: "Salud bucal",
      descripcion: "Elimina placa y sarro.",
      beneficios: ["Previene caries", "Mejor aliento", "Elimina sarro"],
      precio: "Precio: $50.000 COP"
    },
    en: {
      titulo: "Dental Cleaning",
      corta: "Oral health",
      descripcion: "Removes plaque and tartar.",
      beneficios: ["Prevents cavities", "Fresh breath", "Removes tartar"],
      precio: "Price: $50,000 COP"
    },
    imagen: "https://via.placeholder.com/400x200"
  }

};


// ==============================
// FUNCIÓN: cambiarIdioma()
// ==============================

function cambiarIdioma(idioma) {
  idiomaActual = idioma;

  // Cambiar textos generales
  document.getElementById("tituloPagina").textContent = textos[idioma].tituloPagina;
  document.getElementById("cerrarBtn").textContent = textos[idioma].cerrar;

  // Cambiar botones
  document.getElementById("btn1").textContent = textos[idioma].verDetalle;
  document.getElementById("btn2").textContent = textos[idioma].verDetalle;

  // Cambiar títulos de tratamientos
  document.getElementById("t1").textContent = tratamientos.blanqueamiento[idioma].titulo;
  document.getElementById("t1desc").textContent = tratamientos.blanqueamiento[idioma].descripcion;

  document.getElementById("t2").textContent = tratamientos.limpieza[idioma].titulo;
  document.getElementById("t2desc").textContent = tratamientos.limpieza[idioma].descripcion;
}


// ==============================
// FUNCIÓN: verDetalle()
// ==============================

function verDetalle(tipo) {

  const t = tratamientos[tipo][idiomaActual];

  document.getElementById("titulo").textContent = t.titulo;
  document.getElementById("imagen").src = tratamientos[tipo].imagen;
  document.getElementById("descripcionCorta").textContent = t.corta;
  document.getElementById("descripcion").textContent = t.descripcion;
  document.getElementById("precio").textContent = t.precio;

  // Beneficios
  const lista = document.getElementById("beneficios");
  lista.innerHTML = "";

  t.beneficios.forEach(b => {
    const li = document.createElement("li");
    li.textContent = b;
    lista.appendChild(li);
  });

  document.getElementById("modalDetalle").showModal();
}


// ==============================
// FUNCIÓN: cerrarDetalle()
// ==============================

function cerrarDetalle() {
  document.getElementById("modalDetalle").close();
}