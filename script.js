document.addEventListener('DOMContentLoaded', () => {

    // Referências para os elementos do HTML
    const formAgendamento = document.getElementById('form-agendamento');
    const btnAdicionarAjudante = document.getElementById('btn-adicionar-ajudante');
    const ajudantesContainer = document.getElementById('ajudantes-container');
    const valorTotalInput = document.getElementById('valor-total');
    const comissaoPrincipalInput = document.getElementById('comissao-principal');
    const profissionalPrincipalSelect = document.getElementById('profissional-principal');

    let ajudantesCount = 0;

    // Função para atualizar o painel de resumo de comissões
    function updateResumo() {
        const valorTotal = parseFloat(valorTotalInput.value) || 0;
        let somaPorcentagens = 0;

        // Limpa resumos anteriores de ajudantes
        document.querySelectorAll('.resumo-ajudante').forEach(p => p.style.display = 'none');

        // Processa o profissional principal
        const porcentagemPrincipal = parseFloat(comissaoPrincipalInput.value) || 0;
        somaPorcentagens += porcentagemPrincipal;
        const valorComissaoPrincipal = (porcentagemPrincipal / 100) * valorTotal;
        document.getElementById('valor-comissao-principal').textContent = valorComissaoPrincipal.toFixed(2);

        // Processa os ajudantes
        document.querySelectorAll('.comissao-ajudante').forEach((input, index) => {
            const porcentagem = parseFloat(input.value) || 0;
            somaPorcentagens += porcentagem;
            const valorComissao = (porcentagem / 100) * valorTotal;
            
            const resumoAjudante = document.getElementById(`resumo-ajudante${index + 1}`);
            if (resumoAjudante) {
                const nomeAjudante = input.closest('.form-group').querySelector('select').options[input.closest('.form-group').querySelector('select').selectedIndex].text;
                resumoAjudante.textContent = `Comissão de ${nomeAjudante}: R$ ${valorComissao.toFixed(2)}`;
                resumoAjudante.style.display = 'block';
            }
        });
        
        // Atualiza a soma total das porcentagens
        document.getElementById('soma-porcentagem').textContent = somaPorcentagens.toFixed(0);
    }

    // Função para adicionar um novo campo de ajudante
    function adicionarAjudante() {
        if (ajudantesCount >= 2) return;

        ajudantesCount++;
        const novoCampo = document.createElement('div');
        novoCampo.classList.add('form-group');
        
        const ajudanteHTML = `
            <label>Ajudante ${ajudantesCount}</label>
            <div class="comissao-wrapper">
                <select class="profissional-ajudante">
                    <option value="">Selecione um ajudante</option>
                    <option value="1">Arthur Brayan</option>
                    <option value="2">Profissional B</option>
                    <option value="3">Profissional C</option>
                </select>
                <input type="number" class="comissao-ajudante" placeholder="%">
            </div>
        `;
        novoCampo.innerHTML = ajudanteHTML;
        ajudantesContainer.appendChild(novoCampo);
        
        // Adiciona evento de "input" para o novo campo de comissão
        novoCampo.querySelector('.comissao-ajudante').addEventListener('input', updateResumo);
        novoCampo.querySelector('.profissional-ajudante').addEventListener('change', updateResumo);

        if (ajudantesCount >= 2) {
            btnAdicionarAjudante.style.display = 'none';
        }
    }

    // Função para coletar todos os dados do formulário e preparar para envio
    function coletarDados(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        const agendamento = {
            data: document.getElementById('data').value,
            horaInicio: document.getElementById('hora-inicio').value,
            valorTotal: parseFloat(valorTotalInput.value),
            profissionais: []
        };

        const porcentagemPrincipal = parseFloat(comissaoPrincipalInput.value);
        if (profissionalPrincipalSelect.value && !isNaN(porcentagemPrincipal)) {
            agendamento.profissionais.push({
                id: profissionalPrincipalSelect.value,
                comissao_porcentagem: porcentagemPrincipal
            });
        }

        document.querySelectorAll('.comissao-ajudante').forEach((input) => {
            const ajudanteSelect = input.closest('.comissao-wrapper').querySelector('.profissional-ajudante');
            const porcentagemAjudante = parseFloat(input.value);

            if (ajudanteSelect.value && !isNaN(porcentagemAjudante)) {
                agendamento.profissionais.push({
                    id: ajudanteSelect.value,
                    comissao_porcentagem: porcentagemAjudante
                });
            }
        });

        // Verificação final da soma das porcentagens
        const somaFinal = agendamento.profissionais.reduce((acc, curr) => acc + curr.comissao_porcentagem, 0);
        if (somaFinal !== 100) {
            alert(`A soma das comissões deve ser 100%. Soma atual: ${somaFinal}%`);
            return;
        }

        // Se a validação passar, os dados estão prontos
        console.log("Dados prontos para envio:", agendamento);
        alert("Dados prontos para envio. Verifique o console do navegador para a estrutura JSON.");

        // Aqui você faria a sua requisição para o backend
        // Exemplo:
        // fetch('/api/salvar-agendamento', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(agendamento)
        // });
    }

    // Adiciona os event listeners
    btnAdicionarAjudante.addEventListener('click', adicionarAjudante);
    valorTotalInput.addEventListener('input', updateResumo);
    comissaoPrincipalInput.addEventListener('input', updateResumo);
    profissionalPrincipalSelect.addEventListener('change', updateResumo);
    formAgendamento.addEventListener('submit', coletarDados);

    // Chama a função de resumo na carga inicial
    updateResumo();
});
