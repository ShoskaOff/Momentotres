document.addEventListener("DOMContentLoaded", ()=>{ 

    const boton = document.getElementById("theme-toggle");
    const logo = document.querySelector(".logo img"); // 👈 NUEVO

    const logoClaro = "/Media/Logo.png";              // 👈 NUEVO
    const logoOscuro = "/Media/Logo Blanco.png";      // 👈 NUEVO

    // ===============================
    // EXISTE TEMA GUARDADO
    // ===============================
    if(localStorage.getItem("tema") === "oscuro"){
        document.body.classList.add("dark-mode");

        if(boton) boton.textContent = "☀️";
        if(logo) logo.src = logoOscuro; // 👈 CAMBIA LOGO INICIAL
    }else{
        if(boton) boton.textContent = "🌙";
        if(logo) logo.src = logoClaro; // 👈 CAMBIA LOGO INICIAL
    }

    // ===============================
    // BOTÓN PARA CAMBIAR TEMA
    // ===============================
    if(boton){
        boton.addEventListener("click", ()=>{

            document.body.classList.toggle("dark-mode");

            // Si se activó modo oscuro
            if(document.body.classList.contains("dark-mode")){
                boton.textContent = "☀️";
                localStorage.setItem("tema","oscuro");
                if(logo) logo.src = logoOscuro; // 👈 CAMBIA AL LOGO BLANCO
            }
            else{ // Si vuelve a modo claro
                boton.textContent = "🌙";
                localStorage.setItem("tema","claro");
                if(logo) logo.src = logoClaro; // 👈 VUELVE AL LOGO NORMAL
            }

        });
    }

});