const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

//Sessões
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose"); // importa o mesmo mongoose do config.js

app.use(session({
    secret: "stringsecretausadaparagerarohash",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: "sessions",
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000
    }
}));

// Função middleware para impedir cache (resolve o problema de deslogar 
// e conseguir voltar para a página inicial logado)
function autenticar(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/");
    }  

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
}

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

//Rota da home
app.get("/home", autenticar, (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }  
    res.render("paginaBase", { mensagem: "Login efetuado com sucesso!" });
});

//Logout(Certo)
app.get("/logout", async (req, res) => {
    try {
        if (req.session) {
            const sessionId = req.session.id; // ID da sessão atual
            await req.session.destroy();      // apaga da memória
            req.sessionStore.destroy(sessionId, err => { // apaga do Mongo
                if (err) console.error("Erro ao remover sessão do Mongo:", err);
            });
        }

        res.clearCookie("connect.sid", { path: "/" });
        return res.redirect("/");
    } catch (err) {
        console.error("Erro no logout:", err);
        return res.status(500).send("Erro ao fazer logout");
    }
});

//Tela de status
app.get("/status", async (req, res) => {
    try {
        if (!req.session.user) {
            console.log("Requisição /status sem usuário autenticado");
            return res.status(401).json({ erro: "Usuário não autenticado" });
        }

        const nomeUsuario = req.session.user.nome;
        
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
        const infoUsuario = {
            usuario: {
                nome: usuarioDoc.usuario.nome || usuarioDoc.usuario.name || "Usuário",
                name: usuarioDoc.usuario.name || usuarioDoc.usuario.nome || "Usuário",
                email: usuarioDoc.usuario.email || ""
            },
            progresso: usuarioDoc.progresso || {}
        };

        console.log("Deu certo pegar o json, enviando objeto normalizado para o front");
        return res.json(infoUsuario);
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
            "introducao": 0.0,
            "propriedades-som": 0.0,
            "pentagrama": 0.0,
            "claves": 0.0,
            "figuras": 0.0,
            "ligadura": 0.0,
            "ponto-de-aumento": 0.0,
            "fermata": 0.0,
            "compasso": 0.0,
            "barras-de-compasso": 0.0,
            "formula-compasso-simples": 0.0,
            "formula-compasso-composto": 0.0,
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
            // salva o usuário logado na sessão
            req.session.user = {
                nome: check.usuario.nome || check.usuario.name,
                email: check.usuario.email
            };

            return res.redirect("/home");
        } else {
            return res.render("login", { mensagem: "Senha incorreta" });
        }
    } catch (error) {
        console.error("Erro no login:", error);
        return res.render("login", { mensagem: "Erro ao efetuar login. Tente novamente." });
    }
});

//Atualização do progresso - exercicio concluido - de acordo com o tema
app.post("/muda-progresso", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ erro: "Usuário não autenticado" });
        }

        const { id, nivel, media } = req.body;

        // Validação simples
        if (!id || typeof media !== "number") {
            return res.status(400).json({ erro: "Dados inválidos. É necessário enviar 'tema' e 'media' numérico." });
        }

        // Verifica se o tema existe no schema
        const temasValidos = [
            "introducao",
            "propriedades-som",
            "pentagrama",
            "claves",
            "figuras",
            "ligadura",
            "ponto-de-aumento",
            "fermata",
            "compasso",
            "barras-de-compasso",
            "formula-compasso-simples",
            "formula-compasso-composto",
        ];
        if (!temasValidos.includes(id)) {
            return res.status(400).json({ erro: "Tema inválido." });
        }

        // Localiza o usuário
        const usuarioNome = req.session.user.nome;
        const usuario = await collection.findOne({
            $or: [
                { "usuario.name": usuarioNome },
                { "usuario.nome": usuarioNome }
            ]
        });

        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        // Atualiza o progresso do tema específico
        usuario.progresso[id] = media;
        await usuario.save();

        return res.json({ sucesso: true, mensagem: `Progresso em '${id}' atualizado para ${media}.` });
    } catch (err) {
        console.error("Erro ao atualizar progresso:", err);
        return res.status(500).json({ erro: "Erro interno ao atualizar progresso." });
    }
});


// Porta da aplicação
const port = 5000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
});