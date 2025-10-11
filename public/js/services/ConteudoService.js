// Responsável por buscar os dados de conteudos.json
export class ConteudoService {
    static async getConteudos() {
        const res = await fetch("../../data/conteudos.json");
        if (!res.ok) {
            throw new Error("Erro ao buscar conteúdos");
        }
        return await res.json();
    }
}
