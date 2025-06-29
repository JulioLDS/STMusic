const listItems = document.querySelectorAll('.navegacao ul li');
const indicador = document.querySelector('.indicador');
const container = document.querySelector('.container');

// Mapeia cada item de navegação para a classe correspondente da container
const navClasses = ['home', 'conteudos', 'exercicios', 'status'];

// Posição inicial (Home)
positionIndicador(document.querySelector('.navegacao ul li.active'));

listItems.forEach((item, index) => {
    item.addEventListener('click', function () {
        // Remove a classe 'active' de todos os itens
        listItems.forEach(li => li.classList.remove('active'));

        // Adiciona a classe 'active' apenas no item clicado
        this.classList.add('active');

        // Move o indicador para o item clicado
        positionIndicador(this);

        // Atualiza a classe da .container
        updateContainerClass(index);
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

async function updateContainerClass(activeIndex) {
    const className = navClasses[activeIndex];

    // Remove todas as classes antigas
    navClasses.forEach(cls => container.classList.remove(cls));

    // Adiciona a nova classe
    container.classList.add(className);

    try {
        // Caminho do JSON por nome da classe
        const res = await fetch(`../../data/${className}.json`);
        const data = await res.json();

        // Insere o conteúdo HTML vindo do JSON
        container.innerHTML = data.html || `<h1>Conteúdo não encontrado.</h1>`;
    } catch (error) {
        console.error("Erro ao carregar o conteúdo:", error);
        container.innerHTML = `<h1>Erro ao carregar conteúdo.</h1>`;
    }
}

updateContainerClass(0); // Carrega o conteúdo "home" ao iniciar

