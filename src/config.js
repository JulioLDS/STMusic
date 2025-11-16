const mongoose = require('mongoose');
const username = 'localhost';
const password = 'bankofdates';
const cluster = 'cluster0';
const dbname = 'STMusic';

const uri = 'mongodb+srv://' + username + ':' + password + '@' + cluster + '.neeqr7a.mongodb.net/' + dbname + '?retryWrites=true&w=majority&appName=Cluster0';
const connect = mongoose.connect(uri);

// Check database connected or not
connect.then(() => {
    console.log("Conexão com o banco de dados feita com sucesso");
})
    .catch(() => {
        console.log("Não foi possível conectar ao banco de dados");
    })

// Create Schema
const Loginschema = new mongoose.Schema({
    usuario: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: false //Pra n quebrar o login com google
        }
    },
    progresso: {
        "introducao": Number,
        "propriedades_do_som": Number,
        "pentagrama": Number,
        "claves": Number,
        "figuras": Number,
        "ligadura": Number,
        "ponto_de_aumento": Number,
        "fermata": Number,
        "compasso": Number,
        "barras_de_compasso": Number,
        "formula_compasso_simples": Number,
        "formula_compasso_composto": Number,
    },
    estatisticas: {
        type: Object,
        default: {} 
    }
});

//Schema home 
const HomeSchema = new mongoose.Schema({
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

//Schema conteúdos - Flexível pra não ser gigante desnecessariamente
const ConteudosSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

//Schema exercicios - Flexível pra não ser gigante desnecessariamente
const ExerciciosSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

// collection part
const collection = new mongoose.model("users", Loginschema);

const homeModel = new mongoose.model("home", HomeSchema);

const conteudosModel = new mongoose.model("conteudos", ConteudosSchema);

const exerciciosModel = new mongoose.model("exercicios", ExerciciosSchema);

module.exports = {
    collection,
    homeModel,
    conteudosModel,
    exerciciosModel
};