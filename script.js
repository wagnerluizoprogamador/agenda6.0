// Funções para salvar e carregar dados do localStorage
function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function carregarDados(chave, valorPadrao = []) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : valorPadrao;
}

// Dados de exemplo (simulando um "banco de dados" local)
let agendamentos = carregarDados('agendamentos', [
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
]);
let clientes = carregarDados('clientes', ['Wagner', 'João', 'Maria', 'Pedro']);
let servicos = carregarDados('servicos', ['Montagem de 50', 'Manutenção de 100', 'Formatação', 'Instalação']);
let funcionarios = carregarDados('funcionarios', ['Arthur', 'Beatriz', 'Carlos', 'Diana']);

// Lógica para a página de cadastro (index.html)
if (document.body.classList.contains('pagina-cadastro')) {
    const formCliente = document.getElementById('form-cadastro-cliente');
    const formServico = document.getElementById('form-cadastro-servico');
    const formFuncionario = document.getElementById('form-cadastro-funcionario');

    formCliente.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-cliente').value;
        if (!clientes.includes(nome)) {
            clientes.push(nome);
            salvarDados('clientes', clientes);
            alert(`Cliente "${nome}" cadastrado com sucesso!`);
            formCliente.reset();
        } else {
            alert(`Cliente "${nome}" já existe.`);
        }
    });

    formServico.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-servico').value;
        if (!servicos.includes(nome)) {
            servicos.push(nome);
            salvarDados('servicos', servicos);
            alert(`Serviço "${nome}" cadastrado com sucesso!`);
            formServico.reset();
        } else {
            alert(`Serviço "${nome}" já existe.`);
        }
    });

    formFuncionario.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-funcionario').value;
        if (!funcionarios.includes(nome)) {
            funcionarios.push(nome);
            salvarDados('funcionarios', funcionarios);
            alert(`Funcionário "${nome}" cadastrado com sucesso!`);
            formFuncionario.reset();
        } else {
            alert(`Funcionário "${nome}" já existe.`);
        }
    });
}

// Lógica para a página de agenda (agenda.html)
if (document.body.classList.contains('pagina-agenda')) {
    const modalAgendamento = document.getElementById('modal-agendamento');
    const fecharNovoAgendamentoBtn = document.getElementById('fechar-modal');
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
    const dataSelecionadaH2 = document.getElementById('data-selecionada');
    const diasDaSemanaDiv = document.getElementById('dias-da-semana');

    let agendamentoSelecionadoId = null;

    fecharNovoAgendamentoBtn.addEventListener('click', () => {
        modalAgendamento.classList.remove('ativo');
    });

    fecharModalEdicaoBtn.addEventListener('click', () => {
        modalEditar.classList.remove('ativo');
    });

    botaoAlterarDados.addEventListener('click', () => {
        detalhesAgendamento.style.display = 'none';
        formFluxo.style.display = 'none';
        formAlterarDados.style.display = 'block';
        botoesEdicao.style.display = 'none';
        tituloModalEdicao.textContent = 'Editar Atendimento';
    });

    botaoVoltar.addEventListener('click', () => {
        detalhesAgendamento.style.display = 'block';
        formFluxo.style.display = 'block';
        formAlterarDados.style.display = 'none';
        botoesEdicao.style.display = 'flex';
        tituloModalEdicao.textContent = 'Detalhes do Agendamento';
    });

    botaoCancelar.addEventListener('click', () => {
        if (agendamentoSelecionadoId && confirm('Tem certeza que deseja cancelar este agendamento?')) {
            agendamentos = agendamentos.filter(agendamento => agendamento.id !== agendamentoSelecionadoId);
            salvarDados('agendamentos', agendamentos);
            criarAgendaDiaria();
            alert('Agendamento cancelado com sucesso!');
            modalEditar.classList.remove('ativo');
        }
    });

    botaoReverter.addEventListener('click', () => {
        if (agendamentoSelecionadoId && confirm('Tem certeza que deseja reverter este agendamento para o status "Agendado"?')) {
            const agendamento = agendamentos.find(a => a.id === agendamentoSelecionadoId);
            if (agendamento) {
                agendamento.status = 'agendado';
                agendamento.duracao = '';
                salvarDados('agendamentos', agendamentos);
                criarAgendaDiaria();
                alert('Agendamento revertido com sucesso!');
                modalEditar.classList.remove('ativo');
            }
        }
    });

    formAlterarDados.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('agendamento-id').value;
        const dataHora = document.getElementById('data-hora-edicao').value;
        const cliente = document.getElementById('cliente-edicao').value;
        const servico = document.getElementById('servico-edicao').value;
        const funcionariosSelecionados = Array.from(document.getElementById('funcionario-edicao').selectedOptions).map(option => option.value);
    
        const agendamento = agendamentos.find(a => a.id === id);
        if (agendamento) {
            const novaData = new Date(dataHora);
            agendamento.data = novaData.toISOString().split('T')[0];
            agendamento.horario = novaData.toTimeString().substring(0, 5);
            agendamento.cliente = cliente;
            agendamento.servico = servico;
            agendamento.funcionarios = funcionariosSelecionados;
            salvarDados('agendamentos', agendamentos);
        }
    
        criarAgendaDiaria();
        alert('Agendamento alterado com sucesso!');
        modalEditar.classList.remove('ativo');
    });

    function preencherSelects(selectId, options) {
        const selectElement = document.getElementById(selectId);
        selectElement.innerHTML = '';
        if (selectId.includes('agendamento')) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Selecione um ${selectId.replace('-agendamento', '')}`;
            selectElement.appendChild(defaultOption);
        }
        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            selectElement.appendChild(option);
        });
    }

    function preencherSelectsEdicao() {
        const clienteSelect = document.getElementById('cliente-edicao');
        const servicoSelect = document.getElementById('servico-edicao');
        const funcionarioSelect = document.getElementById('funcionario-edicao');

        clienteSelect.innerHTML = '';
        servicoSelect.innerHTML = '';
        funcionarioSelect.innerHTML = '';

        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente;
            option.textContent = cliente;
            clienteSelect.appendChild(option);
        });

        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico;
            option.textContent = servico;
            servicoSelect.appendChild(option);
        });

        funcionarios.forEach(funcionario => {
            const option = document.createElement('option');
            option.value = funcionario;
            option.textContent = funcionario;
            funcionarioSelect.appendChild(option);
        });
    }

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

        document.getElementById('botao-whatsapp').href = `https://wa.me/55${agendamento.telefone.replace(/\D/g, '')}`;
        document.getElementById('botao-maps').href = `http://googleusercontent.com/maps.google.com/8{encodeURIComponent(agendamento.endereco)}`;
        
        modalEditar.classList.add('ativo');
    }

    function abrirModalNovoAgendamento(horario, data) {
        modalAgendamento.classList.add('ativo');
        document.getElementById('data-agendamento').value = data;
        document.getElementById('hora-agendamento').value = horario;
        preencherSelects('cliente-agendamento', clientes);
        preencherSelects('servico-agendamento', servicos);
        preencherSelects('funcionario-agendamento', funcionarios);
    }

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
    
    // NOVO: Função para criar a navegação de dias da semana
    function criarNavegacaoSemanal() {
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        diasDaSemanaDiv.innerHTML = '';
        const hoje = new Date();
        const diaAtual = hoje.getDay(); // 0 = Domingo, 1 = Segunda, etc.
        const dataAtual = hoje.getDate();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        const dataSelecionadaFormatada = `${dias[diaAtual]}, ${dataAtual} de ${mesAtual + 1} de ${anoAtual}`;
        dataSelecionadaH2.textContent = `Agendamentos para hoje, ${dataSelecionadaFormatada}`;

        for (let i = 0; i < 7; i++) {
            const diaDiv = document.createElement('div');
            diaDiv.classList.add('dia-semana');

            const dataDoDia = new Date(anoAtual, mesAtual, dataAtual + (i - diaAtual));
            const diaSemana = dias[dataDoDia.getDay()];
            const diaMes = dataDoDia.getDate();

            diaDiv.innerHTML = `<span>${diaSemana}</span><span>${diaMes}</span>`;

            if (i === diaAtual) {
                diaDiv.classList.add('ativo');
            }

            diasDaSemanaDiv.appendChild(diaDiv);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.classList.contains('pagina-agenda')) {
            criarNavegacaoSemanal();
            criarAgendaDiaria();
        }
    });
}
