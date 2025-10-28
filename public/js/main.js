import { ConteudoController } from "/js/controllers/ConteudoController.js";
import { ExercicioController } from "/js/controllers/ExercicioController.js";
import { StatusController } from "/js/controllers/StatusController.js";
import { HomeController } from "/js/controllers/HomeController.js";

window.carregarHome = () => {
    new HomeController().init();
};

window.carregarConteudos = () => {
    new ConteudoController().init();
};

window.carregarExercicios = () => {
    new ExercicioController().init();
};

window.carregarStatus = () => {
    new StatusController().init();
};
