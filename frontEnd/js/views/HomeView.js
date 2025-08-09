export class HomeView {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    render(data) {
        this.container.innerHTML = `
            <div class="${data.msg1.class}">
                ${data.msg1.conteudo.join("\n")}
            </div>
            <div class="${data.msg2.class}">
                ${data.msg2.conteudo.join("\n")}
            </div>
        `;
    }
}
