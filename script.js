/* ======================================================
   MODAL DE EDIÇÃO – FINAL E FUNCIONAL
   ====================================================== */

function abrirModalEdicao(ag) {

    // Preenche dados básicos
    document.getElementById('detalhes-cliente').textContent = ag.cliente;
    document.getElementById('detalhes-servico').textContent = ag.servico;
    document.getElementById('detalhes-funcionarios').textContent = ag.funcionarios.join(', ');
    document.getElementById('detalhes-status').textContent = ag.status;
    document.getElementById('agendamento-id').value = ag.id;

    // Estado inicial do modal
    document.getElementById('detalhes-agendamento').style.display = 'block';
    document.getElementById('form-alterar-dados').style.display = 'none';
    document.getElementById('form-fluxo').style.display = 'block';
    document.getElementById('botoes-edicao').style.display = 'flex';

    // Controle por status
    document.getElementById('botao-iniciar').style.display =
        ag.status === 'agendado' ? 'block' : 'none';

    document.getElementById('bloco-finalizar').style.display =
        ag.status === 'em andamento' ? 'block' : 'none';

    // WhatsApp e Maps
    configurarAcoesRapidas(ag.cliente);

    // Preenche selects de edição
    preencherSelectsEdicao(ag);

    modalEditarAgendamento.classList.add('ativo');
}

/* ======================================================
   WHATSAPP E MAPS
   ====================================================== */
function configurarAcoesRapidas(clienteNome) {
    const clientes = lerLocal('clientes');
    const cliente = clientes.find(c => c.nome === clienteNome);

    const botaoWhatsapp = document.getElementById('botao-whatsapp');
    const botaoMaps = document.getElementById('botao-maps');

    if (!cliente) return;

    if (cliente.telefone) {
        botaoWhatsapp.href =
            `https://wa.me/55${cliente.telefone.replace(/\D/g,'')}`;
        botaoWhatsapp.style.display = 'inline-block';
    } else {
        botaoWhatsapp.style.display = 'none';
    }

    if (cliente.endereco) {
        botaoMaps.href =
            `https://maps.google.com/maps?daddr=${encodeURIComponent(cliente.endereco)}`;
        botaoMaps.style.display = 'inline-block';
    } else {
        botaoMaps.style.display = 'none';
    }
}

/* ======================================================
   SELECTS DE EDIÇÃO
   ====================================================== */
function preencherSelectsEdicao(ag) {
    const clientes = lerLocal('clientes');
    const servicos = lerLocal('servicos');
    const funcionarios = lerLocal('funcionarios');

    const selCliente = document.getElementById('cliente-edicao');
    const selServico = document.getElementById('servico-edicao');
    const selFuncionario = document.getElementById('funcionario-edicao');

    selCliente.innerHTML = '';
    clientes.forEach(c => {
        const op = document.createElement('option');
        op.value = c.nome;
        op.textContent = c.nome;
        if (c.nome === ag.cliente) op.selected = true;
        selCliente.appendChild(op);
    });

    selServico.innerHTML = '';
    servicos.forEach(s => {
        const op = document.createElement('option');
        op.value = s.nome;
        op.textContent = s.nome;
        if (s.nome === ag.servico) op.selected = true;
        selServico.appendChild(op);
    });

    selFuncionario.innerHTML = '';
    funcionarios.forEach(f => {
        const op = document.createElement('option');
        op.value = f.nome;
        op.textContent = f.nome;
        if (ag.funcionarios.includes(f.nome)) op.selected = true;
        selFuncionario.appendChild(op);
    });
}

/* ======================================================
   BOTÕES DO MODAL
   ====================================================== */

// ALTERAR
document.getElementById('botao-alterar-dados')?.addEventListener('click', () => {
    document.getElementById('detalhes-agendamento').style.display = 'none';
    document.getElementById('form-fluxo').style.display = 'none';
    document.getElementById('botoes-edicao').style.display = 'none';
    document.getElementById('form-alterar-dados').style.display = 'block';
});

// VOLTAR
document.getElementById('botao-voltar')?.addEventListener('click', () => {
    document.getElementById('detalhes-agendamento').style.display = 'block';
    document.getElementById('form-fluxo').style.display = 'block';
    document.getElementById('botoes-edicao').style.display = 'flex';
    document.getElementById('form-alterar-dados').style.display = 'none';
});

// SALVAR ALTERAÇÃO
document.getElementById('form-alterar-dados')?.addEventListener('submit', e => {
    e.preventDefault();

    const id = document.getElementById('agendamento-id').value;
    const dataHora = document.getElementById('data-hora-edicao').value;
    const cliente = document.getElementById('cliente-edicao').value;
    const servico = document.getElementById('servico-edicao').value;
    const funcionarios = Array.from(
        document.getElementById('funcionario-edicao').selectedOptions
    ).map(o => o.value);

    const agendamentos = lerLocal('agendamentos');
    const ag = agendamentos.find(a => a.id == id);
    if (!ag) return;

    ag.data = dataHora.split('T')[0];
    ag.hora = dataHora.split('T')[1];
    ag.cliente = cliente;
    ag.servico = servico;
    ag.funcionarios = funcionarios;

    salvarLocal('agendamentos', agendamentos);

    alert('✅ Agendamento alterado');
    modalEditarAgendamento.classList.remove('ativo');
    gerarCalendarioDoDia(dataAtual);
});

// CANCELAR
document.getElementById('botao-cancelar')?.addEventListener('click', () => {
    const id = document.getElementById('agendamento-id').value;
    if (!confirm('Cancelar este agendamento?')) return;

    let ags = lerLocal('agendamentos');
    ags = ags.filter(a => a.id != id);
    salvarLocal('agendamentos', ags);

    alert('❌ Agendamento cancelado');
    modalEditarAgendamento.classList.remove('ativo');
    gerarCalendarioDoDia(dataAtual);
});

// INICIAR
document.getElementById('botao-iniciar')?.addEventListener('click', () => {
    const id = document.getElementById('agendamento-id').value;
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a => a.id == id);
    if (!ag) return;

    ag.status = 'em andamento';
    ag.horaInicio = new Date().toISOString();
    salvarLocal('agendamentos', ags);

    alert('▶ Serviço iniciado');
    modalEditarAgendamento.classList.remove('ativo');
    gerarCalendarioDoDia(dataAtual);
});

// FINALIZAR
document.getElementById('botao-finalizar')?.addEventListener('click', () => {
    const id = document.getElementById('agendamento-id').value;
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a => a.id == id);
    if (!ag) return;

    ag.status = 'finalizado';
    ag.horaFim = new Date().toISOString();
    salvarLocal('agendamentos', ags);

    alert('✔ Serviço finalizado');
    modalEditarAgendamento.classList.remove('ativo');
    gerarCalendarioDoDia(dataAtual);
});
