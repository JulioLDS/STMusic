// Responsável por buscar os dados de exercicios.json
export class ExercicioService {
    static async getExercicios() {
        const res = await fetch("../../data/exercicios.json");
        if (!res.ok) throw new Error("Erro ao buscar exercícios");
        return await res.json();
    }

    async atualizarProgresso(id, nivel, media) {
        try {
            console.log(`Atualizando progresso: ${id} - ${nivel} - ${media}%`);

            // Enviando progresso ao back-end via service
            await ExercicioService.atualizarProgresso({ id, nivel, media });

            console.log(`Progresso atualizado com sucesso: ${id} - ${media}%`);

            // Opcional: Voltar para a lista após finalizar
            this.init();

        } catch (err) {
            console.error("Erro ao atualizar progresso:", err);
            alert("Erro ao salvar progresso. Tente novamente.");
        }
    }
}
