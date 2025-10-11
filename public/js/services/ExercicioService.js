// Responsável por buscar os dados de exercicios.json
export class ExercicioService {
    static async getExercicios() {
        const res = await fetch("../../data/exercicios.json");
        if (!res.ok) throw new Error("Erro ao buscar exercícios");
        return await res.json();
    }
}
