export class ExercicioView {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.btnVoltar = document.querySelector(".btnVoltar");
    }

    renderSecao(nivel, exercicios) {
        if (!exercicios || exercicios.length === 0) return "";

        const titulos = {
            iniciante: "Iniciante",
            intermediario: "Intermediário",
            avancado: "Avançado"
        };

        return `
            <div class="level-section">
                <h2 class="section-title ${nivel}">${titulos[nivel] || nivel}</h2>
                <div class="swiper-button-prev swiper-button-prev-${nivel}"></div>
                <div class="swiper swiper-${nivel}">
                    <div class="swiper-wrapper">
                        ${exercicios.map(ex => `
                            <div class="swiper-slide">
                                <div class="card ${(nivel === 'intermediario' || nivel === 'avancado') ? 'card-restrito' : ''}" 
                                    data-id="${ex.id}" data-nivel="${nivel}">
                                    ${(nivel === 'intermediario' || nivel === 'avancado') ? '<div class="ribbon">RESTRITO</div>' : ''}
                                    <div class="card-image">
                                        <img src="${ex.card.img}" alt="${ex.card.titulo}">
                                        <p class="card-tag">Exercício</p>
                                        <p class="card-pontuation">0/10</p>
                                        <p class="card-try">Tentativas: 0</p>
                                    </div>
                                    <div class="card-content">
                                        <h3 class="card-title">${ex.card.titulo}</h3>
                                        <p class="card-text">${ex.card.descricao}</p>
                                        <div class="card-footer">
                                            <a href="#" class="card-button saiba-mais">Praticar</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="swiper-pagination"></div>
                </div>
                <div class="swiper-button-next swiper-button-next-${nivel}"></div>
            </div>
        `;
    }

    renderLista(exerciciosPorNivel) {
        this.container.innerHTML = `
            ${this.renderSecao("iniciante", exerciciosPorNivel.iniciante)}
            ${this.renderSecao("intermediario", exerciciosPorNivel.intermediario)}
            ${this.renderSecao("avancado", exerciciosPorNivel.avancado)}
        `;
        this.btnVoltar.style.display = "none";
    }

    renderDetalhe(exercicio) {
        this.currentIndex = 0; // começa na primeira pergunta
        this.exercicioAtual = exercicio;
        this.mostrarPergunta();
    }

    renderDetalhe(exercicio, onVoltar) {
        this.currentIndex = 0;
        this.exercicioAtual = exercicio;
        this.onVoltar = onVoltar;
        this.mostrarPergunta();
    }

    mostrarPergunta() {
        const q = this.exercicioAtual.perguntas[this.currentIndex];

        this.container.innerHTML = `
        <div class="exercicio-detalhado">
            <h2>${this.exercicioAtual.card.titulo}</h2>
            <div class="pergunta-group">
                <p class="pergunta-titulo"><strong>${this.currentIndex + 1}. ${q.pergunta}</strong></p>
                <div class="opcoes-container">
                    ${q.opcoes.map((opcao, j) => `
                        <button class="opcao-btn" data-index="${j}">${opcao}</button>
                    `).join('')}
                </div>
                ${q.explicacao ? `<div class="explicacao" style="display:none;">${q.explicacao}</div>` : ''}
            </div>
            <div class="navegacao-pergunta"></div>
        </div>
    `;

        // Configura o botão voltar global
        this.btnVoltar.style.display = "block";
        this.btnVoltar.onclick = () => {
            if (this.onVoltar) this.onVoltar();
        };

        // Eventos para alternativas
        this.container.querySelectorAll(".opcao-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute("data-index"));
                this.validarResposta(index, btn, q.resposta, q.explicacao);
            });
        });
    }

    validarResposta(indiceEscolhido, botao, respostaCerta, explicacao) {
        const botoes = this.container.querySelectorAll(".opcao-btn");

        botoes.forEach(b => b.disabled = true);

        if (indiceEscolhido === respostaCerta) {
            botao.style.backgroundColor = "green";
        } else {
            botao.style.backgroundColor = "red";
            if (explicacao) {
                const exp = this.container.querySelector(".explicacao");
                exp.style.display = "block";
            }
        }

        const nav = this.container.querySelector(".navegacao-pergunta");
        if (this.currentIndex < this.exercicioAtual.perguntas.length - 1) {
            const btnAvancar = document.createElement("button");
            btnAvancar.textContent = "Avançar →";
            btnAvancar.addEventListener("click", () => {
                this.currentIndex++;
                this.mostrarPergunta();
            });
            nav.appendChild(btnAvancar);
        } else {
            nav.innerHTML = `
            <p>Fim do exercício!</p>
            <button class="btn-refazer">Refazer Questionário</button>
        `;

            // Evento do botão refazer
            const btnRefazer = nav.querySelector(".btn-refazer");
            btnRefazer.addEventListener("click", () => {
                this.currentIndex = 0;
                this.mostrarPergunta();
            });
        }
    }


    bindSaibaMais(handler) {
        this.container.querySelectorAll(".saiba-mais").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                const card = btn.closest(".card");
                handler(card.getAttribute("data-id"), card.getAttribute("data-nivel"));
            });
        });
    }

}
