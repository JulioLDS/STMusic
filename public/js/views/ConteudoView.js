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
                                <div class="card ${(nivel === 'intermediario' || nivel === 'avancado') ? 'card-restrito' : ''}" data-id="${c.id}" data-nivel="${nivel}">
                                    ${(nivel === 'intermediario' || nivel === 'avancado') ? '<div class="ribbon">RESTRITO</div>' : ''}
                                    <div class="card-image">
                                        <img src="${c.card.img}" alt="${c.card.alt || 'Imagem do card'}">
                                        <p class="card-tag">${c.card.titulo.toUpperCase()}</p>
                                    </div>
                                    <div class="card-content">
                                        <h3 class="card-title">${c.card.titulo}</h3>
                                        <p class="card-text">${c.card.descricao}</p>
                                        <div class="card-footer">
                                            ${(nivel === 'intermediario' || nivel === 'avancado')
                ? `<a href="#" class="card-button saiba-mais-disabled" title="Conteúdo restrito">Saiba Mais</a>`
                : `<a href="#" class="card-button saiba-mais">Saiba Mais</a>`
            }
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
                <!-- <iframe width='560' height='315' src='${conteudo.video || ""}' ...></iframe> -->
                <img src='../../assets/img/default1.png'>
                <a href='#' class='btn-praticar'>Praticar</a>
            </div>
        </div>
    `;
        this.btnVoltar.style.display = "block";

        this.bindPraticar();
    }

    // abre a tela de exercícios (usa carregarConteudo global como primeira opção)
    bindPraticar() {
        this.container.querySelectorAll(".btn-praticar").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();

                // tenta simular clique no item do menu (índice 2) — isso garante que a classe active e o indicador mudem
                const navItems = document.querySelectorAll('.navegacao ul li');
                if (navItems && navItems[2]) {
                    navItems.forEach(li => li.classList.remove('active'));
                    navItems[2].classList.add('active');
                    navItems[2].click();
                    return;
                }

                // fallback: usa a função global se existir
                if (typeof window.carregarConteudo === "function") {
                    window.carregarConteudo("exercicios");
                    return;
                }
            });
        });
    }

    bindSaibaMais(handler) {
        // anexa apenas aos botões "saiba-mais" (iniciante)
        this.container.querySelectorAll(".saiba-mais").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                const card = btn.closest(".card");
                handler(card.getAttribute("data-id"));
            });
        });

        // previne comportamento dos botões restritos (só visual)
        this.container.querySelectorAll(".saiba-mais-disabled").forEach(el => {
            el.addEventListener("click", e => {
                e.preventDefault();
                // opcional: mostrar tooltip/alerta leve informando que é restrito
                // ex: toast("Conteúdo restrito. Em breve disponível.");
            });
        });
    }
}
