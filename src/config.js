const mongoose = require('mongoose');
const username = 'localhost';
const password = 'bankofdates';
const cluster = 'cluster0';
const dbname = 'STMusic';

const uri = 'mongodb+srv://'+username+ ':'+password+'@'+cluster+'.neeqr7a.mongodb.net/'+dbname+'?retryWrites=true&w=majority&appName=Cluster0';
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
            type:String,
            required: true
        },
        email: {
            type:String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    },
    progresso: {
        "notas-musicais": Number,
        "escalas": Number,
        "acordes": Number,
        "modos": Number,
        "harmonia": Number,
        "improvisacao": Number,
    }
});

// collection part
const collection = new mongoose.model("users", Loginschema);

module.exports = collection;