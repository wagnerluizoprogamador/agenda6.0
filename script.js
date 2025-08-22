document.addEventListener('DOMContentLoaded', () => {
    const btnAdicionarAjudante = document.getElementById('btn-adicionar-ajudante');
    const ajudantesContainer = document.getElementById('ajudantes-container');
    const valorTotalInput = document.getElementById('valor-total');
    const comissaoPrincipalInput = document.getElementById('comissao-principal');
    const profissionalPrincipalSelect = document.getElementById('profissional-principal');
    const btnSalvar = document.querySelector('button[type="submit"]');

    let ajudantesCount = 0;

    function updateResumo() {
        const valorTotal = parseFloat(valorTotalInput.value) || 0;
        let somaPorcentagens = parseFloat(comissaoPrincipalInput.value) || 0;
        
        const comissaoPrincipal = (parseFloat(comissaoPrincipalInput.value) / 100) * valorTotal;
        document.getElementById('valor-comissao-principal').textContent = comissaoPrincipal.toFixed(2);

        document.querySelectorAll('.comissao-ajudante').forEach((input, index) => {
            const porcentagem = parseFloat(input.value) || 0;
            somaPorcentagens += porcentagem;
            const valorComissao = (porcentagem / 100) * valorTotal;
            
            const resumoAjudante = document.getElementById(`resumo-ajudante${index + 1}`);
            resumoAjudante.textContent = `Comissão do Ajudante ${index + 1}: R$ ${valorComissao.toFixed(2)}`;
            resumoAjudante.style.display = 'block';
        });
        
        document.getElementById('soma-porcentagem').textContent = somaPorcentagens.toFixed(0);
    }

    function adicionarAjudante() {
        if (ajudantesCount >= 2) return;

        ajudantesCount++;
        const novoCampo = document.createElement('div');
        novoCampo.classList.add('campo');
        
        const ajudanteHTML = `
            <label>Ajudante ${ajudantesCount}</label>
            <div class="comissao-grupo">
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
        
        novoCampo.querySelector('.comissao-ajudante').addEventListener('input', updateResumo);

        if (ajudantesCount >= 2) {
            btnAdicionarAjudante.style.display = 'none';
        }
    }

    function coletarDados() {
        const agendamento = {
            data: document.getElementById('data').value,
            valorTotal: parseFloat(valorTotalInput.value),
            profissionais: []
        };

        const principal = {
            id: profissionalPrincipalSelect.value,
            comissao_porcentagem: parseFloat(comissaoPrincipalInput.value)
        };
        agendamento.profissionais.push(principal);

        document.querySelectorAll('.comissao-ajudante').forEach((input) => {
            const ajudanteSelect = input.closest('.comissao-grupo').querySelector('.profissional-ajudante');
            const ajudante = {
                id: ajudanteSelect.value,
                comissao_porcentagem: parseFloat(input.value)
            };
            agendamento.profissionais.push(ajudante);
        });

        console.log(agendamento);
        alert("Dados prontos para envio: Veja o console do seu navegador para a estrutura JSON.");
    }

    btnAdicionarAjudante.addEventListener('click', adicionarAjudante);
    valorTotalInput.addEventListener('input', updateResumo);
    comissaoPrincipalInput.addEventListener('input', updateResumo);
    
    btnSalvar.addEventListener('click', (event) => {
        event.preventDefault();
        coletarDados();
    });

    updateResumo();
});
