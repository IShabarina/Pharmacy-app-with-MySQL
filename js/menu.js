// Меню для мобильной версии:

const hamb = document.getElementById('hamb');
const menu = document.querySelector('.main-menu');
hamb.addEventListener('click', openMenu);


function openMenu(e) {
    e.preventDefault();
    menu.classList.toggle('opened');
    hamb.classList.toggle('active');
}