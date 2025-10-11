import { ConteudoController } from "./controllers/ConteudoController.js";
import { ExercicioController } from "./controllers/ExercicioController.js";
import { StatusController } from "./controllers/StatusController.js";
import { HomeController } from "./controllers/HomeController.js";

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
