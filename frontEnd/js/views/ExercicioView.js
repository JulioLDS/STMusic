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
        this.container.innerHTML = `
            <div class="exercicio-detalhado">
                <h2>${exercicio.card.titulo}</h2>
                <form class="quiz-form">
                    ${exercicio.perguntas.map((q, i) => `
                        <div class="pergunta-group">
                            <p class="pergunta-titulo"><strong>${i + 1}. ${q.pergunta}</strong></p>
                            <div class="opcoes-container">
                                ${q.opcoes.map((opcao, j) => `
                                    <label class="opcao-label">
                                        <input type="radio" name="q${i}" value="${j}" class="opcao-input">
                                        <span class="opcao-texto">${opcao}</span>
                                    </label>
                                `).join('')}
                            </div>
                            ${q.explicacao ? `<div class="explicacao" id="explicacao-${i}" style="display:none;">${q.explicacao}</div>` : ''}
                        </div>
                    `).join('')}
                    <button type="submit" class="btn-enviar">Verificar Respostas</button>
                    <div class="resultado-container"></div>
                </form>
                <a href="#" class="btnVoltar">← Voltar para Exercícios</a>
            </div>
        `;
        this.btnVoltar.style.display = "block";
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

    bindFormSubmit(exercicio) {
        const form = this.container.querySelector(".quiz-form");
        form.addEventListener("submit", e => {
            e.preventDefault();
            const resultadoContainer = this.container.querySelector(".resultado-container");
            let pontuacao = 0;

            exercicio.perguntas.forEach((pergunta, index) => {
                const respostaSelecionada = form.querySelector(`input[name="q${index}"]:checked`);
                const explicacaoEl = this.container.querySelector(`#explicacao-${index}`);

                if (explicacaoEl) explicacaoEl.style.display = "block";
                if (respostaSelecionada && parseInt(respostaSelecionada.value) === pergunta.resposta) {
                    pontuacao++;
                }
            });

            resultadoContainer.innerHTML = `
                <div class="resultado-alerta ${pontuacao === exercicio.perguntas.length ? 'sucesso' : 'aviso'}">
                    Você acertou ${pontuacao} de ${exercicio.perguntas.length} perguntas!
                </div>
            `;
        });
    }
}
