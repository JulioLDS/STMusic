const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

//conversão dos dados pra JSON
app.use(express.json());

app.use(express.urlencoded({extended: false}));

//usa o ejs como view engine
app.set('view engine', 'ejs');

//arquivo estático de estilo?
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("paginaInicial");
});
app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

//---CADASTRO DE USUARIO---
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    }

    //checa se o usuário já existe
    const usuarioJaExiste = await collection.findOne({name: data.name});

    if(usuarioJaExiste){
        res.send("Usuário já existe. Escolha outro email, por favor.");
    }
    else{
        //criptografia da senha
        const saltRounds = 10; //número pra geração da criptografia
        const criptoSenha = await bcrypt.hash(data.password, saltRounds);
        data.password = criptoSenha; //substitui a senha original pela criptografada

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }
});


//---LOGIN DO USUARIO---
app.post("/login", async (req, res) => {
    try{
        const check = await collection.findOne({name: req.body.username});
        if(!check){
            res.send("Usuário não foi encontrado");
        }

        //comparação da senha criptografada do bd com a digitada
        const aSenhaBate = await bcrypt.compare(req.body.password, check.password);
        if(aSenhaBate){
            res.render("paginaBase");
        }
        else{
            res.send("senha incorreta");

        }
    } catch{
        res.send("Usuário ou senha incorretos");

    }
});



// Definição da Porta da Applicação
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});