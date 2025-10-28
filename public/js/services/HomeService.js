export class HomeService {
    static async getHomeData() {
        const res = await fetch("../../data/home.json");
        if (!res.ok) throw new Error("Erro ao buscar dados da home");
        return await res.json();
    }
}
