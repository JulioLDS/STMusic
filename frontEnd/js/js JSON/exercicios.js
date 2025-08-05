async function carregarExercicios() {
    const container = document.querySelector(".container.exercicios");

    try {
        const res = await fetch("../../data/exercicios.json");
        const data = await res.json();

        const criarSecao = (nivel, exercicios) => {
            const titulos = {
                'iniciante': 'Iniciante',
                'intermediario': 'Intermediário',
                'avancado': 'Avançado'
            };

            return `
            <div class="level-section">
                <h2 class="section-title ${nivel}">${titulos[nivel] || nivel}</h2>
                <div class="swiper-button-prev swiper-button-prev-${nivel.toLowerCase()}"></div>
                <div class="swiper swiper-${nivel.toLowerCase()}">
                    <div class="swiper-wrapper">
                        ${exercicios.map(ex => `
                            <div class="swiper-slide">
                            <div class="card ${(nivel === 'intermediario' || nivel === 'avancado') ? 'card-restrito' : ''}" data-id="${ex.id}" data-nivel="${nivel}">
            ${(nivel === 'intermediario' || nivel === 'avancado')
                    ? '<div class="ribbon">RESTRITO</div>'
                    : ''
                }
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
                <div class="swiper-button-next swiper-button-next-${nivel.toLowerCase()}"></div>
            </div>
            `;
        };

        container.innerHTML = `
            ${data.exercicios.iniciante ? criarSecao('iniciante', data.exercicios.iniciante) : ''}
            ${data.exercicios.intermediario ? criarSecao('intermediario', data.exercicios.intermediario) : ''}
            ${data.exercicios.avancado ? criarSecao('avancado', data.exercicios.avancado) : ''}
        `;

        inicializarSwipers();

        document.querySelector('.btnVoltar').style.display = 'none';

        document.querySelectorAll('.saiba-mais').forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const card = this.closest('.card');
                const id = card.getAttribute('data-id');
                const nivel = card.getAttribute('data-nivel');
                const exercicio = data.exercicios[nivel].find(e => e.id === id);
                if (exercicio) {
                    mostrarExercicioDetalhado(exercicio);
                }
            });
        });

    } catch (error) {
        console.error("Erro ao carregar exercícios:", error);
        container.innerHTML = `<p class="erro-carregamento">Erro ao carregar exercícios. Tente novamente mais tarde.</p>`;
    }
}

function mostrarExercicioDetalhado(exercicio) {
    const container = document.querySelector(".container.exercicios");

    container.innerHTML = `
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

    const form = container.querySelector('.quiz-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const resultadoContainer = container.querySelector('.resultado-container');
        let pontuacao = 0;

        exercicio.perguntas.forEach((pergunta, index) => {
            const respostaSelecionada = form.querySelector(`input[name="q${index}"]:checked`);
            const explicacaoEl = container.querySelector(`#explicacao-${index}`);

            if (explicacaoEl) {
                explicacaoEl.style.display = 'block';
            }

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

    // Mostra e configura o botão voltar no header
    const btnVoltar = document.querySelector('.btnVoltar');
    btnVoltar.style.display = 'block';
    btnVoltar.onclick = function (e) {
        e.preventDefault();
        carregarExercicios();
    };
}

function inicializarSwipers() {
    const configs = [
        {
            selector: '.swiper-iniciante',
            next: '.swiper-button-next-iniciante',
            prev: '.swiper-button-prev-iniciante'
        },
        {
            selector: '.swiper-intermediario',
            next: '.swiper-button-next-intermediario',
            prev: '.swiper-button-prev-intermediario'
        },
        {
            selector: '.swiper-avancado',
            next: '.swiper-button-next-avancado',
            prev: '.swiper-button-prev-avancado'
        }
    ];

    configs.forEach(cfg => {
        if (document.querySelector(cfg.selector)) {
            new Swiper(cfg.selector, {
                loop: true,
                spaceBetween: 20,
                slidesPerView: 1,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: `${cfg.selector} .swiper-pagination`,
                    clickable: true,
                },
                navigation: {
                    nextEl: cfg.next,
                    prevEl: cfg.prev,
                },
                breakpoints: {
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }
            });
        }
    });
}



document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".container.exercicios")) {
        document.querySelector(".btnVoltar").style.display = "none";
        carregarExercicios();
    }
});
