// Acessa os formulários e elementos pelo ID
const formCadastroCliente = document.getElementById('form-cadastro-cliente');
const formCadastroServico = document.getElementById('form-cadastro-servico');
const formCadastroFuncionario = document.getElementById('form-cadastro-funcionario');
const formNovoAgendamento = document.getElementById('form-novo-agendamento');
const calendarioDiarioDiv = document.getElementById('calendario-diario');
const dataSelecionadaSpan = document.getElementById('data-selecionada');
const diasDaSemanaDiv = document.getElementById('dias-da-semana');

// Modais e botões de controle
const modalAgendamento = document.getElementById('modal-agendamento');
const fecharModalBtn = document.getElementById('fechar-modal');
const modalEditarAgendamento = document.getElementById('modal-editar-agendamento');
const fecharModalEdicaoBtn = document.getElementById('fechar-modal-edicao');

// Elementos do modal de edição
const detalhesAgendamentoDiv = document.getElementById('detalhes-agendamento');
const formFluxoDiv = document.getElementById('form-fluxo');
const blocoFinalizarDiv = document.getElementById('bloco-finalizar');
const botoesEdicaoDiv = document.getElementById('botoes-edicao');
const formAlterarDados = document.getElementById('form-alterar-dados');
const botaoAlterarDados = document.getElementById('botao-alterar-dados');
const botaoVoltar = document.getElementById('botao-voltar');

// Botões de ação do fluxo
const botaoIniciar = document.getElementById('botao-iniciar');
const botaoFinalizar = document.getElementById('botao-finalizar');
const botaoCancelar = document.getElementById('botao-cancelar');
const fotoServicoInput = document.getElementById('foto-servico');
const timerServicoDiv = document.getElementById('timer-servico');
const valorTimerSpan = document.getElementById('valor-timer');

// Elementos de ação rápida
const botoesAcaoRapidaDiv = document.querySelector('.botoes-acao-rapida');
const botaoWhatsapp = document.getElementById('botao-whatsapp');
const botaoMaps = document.getElementById('botao-maps');

// Variáveis globais
let dataAtual = new Date();
let timerInterval;

// --- Funções de Cadastro, Listagem e Agendamento (inalteradas) ---
if (formCadastroCliente) {
    formCadastroCliente.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const nome = document.getElementById('nome-cliente').value;
        const telefone = document.getElementById('telefone-cliente').value;
        const endereco = document.getElementById('endereco-cliente').value;
        const novoCliente = { nome, telefone, endereco };
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        clientes.push(novoCliente);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        formCadastroCliente.reset();
        alert('Cliente cadastrado com sucesso!');
        preencherSelects();
    });
}
if (formCadastroServico) {
    formCadastroServico.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const nome = document.getElementById('nome-servico').value;
        const duracao = document.getElementById('duracao-servico').value;
        const valor = document.getElementById('valor-servico').value;
        const novoServico = { nome, duracao, valor };
        const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
        servicos.push(novoServico);
        localStorage.setItem('servicos', JSON.stringify(servicos));
        formCadastroServico.reset();
        alert('Serviço cadastrado com sucesso!');
        preencherSelects();
    });
}
if (formCadastroFuncionario) {
    formCadastroFuncionario.addEventListener('submit', function(event) {
        event.preventDefault();
        const nome = document.getElementById('nome-funcionario').value;
        const comissao = document.getElementById('comissao-funcionario').value;
        const novoFuncionario = { nome, comissao };
        const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
        funcionarios.push(novoFuncionario);
        localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        formCadastroFuncionario.reset();
        alert('Funcionário cadastrado com sucesso!');
        preencherSelects();
    });
}
function carregarClientes() {
    const listaClientesDiv = document.getElementById('lista-de-clientes');
    if (!listaClientesDiv) return;
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    if (clientes.length === 0) { listaClientesDiv.innerHTML = '<p>Nenhum cliente cadastrado ainda.</p>'; return; }
    listaClientesDiv.innerHTML = '';
    clientes.forEach(cliente => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        itemDiv.innerHTML = `<strong>${cliente.nome}</strong><p>Telefone: ${cliente.telefone}</p><p>Endereço: ${cliente.endereco || 'Não informado'}</p>`;
        listaClientesDiv.appendChild(itemDiv);
    });
}
function carregarServicos() {
    const listaServicosDiv = document.getElementById('lista-de-servicos');
    if (!listaServicosDiv) return;
    const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    if (servicos.length === 0) { listaServicosDiv.innerHTML = '<p>Nenhum serviço cadastrado ainda.</p>'; return; }
    listaServicosDiv.innerHTML = '';
    servicos.forEach(servico => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        itemDiv.innerHTML = `<strong>${servico.nome}</strong><p>Duração: ${servico.duracao} minutos</p><p>Valor: R$ ${parseFloat(servico.valor).toFixed(2).replace('.', ',')}</p>`;
        listaServicosDiv.appendChild(itemDiv);
    });
}
function carregarFuncionarios() {
    const listaFuncionariosDiv = document.getElementById('lista-de-funcionarios');
    if (!listaFuncionariosDiv) return;
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    if (funcionarios.length === 0) { listaFuncionariosDiv.innerHTML = '<p>Nenhum funcionário cadastrado ainda.</p>'; return; }
    listaFuncionariosDiv.innerHTML = '';
    funcionarios.forEach(funcionario => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        itemDiv.innerHTML = `<strong>${funcionario.nome}</strong><p>Comissão: ${funcionario.comissao}%</p>`;
        listaFuncionariosDiv.appendChild(itemDiv);
    });
}
function preencherSelects() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    const selectClienteNovo = document.getElementById('cliente-agendamento');
    const selectServicoNovo = document.getElementById('servico-agendamento');
    const selectFuncionarioNovo = document.getElementById('funcionario-agendamento');
    const selectClienteEdicao = document.getElementById('cliente-edicao');
    const selectServicoEdicao = document.getElementById('servico-edicao');
    const selectFuncionarioEdicao = document.getElementById('funcionario-edicao');
    const selecionarFuncionarioComissoes = document.getElementById('selecionar-funcionario');
    if (selectClienteNovo) selectClienteNovo.innerHTML = '<option value="">Selecione um cliente</option>';
    if (selectServicoNovo) selectServicoNovo.innerHTML = '<option value="">Selecione um serviço</option>';
    if (selectFuncionarioNovo) selectFuncionarioNovo.innerHTML = '';
    if (selectClienteEdicao) selectClienteEdicao.innerHTML = '';
    if (selectServicoEdicao) selectServicoEdicao.innerHTML = '';
    if (selectFuncionarioEdicao) selectFuncionarioEdicao.innerHTML = '';
    if (selecionarFuncionarioComissoes) selecionarFuncionarioComissoes.innerHTML = '<option value="">Selecione um funcionário</option>';
    const preencher = (select, array) => {
        if (select) {
            array.forEach(item => {
                const option = document.createElement('option');
                option.value = item.nome;
                option.textContent = item.nome;
                select.appendChild(option);
            });
        }
    };
    preencher(selectClienteNovo, clientes);
    preencher(selectServicoNovo, servicos);
    preencher(selectFuncionarioNovo, funcionarios);
    preencher(selectClienteEdicao, clientes);
    preencher(selectServicoEdicao, servicos);
    preencher(selectFuncionarioEdicao, funcionarios);
    preencher(selecionarFuncionarioComissoes, funcionarios);
}

if (formNovoAgendamento) {
    formNovoAgendamento.addEventListener('submit', function(event) {
        event.preventDefault();
        const data = document.getElementById('data-agendamento').value;
        const hora = document.getElementById('hora-agendamento').value;
        const clienteNome = document.getElementById('cliente-agendamento').value;
        const servicoNome = document.getElementById('servico-agendamento').value;
        const funcionariosSelecionados = Array.from(document.getElementById('funcionario-agendamento').selectedOptions).map(option => option.value);
        if (!data || !hora || !clienteNome || !servicoNome || funcionariosSelecionados.length === 0) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        const novoAgendamento = {
            id: Date.now(),
            data, 
            hora, 
            cliente: clienteNome, 
            servico: servicoNome, 
            funcionarios: funcionariosSelecionados, 
            status: 'agendado'
        };
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        agendamentos.push(novoAgendamento);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        formNovoAgendamento.reset();
        modalAgendamento.classList.remove('ativo');
        alert('Agendamento criado com sucesso!');
        gerarCalendarioDoDia(dataAtual);
    });
    fecharModalBtn.addEventListener('click', () => {
        modalAgendamento.classList.remove('ativo');
    });
}
if (formAlterarDados) {
    formAlterarDados.addEventListener('submit', function(event) {
        event.preventDefault();
        const agendamentoId = document.getElementById('agendamento-id').value;
        const dataHoraEdicao = document.getElementById('data-hora-edicao').value;
        const clienteEdicao = document.getElementById('cliente-edicao').value;
        const servicoEdicao = document.getElementById('servico-edicao').value;
        const funcionarioEdicao = Array.from(document.getElementById('funcionario-edicao').selectedOptions).map(option => option.value);
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        const index = agendamentos.findIndex(agendamento => agendamento.id == agendamentoId);
        if (index !== -1) {
            agendamentos[index].data = dataHoraEdicao.split('T')[0];
            agendamentos[index].hora = dataHoraEdicao.split('T')[1];
            agendamentos[index].cliente = clienteEdicao;
            agendamentos[index].servico = servicoEdicao;
            agendamentos[index].funcionarios = funcionarioEdicao;
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            alert('Agendamento alterado com sucesso!');
            modalEditarAgendamento.classList.remove('ativo');
            gerarCalendarioDoDia(dataAtual);
        }
    });
    botaoAlterarDados.addEventListener('click', () => {
        detalhesAgendamentoDiv.style.display = 'none';
        formFluxoDiv.style.display = 'none';
        botoesEdicaoDiv.style.display = 'none';
        formAlterarDados.style.display = 'block';
    });
    botaoVoltar.addEventListener('click', () => {
        detalhesAgendamentoDiv.style.display = 'block';
        formFluxoDiv.style.display = 'block';
        botoesEdicaoDiv.style.display = 'flex';
        formAlterarDados.style.display = 'none';
    });
    botaoIniciar.addEventListener('click', () => {
        const agendamentoId = document.getElementById('agendamento-id').value;
        let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        const agendamento = agendamentos.find(a => a.id == agendamentoId);
        if (agendamento) {
            agendamento.status = 'em andamento';
            agendamento.horaInicio = new Date().toISOString();
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            alert('Serviço iniciado!');
            modalEditarAgendamento.classList.remove('ativo');
            gerarCalendarioDoDia(dataAtual);
        }
    });
    botaoFinalizar.addEventListener('click', () => {
        const agendamentoId = document.getElementById('agendamento-id').value;
        const fotoFile = fotoServicoInput.files[0];
        let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        const agendamento = agendamentos.find(a => a.id == agendamentoId);
        if (agendamento) {
            agendamento.status = 'finalizado';
            agendamento.horaFim = new Date().toISOString();
            const inicio = new Date(agendamento.horaInicio);
            const fim = new Date(agendamento.horaFim);
            const duracaoMs = fim - inicio;
            const duracaoMin = Math.round(duracaoMs / (1000 * 60));
            agendamento.duracaoReal = duracaoMin;
            if (fotoFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    agendamento.foto = reader.result;
                    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                    alert(`Serviço finalizado! Duração: ${duracaoMin} minutos.`);
                    modalEditarAgendamento.classList.remove('ativo');
                    gerarCalendarioDoDia(dataAtual);
                    carregarDadosFinanceirosDoDia(); // Atualiza a página de finanças
                    carregarPaginaComissoes(); // Atualiza a página de comissões
                };
                reader.readAsDataURL(fotoFile);
            } else {
                localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                alert(`Serviço finalizado! Duração: ${duracaoMin} minutos.`);
                modalEditarAgendamento.classList.remove('ativo');
                gerarCalendarioDoDia(dataAtual);
                carregarDadosFinanceirosDoDia(); // Atualiza a página de finanças
                carregarPaginaComissoes(); // Atualiza a página de comissões
            }
        }
    });
    botaoCancelar.addEventListener('click', () => {
        const agendamentoId = document.getElementById('agendamento-id').value;
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
            agendamentos = agendamentos.filter(agendamento => agendamento.id != agendamentoId);
            localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
            alert('Agendamento cancelado com sucesso!');
            modalEditarAgendamento.classList.remove('ativo');
            gerarCalendarioDoDia(dataAtual);
        }
    });
    fecharModalEdicaoBtn.addEventListener('click', () => {
        modalEditarAgendamento.classList.remove('ativo');
        pararTimer();
    });
}
function gerarNavegacaoSemanal() {
    if (!diasDaSemanaDiv) return;
    diasDaSemanaDiv.innerHTML = '';
    const hoje = new Date();
    const diaDaSemana = hoje.getDay();
    const primeiroDia = new Date(hoje);
    primeiroDia.setDate(hoje.getDate() - diaDaSemana);
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 0; i < 7; i++) {
        const dataDia = new Date(primeiroDia);
        dataDia.setDate(primeiroDia.getDate() + i);
        const divDia = document.createElement('div');
        divDia.className = 'dia-semana';
        if (dataDia.toDateString() === dataAtual.toDateString()) {
            divDia.classList.add('ativo');
        }
        divDia.innerHTML = `<span>${dias[dataDia.getDay()]}</span><br><span>${dataDia.getDate()}</span>`;
        divDia.addEventListener('click', () => {
            dataAtual = dataDia;
            gerarCalendarioDoDia(dataAtual);
            document.querySelectorAll('.dia-semana').forEach(d => d.classList.remove('ativo'));
            divDia.classList.add('ativo');
        });
        diasDaSemanaDiv.appendChild(divDia);
    }
}
function gerarCalendarioDoDia(data) {
    if (!calendarioDiarioDiv) return;
    const dataString = data.toISOString().split('T')[0];
    const dataFormatada = data.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    dataSelecionadaSpan.textContent = `Agendamentos para ${dataFormatada}`;
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const agendamentosDoDia = agendamentos.filter(agendamento => agendamento.data === dataString);
    calendarioDiarioDiv.innerHTML = '';
    const horaInicio = 8;
    const horaFim = 18;
    for (let h = horaInicio; h < horaFim; h++) {
        for (let m = 0; m < 60; m += 30) {
            const horaSlot = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            const agendamentoNoSlot = agendamentosDoDia.find(agendamento => agendamento.hora === horaSlot);
            const divHorario = document.createElement('div');
            divHorario.className = 'horario';
            if (agendamentoNoSlot) {
                divHorario.classList.add('ocupado');
                if(agendamentoNoSlot.status === 'em andamento') {
                    divHorario.classList.add('status-em-andamento');
                } else if(agendamentoNoSlot.status === 'finalizado') {
                    divHorario.classList.add('status-finalizado');
                }
                divHorario.innerHTML = `
                    <strong>${agendamentoNoSlot.hora} - ${agendamentoNoSlot.servico}</strong><br>
                    Cliente: ${agendamentoNoSlot.cliente}<br>
                    Funcionário(s): ${agendamentoNoSlot.funcionarios.join(', ')}
                `;
                divHorario.addEventListener('click', () => {
                    abrirModalEdicao(agendamentoNoSlot);
                });
            } else {
                divHorario.classList.add('livre');
                divHorario.innerHTML = `<strong>${horaSlot} - Livre</strong>`;
                divHorario.addEventListener('click', () => {
                    document.getElementById('data-agendamento').value = dataString;
                    document.getElementById('hora-agendamento').value = horaSlot;
                    modalAgendamento.classList.add('ativo');
                });
            }
            calendarioDiarioDiv.appendChild(divHorario);
        }
    }
}
function formatarTempo(segundos) {
    const h = Math.floor(segundos / 3600).toString().padStart(2, '0');
    const m = Math.floor((segundos % 3600) / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}
function iniciarTimer(horaInicio) {
    pararTimer();
    const startTime = new Date(horaInicio).getTime();
    timerServicoDiv.style.display = 'block';
    timerInterval = setInterval(() => {
        const agora = new Date().getTime();
        const segundosDecorridos = Math.floor((agora - startTime) / 1000);
        valorTimerSpan.textContent = formatarTempo(segundosDecorridos);
    }, 1000);
}
function pararTimer() {
    clearInterval(timerInterval);
    timerServicoDiv.style.display = 'none';
}
function abrirModalEdicao(agendamento) {
    pararTimer();
    const tituloModal = document.getElementById('titulo-modal-edicao');
    detalhesAgendamentoDiv.style.display = 'block';
    formAlterarDados.style.display = 'none';
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const clienteAgendado = clientes.find(c => c.nome === agendamento.cliente);
    document.getElementById('detalhes-cliente').textContent = agendamento.cliente;
    document.getElementById('detalhes-servico').textContent = agendamento.servico;
    document.getElementById('detalhes-funcionarios').textContent = agendamento.funcionarios.join(', ');
    document.getElementById('detalhes-status').textContent = agendamento.status;
    document.getElementById('agendamento-id').value = agendamento.id;
    if (clienteAgendado) {
        document.getElementById('detalhes-telefone').textContent = clienteAgendado.telefone || 'Não informado';
        document.getElementById('detalhes-endereco').textContent = clienteAgendado.endereco || 'Não informado';
        const numeroWhatsapp = clienteAgendado.telefone ? clienteAgendado.telefone.replace(/\D/g, '') : '';
        const enderecoMaps = clienteAgendado.endereco ? encodeURIComponent(clienteAgendado.endereco) : '';
        if (numeroWhatsapp) {
            botaoWhatsapp.href = `https://wa.me/55${numeroWhatsapp}`;
            botaoWhatsapp.style.display = 'inline-block';
        } else {
            botaoWhatsapp.style.display = 'none';
        }
        if (enderecoMaps) {
            botaoMaps.href = `http://maps.google.com/maps?daddr=${enderecoMaps}`;
            botaoMaps.style.display = 'inline-block';
        } else {
            botaoMaps.style.display = 'none';
        }
        botoesAcaoRapidaDiv.style.display = (numeroWhatsapp || enderecoMaps) ? 'block' : 'none';
    } else {
        document.getElementById('detalhes-telefone').textContent = 'Não informado';
        document.getElementById('detalhes-endereco').textContent = 'Não informado';
        botoesAcaoRapidaDiv.style.display = 'none';
    }
    const fotoImg = detalhesAgendamentoDiv.querySelector('img');
    if (fotoImg) { fotoImg.remove(); }
    if (agendamento.status === 'agendado') {
        tituloModal.textContent = 'Detalhes do Agendamento';
        formFluxoDiv.style.display = 'block';
        blocoFinalizarDiv.style.display = 'none';
        botaoIniciar.style.display = 'block';
        botoesEdicaoDiv.style.display = 'flex';
        document.getElementById('detalhes-duracao').style.display = 'none';
    } else if (agendamento.status === 'em andamento') {
        tituloModal.textContent = 'Serviço em Andamento';
        formFluxoDiv.style.display = 'block';
        blocoFinalizarDiv.style.display = 'block';
        botaoIniciar.style.display = 'none';
        botoesEdicaoDiv.style.display = 'none';
        document.getElementById('detalhes-duracao').style.display = 'none';
        iniciarTimer(agendamento.horaInicio);
    } else if (agendamento.status === 'finalizado') {
        tituloModal.textContent = 'Serviço Finalizado';
        formFluxoDiv.style.display = 'none';
        botoesEdicaoDiv.style.display = 'none';
        
        document.getElementById('detalhes-duracao').style.display = 'block';
        document.getElementById('valor-duracao').textContent = `${agendamento.duracaoReal} minutos`;
        if (agendamento.foto) {
            const img = document.createElement('img');
            img.src = agendamento.foto;
            img.style.maxWidth = '100%';
            detalhesAgendamentoDiv.appendChild(img);
        }
    }
    document.getElementById('data-hora-edicao').value = `${agendamento.data}T${agendamento.hora}`;
    document.getElementById('cliente-edicao').value = agendamento.cliente;
    document.getElementById('servico-edicao').value = agendamento.servico;
    const selectFuncionariosEdicao = document.getElementById('funcionario-edicao');
    Array.from(selectFuncionariosEdicao.options).forEach(option => {
        option.selected = agendamento.funcionarios.includes(option.value);
    });
    modalEditarAgendamento.classList.add('ativo');
}


// --- Funções para o Módulo Financeiro ---
function formatarMoeda(valor) {
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
}

function calcularComissoesPorFuncionario() {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];

    const comissaoPorFuncionario = {};

    agendamentos.filter(a => a.status === 'finalizado').forEach(agendamento => {
        const servicoDetalhe = servicos.find(s => s.nome === agendamento.servico);
        if (servicoDetalhe) {
            const valorServico = parseFloat(servicoDetalhe.valor);
            const valorComissaoServico = valorServico;

            // Divide a comissão entre os funcionários
            const valorComissaoPorFuncionario = valorComissaoServico / agendamento.funcionarios.length;

            agendamento.funcionarios.forEach(funcNome => {
                const funcionarioDetalhe = funcionarios.find(f => f.nome === funcNome);
                if (funcionarioDetalhe) {
                    const comissaoPercentual = parseFloat(funcionarioDetalhe.comissao) / 100;
                    const valorComissao = valorComissaoPorFuncionario * comissaoPercentual;

                    if (!agendamento.comissaoPaga) { // Só contabiliza se a comissão ainda não foi paga
                        comissaoPorFuncionario[funcNome] = (comissaoPorFuncionario[funcNome] || 0) + valorComissao;
                    }
                }
            });
        }
    });

    // Subtrai os vales
    const vales = JSON.parse(localStorage.getItem('vales')) || [];
    vales.forEach(vale => {
        comissaoPorFuncionario[vale.funcionario] = (comissaoPorFuncionario[vale.funcionario] || 0) - vale.valor;
    });

    return comissaoPorFuncionario;
}

function carregarDadosFinanceirosDoDia() {
    const dataFinanceiroH2 = document.getElementById('data-financeiro');
    if (!dataFinanceiroH2) return;
    
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    dataFinanceiroH2.textContent = `Dados de ${dataFormatada}`;

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];

    const dataStringHoje = hoje.toISOString().split('T')[0];
    const servicosFinalizadosHoje = agendamentos.filter(a => a.status === 'finalizado' && a.data === dataStringHoje);

    let totalRecebido = 0;
    const comissaoPorFuncionarioHoje = {};

    const listaServicosFinalizadosDiv = document.getElementById('lista-servicos-finalizados');
    listaServicosFinalizadosDiv.innerHTML = '';

    if (servicosFinalizadosHoje.length === 0) {
        listaServicosFinalizadosDiv.innerHTML = '<p class="nenhum-dado">Nenhum serviço finalizado hoje.</p>';
    } else {
        servicosFinalizadosHoje.forEach(agendamento => {
            const servicoDetalhe = servicos.find(s => s.nome === agendamento.servico);
            if (servicoDetalhe) {
                const valorServico = parseFloat(servicoDetalhe.valor);
                totalRecebido += valorServico;

                const comissaoTotalServico = valorServico;
                const valorComissaoPorFuncionario = comissaoTotalServico / agendamento.funcionarios.length;
                agendamento.funcionarios.forEach(funcNome => {
                    const funcionarioDetalhe = funcionarios.find(f => f.nome === funcNome);
                    if (funcionarioDetalhe) {
                        const comissaoPercentual = parseFloat(funcionarioDetalhe.comissao) / 100;
                        const valorComissao = valorComissaoPorFuncionario * comissaoPercentual;
                        comissaoPorFuncionarioHoje[funcNome] = (comissaoPorFuncionarioHoje[funcNome] || 0) + valorComissao;
                    }
                });

                const itemDiv = document.createElement('div');
                itemDiv.className = 'item-servico';
                itemDiv.innerHTML = `
                    <p><strong>${agendamento.servico}</strong> - ${formatarMoeda(valorServico)}</p>
                    <p>Cliente: ${agendamento.cliente}</p>
                    <p>Funcionário(s): ${agendamento.funcionarios.join(', ')}</p>
                `;
                listaServicosFinalizadosDiv.appendChild(itemDiv);
            }
        });
    }
    
    let totalComissao = Object.values(comissaoPorFuncionarioHoje).reduce((sum, val) => sum + val, 0);
    const lucroLiquido = totalRecebido - totalComissao;

    document.getElementById('total-recebido').textContent = formatarMoeda(totalRecebido);
    document.getElementById('total-comissao').textContent = formatarMoeda(totalComissao);
    document.getElementById('lucro-liquido').textContent = formatarMoeda(lucroLiquido);
    
    const listaComissoesDiv = document.getElementById('lista-comissoes-funcionarios');
    listaComissoesDiv.innerHTML = '';
    const nomesFuncionarios = Object.keys(comissaoPorFuncionarioHoje);
    if (nomesFuncionarios.length === 0) {
        listaComissoesDiv.innerHTML = '<p class="nenhum-dado">Nenhum dado de comissão hoje.</p>';
    } else {
        nomesFuncionarios.forEach(funcNome => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-comissao';
            itemDiv.innerHTML = `<strong>${funcNome}:</strong> ${formatarMoeda(comissaoPorFuncionarioHoje[funcNome])}`;
            listaComissoesDiv.appendChild(itemDiv);
        });
    }
}


// --- NOVIDADE: Funções para o Módulo Comissões ---

function carregarPaginaComissoes() {
    const selecionarFuncionario = document.getElementById('selecionar-funcionario');
    const comissaoDetalhesDiv = document.getElementById('comissao-detalhes');
    const formRegistrarVale = document.getElementById('form-registrar-vale');
    const botaoPagarComissao = document.getElementById('botao-pagar-comissao');

    if (!selecionarFuncionario) return; // Só roda na página 'comissoes.html'

    // Evento para atualizar a página ao selecionar um funcionário
    selecionarFuncionario.addEventListener('change', () => {
        const funcionarioSelecionado = selecionarFuncionario.value;
        if (funcionarioSelecionado) {
            comissaoDetalhesDiv.style.display = 'block';
            exibirDetalhesComissao(funcionarioSelecionado);
        } else {
            comissaoDetalhesDiv.style.display = 'none';
        }
    });

    // Evento para registrar um vale
    formRegistrarVale.addEventListener('submit', (event) => {
        event.preventDefault();
        const funcionarioSelecionado = selecionarFuncionario.value;
        const valorVale = parseFloat(document.getElementById('valor-vale').value);

        if (funcionarioSelecionado && valorVale > 0) {
            const vales = JSON.parse(localStorage.getItem('vales')) || [];
            vales.push({
                funcionario: funcionarioSelecionado,
                valor: valorVale,
                data: new Date().toISOString()
            });
            localStorage.setItem('vales', JSON.stringify(vales));
            formRegistrarVale.reset();
            alert(`Vale de ${formatarMoeda(valorVale)} registrado para ${funcionarioSelecionado}.`);
            exibirDetalhesComissao(funcionarioSelecionado);
        }
    });

    // Evento para pagar a comissão
    botaoPagarComissao.addEventListener('click', () => {
        const funcionarioSelecionado = selecionarFuncionario.value;
        if (!funcionarioSelecionado) return;

        const comissoes = calcularComissoesPendentesPorFuncionario();
        const saldoLiquido = comissoes[funcionarioSelecionado] || 0;

        if (saldoLiquido > 0) {
            if (confirm(`Confirmar pagamento de ${formatarMoeda(saldoLiquido)} para ${funcionarioSelecionado}?`)) {
                // Marca os agendamentos como "comissaoPaga"
                const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
                const agendamentosPendentes = agendamentos.filter(a => a.status === 'finalizado' && a.funcionarios.includes(funcionarioSelecionado) && !a.comissaoPaga);
                
                agendamentosPendentes.forEach(a => a.comissaoPaga = true);
                localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

                // Limpa os vales do funcionário
                const vales = JSON.parse(localStorage.getItem('vales')) || [];
                const valesRestantes = vales.filter(v => v.funcionario !== funcionarioSelecionado);
                localStorage.setItem('vales', JSON.stringify(valesRestantes));

                alert(`Comissão de ${formatarMoeda(saldoLiquido)} paga para ${funcionarioSelecionado}.`);
                exibirDetalhesComissao(funcionarioSelecionado);
            }
        } else {
            alert('Não há comissão positiva para ser paga.');
        }
    });
}

// Função auxiliar para calcular apenas as comissões pendentes (não pagas)
function calcularComissoesPendentesPorFuncionario() {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];

    const comissaoPendente = {};

    agendamentos.filter(a => a.status === 'finalizado' && !a.comissaoPaga).forEach(agendamento => {
        const servicoDetalhe = servicos.find(s => s.nome === agendamento.servico);
        if (servicoDetalhe) {
            const valorServico = parseFloat(servicoDetalhe.valor);
            const valorComissaoServico = valorServico;

            const valorComissaoPorFuncionario = valorComissaoServico / agendamento.funcionarios.length;
            agendamento.funcionarios.forEach(funcNome => {
                const funcionarioDetalhe = funcionarios.find(f => f.nome === funcNome);
                if (funcionarioDetalhe) {
                    const comissaoPercentual = parseFloat(funcionarioDetalhe.comissao) / 100;
                    const valorComissao = valorComissaoPorFuncionario * comissaoPercentual;
                    comissaoPendente[funcNome] = (comissaoPendente[funcNome] || 0) + valorComissao;
                }
            });
        }
    });

    return comissaoPendente;
}

// Função auxiliar para exibir os detalhes do funcionário selecionado
function exibirDetalhesComissao(funcionario) {
    const comissoesPendentes = calcularComissoesPendentesPorFuncionario();
    const comissao = comissoesPendentes[funcionario] || 0;

    const vales = JSON.parse(localStorage.getItem('vales')) || [];
    const valesFuncionario = vales.filter(v => v.funcionario === funcionario);
    const totalVales = valesFuncionario.reduce((sum, vale) => sum + vale.valor, 0);

    const saldoLiquido = comissao - totalVales;

    document.getElementById('comissao-pendente').textContent = formatarMoeda(comissao);
    document.getElementById('total-vales').textContent = formatarMoeda(totalVales);
    document.getElementById('saldo-liquido').textContent = formatarMoeda(saldoLiquido);
}


// Chamadas iniciais
document.addEventListener('DOMContentLoaded', () => {
    // Verifica a página atual para carregar o conteúdo correto
    if (document.body.classList.contains('pagina-cadastro')) {
        carregarClientes();
        carregarServicos();
        carregarFuncionarios();
        preencherSelects();
    } else if (document.body.classList.contains('pagina-agenda')) {
        preencherSelects();
        gerarNavegacaoSemanal();
        gerarCalendarioDoDia(dataAtual);
    } else if (document.body.classList.contains('pagina-financeiro')) {
        carregarDadosFinanceirosDoDia();
    } else if (document.body.classList.contains('pagina-comissoes')) {
        preencherSelects(); // Preenche a lista de funcionários
        carregarPaginaComissoes(); // Adiciona os listeners
    } else {
        carregarClientes();
        carregarServicos();
        carregarFuncionarios();
        preencherSelects();
    }
});