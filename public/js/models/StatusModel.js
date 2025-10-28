export class Status {
    constructor(payload = {}) {
        // payload pode ser { usuario, progresso } vindo do backend
        const { usuario = {}, progresso = {} } = payload;
        // garante nome mínimo — aceita tanto `nome` (pt) quanto `name` (en)
        this.usuario = {
            nome: usuario.nome || usuario.name || "Usuário",
            // mantém alias `name` caso alguma parte do código use-o
            name: usuario.name || usuario.nome || "Usuário",
            email: usuario.email || ""
        };

        // normaliza valores de progresso: aceita 0..1 ou 0..100
        this.progresso = {};
        Object.entries(progresso).forEach(([k, v]) => {
            let num = Number(v) || 0;
            if (num > 1) num = num / 100; // converte 0..100 -> 0..1
            // garante limite 0..1
            num = Math.max(0, Math.min(1, num));
            this.progresso[k] = num;
        });
    }

    getMediaPercentual() {
        const total = Object.keys(this.progresso || {}).length;
        const soma = Object.values(this.progresso || {}).reduce((a, b) => a + b, 0);
        return total > 0 ? Math.round((soma / total) * 100) : 0;
    }
}