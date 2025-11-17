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
        this.progresso = {}; // Agora vamos usar apenas o do banco
        this.service = new ExercicioService();
        this.carregandoEstatisticas = false;
    }

    async init() {
        try {
            // Carrega estatísticas do banco primeiro
            await this.carregarEstatisticasBanco();

            const data = await ExercicioService.getExercicios();

            // Criar lista de models
            this.exercicios = [
                ...(data.exercicios.iniciante || []).map(e => new Exercicio({ ...e, nivel: "iniciante" })),
                ...(data.exercicios.intermediario || []).map(e => new Exercicio({ ...e, nivel: "intermediario" })),
                ...(data.exercicios.avancado || []).map(e => new Exercicio({ ...e, nivel: "avancado" }))
            ];

            // Renderiza com progresso do banco
            this.renderListaComProgresso(data.exercicios);
            this.view.bindSaibaMais((id, nivel) => this.mostrarDetalhe(id, nivel));

            this.inicializarSwipers();
        } catch (err) {
            console.error(err);
            this.view.container.innerHTML = `<p class="erro-carregamento">Erro ao carregar exercícios.</p>`;
        }
    }

    // Carrega estatísticas do banco de dados
    async carregarEstatisticasBanco() {
        if (this.carregandoEstatisticas) return;

        this.carregandoEstatisticas = true;
        try {
            console.log("Carregando estatísticas do banco...");
            this.progresso = await this.service.getEstatisticasUsuario();
            console.log("statísticas carregadas do banco:", this.progresso);
        } catch (err) {
            console.error("Erro ao carregar estatísticas do banco:", err);
            this.progresso = {};
        } finally {
            this.carregandoEstatisticas = false;
        }
    }

    // Busca estatísticas de um exercício (agora do banco)
    getEstatisticasExercicio(id, nivel) {
        nivel = nivel.trim().toLowerCase();
        const chave = `${id}_${nivel}`;
        const estatisticasBanco = this.progresso[chave];

        if (estatisticasBanco) {
            return {
                tentativas: estatisticasBanco.tentativas || 0,
                melhorPontuacao: estatisticasBanco.melhorPontuacao || 0,
                ultimaPontuacao: estatisticasBanco.ultimaPontuacao || 0
            };
        }

        // Fallback caso não exista no banco
        return {
            tentativas: 0,
            melhorPontuacao: 0,
            ultimaPontuacao: 0
        };
    }

    // Renderiza lista com dados atualizados do banco
    renderListaComProgresso(exerciciosPorNivel) {
        // Atualiza os cards com dados reais do banco
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


    mostrarDetalhe(id, nivel) {
        const exercicio = this.exercicios.find(e => e.id === id && e.nivel === nivel);
        if (exercicio) {
            this.view.renderDetalhe(
                exercicio,
                () => {
                    // ATUALIZA A VIEW AO VOLTAR (recarrega do banco)
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

    // Atualiza progresso quando exercício é finalizado (agora salva no banco)
    async atualizarProgresso(id, nivel, media) {
        try {
            //Padronização
            nivel = nivel.trim().toLowerCase();

            console.log(`ATUALIZANDO PROGRESSO: ${id}_${nivel} - ${media}%`);

            // Chave única para o exercício
            const chave = `${id}_${nivel}`;

            // Busca estatísticas atuais
            const estatisticasAtuais = this.getEstatisticasExercicio(id, nivel);

            // Calcula novas estatísticas
            const novasTentativas = estatisticasAtuais.tentativas + 1;
            const novaMelhorPontuacao = Math.max(estatisticasAtuais.melhorPontuacao, media);

            console.log(`ATUALIZANDO ESTATÍSTICAS:`, {
                tentativas: novasTentativas,
                melhorPontuacao: novaMelhorPontuacao,
                ultimaPontuacao: media
            });

            // ATUALIZA NO BANCO DE DADOS
            await this.service.atualizarEstatisticas(
                id,
                nivel,
                novasTentativas,
                novaMelhorPontuacao,
                media
            );

            // ATUALIZA LOCALMENTE (cache)
            this.progresso[chave] = {
                tentativas: novasTentativas,
                melhorPontuacao: novaMelhorPontuacao,
                ultimaPontuacao: media,
                ultimaAtualizacao: new Date()
            };


            // Atualiza também o progresso do tema
            console.log(`chamando atualizar progresso: ${id}, ${nivel}, ${media}`);
            await this.service.atualizarProgresso(id, nivel, media);
            console.log(`Progresso atualizado no banco: ${chave} - ${media}%`);

        } catch (err) {
            console.error("Erro ao atualizar progresso:", err);
        }
    }

    async atualizarView() {
        // Recarrega as estatísticas do banco antes de atualizar a view
        await this.carregarEstatisticasBanco();

        // Recarrega a lista com os dados atualizados do banco
        try {
            const data = await ExercicioService.getExercicios();
            this.renderListaComProgresso(data.exercicios);
            this.view.bindSaibaMais((id, nivel) => this.mostrarDetalhe(id, nivel));
            this.inicializarSwipers();
        } catch (err) {
            console.error("Erro ao atualizar view:", err);
        }
    }
}
