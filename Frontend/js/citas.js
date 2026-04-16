document.addEventListener("DOMContentLoaded", function () {

const urlParams = new URLSearchParams(window.location.search);
const nombreProducto = urlParams.get('servicio');

if (nombreProducto) {
    document.getElementById("servicioSeleccionado").innerText = "Servicio: " + nombreProducto;
    document.getElementById("servicio").value = nombreProducto; 
}
  
    
   document.getElementById("formCita").addEventListener("submit", function (e) {
    e.preventDefault();

    let servicioVal = document.getElementById("servicio").value;
    let fecha = document.getElementById("fecha").value;
    let hora = document.getElementById("hora").value;

    if (!servicioVal || !fecha || !hora) {
        alert("Completa todos los campos");
        return;
    }

    let citas = JSON.parse(localStorage.getItem("citas")) || [];

    //  validar citas 

    let conflicto = citas.find(cita => 
        cita.fecha === fecha && cita.hora === hora
    );

    if (conflicto) {
        alert("Esta cita ya está ocupada ");
        return;
    }

    
    citas.push({
        servicio: servicioVal,
        fecha: fecha,
        hora: hora
    });

    localStorage.setItem("citas", JSON.stringify(citas));

    alert("Cita agendada con éxito ");

    mostrarHistorial();
});

 mostrarHistorial();
});

function mostrarHistorial() {
    let lista = document.getElementById("listaCitas");
    lista.innerHTML = "";

    let citas = JSON.parse(localStorage.getItem("citas") || "[]");

    if (citas.length === 0) {
        lista.innerHTML = "<p>No hay citas aún</p>";
        return;
    }

    citas.forEach((cita, index) => {
        let articulo = document.createElement("article");
        articulo.className = "cita";

        articulo.innerHTML = `
            <strong>${cita.servicio}</strong><br>
             ${cita.fecha}<br>
             ${cita.hora}<br><br>
            <button onclick="cancelarCita(${index})"> Cancelar </button>
        `;

        lista.appendChild(articulo);
    });
}


function cancelarCita(index) {
    let citas = JSON.parse(localStorage.getItem("citas")) || [];

    if (confirm("¿Seguro que quieres cancelar esta cita?")) {
        citas.splice(index, 1);
        localStorage.setItem("citas", JSON.stringify(citas));
        mostrarHistorial();
    }
}
