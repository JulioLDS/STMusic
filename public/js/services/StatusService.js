export class StatusService {
    static async getStatus() {
        const res = await fetch("../../data/status.json");
        if (!res.ok) throw new Error("Erro ao buscar status");
        return await res.json();
    }
}
