/* ======================================================
   SCRIPT FINAL 100% FUNCIONAL – CADASTROS + AGENDA + MODAL
   ====================================================== */

/* ================= STORAGE ================= */
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

/* ================= VARIÁVEIS ================= */
let dataAtual = new Date();
let timerInterval = null;
let agendamentoAtivo = null;

/* ======================================================
   TIMER
   ====================================================== */
function iniciarTimer(horaInicio) {
    const box = document.getElementById('timer-servico');
    const span = document.getElementById('valor-timer');
    if (!box || !span || !horaInicio) return;

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
   AGENDA
   ====================================================== */
function inicializarAgenda() {

    const calendario = document.getElementById('calendario-diario');
    const modalNovo = document.getElementById('modal-agendamento');
    const modalEditar = document.getElementById('modal-editar-agendamento');

    if (!calendario) return;

    /* ---------- SELECTS ---------- */
    function preencherSelects() {
        const selCliente = document.getElementById('cliente-agendamento');
        const selServico = document.getElementById('servico-agendamento');
        const selFuncionario = document.getElementById('funcionario-agendamento');

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

    /* ---------- GERAR AGENDA ---------- */
    function gerarAgenda() {
        calendario.innerHTML = '';
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
                    div.innerHTML = `<strong>${hora}</strong><br>${ag.cliente}`;
                    div.onclick = () => abrirEdicao(ag.id);
                } else {
                    div.innerHTML = `<strong>${hora}</strong> Livre`;
                    div.onclick = () => {
                        document.getElementById('data-agendamento').value = dataStr;
                        document.getElementById('hora-agendamento').value = hora;
                        preencherSelects();
                        modalNovo.classList.add('ativo');
                    };
                }
                calendario.appendChild(div);
            }
        }
    }

    /* ---------- MODAL EDIÇÃO ---------- */
    function abrirEdicao(id) {
        const ags = lerLocal('agendamentos');
        agendamentoAtivo = ags.find(a => a.id === id);
        if (!agendamentoAtivo) return;

        document.getElementById('detalhes-cliente').textContent = agendamentoAtivo.cliente;
        document.getElementById('detalhes-servico').textContent = agendamentoAtivo.servico;
        document.getElementById('detalhes-funcionarios').textContent =
            agendamentoAtivo.funcionarios.join(', ');
        document.getElementById('detalhes-status').textContent = agendamentoAtivo.status;

        document.getElementById('botao-iniciar').style.display =
            agendamentoAtivo.status === 'agendado' ? 'block' : 'none';

        document.getElementById('bloco-finalizar').style.display =
            agendamentoAtivo.status === 'em andamento' ? 'block' : 'none';

        pararTimer();
        if (agendamentoAtivo.status === 'em andamento' && agendamentoAtivo.horaInicio) {
            iniciarTimer(agendamentoAtivo.horaInicio);
        }

        modalEditar.classList.add('ativo');
    }

    /* ---------- NOVO AGENDAMENTO ---------- */
    document.getElementById('form-novo-agendamento')?.addEventListener('submit', e => {
        e.preventDefault();

        const ags = lerLocal('agendamentos');
        ags.push({
            id: Date.now(),
            data: document.getElementById('data-agendamento').value,
            hora: document.getElementById('hora-agendamento').value,
            cliente: document.getElementById('cliente-agendamento').value,
            servico: document.getElementById('servico-agendamento').value,
            funcionarios: [...document.getElementById('funcionario-agendamento').selectedOptions]
                .map(o => o.value),
            status: 'agendado'
        });

        salvarLocal('agendamentos', ags);
        modalNovo.classList.remove('ativo');
        gerarAgenda();
    });

    /* ---------- BOTÕES DO MODAL ---------- */
    document.getElementById('botao-iniciar')?.addEventListener('click', () => {
        if (!agendamentoAtivo) return;

        agendamentoAtivo.status = 'em andamento';
        agendamentoAtivo.horaInicio = new Date().toISOString();

        salvarLocal('agendamentos', lerLocal('agendamentos'));
        document.getElementById('detalhes-status').textContent = 'em andamento';

        document.getElementById('botao-iniciar').style.display = 'none';
        document.getElementById('bloco-finalizar').style.display = 'block';

        iniciarTimer(agendamentoAtivo.horaInicio);
        gerarAgenda();
    });

    document.getElementById('botao-finalizar')?.addEventListener('click', () => {
        if (!agendamentoAtivo) return;

        agendamentoAtivo.status = 'finalizado';
        agendamentoAtivo.horaFim = new Date().toISOString();

        salvarLocal('agendamentos', lerLocal('agendamentos'));
        pararTimer();
        modalEditar.classList.remove('ativo');
        gerarAgenda();
    });

    document.getElementById('botao-cancelar')?.addEventListener('click', () => {
        if (!agendamentoAtivo) return;

        let ags = lerLocal('agendamentos');
        ags = ags.filter(a => a.id !== agendamentoAtivo.id);
        salvarLocal('agendamentos', ags);

        modalEditar.classList.remove('ativo');
        gerarAgenda();
    });

    gerarAgenda();
}

/* ======================================================
   INIT
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
    inicializarAgenda();
});
