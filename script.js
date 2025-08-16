function abrirModalComDetalhes(agendamento) {
    agendamentoSelecionadoId = agendamento.id;

    formAlterarDados.style.display = 'none';
    detalhesAgendamento.style.display = 'block';
    botoesEdicao.style.display = 'flex';

    document.getElementById('detalhes-cliente').textContent = agendamento.cliente;
    document.getElementById('detalhes-telefone').textContent = agendamento.telefone;
    document.getElementById('detalhes-endereco').textContent = agendamento.endereco;
    document.getElementById('detalhes-servico').textContent = agendamento.servico;
    document.getElementById('detalhes-funcionarios').textContent = agendamento.funcionarios.join(', ');
    document.getElementById('detalhes-status').textContent = agendamento.status;
    
    preencherSelectsEdicao();
    document.getElementById('agendamento-id').value = agendamento.id;
    document.getElementById('cliente-edicao').value = agendamento.cliente;
    document.getElementById('servico-edicao').value = agendamento.servico;

    const funcionariosSelecionados = Array.from(document.getElementById('funcionario-edicao').options);
    funcionariosSelecionados.forEach(option => {
        if (agendamento.funcionarios.includes(option.value)) {
            option.selected = true;
        } else {
            option.selected = false;
        }
    });

    const blocoFinalizar = document.getElementById('bloco-finalizar');
    const botaoIniciar = document.getElementById('botao-iniciar');

    // Sempre mostrar os botões de edição e cancelamento, independente do status
    document.getElementById('botao-alterar-dados').style.display = 'block';
    document.getElementById('botao-cancelar').style.display = 'block';
    
    if (agendamento.status === 'agendado') {
        tituloModalEdicao.textContent = 'Detalhes do Agendamento';
        botaoIniciar.style.display = 'block';
        blocoFinalizar.style.display = 'none';
        detalhesDuracao.style.display = 'none';
        formFluxo.style.display = 'block';
        botaoReverter.style.display = 'none';
    } else if (agendamento.status === 'finalizado') {
        tituloModalEdicao.textContent = 'Serviço Finalizado';
        botaoIniciar.style.display = 'none';
        blocoFinalizar.style.display = 'none';
        detalhesDuracao.style.display = 'block';
        document.getElementById('valor-duracao').textContent = agendamento.duracao;
        formFluxo.style.display = 'none';
        botaoReverter.style.display = 'block';
    }

    // Remova este trecho, pois os botões agora estão visíveis em todos os status
    /* if (agendamento.status === 'finalizado') {
        document.getElementById('botao-alterar-dados').style.display = 'none';
        document.getElementById('botao-cancelar').style.display = 'none';
    } */

    document.getElementById('botao-whatsapp').href = `https://wa.me/55${agendamento.telefone.replace(/\D/g, '')}`;
    document.getElementById('botao-maps').href = `http://google.com/maps/place/${encodeURIComponent(agendamento.endereco)}`;
    
    modalEditar.classList.add('ativo');
}
