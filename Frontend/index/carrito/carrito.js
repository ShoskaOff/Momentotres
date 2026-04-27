document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema de carrito inicializado.");

    // --- 1. Lógica para AGREGAR ---
    // Usamos un selector condicional para no fallar si no hay botones en la página actual
    const botones = document.querySelectorAll('.btn-agregar');
    botones.forEach(btn => {
        btn.addEventListener('click', (e) => {
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
            alert(nuevoProducto.nombre + " añadido al carrito.");
        });
    });

    // --- 2. Lógica para RENDERIZAR ---
    const contenedorCarrito = document.getElementById('contenedor-carrito');
    if (contenedorCarrito) {
        renderizarCarrito();
    }

    // --- 3. Lógica para TEMA OSCURO ---
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) { // Verificamos que el botón exista antes de agregar el evento
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

// Función para dibujar el carrito
function renderizarCarrito() {
    const contenedor = document.getElementById('contenedor-carrito');
    const totalSpan = document.getElementById('total-carrito'); // Corregido ID
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

window.cambiarCantidad = function(index, cambio) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito[index]) {
        carrito[index].cantidad = (carrito[index].cantidad || 1) + cambio;
        if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
};

window.eliminarProducto = function(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
};