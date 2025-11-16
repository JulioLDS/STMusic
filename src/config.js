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
    // 🆕 ADICIONE ESTE CAMPO PARA AS ESTATÍSTICAS
    estatisticas: {
        type: Object,
        default: {} // Inicializa como objeto vazio
    }
});

// collection part
const collection = new mongoose.model("users", Loginschema);

module.exports = collection;