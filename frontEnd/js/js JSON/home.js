async function carregarHome() {
  // Altera a classe do container para 'home'
  const className = window.setContainerClassByIndex
    ? window.setContainerClassByIndex(0)
    : "home";

  const container = document.querySelector(".container");

  try {
    const res = await fetch(`../../data/${className}.json`);
    const data = await res.json();

    const msg1Html = `
      <div class="${data.msg1.class}">
        ${data.msg1.conteudo.join("\n")}
      </div>
    `;

    const msg2Html = `
      <div class="${data.msg2.class}">
        ${data.msg2.conteudo.join("\n")}
      </div>
    `;

    container.innerHTML = msg1Html + msg2Html;

  } catch (error) {
    console.error("Erro ao carregar o conteúdo da home:", error);
    container.innerHTML = `<h1>Erro ao carregar conteúdo da home.</h1>`;
  }
}

// Executa ao iniciar
carregarHome();
