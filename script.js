/* ======================================================
   SCRIPT FINAL ESTÁVEL – AGENDA + FINANCEIRO (CORRIGIDO)
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
   AGENDA
   ====================================================== */
function inicializarAgenda() {

    const calendario = document.getElementById('calendario-diario');
    const diasDiv = document.getElementById('dias-da-semana');
    const tituloData = document.getElementById('data-selecionada');

    if (!calendario) return;

    /* ===== Navegação semanal ===== */
    function gerarNavegacaoSemanal() {
        diasDiv.innerHTML = '';
        const inicio = new Date(dataAtual);
        inicio.setDate(dataAtual.getDate() - dataAtual.getDay());

        const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(inicio);
            d.setDate(inicio.getDate() + i);

            const el = document.createElement('div');
            el.className = 'dia-semana';
            if (d.toDateString() === dataAtual.toDateString()) {
                el.classList.add('ativo');
            }

            el.innerHTML = `${dias[d.getDay()]}<br>${d.getDate()}`;
            el.onclick = () => {
                dataAtual = d;
                gerarAgenda();
                gerarNavegacaoSemanal();
            };

            diasDiv.appendChild(el);
        }
    }

    /* ===== Selects ===== */
    function preencherSelects() {
        const c = document.getElementById('cliente-agendamento');
        const s = document.getElementById('servico-agendamento');
        const f = document.getElementById('funcionario-agendamento');

        c.innerHTML = '<option value="">Cliente</option>';
        lerLocal('clientes').forEach(x => c.innerHTML += `<option>${x.nome}</option>`);

        s.innerHTML = '<option value="">Serviço</option>';
        lerLocal('servicos').forEach(x => s.innerHTML += `<option>${x.nome}</option>`);

        f.innerHTML = '';
        lerLocal('funcionarios').forEach(x => f.innerHTML += `<option>${x.nome}</option>`);
    }

    /* ===== Agenda ===== */
    function gerarAgenda() {
        calendario.innerHTML = '';
        const dataStr = dataAtual.toISOString().split('T')[0];
        tituloData.textContent = `Agendamentos de ${dataAtual.toLocaleDateString('pt-BR')}`;

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
                    div.onclick = () => abrirEdicao(ag);
                } else {
                    div.classList.add('livre');
                    div.innerHTML = `<strong>${hora}</strong> Livre`;
                    div.onclick = () => {
                        document.getElementById('data-agendamento').value = dataStr;
                        document.getElementById('hora-agendamento').value = hora;
                        preencherSelects();
                        document.getElementById('modal-agendamento').classList.add('ativo');
                    };
                }
                calendario.appendChild(div);
            }
        }
    }

    /* ===== Edição ===== */
    function abrirEdicao(ag) {
        document.getElementById('detalhes-cliente').textContent = ag.cliente;
        document.getElementById('detalhes-servico').textContent = ag.servico;
        document.getElementById('detalhes-funcionarios').textContent = ag.funcionarios.join(', ');
        document.getElementById('detalhes-status').textContent = ag.status;
        document.getElementById('agendamento-id').value = ag.id;

        pararTimer();
        if (ag.status === 'em andamento' && ag.horaInicio) iniciarTimer(ag.horaInicio);

        document.getElementById('modal-editar-agendamento').classList.add('ativo');
    }

    gerarNavegacaoSemanal();
    gerarAgenda();
}

/* ======================================================
   FINANCEIRO (ISOLADO)
   ====================================================== */
function inicializarFinanceiro() {
    if (!document.body.classList.contains('pagina-financeiro')) return;

    const hoje = new Date().toISOString().split('T')[0];
    const ags = lerLocal('agendamentos').filter(a => a.data === hoje && a.status === 'finalizado');

    const servicos = lerLocal('servicos');
    const funcs = lerLocal('funcionarios');

    let recebido = 0, comissao = 0;

    ags.forEach(a => {
        const s = servicos.find(x => x.nome === a.servico);
        if (!s) return;

        recebido += Number(s.valor);
        a.funcionarios.forEach(f => {
            const fu = funcs.find(x => x.nome === f);
            if (fu) comissao += (s.valor * fu.comissao) / 100;
        });
    });

    document.getElementById('total-recebido').textContent = moeda(recebido);
    document.getElementById('total-comissao').textContent = moeda(comissao);
    document.getElementById('lucro-liquido').textContent = moeda(recebido - comissao);
}

/* ======================================================
   INIT
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
    inicializarAgenda();
    inicializarFinanceiro();
});
