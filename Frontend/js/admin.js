const btnHamburguesa = document.getElementById('btnHamburguesa');
const sidebar = document.getElementById('sidebar');

btnHamburguesa.addEventListener('click', () => {
    sidebar.classList.toggle('activa');
});