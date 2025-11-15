export class ExercicioService {
    static async getExercicios() {
        const res = await fetch("../../data/exercicios.json");
        if (!res.ok) throw new Error("Erro ao buscar exercícios");
        return await res.json();
    }

    async atualizarProgresso(id, nivel, media) {
        try {
            const response = await fetch("/muda-progresso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, nivel, media })
            });

            if (!response.ok) {
                const erro = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${erro}`);
            }

            const data = await response.json();
            console.log(`Progresso atualizado com sucesso: ${data.mensagem}`);

        } catch (err) {
            console.error("Erro ao atualizar progresso no service:", err);
        }
    }
}