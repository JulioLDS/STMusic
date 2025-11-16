export class ExercicioService {
    static async getExercicios() {
        const res = await fetch("/exercicios");
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

    // 🆕 NOVO MÉTODO: Atualizar estatísticas no banco de dados
    async atualizarEstatisticas(exercicioId, nivel, tentativas, melhorPontuacao, ultimaPontuacao) {
        try {
            const response = await fetch("/atualizar-estatisticas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exercicioId,
                    nivel,
                    tentativas,
                    melhorPontuacao,
                    ultimaPontuacao
                })
            });

            if (!response.ok) {
                const erro = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${erro}`);
            }

            const data = await response.json();
            console.log(`✅ Estatísticas atualizadas no banco: ${data.mensagem}`);
            return data;

        } catch (err) {
            console.error("❌ Erro ao atualizar estatísticas no service:", err);
            throw err;
        }
    }

    // 🆕 NOVO MÉTODO: Buscar estatísticas do usuário do banco
    async getEstatisticasUsuario() {
        try {
            const response = await fetch("/estatisticas-usuario");

            if (!response.ok) {
                throw new Error(`Erro HTTP ${response.status} ao buscar estatísticas`);
            }

            const data = await response.json();
            return data.estatisticas || {};

        } catch (err) {
            console.error("❌ Erro ao buscar estatísticas do usuário:", err);
            return {};
        }
    }
}