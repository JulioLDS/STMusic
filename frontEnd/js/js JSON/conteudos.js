async function carregarConteudos() {
    const container = document.querySelector(".container.conteudos");

    try {
        const res = await fetch(`../../data/conteudos.json`);
        const data = await res.json();

        // Função para criar seções de cada nível
        const criarSecao = (nivel, conteudos) => {
            if (!conteudos || conteudos.length === 0) return '';

            // Mapeia os níveis sem acento para os títulos formatados corretamente
            const titulos = {
                'iniciante': 'Iniciante',
                'intermediario': 'Intermediário',
                'avancado': 'Avançado'
            };

            return `
            <div class="level-section">
                <h2 class="section-title" id="${nivel}">${titulos[nivel] || nivel}</h2>
                <div class="swiper-button-prev swiper-button-prev-${nivel.toLowerCase()}"></div>
                <div class="swiper swiper-${nivel.toLowerCase()}">
                
                <div class="swiper-wrapper">
               ${conteudos.map((conteudo, index) => `
                <div class="swiper-slide">
                    <div class="card ${(nivel === 'intermediario' || nivel === 'avancado') ? 'card-restrito' : ''}" data-id="${conteudo.id}">
            ${(nivel === 'intermediario' || nivel === 'avancado')
                    ? '<div class="ribbon">RESTRITO</div>'
                    : ''
                }
                                    <div class="card-image">
                                        <img src="${conteudo.card.img}" alt="${conteudo.card.alt || 'Imagem do card'}">
                                        <p class="card-tag">${conteudo.card.tag || 'Música'}</p>
                                    </div>
                                    <div class="card-content">
                                        <h3 class="card-title">${conteudo.card.titulo}</h3>
                                        <p class="card-text">${conteudo.card.descricao}</p>
                                        <div class="card-footer">
                                            <a href="#" class="card-button saiba-mais">Saiba Mais</a>
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

        // Monta todo o conteúdo diretamente no container
        container.innerHTML = `
            ${data.conteudos.iniciante ? criarSecao('iniciante', data.conteudos.iniciante) : ''}
            ${data.conteudos.intermediario ? criarSecao('intermediario', data.conteudos.intermediario) : ''}
            ${data.conteudos.avancado ? criarSecao('avancado', data.conteudos.avancado) : ''}
        `;

        // Esconde o botão voltar quando está na lista de conteúdos
        document.querySelector('.btnVoltar').style.display = 'none';

        // Inicializa os Swipers
        inicializarSwipers();

        // Adiciona eventos aos botões "Saiba Mais"
        document.querySelectorAll('.saiba-mais').forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
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
        container.innerHTML = `<p class="erro-carregamento">Erro ao carregar conteúdos. Tente novamente mais tarde.</p>`;
    }

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

function mostrarConteudoDetalhado(conteudo) {
    const container = document.querySelector(".container.conteudos");

    // Mostra o conteúdo detalhado diretamente no container
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

// Carrega os conteúdos quando a página estiver pronta
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.container.conteudos')) {
        // Esconde o botão voltar inicialmente
        document.querySelector('.btnVoltar').style.display = 'none';
        carregarConteudos();
    }
});