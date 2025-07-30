async function carregarStatus() {
    const container = document.querySelector(".container");

    try {
        const res = await fetch("../../data/status.json");
        const data = await res.json();

        const progresso = data.progresso || {};
        const total = Object.keys(progresso).length;
        let soma = 0;

        const barrasHtml = Object.entries(progresso).map(([chave, valor]) => {
            const label = chave.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const percent = Math.round(valor * 100);
            soma += valor;

            return `
                <div class="status-item">
                    <label>${label}</label>
                    <progress value="${valor}" max="1"></progress>
                    <div class="status-circular-individual" style="left: ${percent}%;"></div>
                </div>
            `;
        }).join('');

        const media = total > 0 ? soma / total : 0;
        const mediaPercent = Math.round(media * 100);

        container.innerHTML = `
            <div class="status-painel">
                <div class="status-info">
                    <button class="status-nome">${data.usuario.nome}</button>
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

        //POP UP BTN SAIR
        const btnSair = document.querySelector(".btnSair");
        const modal = document.getElementById("modalSair");
        const btnConfirmar = document.getElementById("confirmarSair");
        const btnCancelar = document.getElementById("cancelarSair");
        const modalConteudo = document.querySelector(".modal-conteudo");

        // Abre o modal
        btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            modal.classList.remove("hidden");
        });

        // Fecha ao clicar no botão "Cancelar"
        btnCancelar.addEventListener("click", () => {
            modal.classList.add("hidden");
        });

        // Fecha ao clicar em "Sim"
        btnConfirmar.addEventListener("click", () => {
            window.location.href = "../Pages/paginaInicial.html";
        });

        // Fecha ao clicar fora da caixa
        modal.addEventListener("click", (e) => {
            if (!modalConteudo.contains(e.target)) {
                modal.classList.add("hidden");
            }
        });

    } catch (err) {
        console.error("Erro ao carregar status:", err);
        container.innerHTML = `<h1>Erro ao carregar status do usuário.</h1>`;
    }
}

const barrasHtml = Object.entries(progresso).map(([chave, valor]) => {
    const label = chave.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const percent = Math.round(valor * 100);
    soma += valor;

    return `
        <div class="status-item">
            <label>${label}</label>
            <progress value="${valor}" max="1"></progress>
            <div class="status-circular-individual" style="left: ${percent}%;"></div>
        </div>
    `;
}).join('');



// Verifica se estamos na página de status
if (document.querySelector(".container").classList.contains("status")) {
    document.querySelector('.btnVoltar').style.display = 'none';
    carregarStatus();
}

