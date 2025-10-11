export class Status {
    constructor({ usuario, progresso }) {
        this.usuario = usuario;
        this.progresso = progresso;
    }

    getMediaPercentual() {
        const total = Object.keys(this.progresso || {}).length;
        const soma = Object.values(this.progresso || {}).reduce((a, b) => a + b, 0);
        return total > 0 ? Math.round((soma / total) * 100) : 0;
    }
}
