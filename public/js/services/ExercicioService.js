// Responsável por buscar os dados de exercicios.json
export class ExercicioService {
    static async getExercicios() {
        const res = await fetch("../../data/exercicios.json");
        if (!res.ok) throw new Error("Erro ao buscar exercícios");
        return await res.json();
    }

    static async atualizarProgresso({ id, nivel, media }) {
        const response = await fetch('/muda-progresso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nivel, media })
        });
        if (!response.ok) throw new Error('Falha ao atualizar progresso');
        return response.json();
    }
}
