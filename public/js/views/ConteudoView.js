export class ConteudoView {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.btnVoltar = document.querySelector(".btnVoltar");
    }

    renderSecao(nivel, conteudos) {
        if (!conteudos || conteudos.length === 0) return "";

        const titulos = {
            iniciante: "Iniciante",
            intermediario: "Intermediário",
            avancado: "Avançado"
        };

        return `
            <div class="level-section">
                <h2 class="section-title" id="${nivel}">${titulos[nivel] || nivel}</h2>
                <div class="swiper-button-prev swiper-button-prev-${nivel}"></div>
                <div class="swiper swiper-${nivel}">
                    <div class="swiper-wrapper">
                        ${conteudos.map(c => `
                            <div class="swiper-slide">
                                <div class="card ${(nivel === 'intermediario' || nivel === 'avancado') ? 'card-restrito' : ''}" data-id="${c.id}">
                                    ${(nivel === 'intermediario' || nivel === 'avancado') ? '<div class="ribbon">RESTRITO</div>' : ''}
                                    <div class="card-image">
                                        <img src="${c.card.img}" alt="${c.card.alt || 'Imagem do card'}">
                                        <p class="card-tag">${c.card.tag || 'Música'}</p>
                                    </div>
                                    <div class="card-content">
                                        <h3 class="card-title">${c.card.titulo}</h3>
                                        <p class="card-text">${c.card.descricao}</p>
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
                <div class="swiper-button-next swiper-button-next-${nivel}"></div>
            </div>
        `;
    }

    renderLista(conteudosPorNivel) {
        this.container.innerHTML = `
            ${this.renderSecao('iniciante', conteudosPorNivel.iniciante)}
            ${this.renderSecao('intermediario', conteudosPorNivel.intermediario)}
            ${this.renderSecao('avancado', conteudosPorNivel.avancado)}
        `;
        this.btnVoltar.style.display = "none";
    }

    renderDetalhe(conteudo) {
        this.container.innerHTML = `
        <div class="conteudo-detalhado">
            <div class="material">
                ${conteudo.conteudo.join("\n")}
            </div>
            <div class="pratica">
                <iframe width='560' height='315' src='${conteudo.video || ""}' ...></iframe>
                <a href='#' class='btn-praticar'>Praticar</a>
            </div>
        </div>
    `;
        this.btnVoltar.style.display = "block";
    }

    bindSaibaMais(handler) {
        this.container.querySelectorAll(".saiba-mais").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                const card = btn.closest(".card");
                handler(card.getAttribute("data-id"));
            });
        });
    }
}
