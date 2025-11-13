// Responsável por buscar os dados de exercicios.json
export class ExercicioService {
    static async getExercicios() {
        const res = await fetch("../../data/exercicios.json");
        if (!res.ok) throw new Error("Erro ao buscar exercícios");
        return await res.json();
    }

    async atualizarProgresso(id, nivel, media) {
        try {

            alert(`Atualizando progresso: ${id} - ${nivel} - ${media}%`);

            // Enviando progresso ao back-end via service (Redundância??)
            //await ExercicioService.atualizarProgresso({ id, nivel, media });
            const response = await fetch("/muda-progresso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, nivel, media })
            });

            
            // Aqui verificamos se a requisição foi bem-sucedida
            if (!response.ok) {
                const erro = await response.text();
                throw new Error(`Erro HTTP ${response.status}: ${erro}`);
            }

            const data = await response.json();
            alert(`Service chamou o back end com sucesso: ${data.mensagem}`);

            // Atualiza a interface, se necessário
            //this.init();

        } catch (err) {
            console.error("Erro ao atualizar progresso no service:", err);
            alert("Erro ao salvar progresso - service. Tente novamente.");
        }
    }
}
