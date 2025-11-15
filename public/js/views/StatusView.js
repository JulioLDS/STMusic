export class StatusView {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.btnVoltar = document.querySelector(".btnVoltar");
        this.btnSair = document.querySelector(".btnSair");
        this.modal = document.getElementById("modalSair");
        this.btnConfirmar = document.getElementById("confirmarSair");
        this.btnCancelar = document.getElementById("cancelarSair");
        this.modalConteudo = document.querySelector(".modal-conteudo");
    }

    render(statusModel) {
        const barrasHtml = Object.entries(statusModel.progresso || {}).map(([chave, valor]) => {
            // Remove underscores e capitaliza cada palavra
            const label = chave
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            const percent = Math.round(valor * 100);
            return `
                <div class="status-item">
                    <label>${label}</label>
                    <div class="progress-wrap">
                        <progress value="${valor}" max="1" style="width:100%;"></progress>
                        <div class="status-circular-individual" style="left: ${percent}%;"></div>
                    </div>
                </div>
            `;
        }).join('');

        const mediaPercent = statusModel.getMediaPercentual();

        this.container.innerHTML = `
            <div class="status-painel">
                <div class="status-info">
                    <button class="status-nome">${statusModel.usuario.nome}</button>
                    <div class="status-barras">
                        ${barrasHtml}
                    </div>
                </div>
                <div class="status-circular">
                    <svg viewBox="0 0 36 36" class="circular-chart green">
                        <path class="circle-bg"
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="circle"
                            stroke-dasharray="${mediaPercent}, 100"
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <text x="18" y="20.35" class="percentage">${mediaPercent}%</text>
                    </svg>
                </div>
            </div>
        `;
    }

    bindModalEvents() {
        // Abrir modal
        this.btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            this.modal.classList.remove("hidden");
        });

        // Cancelar
        this.btnCancelar.addEventListener("click", () => {
            this.modal.classList.add("hidden");
        });

        // Confirmar
        this.btnConfirmar.addEventListener("click", () => {
            window.location.href = "/logout";
        });

        // Fechar clicando fora
        this.modal.addEventListener("click", (e) => {
            if (!this.modalConteudo.contains(e.target)) {
                this.modal.classList.add("hidden");
            }
        });
    }
}
