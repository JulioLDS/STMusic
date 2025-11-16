const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

require("dotenv").config();

const app = express();

//Sessões
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

// Passport
const passport = require("./auth/passport");

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

// Conversão dos dados para JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Usa o EJS como view engine
app.set('view engine', 'ejs');

// Arquivos estáticos
app.use(express.static("public"));

//Api google
const authGoogleRoutes = require("./routes/authGoogle");

//Rota de login com o Google
app.use("/auth", authGoogleRoutes);

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

/*
app.get("/exercicios", async (req, res) => {
    try {
        if (!req.session.user) {
            console.log("Requisição /status sem usuário autenticado");
            return res.status(401).json({ erro: "Usuário não autenticado" });
        }
        const exercicios = await collection.findOne({});

        res.json(exercicios);
    } catch (err) {
        console.error("Erro ao buscar exercícios:", err);
        return res.status(500).json({ erro: "Erro ao buscar progresso" });
    }
});*/

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
                { "usuario.name": nomeUsuario.toUpperCase() },
                { "usuario.nome": nomeUsuario.toUpperCase() }
            ]
        });

        if (!usuarioDoc) {
            console.log("Usuário não encontrado / não autenticado");
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        // Normaliza para { usuario, progresso } e fornece ambos os campos nome/name
        const infoUsuario = {
            usuario: {
                nome: capitalizeName(req.session.user.nome) || "Usuário",
                name: capitalizeName(req.session.user.nome) || "Usuário",
                email: req.session.user.email || ""
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
            "propriedades_do_som": 0.0,
            "pentagrama": 0.0,
            "claves": 0.0,
            "figuras": 0.0,
            "ligadura": 0.0,
            "ponto_de_aumento": 0.0,
            "fermata": 0.0,
            "compasso": 0.0,
            "barras_de_compasso": 0.0,
            "formula_compasso_simples": 0.0,
            "formula_compasso_composto": 0.0,
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

        //Normalização dos dados (Maiúsculos)
        data.usuario.name = data.usuario.name.toUpperCase().trim();
        data.usuario.email = data.usuario.email.toUpperCase().trim();

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
        const check = await collection.findOne({ $or: [{ "usuario.name": req.body.username.toUpperCase() }, { "usuario.nome": req.body.username.toUpperCase() }] });
        if (!check) {
            return res.render("login", { mensagem: "Usuário não encontrado" });
        }

        const senhaConfere = await bcrypt.compare(req.body.password, check.usuario.password);
        if (senhaConfere) {
            // salva o usuário logado na sessão formatando o nome
            req.session.user = {
                nome: capitalizeName(check.usuario.nome || check.usuario.name),
                email: check.usuario.email.toLowerCase()
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
    console.log("função muda progresso foi chamada");
    try {
        if (!req.session.user) {
            return res.status(401).json({ erro: "Usuário não autenticado" });
        }

        const { id, nivel, media: mediaString } = req.body;
        const media = Number(mediaString);

        console.log(`Passou por aqui - id: ${id}, media: ${media}`);

        // Validação simples
        if (!id || typeof media !== "number") {
            return res.status(400).json({ erro: "Dados inválidos. É necessário enviar 'tema' e 'media' numérico." });
        }

        // Verifica se o tema existe no schema
        const temasValidos = [
            "introducao",
            "propriedades_do_som",
            "pentagrama",
            "claves",
            "figuras",
            "ligadura",
            "ponto_de_aumento",
            "fermata",
            "compasso",
            "barras_de_compasso",
            "formula_compasso_simples",
            "formula_compasso_composto",
        ];
        if (!temasValidos.includes(id)) {
            return res.status(400).json({ erro: "Tema inválido." });
        }

        // Localiza o usuário
        const usuarioNome = req.session.user.nome;
        const usuario = await collection.findOne({
            $or: [
                { "usuario.name": usuarioNome.toUpperCase() },
                { "usuario.nome": usuarioNome.toUpperCase() }
            ]
        });

        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        console.log("Chegou até a parte de salvar");
        console.log("Tipo de usuario:", typeof usuario, usuario.constructor?.name);
        // Atualiza o progresso do tema específico
        usuario.progresso[id] = media;
        await usuario.save();
        console.log("Salvou");

        return res.status(200).json({ sucesso: true, mensagem: `Progresso em '${id}' atualizado para ${media}.` });
    } catch (err) {
        console.error("Erro ao atualizar progresso:", err);
        return res.status(500).json({ erro: "Erro interno ao atualizar progresso." });
    }
});

//Função para fazer title case do nome - mudar de "JOÃO GOMES SILVA" para "João Gomes Silva"
function capitalizeName(nome) {
  return nome
    .toLowerCase()
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Porta da aplicação
const port = 5000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
});