/* ======================================================
   SCRIPT FINAL ESTÁVEL – AGENDA + FINANCEIRO
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

/* ================= DOM ================= */
// Agenda
const calendarioDiario = document.getElementById('calendarioDiario');
const dataSelecionada = document.getElementById('dataSelecionada');

// Modais
const modalAgendamento = document.getElementById('modal-agendamento');
const modalEditarAgendamento = document.getElementById('modal-editar-agendamento');

// Novo agendamento
const formNovoAgendamento = document.getElementById('form-novo-agendamento');
const dataAgendamento = document.getElementById('data-agendamento');
const horaAgendamento = document.getElementById('hora-agendamento');
const clienteAgendamento = document.getElementById('cliente-agendamento');
const servicoAgendamento = document.getElementById('servico-agendamento');
const funcionarioAgendamento = document.getElementById('funcionario-agendamento');

// Edição
const detalhesCliente = document.getElementById('detalhes-cliente');
const detalhesServico = document.getElementById('detalhes-servico');
const detalhesFuncionarios = document.getElementById('detalhes-funcionarios');
const detalhesStatus = document.getElementById('detalhes-status');
const agendamentoId = document.getElementById('agendamento-id');

// Botões
const botaoIniciar = document.getElementById('botao-iniciar');
const botaoFinalizar = document.getElementById('botao-finalizar');
const botaoCancelar = document.getElementById('botao-cancelar');

// Timer
const timerBox = document.getElementById('timer-servico');
const timerSpan = document.getElementById('valor-timer');

// Financeiro
const totalRecebido = document.getElementById('totalRecebido');
const totalComissao = document.getElementById('totalComissao');
const lucroLiquido = document.getElementById('lucroLiquido');

/* ======================================================
   TIMER
   ====================================================== */
function iniciarTimer(horaInicio) {
    if (!timerBox || !timerSpan) return;

    clearInterval(timerInterval);
    timerBox.style.display = 'block';

    timerInterval = setInterval(() => {
        const diff = Math.floor((Date.now() - new Date(horaInicio)) / 1000);
        const h = String(Math.floor(diff / 3600)).padStart(2,'0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2,'0');
        const s = String(diff % 60).padStart(2,'0');
        timerSpan.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

function pararTimer() {
    clearInterval(timerInterval);
    if (timerBox) timerBox.style.display = 'none';
}

/* ======================================================
   SELECTS
   ====================================================== */
function preencherSelects() {
    const clientes = lerLocal('clientes');
    const servicos = lerLocal('servicos');
    const funcionarios = lerLocal('funcionarios');

    clienteAgendamento.innerHTML = '<option value="">Cliente</option>';
    clientes.forEach(c => clienteAgendamento.innerHTML += `<option>${c.nome}</option>`);

    servicoAgendamento.innerHTML = '<option value="">Serviço</option>';
    servicos.forEach(s => servicoAgendamento.innerHTML += `<option>${s.nome}</option>`);

    funcionarioAgendamento.innerHTML = '';
    funcionarios.forEach(f => funcionarioAgendamento.innerHTML += `<option>${f.nome}</option>`);
}

/* ======================================================
   AGENDA
   ====================================================== */
function gerarAgenda() {
    if (!calendarioDiario) return;

    calendarioDiario.innerHTML = '';
    const dataStr = dataAtual.toISOString().split('T')[0];
    if (dataSelecionada) {
        dataSelecionada.textContent = dataAtual.toLocaleDateString('pt-BR');
    }

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
        status: 'agendado'
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
    if (ag.status === 'em andamento' && ag.horaInicio) {
        iniciarTimer(ag.horaInicio);
    }

    modalEditarAgendamento.classList.add('ativo');
}

/* ======================================================
   BOTÕES
   ====================================================== */
botaoIniciar?.addEventListener('click', () => {
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a => a.id == agendamentoId.value);
    if (!ag) return;

    ag.status = 'em andamento';
    ag.horaInicio = new Date().toISOString();
    salvarLocal('agendamentos', ags);

    modalEditarAgendamento.classList.remove('ativo');
    gerarAgenda();
});

botaoFinalizar?.addEventListener('click', () => {
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a => a.id == agendamentoId.value);
    if (!ag) return;

    ag.status = 'finalizado';
    salvarLocal('agendamentos', ags);

    modalEditarAgendamento.classList.remove('ativo');
    gerarAgenda();
});

botaoCancelar?.addEventListener('click', () => {
    let ags = lerLocal('agendamentos');
    ags = ags.filter(a => a.id != agendamentoId.value);
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
    const ags = lerLocal('agendamentos').filter(a => a.data===hoje && a.status==='finalizado');
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
    gerarAgenda();
    carregarFinanceiro();
});
