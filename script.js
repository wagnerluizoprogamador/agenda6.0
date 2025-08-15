// Dados de exemplo (simulando um "banco de dados" local)
let agendamentos = [
    {
        id: 'agendamento-0800',
        horario: '08:00',
        cliente: 'Wagner',
        telefone: '21987654321',
        endereco: 'Rua Exemplo, 123, Rio de Janeiro',
        servico: 'Montagem de 50',
        funcionarios: ['Arthur'],
        status: 'agendado'
    },
    {
        id: 'agendamento-1000',
        horario: '10:00',
        cliente: 'João',
        telefone: '21987654322',
        endereco: 'Av. Principal, 456, Rio de Janeiro',
        servico: 'Manutenção de 100',
        funcionarios: ['Arthur'],
        status: 'finalizado',
        duracao: '01:30:00'
    }
];

// Listas de dados para os selects
const clientes = ['Wagner', 'João', 'Maria', 'Pedro'];
const servicos = ['Montagem de 50', 'Manutenção de 100', 'Formatação', 'Instalação'];
const funcionarios = ['Arthur', 'Beatriz', 'Carlos', 'Diana'];

// Obtém os elementos do modal de Novo Agendamento
const modalAgendamento = document.getElementById('modal-agendamento');
const fecharNovoAgendamentoBtn = document.getElementById('fechar-modal');

// Obtém os elementos do modal de Edição/Detalhes
const modalEditar = document.getElementById('modal-editar-agendamento');
const fecharModalEdicaoBtn = document.getElementById('fechar-modal-edicao');
const botaoAlterarDados = document.getElementById('botao-alterar-dados');
const formAlterarDados = document.getElementById('form-alterar-dados');
const detalhesAgendamento = document.getElementById('detalhes-agendamento');
const botoesEdicao = document.getElementById('botoes-edicao');
const botaoVoltar = document.getElementById('botao-voltar');
const formFluxo = document.getElementById('form-fluxo');
const tituloModalEdicao = document.getElementById('titulo-modal-edicao');
const detalhesDuracao = document.getElementById('detalhes-duracao');
const botaoCancelar = document.getElementById('botao-cancelar');
const botaoReverter = document.getElementById('botao-reverter');

let agendamentoSelecionadoId = null;

// Evento de clique para fechar o modal de Novo Agendamento
fecharNovoAgendamentoBtn.addEventListener('click', () => {
    modalAgendamento.classList.remove('ativo');
});

// Evento de clique para fechar o modal de Edição/Detalhes
fecharModalEdicaoBtn.addEventListener('click', () => {
    modalEditar.classList.remove('ativo');
});

// Evento de clique para o botão "Alterar Dados"
botaoAlterarDados.addEventListener('click', () => {
    detalhesAgendamento.style.display = 'none';
    formFluxo.style.display = 'none';
    formAlterarDados.style.display = 'block';
    botoesEdicao.style.display = 'none';
    tituloModalEdicao.textContent = 'Editar Atendimento';
});

// Evento de clique para o botão "Voltar"
botaoVoltar.addEventListener('click', () => {
    detalhesAgendamento.style.display = 'block';
    formFluxo.style.display = 'block';
    formAlterarDados.style.display = 'none';
    botoesEdicao.style.display = 'flex';
    tituloModalEdicao.textContent = 'Detalhes do Agendamento';
});

// Evento de clique para o botão "Cancelar Agendamento"
botaoCancelar.addEventListener('click', () => {
    if (agendamentoSelecionadoId && confirm('Tem certeza que deseja cancelar este agendamento?')) {
        agendamentos = agendamentos.filter(agendamento => agendamento.id !== agendamentoSelecionadoId);
        criarAgendaDiaria();
        alert('Agendamento cancelado com sucesso!');
        modalEditar.classList.remove('ativo');
    }
});

// Evento de clique para o novo botão "Reverter para Agendado"
botaoReverter.addEventListener('click', () => {
    if (agendamentoSelecionadoId && confirm('Tem certeza que deseja reverter este agendamento para o status "Agendado"?')) {
        const agendamento = agendamentos.find(a => a.id === agendamentoSelecionadoId);
        if (agendamento) {
            agendamento.status = 'agendado';
            agendamento.duracao = '';
            criarAgendaDiaria();
            alert('Agendamento revertido com sucesso!');
            modalEditar.classList.remove('ativo');
        }
    }
});

// Evento de envio do formulário de Alterar Dados (novo)
formAlterarDados.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('agendamento-id').value;
    const dataHora = document.getElementById('data-hora-edicao').value;
    const cliente = document.getElementById('cliente-edicao').value;
    const servico = document.getElementById('servico-edicao').value;
    const funcionariosSelecionados = Array.from(document.getElementById('funcionario-edicao').selectedOptions).map(option => option.value);

    // Encontra o agendamento na lista e o atualiza
    const agendamento = agendamentos.find(a => a.id === id);
    if (agendamento) {
        agendamento.cliente = cliente;
        agendamento.servico = servico;
        agendamento.funcionarios = funcionariosSelecionados;
        // Adicione aqui a lógica para atualizar data e hora, se necessário
    }

    criarAgendaDiaria();
    alert('Agendamento alterado com sucesso!');
    modalEditar.classList.remove('ativo');
});


// Função para preencher os selects do formulário de edição
function preencherSelectsEdicao() {
    const clienteSelect = document.getElementById('cliente-edicao');
    const servicoSelect = document.getElementById('servico-edicao');
    const funcionarioSelect = document.getElementById('funcionario-edicao');

    // Limpa os selects antes de preencher
    clienteSelect.innerHTML = '';
    servicoSelect.innerHTML = '';
    funcionarioSelect.innerHTML = '';

    // Preenche clientes
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente;
        option.textContent = cliente;
        clienteSelect.appendChild(option);
    });

    // Preenche serviços
    servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico;
        option.textContent = servico;
        servicoSelect.appendChild(option);
    });

    // Preenche funcionários
    funcionarios.forEach(funcionario => {
        const option = document.createElement('option');
        option.value = funcionario;
        option.textContent = funcionario;
        funcionarioSelect.appendChild(option);
    });
}

// Função para abrir o modal de Edição/Detalhes com dados de agendamento
function abrirModalComDetalhes(agendamento) {
    agendamentoSelecionadoId = agendamento.id;

    // Reseta o estado do modal
    formAlterarDados.style.display = 'none';
    detalhesAgendamento.style.display = 'block';
    botoesEdicao.style.display = 'flex';

    document.getElementById('detalhes-cliente').textContent = agendamento.cliente;
    document.getElementById('detalhes-telefone').textContent = agendamento.telefone;
    document.getElementById('detalhes-endereco').textContent = agendamento.endereco;
    document.getElementById('detalhes-servico').textContent = agendamento.servico;
    document.getElementById('detalhes-funcionarios').textContent = agendamento.funcionarios.join(', ');
    document.getElementById('detalhes-status').textContent = agendamento.status;

    // Preenche o formulário de edição com os dados do agendamento
    preencherSelectsEdicao();
    document.getElementById('agendamento-id').value = agendamento.id;
    document.getElementById('cliente-edicao').value = agendamento.cliente;
    document.getElementById('servico-edicao').value = agendamento.servico;

    // Seleciona os funcionários
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

    document.getElementById('botao-whatsapp').href = `https://wa.me/55${agendamento.telefone.replace(/\D/g, '')}`;
    document.getElementById('botao-maps').href = `http://googleusercontent.com/maps.google.com/4{encodeURIComponent(agendamento.endereco)}`;

    modalEditar.classList.add('ativo');
}

// Função para abrir o modal de Novo Agendamento
function abrirModalNovoAgendamento(horario, data) {
    modalAgendamento.classList.add('ativo');
    document.getElementById('data-agendamento').value = data;
    document.getElementById('hora-agendamento').value = horario;
}

// Função para criar a agenda diária e os blocos de agendamento
function criarAgendaDiaria() {
    const calendarioDiario = document.getElementById('calendario-diario');
    const horarios = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

    calendarioDiario.innerHTML = '';
    const hoje = new Date().toISOString().split('T')[0];

    horarios.forEach(horario => {
        const horarioDiv = document.createElement('div');
        horarioDiv.classList.add('horario');
        horarioDiv.textContent = horario;
        calendarioDiario.appendChild(horarioDiv);

        const agendamentoDoHorario = agendamentos.find(a => a.horario === horario);
        
        const agendamentoDiv = document.createElement('div');
        agendamentoDiv.classList.add('bloco-agendamento');

        if (agendamentoDoHorario) {
            agendamentoDiv.classList.add('agendado');
            agendamentoDiv.innerHTML = `
                <span>${agendamentoDoHorario.horario} - ${agendamentoDoHorario.servico}</span>
                <span>Cliente: ${agendamentoDoHorario.cliente}</span>
                <span>Funcionário(s): ${agendamentoDoHorario.funcionarios.join(', ')}</span>
            `;
            agendamentoDiv.addEventListener('click', () => {
                abrirModalComDetalhes(agendamentoDoHorario);
            });
        } else {
            agendamentoDiv.innerHTML = `<span>${horario} - Livre</span>`;
            agendamentoDiv.addEventListener('click', () => {
                abrirModalNovoAgendamento(horario, hoje);
            });
        }

        calendarioDiario.appendChild(agendamentoDiv);
    });
}

// Chama a função para criar a agenda ao carregar a página
document.addEventListener('DOMContentLoaded', criarAgendaDiaria);
