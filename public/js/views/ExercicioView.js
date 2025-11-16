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
            <h2 class="section-title" id= "${nivel}">${titulos[nivel] || nivel}</h2>
            <div class="swiper-button-prev swiper-button-prev-${nivel}"></div>
            <div class="swiper swiper-${nivel}">
                <div class="swiper-wrapper">
                    ${exercicios.map(ex => {
            const stats = ex.estatisticas || { tentativas: 0, melhorPontuacao: 0, ultimaPontuacao: 0 };
            const totalPerguntas = ex.perguntas ? ex.perguntas.length : 10;
            const acertos = Math.round((stats.ultimaPontuacao / 100) * totalPerguntas);

            return `
                        <div class="swiper-slide">
                            <div class="card ${(nivel === 'intermediario' || nivel === 'avancado') ? 'card-restrito' : ''}" 
                                data-id="${ex.id}" data-nivel="${nivel}">
                                ${(nivel === 'intermediario' || nivel === 'avancado') ? '<div class="ribbon">RESTRITO</div>' : ''}
                                <div class="card-image">
                                    <img src="${ex.card.img}" alt="${ex.card.titulo}">
                                    <p class="card-tag">${ex.card.titulo}</p>
                                    <p class="card-pontuation">${acertos}/${totalPerguntas}</p>
                                    <p class="card-try">Tentativas: ${stats.tentativas}</p>
                                </div>
                                <div class="card-content">
                                    <h3 class="card-title">${ex.card.titulo}</h3>
                                    <p class="card-text">${ex.card.descricao}</p>
                                    <div class="card-footer">
                                        ${(nivel === 'intermediario' || nivel === 'avancado')
                    ? `<a href="#" class="card-button saiba-mais-disabled" title="Conteúdo restrito">Praticar</a>`
                    : `<a href="#" class="card-button saiba-mais">Praticar</a>`
                }
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
        }).join('')}
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

        // Garante que o botão voltar some quando voltar para a lista
        if (this.btnVoltar) this.btnVoltar.style.display = "none";
    }

    renderDetalhe(exercicio, onVoltar, onFinalizarProgresso) {
        this.currentIndex = 0;
        this.exercicioAtual = exercicio;
        this.onVoltar = onVoltar;
        this.onFinalizarProgresso = onFinalizarProgresso;
        this.acertos = 0;
        this.respondidas = 0;

        // Esconde o botão voltar global ao entrar no exercício
        if (this.btnVoltar) this.btnVoltar.style.display = "none";

        // Bloqueia o back do navegador
        this.handlePopState = (e) => {
            e.preventDefault();
            window.history.pushState(null, null, window.location.href);
        };
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', this.handlePopState);

        // Reset scroll da página e do container
        window.scrollTo(0, 0);
        if (this.container) this.container.scrollTop = 0;

        this.mostrarPergunta();
    }

    mostrarPergunta() {
        if (!this.exercicioAtual) return;
        const q = this.exercicioAtual.perguntas[this.currentIndex];
        const lastIndex = this.exercicioAtual.perguntas.length - 1;

        const navHtml = (this.currentIndex < lastIndex)
            ? `<div class="navegacao-pergunta">
            <button class="btn-voltar-lista">Sair do Exercício</button>
            <button class="btn-avancar" disabled>Avançar</button>
          </div>`
            : `<div class="navegacao-pergunta">
            <button class="btn-voltar-lista">Sair do Exercício</button>
          </div>`;

        this.container.innerHTML = `
    <div class="exercicio-detalhado" tabindex="0">
        <!-- HEADER FIXO -->
        <div class="exercicio-header">
            <h2 class="exercicio-titulo">${this.exercicioAtual.card.titulo}</h2>
        </div>

        <!-- CONTEÚDO ROLÁVEL -->
        <div class="exercicio-content">
            <div class="pergunta-group">
                <p class="pergunta-titulo"><strong>${this.currentIndex + 1}.</strong> ${q.pergunta}</p>
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
        </div>

        <!-- NAVEGAÇÃO FIXA -->
        ${navHtml}
    </div>
    `;

        // Foca no container para melhor acessibilidade
        const card = this.container.querySelector('.exercicio-detalhado');
        if (card) {
            card.focus();
            card.scrollTop = 0;
        }
    }

    validarResposta(indiceEscolhido, botao, respostaCerta, explicacao) {
        // bloqueia todas as alternativas após a escolha
        const botoes = this.container.querySelectorAll(".opcao-btn");
        botoes.forEach(b => b.disabled = true);

        this.respondidas++; // incrementa total respondidas

        // feedback visual e emoji
        if (indiceEscolhido === respostaCerta) {
            botao.classList.add("correta");
            this.mostrarEmoji(botao, "😄");
            this.acertos++; // incrementa acertos
        } else {
            botao.classList.add("errada");
            this.mostrarEmoji(botao, "😢");
            if (explicacao) {
                const expEl = this.container.querySelector(".explicacao");
                if (expEl) {
                    expEl.style.display = "block";

                    // SCROLL AUTOMÁTICO PARA A EXPLICAÇÃO
                    setTimeout(() => {
                        expEl.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }); // Pequeno delay para a animação do emoji
                }
            }
        }

        // decide se mostra botões finais ou habilita Avançar
        const lastIndex = this.exercicioAtual.perguntas.length - 1;
        const nav = this.container.querySelector(".navegacao-pergunta");
        if (!nav) return;

        if (this.currentIndex === lastIndex) {
            // Última pergunta - mostra botões finais
            this.mostrarResultadoFinal();
        } else {
            // há próxima pergunta: habilita o Avançar
            const btnAvancar = nav.querySelector(".btn-avancar");
            if (btnAvancar) {
                btnAvancar.disabled = false;
            }
        }
    }

    // Novo método para mostrar resultado final
    mostrarResultadoFinal() {
        const totalPerguntas = this.exercicioAtual.perguntas.length;
        const media = Math.round((this.acertos / totalPerguntas) * 100);

        const nav = this.container.querySelector(".navegacao-pergunta");
        if (!nav) return;

        // Renderiza apenas os botões inicialmente
        nav.innerHTML = `
    <div class="botoes-finais">
        <button class="btn-refazer">Refazer Questionário</button>
        <button class="btn-finalizar">Finalizar</button>
    </div>
    `;

        // Listener do botão "Finalizar"
        const btnFinalizar = nav.querySelector(".btn-finalizar");
        btnFinalizar.addEventListener("click", () => {
            if (this.onFinalizarProgresso) {
                // ATUALIZA O PROGRESSO ANTES DE MOSTRAR O RESULTADO
                this.onFinalizarProgresso(this.exercicioAtual.id, this.exercicioAtual.nivel, media);

                // Agora mostra o resultado
                this.mostrarTelaResultado(this.acertos, totalPerguntas, media);
            }
        });
    }

    // Novo método para mostrar apenas o resultado final
    mostrarTelaResultado(acertos, total, media) {
        // Limpa toda a tela e mostra apenas o resultado
        this.container.innerHTML = `
    <div class="tela-resultado-final">
        <div class="resultado-content">
            <h2>Questionário Finalizado!</h2>
            <div class="resultado-stats">
                <div class="stat-item">
                    <span class="stat-label">Acertos:</span>
                    <span class="stat-value">${acertos}/${total}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Aproveitamento:</span>
                    <span class="stat-value">${media}%</span>
                </div>
            </div>
            <div class="botoes-resultado">
                <button class="btn-refazer-resultado">Voltar para os Exercícios</button>
            </div>
        </div>
    </div>
    `;

        // Garante que o botão voltar fique hidden na tela de resultado
        if (this.btnVoltar) this.btnVoltar.style.display = "none";

        // Listener para o botão refazer na tela de resultado
        const btnRefazer = this.container.querySelector(".btn-refazer-resultado");
        btnRefazer.addEventListener("click", () => {
            // Reseta estados
            this.currentIndex = 0;
            this.acertos = 0;
            this.respondidas = 0;

            // Remove bloqueio de navegação (popstate)
            this.liberarBloqueio();

            // Volta para a lista de cards via callback do controller
            if (this.onVoltar) {
                this.onVoltar();
            } else {
                // fallback: recarrega a página caso callback não esteja disponível
                window.location.reload();
            }
        });
    }

    // Delegated click handler: gerencia cliques em alternativas, avançar e refazer
    handleContainerClick(e) {
        if (!this.exercicioAtual) return;

        const opcaoBtn = e.target.closest(".opcao-btn");
        if (opcaoBtn && !opcaoBtn.disabled) {
            const idx = parseInt(opcaoBtn.getAttribute("data-index"));
            const q = this.exercicioAtual.perguntas[this.currentIndex];
            this.validarResposta(idx, opcaoBtn, q.resposta, q.explicacao);
            return;
        }

        // Clique no botão "Voltar para Lista"
        const voltarListaBtn = e.target.closest(".btn-voltar-lista");
        if (voltarListaBtn) {
            this.currentIndex = 0;
            this.acertos = 0;
            this.respondidas = 0;

            // Remove o bloqueio do back ao sair do exercício
            if (this.handlePopState) {
                window.removeEventListener('popstate', this.handlePopState);
            }

            if (this.onVoltar) this.onVoltar();
            return;
        }

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

        const refazerBtn = e.target.closest(".btn-refazer");
        if (refazerBtn) {
            this.currentIndex = 0;
            this.acertos = 0;
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
        // anexa apenas aos botões "saiba-mais" (iniciante)
        this.container.querySelectorAll(".saiba-mais").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                const card = btn.closest(".card");
                const nivel = card.getAttribute("data-nivel");
                if (nivel !== "iniciante") return; // proteção extra
                // Força atualização da lista após exercício (para atualizar stats)
                setTimeout(() => {
                    handler(card.getAttribute("data-id"), nivel);
                }, 50);
            });
        });

        this.container.querySelectorAll(".saiba-mais-disabled").forEach(el => {
            el.addEventListener("click", e => {
                e.preventDefault();
            });
        });
    }

    // Método para liberar o bloqueio do back quando sair
    liberarBloqueio() {
        if (this.handlePopState) {
            window.removeEventListener('popstate', this.handlePopState);
            this.handlePopState = null;
        }
    }
}
