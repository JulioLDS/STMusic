// Função para limpar todos os campos de um formulário
function limparFormulario(formId) {
    const form = document.getElementById(formId);
    if (form) {
        const inputs = form.querySelectorAll('input[type="text"], input[type="password"]');
        inputs.forEach(input => {
            input.value = '';
            // Resetar campos de senha (garante que o campo volte a type="password" e ícone fechado)
            if (input.id && input.id.includes('senha')) {
                input.type = 'password';
                // Atualizar o ícone do olho correspondente
                const toggleId = `toggle${input.id.charAt(0).toUpperCase() + input.id.slice(1)}`;
                const toggle = document.getElementById(toggleId);
                if (toggle) {
                    toggle.src = '/assets/img/olhoF.png';
                }
            }
        });
    }
}

// Função para configurar o toggle de mostrar/esconder senha
function setupPasswordToggle(passwordFieldId, toggleIconId) {
    const passwordField = document.getElementById(passwordFieldId);
    const toggleIcon = document.getElementById(toggleIconId);

    if (passwordField && toggleIcon) {
        toggleIcon.addEventListener('click', function () {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleIcon.src = '../assets/img/olhoA.png'; // Olho aberto (mostrando senha)
            } else {
                passwordField.type = 'password';
                toggleIcon.src = '../assets/img/olhoF.png'; // Olho fechado (escondendo senha)
            }
        });
    }
}

// Função para configurar o underline das tabs
function setupTabs() {
    const tabs = document.querySelectorAll(".tab");
    const underline = document.querySelector(".underline");
    const formsWrapper = document.getElementById("formsWrapper");

    function setUnderline(el) {
        const extra = 16;
        underline.style.width = `${el.offsetWidth + extra}px`;
        underline.style.left = `${el.offsetLeft - extra / 2}px`;
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            setUnderline(tab);

            // Move forms e limpa os campos
            if (index === 0) {
                formsWrapper.style.transform = "translateX(0)"; // Entrar
                limparFormulario('formCadastro'); // Limpa cadastro ao voltar para login
            } else {
                formsWrapper.style.transform = "translateX(-50%)"; // Cadastrar
                limparFormulario('formLogin'); // Limpa login ao ir para cadastro
            }
        });
    });

    window.addEventListener("load", () => {
        const active = document.querySelector(".tab.active");
        setUnderline(active);
    });

    window.addEventListener("resize", () => {
        const active = document.querySelector(".tab.active");
        setUnderline(active);
    });
}

// Função para ajustar o tamanho da fonte dinamicamente


// Exibir mensagens vindas do backend (EJS)
document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    setupPasswordToggle('senhaLogin', 'toggleSenhaLogin');
    setupPasswordToggle('senhaCadastro', 'toggleSenhaCadastro');

    // Captura mensagem passada pelo servidor (EJS)
    const mensagem = document.body.dataset.mensagem;
    setupMensagemModal(mensagem);
});

function setupFocusCycle(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Seleciona inputs de texto e senha dentro do formulário
    const inputs = form.querySelectorAll('input[type="text"], input[type="password"]');
    if (inputs.length === 0) return;

    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Tab' && !e.shiftKey) {
                // Se no último input pressionar TAB, volta para o primeiro
                if (index === inputs.length - 1) {
                    e.preventDefault();
                    inputs[0].focus();
                }
            }
            if (e.key === 'Tab' && e.shiftKey) {
                // Se no primeiro input pressionar Shift+TAB, vai para o último
                if (index === 0) {
                    e.preventDefault();
                    inputs[inputs.length - 1].focus();
                }
            }
        });
    });
}

// Configura ciclo de TAB para login e cadastro
setupFocusCycle('formLogin');
setupFocusCycle('formCadastro');


function autoResizeInputFont(input, minFontSize = 12, maxFontSize = 28) {
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.style.whiteSpace = "pre";
    span.style.fontFamily = getComputedStyle(input).fontFamily;
    span.style.fontWeight = getComputedStyle(input).fontWeight;
    span.style.letterSpacing = getComputedStyle(input).letterSpacing;
    span.style.padding = getComputedStyle(input).padding;
    document.body.appendChild(span);

    function resizeFont() {
        const inputWidth = input.clientWidth - 20; // margem de segurança
        let fontSize = maxFontSize;

        while (fontSize >= minFontSize) {
            span.style.fontSize = fontSize + "px";
            span.textContent = input.value || input.placeholder || "";
            if (span.offsetWidth <= inputWidth) break;
            fontSize--;
        }

        input.style.fontSize = fontSize + "px";
    }

    input.addEventListener("input", resizeFont);
    window.addEventListener("resize", resizeFont);
    resizeFont(); // chamar inicialmente
}

// --- Modal de mensagens de sucesso/erro --- //
function setupMensagemModal(mensagem) {
    const modal = document.getElementById("modalMensagem");
    const texto = document.getElementById("textoMensagem");
    const btnFechar = document.getElementById("fecharMensagem");

    if (!modal || !texto || !btnFechar) return;

    if (mensagem && mensagem.trim() !== "") {
        texto.textContent = mensagem;
        modal.classList.remove("hidden");
    }

    btnFechar.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // Fecha clicando fora
    modal.addEventListener("click", (e) => {
        const conteudo = modal.querySelector(".modal-conteudo");
        if (!conteudo.contains(e.target)) {
            modal.classList.add("hidden");
        }
    });
}


// Pegue todos os inputs que precisam se adaptar
const inputsAdaptaveis = document.querySelectorAll("input[type='text'], input[type='password']");

inputsAdaptaveis.forEach(input => {
    autoResizeInputFont(input);
});