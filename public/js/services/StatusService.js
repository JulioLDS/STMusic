export class StatusService {
    static async getStatus() {
        const res = await fetch("/status");
        if (!res.ok) throw new Error("Erro ao buscar status");
        return await res.json();
    }
}
