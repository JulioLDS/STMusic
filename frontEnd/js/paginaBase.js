const listItems = document.querySelectorAll('.navegacao ul li');
const indicador = document.querySelector('.indicador');
const container = document.querySelector('.container');

const navClasses = ['home', 'conteudos', 'exercicios', 'status'];

// Posiciona indicador no item ativo
function positionIndicador(activeItem) {
  const gap = 30;
  const itemWidth = 60;
  const index = Array.from(listItems).indexOf(activeItem);
  const position = index * (itemWidth + gap);
  indicador.style.transform = `translateX(${position}px)`;
}

// Função que carrega o conteúdo JSON estruturado e monta HTML
async function carregarConteudo(className) {
  try {
    const res = await fetch(`../../data/${className}.json`);
    const data = await res.json();

    // Atualiza o conteúdo primeiro
    container.innerHTML = `
            <div class="${data.msg1.class}">
                ${data.msg1.conteudo.join("\n")}
            </div>
            <div class="${data.msg2.class}">
                ${data.msg2.conteudo.join("\n")}
            </div>
        `;

    // Só depois troca a classe
    navClasses.forEach(cls => container.classList.remove(cls));
    container.classList.add(className);

  } catch (error) {
    console.error("Erro ao carregar o conteúdo:", error);
    container.innerHTML = `<h1>Erro ao carregar conteúdo.</h1>`;
  }
}


// Inicializa a página com "home"
positionIndicador(document.querySelector('.navegacao ul li.active'));
carregarConteudo('home');

// Listener para clique no menu
listItems.forEach((item, index) => {
  item.addEventListener('click', function (e) {
    e.preventDefault(); // evita scroll ao topo pois o link é "#"

    // Atualiza active class
    listItems.forEach(li => li.classList.remove('active'));
    this.classList.add('active');

    // Move indicador
    positionIndicador(this);

    // Carrega conteúdo da classe selecionada
    carregarConteudo(navClasses[index]);
  });
});
