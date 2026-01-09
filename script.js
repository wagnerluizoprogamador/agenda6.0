/* ======================================================
   SCRIPT FINAL DEFINITIVO – AGENDA + FINANCEIRO COMPLETO
   ====================================================== */

/* ================= STORAGE ================= */
function salvarLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}
function lerLocal(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}
function moeda(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ================= VARIÁVEIS ================= */
let dataAtual = new Date();
let timerInterval = null;

/* ================= MODAIS ================= */
const modalAgendamento = document.getElementById('modal-agendamento');
const modalEditarAgendamento = document.getElementById('modal-editar-agendamento');

/* ======================================================
   TIMER
   ====================================================== */
function iniciarTimer(horaInicio) {
    const box = document.getElementById('timer-servico');
    const span = document.getElementById('valor-timer');
    if (!box || !span) return;

    clearInterval(timerInterval);
    box.style.display = 'block';

    timerInterval = setInterval(() => {
        const diff = Math.floor((Date.now() - new Date(horaInicio)) / 1000);
        const h = String(Math.floor(diff / 3600)).padStart(2,'0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2,'0');
        const s = String(diff % 60).padStart(2,'0');
        span.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

function pararTimer() {
    clearInterval(timerInterval);
    const box = document.getElementById('timer-servico');
    if (box) box.style.display = 'none';
}

/* ======================================================
   CADASTROS
   ====================================================== */
function inicializarCadastros() {

    const cliente = document.getElementById('form-cadastro-cliente');
    if (cliente) cliente.onsubmit = e => {
        e.preventDefault();
        const nome = nomeCliente.value.trim();
        const telefone = telefoneCliente.value.trim();
        const endereco = enderecoCliente.value.trim();
        if (!nome || !telefone) return alert('Preencha nome e telefone');

        const dados = lerLocal('clientes');
        dados.push({ nome, telefone, endereco });
        salvarLocal('clientes', dados);
        alert('Cliente cadastrado');
        cliente.reset();
    };

    const servico = document.getElementById('form-cadastro-servico');
    if (servico) servico.onsubmit = e => {
        e.preventDefault();
        const nome = nomeServico.value.trim();
        const duracao = Number(duracaoServico.value);
        const valor = Number(valorServico.value);
        if (!nome || !duracao || !valor) return alert('Preencha tudo');

        const dados = lerLocal('servicos');
        dados.push({ nome, duracao, valor });
        salvarLocal('servicos', dados);
        alert('Serviço cadastrado');
        servico.reset();
    };

    const funcionario = document.getElementById('form-cadastro-funcionario');
    if (funcionario) funcionario.onsubmit = e => {
        e.preventDefault();
        const nome = nomeFuncionario.value.trim();
        const comissao = Number(comissaoFuncionario.value);
        if (!nome || !comissao) return alert('Preencha tudo');

        const dados = lerLocal('funcionarios');
        dados.push({ nome, comissao });
        salvarLocal('funcionarios', dados);
        alert('Funcionário cadastrado');
        funcionario.reset();
    };
}

/* ======================================================
   SELECTS AGENDA
   ====================================================== */
function preencherSelects() {
    const clientes = lerLocal('clientes');
    const servicos = lerLocal('servicos');
    const funcs = lerLocal('funcionarios');

    clienteAgendamento.innerHTML = '<option value="">Cliente</option>';
    clientes.forEach(c => clienteAgendamento.innerHTML += `<option>${c.nome}</option>`);

    servicoAgendamento.innerHTML = '<option value="">Serviço</option>';
    servicos.forEach(s => servicoAgendamento.innerHTML += `<option>${s.nome}</option>`);

    funcionarioAgendamento.innerHTML = '';
    funcs.forEach(f => funcionarioAgendamento.innerHTML += `<option>${f.nome}</option>`);
}

/* ======================================================
   AGENDA
   ====================================================== */
function gerarAgenda() {
    calendarioDiario.innerHTML = '';
    const dataStr = dataAtual.toISOString().split('T')[0];
    const ags = lerLocal('agendamentos').filter(a => a.data === dataStr);

    for (let h=0; h<24; h++) {
        for (let m=0; m<60; m+=30) {
            const hora = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const ag = ags.find(a => a.hora === hora);
            const div = document.createElement('div');
            div.className = 'horario';

            if (ag) {
                div.classList.add('ocupado');
                div.innerHTML = `<b>${hora}</b><br>${ag.cliente}`;
                div.onclick = () => abrirEdicao(ag);
            } else {
                div.innerHTML = `<b>${hora}</b> Livre`;
                div.onclick = () => {
                    dataAgendamento.value = dataStr;
                    horaAgendamento.value = hora;
                    preencherSelects();
                    modalAgendamento.classList.add('ativo');
                };
            }
            calendarioDiario.appendChild(div);
        }
    }
}

/* ======================================================
   NOVO AGENDAMENTO
   ====================================================== */
formNovoAgendamento?.addEventListener('submit', e => {
    e.preventDefault();

    const ags = lerLocal('agendamentos');
    ags.push({
        id: Date.now(),
        data: dataAgendamento.value,
        hora: horaAgendamento.value,
        cliente: clienteAgendamento.value,
        servico: servicoAgendamento.value,
        funcionarios: [...funcionarioAgendamento.selectedOptions].map(o=>o.value),
        status: 'agendado',
        custo: 0
    });
    salvarLocal('agendamentos', ags);
    modalAgendamento.classList.remove('ativo');
    gerarAgenda();
});

/* ======================================================
   MODAL EDIÇÃO
   ====================================================== */
function abrirEdicao(ag) {
    detalhesCliente.textContent = ag.cliente;
    detalhesServico.textContent = ag.servico;
    detalhesFuncionarios.textContent = ag.funcionarios.join(', ');
    detalhesStatus.textContent = ag.status;
    agendamentoId.value = ag.id;

    pararTimer();
    if (ag.status === 'em andamento' && ag.horaInicio) iniciarTimer(ag.horaInicio);

    modalEditarAgendamento.classList.add('ativo');
}

/* ======================================================
   BOTÕES EDIÇÃO
   ====================================================== */
botaoIniciar?.addEventListener('click', () => {
    const id = agendamentoId.value;
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a=>a.id==id);
    ag.status = 'em andamento';
    ag.horaInicio = new Date().toISOString();
    salvarLocal('agendamentos', ags);
    modalEditarAgendamento.classList.remove('ativo');
    gerarAgenda();
});

botaoFinalizar?.addEventListener('click', () => {
    const id = agendamentoId.value;
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a=>a.id==id);
    ag.status = 'finalizado';
    salvarLocal('agendamentos', ags);
    modalEditarAgendamento.classList.remove('ativo');
    gerarAgenda();
});

botaoCancelar?.addEventListener('click', () => {
    let ags = lerLocal('agendamentos');
    ags = ags.filter(a=>a.id!=agendamentoId.value);
    salvarLocal('agendamentos', ags);
    modalEditarAgendamento.classList.remove('ativo');
    gerarAgenda();
});

/* ======================================================
   FINANCEIRO
   ====================================================== */
function carregarFinanceiro() {
    if (!document.body.classList.contains('pagina-financeiro')) return;

    const hoje = new Date().toISOString().split('T')[0];
    const ags = lerLocal('agendamentos').filter(a=>a.data===hoje && a.status==='finalizado');
    const servicos = lerLocal('servicos');
    const funcs = lerLocal('funcionarios');

    let recebido=0, comissao=0;

    ags.forEach(a=>{
        const s = servicos.find(x=>x.nome===a.servico);
        if (!s) return;
        recebido += s.valor;
        a.funcionarios.forEach(f=>{
            const fu = funcs.find(x=>x.nome===f);
            if (fu) comissao += (s.valor*fu.comissao)/100;
        });
    });

    totalRecebido.textContent = moeda(recebido);
    totalComissao.textContent = moeda(comissao);
    lucroLiquido.textContent = moeda(recebido-comissao);
}

/* ======================================================
   INIT
   ====================================================== */
document.addEventListener('DOMContentLoaded', ()=>{
    if (document.body.classList.contains('pagina-cadastro')) inicializarCadastros();
    if (document.body.classList.contains('pagina-agenda')) gerarAgenda();
    if (document.body.classList.contains('pagina-financeiro')) carregarFinanceiro();
});
