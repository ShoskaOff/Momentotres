document.addEventListener("DOMContentLoaded", ()=>{

const boton = document.getElementById("theme-toggle");

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

if(localStorage.getItem("tema") === "oscuro"){
    document.body.classList.add("dark-mode");
    boton.textContent = "☀️";
}

});