const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

//variável provisória feia PRA CARALHO só pra pegar o usuario no bd de qualquer parte do código
let nomeUsuario = null;

// Conversão dos dados para JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Usa o EJS como view engine
app.set('view engine', 'ejs');

// Arquivos estáticos
app.use(express.static("public"));

// Rota inicial
app.get("/", (req, res) => {
    res.render("paginaInicial");
});

// Rota de login (contém também o cadastro na mesma página)
app.get("/login", (req, res) => {
    res.render("login", { mensagem: "" });
});

// Logout
app.get("/logout", (req, res) => {
    res.render("paginaInicial");
});

//provisório PRA CARALHO (Mas fui eu que pensei nisso :3)
app.get("/status", async (req, res) => {
    try {
        if (!nomeUsuario) {
            console.log("Requisição /status sem usuário autenticado");
            return res.status(401).json({ erro: "Usuário não autenticado" });
        }

        const usuarioDoc = await collection.findOne({
            $or: [
                { "usuario.name": nomeUsuario },
                { "usuario.nome": nomeUsuario }
            ]
        });

        if (!usuarioDoc) {
            console.log("Usuário não encontrado / não autenticado");
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        // Normaliza para { usuario, progresso } e fornece ambos os campos nome/name
        const payload = {
            usuario: {
                nome: usuarioDoc.usuario.nome || usuarioDoc.usuario.name || "Usuário",
                name: usuarioDoc.usuario.name || usuarioDoc.usuario.nome || "Usuário",
                email: usuarioDoc.usuario.email || ""
            },
            progresso: usuarioDoc.progresso || {}
        };

        console.log("Deu certo pegar o json, enviando objeto normalizado para o front");
        return res.json(payload);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao buscar progresso" });
    }
});


// --- CADASTRO DE USUÁRIO ---
app.post("/signup", async (req, res) => {
    const data = {
        "usuario": {
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
        },
        "progresso": {
            "notas-musicais": 0.0,
            "escalas": 0.0,
            "acordes": 0.0,
            "modos": 0.0,
            "harmonia": 0.0,
            "improvisacao": 0.0,
        }
    };

    try {
        // Checa se o usuário já existe
        const usuarioJaExiste = await collection.findOne({ "usuario.name": data.usuario.name });

        if (usuarioJaExiste) {
            return res.render("login", { mensagem: "Usuário já existe!" });
        }

        // Criptografia da senha
        const saltRounds = 10;
        const criptoSenha = await bcrypt.hash(data.usuario.password, saltRounds);
        data.usuario.password = criptoSenha;

        const userdata = await collection.insertOne(data);
        console.log("Usuário cadastrado:", userdata);

        // Após cadastro bem-sucedido, volta para o login com mensagem
        return res.render("login", { mensagem: "Cadastro realizado com sucesso! Faça login." });
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        return res.render("login", { mensagem: "Erro ao cadastrar. Tente novamente." });
    }
});




// --- LOGIN DO USUÁRIO ---
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ $or: [{ "usuario.name": req.body.username }, { "usuario.nome": req.body.username }] });
        if (!check) {
            return res.render("login", { mensagem: "Usuário não encontrado" });
        }

        const senhaConfere = await bcrypt.compare(req.body.password, check.usuario.password);
        if (senhaConfere) {
            // provisório: armazena corretamente o nome do usuário logado (aceita name ou nome)
            nomeUsuario = check.usuario.name || check.usuario.nome;

            return res.render("paginaBase", { mensagem: "Login efetuado com sucesso!" });
        } else {
            return res.render("login", { mensagem: "Senha incorreta" });
        }
    } catch (error) {
        console.error("Erro no login:", error);
        return res.render("login", { mensagem: "Erro ao efetuar login. Tente novamente." });
    }
});


// Porta da aplicação
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});