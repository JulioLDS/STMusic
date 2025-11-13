import { Exercicio } from "/js/models/ExercicioModel.js";
import { ExercicioService } from "/js/services/ExercicioService.js";
import { ExercicioView } from "/js/views/ExercicioView.js";

export class ExercicioController {
    constructor() {
        this.view = new ExercicioView(".container.exercicios");
        this.exercicios = [];
    }

    async init() {
        try {
            const data = await ExercicioService.getExercicios();

            // Criar lista de models
            this.exercicios = [
                ...(data.exercicios.iniciante || []).map(e => new Exercicio({ ...e, nivel: "iniciante" })),
                ...(data.exercicios.intermediario || []).map(e => new Exercicio({ ...e, nivel: "intermediario" })),
                ...(data.exercicios.avancado || []).map(e => new Exercicio({ ...e, nivel: "avancado" }))
            ];

            this.view.renderLista(data.exercicios);
            this.view.bindSaibaMais((id, nivel) => this.mostrarDetalhe(id, nivel));

            this.inicializarSwipers();
        } catch (err) {
            console.error(err);
            this.view.container.innerHTML = `<p class="erro-carregamento">Erro ao carregar exercícios.</p>`;
        }
    }

    mostrarDetalhe(id, nivel) {
        const exercicio = this.exercicios.find(e => e.id === id && e.nivel === nivel);
        if (exercicio) {
            this.view.renderDetalhe(
                exercicio,
                () => this.init(), // callback para voltar
                (id, nivel, media) => this.atualizarProgresso(id, nivel, media) // callback para finalizar
            );
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

    async atualizarProgresso(id, nivel, media) {
        try {
            // Enviando progresso ao back-end via service
            await ExercicioService.atualizarProgresso({ id, nivel, media });

            console.log(`Progresso atualizado: ${id} - ${media}%`);
        } catch (err) {
            console.error("Erro ao atualizar progresso:", err);
        }
    }
}
