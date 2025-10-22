import { Status } from "/js/models/StatusModel.js";
import { StatusService } from "/js/services/StatusService.js";
import { StatusView } from "/js/views/StatusView.js";

export class StatusController {
    constructor() {
        this.view = new StatusView(".container.status");
    }

    async init() {
        try {
            const data = await StatusService.getStatus();
            const statusModel = new Status(data);
            this.view.render(statusModel);
            this.view.bindModalEvents();
            document.querySelector(".btnVoltar").style.display = "none";
        } catch (err) {
            console.error(err);
            this.view.container.innerHTML = `<h1>Erro ao carregar status do usuário.</h1>`;
        }
    }
}
