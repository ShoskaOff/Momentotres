document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema de carrito inicializado.");

    // --- 1. Lógica para AGREGAR (CORREGIDA 🔥) ---
    // 👉 Ahora usa delegación de eventos (funciona con contenido dinámico)
    document.addEventListener('click', (e) => {

        if (e.target.classList.contains('btn-agregar')) {

            const prod = e.target.closest('.producto');
            if (!prod) return;

            const nuevoProducto = {
                id: prod.dataset.id,
                nombre: prod.dataset.nombre,
                precio: parseFloat(prod.dataset.precio),
                cantidad: 1 
            };

            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            const indiceExistente = carrito.findIndex(p => p.id === nuevoProducto.id);
            
            if (indiceExistente !== -1) {
                carrito[indiceExistente].cantidad += 1;
            } else {
                carrito.push(nuevoProducto);
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));

            // 🔥 REDIRECCIÓN CORREGIDA (ruta relativa)
            const ir = confirm(nuevoProducto.nombre + " añadido 🛒 ¿Ir al carrito?");

            if (ir) {
                 window.location.href = "/Frontend/index/carrito/carritoo.html";

             }
        }
    });

    // --- 2. Lógica para RENDERIZAR ---
    const contenedorCarrito = document.getElementById('contenedor-carrito');
    if (contenedorCarrito) {
        renderizarCarrito();
    }

    // --- 3. Lógica para TEMA OSCURO ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });

        // Cargar preferencia al iniciar
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
});


// --- 4. Función para dibujar el carrito ---
function renderizarCarrito() {
    const contenedor = document.getElementById('contenedor-carrito');
    const totalSpan = document.getElementById('total-carrito');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    contenedor.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
        carrito.forEach((prod, index) => {
            const cantidad = prod.cantidad || 1;
            total += (prod.precio * cantidad);
            
            contenedor.innerHTML += `
                <div class="item-carrito">
                    <span>${prod.nombre}</span>
                    <div class="controles">
                        <button onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span>${cantidad}</span>
                        <button onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                    <span>$${(prod.precio * cantidad).toLocaleString()}</span>
                    <button onclick="eliminarProducto(${index})">Eliminar</button>
                </div>`;
        });
    }

    if (totalSpan) totalSpan.innerText = total.toLocaleString();
}


// --- 5. Cambiar cantidad ---
window.cambiarCantidad = function(index, cambio) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito[index]) {
        carrito[index].cantidad = (carrito[index].cantidad || 1) + cambio;

        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
};


// --- 6. Eliminar producto ---
window.eliminarProducto = function(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.splice(index, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
};
