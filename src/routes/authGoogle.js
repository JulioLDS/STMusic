const express = require("express");
const router = express.Router();
const passport = require("../auth/passport");

// rota do botão
router.get("/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
);

// callback após login
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {

        // req.user = documento do MongoDB (já normalizado pela Strategy)
        req.session.user = {
            nome: req.user.usuario.name,   
            email: req.user.usuario.email  
        };

        console.log("Sessão criada pelo Google:", req.session.user);

        res.redirect("/home");
    }
);

module.exports = router;