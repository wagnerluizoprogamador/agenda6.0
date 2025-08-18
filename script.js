// Funções para salvar e carregar dados do localStorage
function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function carregarDados(chave, valorPadrao = []) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : valorPadrao;
}

// NOVA FUNÇÃO GENÉRICA PARA RENDERIZAR LISTAS
function renderizarLista(listaId, dados, chaveLocalStorage) {
    const lista = document.getElementById(listaId);
    lista.innerHTML = '';
    dados.forEach(item => {
        const li = document.createElement('li');
        // Adiciona a comissão se o item for um funcionário, ou o preço se for um serviço
        const infoExtra = item.comissao ? ` (${item.comissao}%)` : ` (R$ ${item.preco.toFixed(2)})`;
        li.innerHTML = `
            <span>${item.nome}${infoExtra}</span>
            <button class="btn-excluir" data-nome="${item.nome}" data-chave="${chaveLocalStorage}">Excluir</button>
        `;
        lista.appendChild(li);
    });

    document.querySelectorAll('.btn-excluir').forEach(botao => {
        botao.addEventListener('click', (e) => {
            const nomeItem = e.target.dataset.nome;
            const chave = e.target.dataset.chave;
            if (confirm(`Tem certeza que deseja excluir "${nomeItem}"?`)) {
                // Filtra os dados com base na chave de localStorage
                let dadosAtuais = JSON.parse(localStorage.getItem(chave));
                dadosAtuais = dadosAtuais.filter(item => item.nome !== nomeItem);
                
                salvarDados(chave, dadosAtuais);
                
                // Recarrega a página para atualizar a lista
                window.location.reload(); 
            }
        });
    });
}

// Dados de exemplo (simulando um "banco de dados" local)
let agendamentos = carregarDados('agendamentos', [
    {
        id: 'agendamento-0800',
        data: '2025-08-15',
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
        data: '2025-08-15',
        horario: '10:00',
        cliente: 'João',
        telefone: '21987654322',
        endereco: 'Av. Principal, 456, Rio de Janeiro',
        servico: 'Manutenção de 100',
        funcionarios: ['Arthur'],
        status: 'finalizado',
        duracao: '01:30:00',
        valor: 150.00,
        comissaoPaga: false
    }
]);
let clientes = carregarDados('clientes', [{ nome: 'Wagner' }, { nome: 'João' }, { nome: 'Maria' }, { nome: 'Pedro' }]);
let servicos = carregarDados('servicos', [{ nome: 'Montagem de 50', preco: 100 }, { nome: 'Manutenção de 100', preco: 150 }, { nome: 'Formatação', preco: 80 }]);
let funcionarios = carregarDados('funcionarios', [{ nome: 'Arthur', comissao: 10 }, { nome: 'Beatriz', comissao: 15 }, { nome: 'Carlos', comissao: 10 }, { nome: 'Diana', comissao: 20 }]);

// Lógica para a página de cadastro (index.html)
if (document.body.classList.contains('pagina-cadastro')) {
    const formCliente = document.getElementById('form-cadastro-cliente');
    const formServico = document.getElementById('form-cadastro-servico');
    const formFuncionario = document.getElementById('form-cadastro-funcionario');

    formCliente.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-cliente').value;
        if (!clientes.find(c => c.nome === nome)) {
            clientes.push({ nome: nome });
            salvarDados('clientes', clientes);
            alert(`Cliente "${nome}" cadastrado com sucesso!`);
            formCliente.reset();
        } else {
            alert(`Cliente "${nome}" já existe.`);
        }
    });
}

// Lógica para a página de serviços (servicos.html)
if (document.body.classList.contains('pagina-servicos')) {
    const formCadastroServico = document.getElementById('form-cadastro-servico');
    const listaServicos = document.getElementById('lista-servicos');

    formCadastroServico.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-servico').value;
        const preco = parseFloat(document.getElementById('preco-servico').value);
        if (!servicos.find(s => s.nome === nome)) {
            servicos.push({ nome: nome, preco: preco });
            salvarDados('servicos', servicos);
            alert(`Serviço "${nome}" cadastrado com sucesso!`);
            formCadastroServico.reset();
            renderizarLista('lista-servicos', servicos, 'servicos');
        } else {
            alert(`Serviço "${nome}" já existe.`);
        }
    });

    renderizarLista('lista-servicos', servicos, 'servicos');
}

// Lógica para a página de funcionários (funcionarios.html)
if (document.body.classList.contains('pagina-funcionarios')) {
    const formCadastroFuncionario = document.getElementById('form-cadastro-funcionario');
    const listaFuncionarios = document.getElementById('lista-funcionarios');

    formCadastroFuncionario.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-funcionario').value;
        const comissao = parseFloat(document.getElementById('comissao-funcionario').value);
        if (!funcionarios.find(f => f.nome === nome)) {
            funcionarios.push({ nome: nome, comissao: comissao });
            salvarDados('funcionarios', funcionarios);
            alert(`Funcionário "${nome}" cadastrado com sucesso!`);
            formCadastroFuncionario.reset();
            renderizarLista('lista-funcionarios', funcionarios, 'funcionarios');
        } else {
            alert(`Funcionário "${nome}" já existe.`);
        }
    });

    renderizarLista('lista-funcionarios', funcionarios, 'funcionarios');
}

// Lógica para a página de financeiro (financeiro.html)
if (document.body.classList.contains('pagina-financeiro')) {
    const receitaTotalElement = document.getElementById('receita-total');
    const comissoesPendentesElement = document.getElementById('comissoes-pendentes');
    const listaServicosFinalizados = document.getElementById('lista-servicos-finalizados');

    function calcularEExibirValores() {
        const servicosFinalizados = agendamentos.filter(ag => ag.status === 'finalizado');
        let receitaTotal = 0;
        let comissoesPendentes = 0;

        listaServicosFinalizados.innerHTML = '';

        servicosFinalizados.forEach(agendamento => {
            const servicoAssociado = servicos.find(s => s.nome === agendamento.servico);
            if (!servicoAssociado) {
                console.error(`Serviço "${agendamento.servico}" não encontrado.`);
                return;
            }

            const valorServico = agendamento.valor || servicoAssociado.preco;
            receitaTotal += valorServico;

            let valorComissaoTotal = 0;
            agendamento.funcionarios.forEach(funcNome => {
                const funcionarioAssociado = funcionarios.find(f => f.nome === funcNome);
                if (funcionarioAssociado && !agendamento.comissaoPaga) {
                    const valorComissao = (valorServico * funcionarioAssociado.comissao) / 100;
                    comissoesPendentes += valorComissao;
                    valorComissaoTotal += valorComissao;
                }
            });

            const li = document.createElement('li');
            li.innerHTML = `
                <span>${agendamento.data} - ${agendamento.horario}</span>
                <span>${agendamento.servico} (R$ ${valorServico.toFixed(2)})</span>
                <span>Funcionário(s): ${agendamento.funcionarios.join(', ')}</span>
                <span>Comissão a pagar: R$ ${valorComissaoTotal.toFixed(2)}</span>
            `;
            listaServicosFinalizados.appendChild(li);
        });

        receitaTotalElement.textContent = `R$ ${receitaTotal.toFixed(2)}`;
        comissoesPendentesElement.textContent = `R$ ${comissoesPendentes.toFixed(2)}`;
    }

    document.addEventListener('DOMContentLoaded', calcularEExibirValores);
}

// Lógica para a página de agenda (agenda.html)
if (document.body.classList.contains('pagina-agenda')) {
    const formNovoAgendamento = document.getElementById('form-novo-agendamento');
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
    let dataAtual = new Date();

    formNovoAgendamento.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = document.getElementById('data-agendamento').value;
        const horario = document.getElementById('hora-agendamento').value;
        const cliente = document.getElementById('cliente-agendamento').value;
        const servico = document.getElementById('servico-agendamento').value;
        const funcionariosSelecionados = Array.from(document.getElementById('funcionario-agendamento').selectedOptions).map(option => option.value);

        const novoAgendamento = {
            id: `agendamento-${Date.now()}`,
            data: data,
            horario: horario,
            cliente: cliente,
            servico: servico,
            funcionarios: funcionariosSelecionados,
            status: 'agendado'
        };

        agendamentos.push(novoAgendamento);
        salvarDados('agendamentos', agendamentos);
        criarAgendaDiaria(dataAtual);
        modalAgendamento.classList.remove('ativo');
        alert('Agendamento salvo com sucesso!');
        formNovoAgendamento.reset();
    });

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
            criarAgendaDiaria(dataAtual);
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
                agendamento.valor = undefined;
                agendamento.comissaoPaga = false;
                salvarDados('agendamentos', agendamentos);
                criarAgendaDiaria(dataAtual);
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

        criarAgendaDiaria(dataAtual);
        alert('Agendamento alterado com sucesso!');
        modalEditar.classList.remove('ativo');
    });

    function preencherSelects(selectId, options, valueKey = 'nome') {
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
            const valor = typeof optionText === 'object' ? optionText[valueKey] : optionText;
            const texto = typeof optionText === 'object' ? optionText.nome : optionText;
            option.value = valor;
            option.textContent = texto;
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
            option.value = cliente.nome;
            option.textContent = cliente.nome;
            clienteSelect.appendChild(option);
        });

        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.nome;
            option.textContent = servico.nome;
            servicoSelect.appendChild(option);
        });

        funcionarios.forEach(funcionario => {
            const option = document.createElement('option');
            option.value = funcionario.nome;
            option.textContent = funcionario.nome;
            funcionarioSelect.appendChild(option);
        });
    }

    function abrirModalComDetalhes(agendamento) {
        agendamentoSelecionadoId = agendamento.id;
        console.log("Status do agendamento:", agendamento.status);

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
        document.getElementById('botao-maps').href = `https://www.google.com/maps/search/?api=1&query=$$0{encodeURIComponent(agendamento.endereco)}`;

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

    function criarAgendaDiaria(data) {
        const calendarioDiario = document.getElementById('calendario-diario');
        calendarioDiario.innerHTML = '';

        const horarios = [];
        for (let i = 0; i < 24; i++) {
            horarios.push(`${String(i).padStart(2, '0')}:00`);
            horarios.push(`${String(i).padStart(2, '0')}:30`);
        }

        const dataFormatada = data.toISOString().split('T')[0];

        horarios.forEach(horario => {
            const horarioDiv = document.createElement('div');
            horarioDiv.classList.add('horario');
            horarioDiv.textContent = horario;
            calendarioDiario.appendChild(horarioDiv);

            const agendamentoDoHorario = agendamentos.find(a => a.horario === horario && a.data === dataFormatada);

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
                    abrirModalNovoAgendamento(horario, dataFormatada);
                });
            }
            calendarioDiario.appendChild(agendamentoDiv);
        });
    }

    function criarNavegacaoSemanal() {
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        diasDaSemanaDiv.innerHTML = '';

        const hoje = new Date();
        const dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 15);

        for (let i = 0; i < 30; i++) {
            const dataDoDia = new Date(dataInicial);
            dataDoDia.setDate(dataInicial.getDate() + i);

            const diaDiv = document.createElement('div');
            diaDiv.classList.add('dia-semana');

            const diaSemana = dias[dataDoDia.getDay()];
            const diaMes = dataDoDia.getDate();

            diaDiv.innerHTML = `<span>${diaSemana}</span><span>${diaMes}</span>`;

            const dataFormatada = dataDoDia.toISOString().split('T')[0];
            const hojeFormatado = hoje.toISOString().split('T')[0];

            if (dataFormatada === hojeFormatado) {
                diaDiv.classList.add('ativo');
            }

            diaDiv.addEventListener('click', () => {
                dataAtual = dataDoDia;
                document.querySelectorAll('.dia-semana').forEach(d => d.classList.remove('ativo'));
                diaDiv.classList.add('ativo');
                criarAgendaDiaria(dataAtual);
            });

            diasDaSemanaDiv.appendChild(diaDiv);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.classList.contains('pagina-agenda')) {
            criarNavegacaoSemanal();
            criarAgendaDiaria(dataAtual);
        }
    });
