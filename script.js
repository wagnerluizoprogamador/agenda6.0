/* ======================================================
   STORAGE BASE
===================================================== */
function salvarLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}
function lerLocal(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}
function moeda(v) {
    return Number(v || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/* ======================================================
   CLIENTES
===================================================== */
function carregarClientes() {
    const lista = document.getElementById('lista-clientes');
    if (!lista) return;

    lista.innerHTML = '';
    lerLocal('clientes').forEach(c => {
        lista.innerHTML += `
            <div class="item-lista">
                <strong>${c.nome}</strong><br>
                ${c.telefone}<br>
                ${c.endereco || ''}
            </div>
        `;
    });
}

document.getElementById('form-cadastro-cliente')?.addEventListener('submit', e => {
    e.preventDefault();

    const clientes = lerLocal('clientes');
    clientes.push({
        nome: nomeCliente.value,
        telefone: telefoneCliente.value,
        endereco: enderecoCliente.value
    });

    salvarLocal('clientes', clientes);
    e.target.reset();
    carregarClientes();
});

/* ======================================================
   SERVIÇOS
===================================================== */
function carregarServicos() {
    const lista = document.getElementById('lista-servicos');
    if (!lista) return;

    lista.innerHTML = '';
    lerLocal('servicos').forEach(s => {
        lista.innerHTML += `
            <div class="item-lista">
                <strong>${s.nome}</strong><br>
                Duração: ${s.duracao} min<br>
                Valor: ${moeda(s.valor)}
            </div>
        `;
    });
}

document.getElementById('form-cadastro-servico')?.addEventListener('submit', e => {
    e.preventDefault();

    const servicos = lerLocal('servicos');
    servicos.push({
        nome: nomeServico.value,
        duracao: duracaoServico.value,
        valor: valorServico.value
    });

    salvarLocal('servicos', servicos);
    e.target.reset();
    carregarServicos();
});

/* ======================================================
   FUNCIONÁRIOS
===================================================== */
function carregarFuncionarios() {
    const lista = document.getElementById('lista-funcionarios');
    if (!lista) return;

    lista.innerHTML = '';
    lerLocal('funcionarios').forEach(f => {
        lista.innerHTML += `
            <div class="item-lista">
                <strong>${f.nome}</strong><br>
                Comissão: ${f.comissao}%
            </div>
        `;
    });
}

document.getElementById('form-cadastro-funcionario')?.addEventListener('submit', e => {
    e.preventDefault();

    const funcionarios = lerLocal('funcionarios');
    funcionarios.push({
        nome: nomeFuncionario.value,
        comissao: comissaoFuncionario.value
    });

    salvarLocal('funcionarios', funcionarios);
    e.target.reset();
    carregarFuncionarios();
});

/* ======================================================
   AGENDA
===================================================== */
let dataAtual = new Date();

function preencherSelectsAgenda() {
    const selCliente = document.getElementById('cliente-agendamento');
    const selServico = document.getElementById('servico-agendamento');
    const selFuncionario = document.getElementById('funcionario-agendamento');
    if (!selCliente) return;

    selCliente.innerHTML = '<option value="">Cliente</option>';
    lerLocal('clientes').forEach(c =>
        selCliente.innerHTML += `<option value="${c.nome}">${c.nome}</option>`
    );

    selServico.innerHTML = '<option value="">Serviço</option>';
    lerLocal('servicos').forEach(s =>
        selServico.innerHTML += `<option value="${s.nome}">${s.nome}</option>`
    );

    selFuncionario.innerHTML = '';
    lerLocal('funcionarios').forEach(f =>
        selFuncionario.innerHTML += `<option value="${f.nome}">${f.nome}</option>`
    );
}

function gerarAgenda() {
    const calendario = document.getElementById('calendario-diario');
    const titulo = document.getElementById('data-selecionada');
    if (!calendario) return;

    calendario.innerHTML = '';
    const dataStr = dataAtual.toISOString().split('T')[0];
    titulo.textContent = `Agendamentos de ${dataAtual.toLocaleDateString('pt-BR')}`;

    const ags = lerLocal('agendamentos').filter(a => a.data === dataStr);

    for (let h = 8; h < 20; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hora = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const ag = ags.find(a => a.hora === hora);

            const div = document.createElement('div');
            div.className = 'horario';

            if (ag) {
                div.classList.add('ocupado');
                div.innerHTML = `<strong>${hora}</strong><br>${ag.cliente}`;
                div.onclick = () => abrirEdicao(ag);
            } else {
                div.classList.add('livre');
                div.innerHTML = `<strong>${hora}</strong> Livre`;
                div.onclick = () => {
                    dataAgendamento.value = dataStr;
                    horaAgendamento.value = hora;
                    preencherSelectsAgenda();
                    modalAgendamento.classList.add('ativo');
                };
            }
            calendario.appendChild(div);
        }
    }
}

/* ======================================================
   MODAIS AGENDA
===================================================== */
const modalAgendamento = document.getElementById('modal-agendamento');
const modalEditar = document.getElementById('modal-editar-agendamento');

document.getElementById('fechar-modal')?.addEventListener('click', () =>
    modalAgendamento.classList.remove('ativo')
);
document.getElementById('fechar-modal-edicao')?.addEventListener('click', () =>
    modalEditar.classList.remove('ativo')
);

document.getElementById('form-novo-agendamento')?.addEventListener('submit', e => {
    e.preventDefault();

    const ags = lerLocal('agendamentos');
    ags.push({
        id: Date.now(),
        data: dataAgendamento.value,
        hora: horaAgendamento.value,
        cliente: clienteAgendamento.value,
        servico: servicoAgendamento.value,
        funcionarios: [...funcionarioAgendamento.selectedOptions].map(o => o.value),
        status: 'agendado'
    });

    salvarLocal('agendamentos', ags);
    modalAgendamento.classList.remove('ativo');
    gerarAgenda();
});

/* ======================================================
   MODAL EDIÇÃO
===================================================== */
function abrirEdicao(ag) {
    detalhesCliente.textContent = ag.cliente;
    detalhesServico.textContent = ag.servico;
    detalhesFuncionarios.textContent = ag.funcionarios.join(', ');
    detalhesStatus.textContent = ag.status;
    agendamentoId.value = ag.id;

    document.getElementById('botao-iniciar').style.display =
        ag.status === 'agendado' ? 'block' : 'none';

    document.getElementById('bloco-finalizar').style.display =
        ag.status === 'em andamento' ? 'block' : 'none';

    modalEditar.classList.add('ativo');
}

botaoIniciar?.addEventListener('click', () => {
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a => a.id == agendamentoId.value);
    if (!ag) return;

    ag.status = 'em andamento';
    salvarLocal('agendamentos', ags);
    gerarAgenda();
    modalEditar.classList.remove('ativo');
});

botaoFinalizar?.addEventListener('click', () => {
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a => a.id == agendamentoId.value);
    if (!ag) return;

    ag.status = 'finalizado';
    salvarLocal('agendamentos', ags);
    gerarAgenda();
    modalEditar.classList.remove('ativo');
});

botaoCancelar?.addEventListener('click', () => {
    let ags = lerLocal('agendamentos');
    ags = ags.filter(a => a.id != agendamentoId.value);
    salvarLocal('agendamentos', ags);
    gerarAgenda();
    modalEditar.classList.remove('ativo');
});

/* ======================================================
   FINANCEIRO
===================================================== */
function carregarFinanceiro() {
    if (!document.body.classList.contains('pagina-financeiro')) return;

    const hoje = new Date().toISOString().split('T')[0];
    const ags = lerLocal('agendamentos').filter(a =>
        a.data === hoje && a.status === 'finalizado'
    );

    let total = 0;
    ags.forEach(a => {
        const s = lerLocal('servicos').find(x => x.nome === a.servico);
        if (s) total += Number(s.valor);
    });

    document.getElementById('total-recebido').textContent = moeda(total);
}

/* ======================================================
   INIT
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();
    carregarServicos();
    carregarFuncionarios();
    gerarAgenda();
    carregarFinanceiro();
});
