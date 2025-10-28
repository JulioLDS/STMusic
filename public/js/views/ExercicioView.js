export class ExercicioView {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.btnVoltar = document.querySelector(".btnVoltar");

        // Delegation: um único listener no container para evitar handlers acumulados
        this.handleContainerClick = this.handleContainerClick.bind(this);
        if (this.container) this.container.addEventListener('click', this.handleContainerClick);
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
        if (this.btnVoltar) this.btnVoltar.style.display = "none";
    }

    renderDetalhe(exercicio, onVoltar) {
        this.currentIndex = 0;
        this.exercicioAtual = exercicio;
        this.onVoltar = onVoltar;
        this.mostrarPergunta();
    }

    mostrarPergunta() {
        if (!this.exercicioAtual) return;
        const q = this.exercicioAtual.perguntas[this.currentIndex];
        const lastIndex = this.exercicioAtual.perguntas.length - 1;

        // Se for a última pergunta, não colocamos botão Avançar no template.
        // Caso contrário, renderizamos o Avançar desabilitado (será habilitado após resposta).
        const navHtml = (this.currentIndex < lastIndex)
            ? `<div class="navegacao-pergunta"><button class="btn-avancar" disabled>Avançar ➝</button></div>`
            : `<div class="navegacao-pergunta"></div>`;

        this.container.innerHTML = `
        <div class="exercicio-detalhado" tabindex="0">
            <h2 class="exercicio-titulo">${this.exercicioAtual.card.titulo}</h2>

            <div class="pergunta-group">
                <p class="pergunta-titulo"><strong>${this.currentIndex + 1}. ${q.pergunta}</strong></p>
                <div class="opcoes-grid-container">
                    <div class="opcoes-container">
                        ${q.opcoes.map((opcao, j) => `
                            <button class="opcao-btn" data-index="${j}">
                                <span class="opcao-texto">${opcao}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                ${q.explicacao ? `<div class="explicacao" style="display:none;">${q.explicacao}</div>` : ''}
            </div>

            ${navHtml}
        </div>
        `;

        // garante scroll interno ao topo da pergunta (se tiver scroll)
        const card = this.container.querySelector('.exercicio-detalhado');
        if (card) card.scrollTop = 0;

        // botão voltar global
        if (this.btnVoltar) {
            this.btnVoltar.style.display = "block";
            this.btnVoltar.onclick = () => {
                // volta para a lista (controller trata isso)
                if (this.onVoltar) this.onVoltar();
            };
        }

        // Avançar começa desabilitado quando existe
        const nav = this.container.querySelector('.navegacao-pergunta');
        if (nav) {
            const btnAvancar = nav.querySelector('.btn-avancar');
            if (btnAvancar) btnAvancar.disabled = true;
        }
    }

    validarResposta(indiceEscolhido, botao, respostaCerta, explicacao) {
        // bloqueia todas as alternativas após a escolha
        const botoes = this.container.querySelectorAll(".opcao-btn");
        botoes.forEach(b => b.disabled = true);

        // feedback visual e emoji
        if (indiceEscolhido === respostaCerta) {
            botao.classList.add("correta");
            this.mostrarEmoji(botao, "😄");
        } else {
            botao.classList.add("errada");
            this.mostrarEmoji(botao, "😢");
            if (explicacao) {
                const expEl = this.container.querySelector(".explicacao");
                if (expEl) expEl.style.display = "block";
            }
        }

        // decide se mostra Refazer (agora) ou habilita Avançar
        const lastIndex = this.exercicioAtual.perguntas.length - 1;
        const nav = this.container.querySelector(".navegacao-pergunta");
        if (!nav) return;

        if (this.currentIndex === lastIndex) {
            // estamos na ÚLTIMA pergunta — já mostramos o botão Refazer
            nav.innerHTML = `<button class="btn-refazer"> Refazer Questionário</button>`;
        } else {
            // há próxima pergunta: habilita o Avançar (apenas um botão já existente)
            const btnAvancar = nav.querySelector(".btn-avancar");
            if (btnAvancar) {
                btnAvancar.disabled = false;
            }
        }
    }

    // Delegated click handler: gerencia cliques em alternativas, avançar e refazer
    handleContainerClick(e) {
        // evita agir quando não há exercício carregado
        if (!this.exercicioAtual) return;

        // clique em alternativa
        const opcaoBtn = e.target.closest(".opcao-btn");
        if (opcaoBtn && !opcaoBtn.disabled) {
            const idx = parseInt(opcaoBtn.getAttribute("data-index"));
            const q = this.exercicioAtual.perguntas[this.currentIndex];
            this.validarResposta(idx, opcaoBtn, q.resposta, q.explicacao);
            return;
        }

        // clique no Avançar (se existir)
        const avancarBtn = e.target.closest(".btn-avancar");
        if (avancarBtn) {
            if (avancarBtn.disabled) return;
            const lastIndex = this.exercicioAtual.perguntas.length - 1;
            if (this.currentIndex < lastIndex) {
                this.currentIndex++;
                this.mostrarPergunta();
            }
            return;
        }

        // clique no Refazer
        const refazerBtn = e.target.closest(".btn-refazer");
        if (refazerBtn) {
            this.currentIndex = 0;
            this.mostrarPergunta();
            return;
        }
    }

    // emoji suave + desaparece
    mostrarEmoji(botao, emoji) {
        const span = document.createElement("span");
        span.textContent = emoji;
        span.className = "emoji-feedback";
        botao.appendChild(span);
        setTimeout(() => span.classList.add('fade-out'), 900);
        setTimeout(() => span.remove(), 1400);
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
