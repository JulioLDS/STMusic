import { ConteudoController } from "/js/controllers/ConteudoController.js";
import { ExercicioController } from "/js/controllers/ExercicioController.js";
import { StatusController } from "/js/controllers/StatusController.js";

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
    // Limpa classes do container
    navClasses.forEach(cls => container.classList.remove(cls));
    container.classList.add(className);
    container.innerHTML = '';

    const header = document.querySelector("header");
    const btnVoltar = document.querySelector(".btnVoltar");
    const btnSair = document.querySelector(".btnSair");

    // Reset estilos do header e dos botões
    header.style.backgroundColor = ""; // volta ao padrão
    btnSair.style.display = "none";
    btnVoltar.style.display = "none";
    btnVoltar.onclick = null;

    // STATUS
    if (className === 'status') {
      // Deixa header transparente e mostra botão sair
      header.style.backgroundColor = "transparent";
      btnSair.style.display = "block";

      if (typeof carregarStatus === 'function') {
        new StatusController().init();
      } else {
        container.innerHTML = `<h1>Função "carregarStatus" não encontrada.</h1>`;
      }
      return;
    }

    // CONTEÚDOS
    if (className === 'conteudos') {
      new ConteudoController().init();
      return;
    }

    // EXERCÍCIOS
    if (className === 'exercicios') {
      new ExercicioController().init();
      return;
    }

    // OUTROS (home, exercicios etc)
    const res = await fetch(`../../data/${className}.json`);
    const data = await res.json();

    container.innerHTML = `
      <div class="${data.msg1.class}">
          ${data.msg1.conteudo.join("\n")}
      </div>
      <div class="${data.msg2.class}">
          ${data.msg2.conteudo.join("\n")}
      </div>
    `;
  } catch (error) {
    console.error("Erro ao carregar o conteúdo:", error);
    container.innerHTML = `<h1>Erro ao carregar conteúdo.</h1>`;
  }
}


// Inicializa a página com "home"
positionIndicador(document.querySelector('.navegacao ul li.active'));
carregarConteudo('home');

// Exponha a função para uso por outras views (ex.: botão "Praticar")
window.carregarConteudo = carregarConteudo;

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
