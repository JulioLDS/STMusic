import { HomeService } from "/js/services/HomeService.js";
import { HomeView } from "/js/views/HomeView.js";

export class HomeController {
    constructor() {
        this.view = new HomeView(".container.home");
    }

    async init() {
        try {
            const data = await HomeService.getHomeData();
            this.view.render(data);
        } catch (err) {
            console.error(err);
            this.view.container.innerHTML = `<h1>Erro ao carregar conteúdo da home.</h1>`;
        }
    }
}
