document.addEventListener("DOMContentLoaded", ()=>{

const boton = document.getElementById("theme-toggle");

if(localStorage.getItem("tema") === "oscuro"){
    document.body.classList.add("dark-mode");

    if(boton){
        boton.textContent = "☀️";
    }
}else{
    if(boton){
        boton.textContent = "🌙";
    }
}

if(boton){
    boton.addEventListener("click", ()=>{

        document.body.classList.toggle("dark-mode");

        if(document.body.classList.contains("dark-mode")){
            boton.textContent = "☀️";
            localStorage.setItem("tema","oscuro");
        }else{
            boton.textContent = "🌙";
            localStorage.setItem("tema","claro");
        }

    });
}

});