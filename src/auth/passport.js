const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { collection } = require("../config"); // sua model "users"

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await collection.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:5000/auth/google/callback",
            passReqToCallback: true
        },
        async (request, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.email.toUpperCase().trim();
                const nome = profile.displayName.toUpperCase().trim();

                // Procura usuário existente
                let user = await collection.findOne({ "usuario.email": email });

                // Se não existir, cria novo
                if (!user) {
                    const novoUsuario = {
                        usuario: {
                            name: nome,
                            email: email,
                            password: null, // Google user não tem senha
                        },
                        progresso: {
                            introducao: 0,
                            propriedades_do_som: 0,
                            pentagrama: 0,
                            claves: 0,
                            figuras: 0,
                            ligadura: 0,
                            ponto_de_aumento: 0,
                            fermata: 0,
                            compasso: 0,
                            barras_de_compasso: 0,
                            formula_compasso_simples: 0,
                            formula_compasso_composto: 0
                        },
                        "estatisticas": {}
                    };

                    const result = await collection.create(novoUsuario);
                    user = result;
                }

                return done(null, user);
            } catch (error) {
                console.error("Erro Google Strategy:", error);
                return done(error, null);
            }
        }
    )
);

module.exports = passport;