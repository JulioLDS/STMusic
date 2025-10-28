import { Conteudo } from "/js/models/ConteudoModel.js";
import { ConteudoService } from "/js/services/ConteudoService.js";
import { ConteudoView } from "/js/views/ConteudoView.js";

export class ConteudoController {
    constructor() {
        this.view = new ConteudoView(".container.conteudos");
        this.conteudos = [];
    }

    async init() {
        try {
            const data = await ConteudoService.getConteudos();

            // Transforma dados crus em instâncias de Conteudo
            this.conteudos = [
                ...(data.conteudos.iniciante || []).map(c => new Conteudo({ ...c, nivel: "iniciante" })),
                ...(data.conteudos.intermediario || []).map(c => new Conteudo({ ...c, nivel: "intermediario" })),
                ...(data.conteudos.avancado || []).map(c => new Conteudo({ ...c, nivel: "avancado" }))
            ];

            this.view.renderLista(data.conteudos);
            this.view.bindSaibaMais(id => this.mostrarDetalhe(id));

            this.inicializarSwipers();
        } catch (err) {
            console.error(err);
            this.view.container.innerHTML = `<p class="erro-carregamento">Erro ao carregar conteúdos.</p>`;
        }
    }

    mostrarDetalhe(id) {
        const conteudo = this.conteudos.find(c => c.id === id);
        if (conteudo) {
            this.view.renderDetalhe(conteudo);
            document.querySelector(".btnVoltar").onclick = () => this.init();
        }
    }

    inicializarSwipers() {
        const configs = [
            { selector: ".swiper-iniciante", next: ".swiper-button-next-iniciante", prev: ".swiper-button-prev-iniciante" },
            { selector: ".swiper-intermediario", next: ".swiper-button-next-intermediario", prev: ".swiper-button-prev-intermediario" },
            { selector: ".swiper-avancado", next: ".swiper-button-next-avancado", prev: ".swiper-button-prev-avancado" }
        ];

        configs.forEach(cfg => {
            if (document.querySelector(cfg.selector)) {
                new Swiper(cfg.selector, {
                    loop: true,
                    spaceBetween: 20,
                    slidesPerView: 1,
                    autoplay: { delay: 5000, disableOnInteraction: false },
                    pagination: { el: `${cfg.selector} .swiper-pagination`, clickable: true },
                    navigation: { nextEl: cfg.next, prevEl: cfg.prev },
                    breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
                });
            }
        });
    }
}
