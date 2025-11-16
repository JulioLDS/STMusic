import { Exercicio } from "/js/models/ExercicioModel.js";
import { ExercicioService } from "/js/services/ExercicioService.js";
import { ExercicioView } from "/js/views/ExercicioView.js";

export class ExercicioController {
    constructor() {
        this.view = new ExercicioView(".container.exercicios");
        this.exercicios = [];
        this.progresso = this.carregarProgressoLocal(); // Progresso local
    }

    // Carrega progresso do localStorage
    carregarProgressoLocal() {
        const salvo = localStorage.getItem('progressoExercicios');
        return salvo ? JSON.parse(salvo) : {};
    }

    // Salva progresso no localStorage
    salvarProgressoLocal() {
        localStorage.setItem('progressoExercicios', JSON.stringify(this.progresso));
    }



    // Busca estatísticas de um exercício
    getEstatisticasExercicio(id, nivel) {
        const chave = `${id}_${nivel}`;
        return this.progresso[chave] || {
            tentativas: 0,
            melhorPontuacao: 0,
            ultimaPontuacao: 0
        };
    }

    // Renderiza lista com dados atualizados
    renderListaComProgresso(exerciciosPorNivel) {
        // Atualiza os cards com dados reais
        const exerciciosAtualizados = {
            iniciante: exerciciosPorNivel.iniciante?.map(ex => ({
                ...ex,
                estatisticas: this.getEstatisticasExercicio(ex.id, 'iniciante')
            })) || [],
            intermediario: exerciciosPorNivel.intermediario?.map(ex => ({
                ...ex,
                estatisticas: this.getEstatisticasExercicio(ex.id, 'intermediario')
            })) || [],
            avancado: exerciciosPorNivel.avancado?.map(ex => ({
                ...ex,
                estatisticas: this.getEstatisticasExercicio(ex.id, 'avancado')
            })) || []
        };

        this.view.renderLista(exerciciosAtualizados);
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

            // Renderiza com progresso
            this.renderListaComProgresso(data.exercicios);
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
                () => {
                    // 🆕 ATUALIZA A VIEW AO VOLTAR
                    this.atualizarView();
                },
                (id, nivel, media) => this.atualizarProgresso(id, nivel, media)
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

    // Atualiza progresso quando exercício é finalizado
    async atualizarProgresso(id, nivel, media) {
        try {
            console.log(`🔄 ATUALIZANDO PROGRESSO: ${id}_${nivel} - ${media}%`);

            // Chave única para o exercício
            const chave = `${id}_${nivel}`;

            // Inicializa se não existir
            if (!this.progresso[chave]) {
                this.progresso[chave] = {
                    tentativas: 0,
                    melhorPontuacao: 0,
                    ultimaPontuacao: 0
                };
            }

            // Atualiza estatísticas
            this.progresso[chave].tentativas++;
            this.progresso[chave].ultimaPontuacao = media;

            if (media > this.progresso[chave].melhorPontuacao) {
                this.progresso[chave].melhorPontuacao = media;
            }

            console.log(`📊 NOVAS ESTATÍSTICAS:`, this.progresso[chave]);

            // Salva localmente
            this.salvarProgressoLocal();

            // Atualiza no servidor também
            const service = new ExercicioService();
            await service.atualizarProgresso(id, nivel, media);

            console.log(`✅ Progresso atualizado: ${chave} - ${media}%`);

        } catch (err) {
            console.error("❌ Erro ao atualizar progresso:", err);
        }
    }

    atualizarView() {
        // Recarrega a lista com os dados atualizados
        this.init();
    }
}
