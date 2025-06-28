const listItems = document.querySelectorAll('.navegacao ul li');
const indicador = document.querySelector('.indicador');

// Posição inicial (Home)
positionIndicador(document.querySelector('.navegacao ul li.active'));

listItems.forEach(item => {
    item.addEventListener('click', function () {
        // Remove a classe 'active' de todos os itens
        listItems.forEach(li => li.classList.remove('active'));

        // Adiciona a classe 'active' apenas no item clicado
        this.classList.add('active');

        // Move o indicador para o item clicado
        positionIndicador(this);
    });
});

function positionIndicador(activeItem) {
    const gap = 30; // O mesmo gap do CSS (30px)
    const itemWidth = 60; // Largura do item do menu (60px)

    // Calcula a posição do item ativo
    const index = Array.from(listItems).indexOf(activeItem);
    const position = index * (itemWidth + gap);

    // Ajusta a posição do indicador
    indicador.style.transform = `translateX(${position}px)`;
}