// Representa um exercício individual
export class Exercicio {
    constructor({ id, nivel, card, perguntas }) {
        this.id = id;
        this.nivel = nivel;
        this.card = card;
        this.perguntas = perguntas;
    }
}
