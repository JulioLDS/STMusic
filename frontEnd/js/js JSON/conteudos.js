async function carregarConteudos() {
    // Configuração padrão igual ao home.js
    const className = window.setContainerClassByIndex
        ? window.setContainerClassByIndex(1) // índice 1 para conteúdos
        : "conteudos";

    const container = document.querySelector(".container");

    try {
        const res = await fetch(`../../data/${className}.json`);
        const data = await res.json();

        // Função para criar seções de cada nível
        const criarSecao = (nivel, conteudos) => {
            if (!conteudos || conteudos.length === 0) return '';
            return `
                <div class="nivel-container">
                    <h2 class="nivel-titulo">${nivel.toUpperCase()}</h2>
                    <div class="cards-row">
                        ${conteudos.map(conteudo => `
                            <div class="card" data-id="${conteudo.id}">
                                <div class="card-image">
                                    <img src="${conteudo.card.img}" alt="${conteudo.card.titulo}">
                                </div>
                                <h3>${conteudo.card.titulo}</h3>
                                <p>${conteudo.card.descricao}</p>
                                <button class="ver-conteudo">Ver Conteúdo</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        };

        // Monta todo o conteúdo
        container.innerHTML = `
            ${criarSecao('iniciante', data.conteudos.iniciante)}
            ${criarSecao('intermediário', data.conteudos.intermediario)}
            ${criarSecao('avançado', data.conteudos.avancado)}
        `;

        // Esconde o botão voltar quando está na lista de conteúdos
        document.querySelector('.btnVoltar').style.display = 'none';
        document.querySelector('.btnVoltar').onclick = null;

        // Adiciona eventos aos botões "Ver Conteúdo"
        document.querySelectorAll('.ver-conteudo').forEach(button => {
            button.addEventListener('click', async function () {
                const card = this.closest('.card');
                const conteudoId = card.getAttribute('data-id');

                // Encontra o conteúdo em qualquer nível
                const conteudoSelecionado = [
                    ...(data.conteudos.iniciante || []),
                    ...(data.conteudos.intermediario || []),
                    ...(data.conteudos.avancado || [])
                ].find(c => c.id === conteudoId);

                if (conteudoSelecionado) {
                    mostrarConteudoDetalhado(conteudoSelecionado);
                }
            });
        });

    } catch (error) {
        console.error("Erro ao carregar os conteúdos:", error);
        container.innerHTML = `<h1>Erro ao carregar conteúdos.</h1>`;
    }
}

function mostrarConteudoDetalhado(conteudo) {
    const container = document.querySelector(".container");

    // Mostra o conteúdo detalhado
    container.innerHTML = `
        <div class="conteudo-detalhado">
            ${conteudo.conteudo.join("\n")}
        </div>
    `;

    // Mostra e configura o botão voltar no header
    const btnVoltar = document.querySelector('.btnVoltar');
    btnVoltar.style.display = 'block';
    btnVoltar.onclick = function (e) {
        e.preventDefault();
        carregarConteudos();
    };
}

// Verifica se é a página de conteúdos e carrega
if (document.querySelector('.container').classList.contains('conteudos')) {
    // Esconde o botão voltar inicialmente
    document.querySelector('.btnVoltar').style.display = 'none';
    carregarConteudos();
}