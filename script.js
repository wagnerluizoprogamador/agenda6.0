/* ======================================================
   SCRIPT FINAL 100% ESTÁVEL – AGENDA + FINANCEIRO
   ====================================================== */

/* ================= STORAGE ================= */
function salvarLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}
function lerLocal(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave)) || [];
    } catch {
        return [];
    }
}
function moeda(v) {
    return Number(v || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/* ================= VARIÁVEIS GLOBAIS ================= */
let dataAtual = new Date();
let timerInterval = null;
let agendamentoAtivoId = null;

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
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
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
    if (!calendario) return;

    const modalNovo = document.getElementById('modal-agendamento');
    const modalEditar = document.getElementById('modal-editar-agendamento');

    /* ---------- FECHAR MODAIS ---------- */
    document.getElementById('fechar-modal')?.addEventListener('click', () => {
        modalNovo.classList.remove('ativo');
    });

    document.getElementById('fechar-modal-edicao')?.addEventListener('click', () => {
        pararTimer();
        agendamentoAtivoId = null;
        modalEditar.classList.remove('ativo');
    });

    /* ---------- SELECTS ---------- */
    function preencherSelects() {
        const selCliente = document.getElementById('cliente-agendamento');
        const selServico = document.getElementById('servico-agendamento');
        const selFuncionario = document.getElementById('funcionario-agendamento');

        if (!selCliente || !selServico || !selFuncionario) return;

        selCliente.innerHTML = '<option value="">Selecione um cliente</option>';
        lerLocal('clientes').forEach(c => {
            if (c.nome) {
                selCliente.innerHTML += `<option value="${c.nome}">${c.nome}</option>`;
            }
        });

        selServico.innerHTML = '<option value="">Selecione um serviço</option>';
        lerLocal('servicos').forEach(s => {
            if (s.nome) {
                selServico.innerHTML += `<option value="${s.nome}">${s.nome}</option>`;
            }
        });

        selFuncionario.innerHTML = '';
        lerLocal('funcionarios').forEach(f => {
            if (f.nome) {
                selFuncionario.innerHTML += `<option value="${f.nome}">${f.nome}</option>`;
            }
        });
    }

    /* ---------- GERAR AGENDA ---------- */
    function gerarAgenda() {
        calendario.innerHTML = '';
        const dataStr = dataAtual.toISOString().split('T')[0];
        const ags = lerLocal('agendamentos').filter(a => a.data === dataStr);

        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {

                const hora = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                const ag = ags.find(a => a.hora === hora);

                const div = document.createElement('div');
                div.className = 'horario';

                if (ag) {
                    div.classList.add('ocupado');
                    div.innerHTML = `<strong>${hora}</strong><br>${ag.cliente}`;
                    div.onclick = () => abrirModalEdicao(ag.id);
                } else {
                    div.classList.add('livre');
                    div.innerHTML = `<strong>${hora}</strong> - Livre`;
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
    function abrirModalEdicao(id) {
        const ags = lerLocal('agendamentos');
        const ag = ags.find(a => a.id === id);
        if (!ag) return;

        agendamentoAtivoId = id;

        document.getElementById('detalhes-cliente').textContent = ag.cliente || '';
        document.getElementById('detalhes-servico').textContent = ag.servico || '';
        document.getElementById('detalhes-funcionarios').textContent =
            (ag.funcionarios || []).join(', ');
        document.getElementById('detalhes-status').textContent = ag.status || '';

        document.getElementById('botao-iniciar').style.display =
            ag.status === 'agendado' ? 'block' : 'none';

        document.getElementById('bloco-finalizar').style.display =
            ag.status === 'em andamento' ? 'block' : 'none';

        pararTimer();
        if (ag.status === 'em andamento' && ag.horaInicio) {
            iniciarTimer(ag.horaInicio);
        }

        configurarAcoesRapidas(ag.cliente);
        modalEditar.classList.add('ativo');
    }

    /* ---------- WHATSAPP / MAPS ---------- */
    function configurarAcoesRapidas(nomeCliente) {
        const cliente = lerLocal('clientes').find(c => c.nome === nomeCliente);
        const wpp = document.getElementById('botao-whatsapp');
        const maps = document.getElementById('botao-maps');

        if (!cliente) {
            if (wpp) wpp.style.display = 'none';
            if (maps) maps.style.display = 'none';
            return;
        }

        if (wpp && cliente.telefone) {
            wpp.href = `https://wa.me/55${cliente.telefone.replace(/\D/g,'')}`;
            wpp.style.display = 'inline-block';
        } else if (wpp) {
            wpp.style.display = 'none';
        }

        if (maps && cliente.endereco) {
            maps.href = `https://maps.google.com/maps?daddr=${encodeURIComponent(cliente.endereco)}`;
            maps.style.display = 'inline-block';
        } else if (maps) {
            maps.style.display = 'none';
        }
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
            funcionarios: [...document.getElementById('funcionario-agendamento').selectedOptions].map(o => o.value),
            status: 'agendado'
        });

        salvarLocal('agendamentos', ags);
        modalNovo.classList.remove('ativo');
        gerarAgenda();
    });

    /* ---------- BOTÕES ---------- */
    document.getElementById('botao-iniciar')?.addEventListener('click', () => {
        if (!agendamentoAtivoId) return;

        const ags = lerLocal('agendamentos');
        const ag = ags.find(a => a.id === agendamentoAtivoId);
        if (!ag) return;

        ag.status = 'em andamento';
        ag.horaInicio = new Date().toISOString();
        salvarLocal('agendamentos', ags);

        document.getElementById('detalhes-status').textContent = 'em andamento';
        document.getElementById('botao-iniciar').style.display = 'none';
        document.getElementById('bloco-finalizar').style.display = 'block';

        iniciarTimer(ag.horaInicio);
        gerarAgenda();
    });

    document.getElementById('botao-finalizar')?.addEventListener('click', () => {
        if (!agendamentoAtivoId) return;

        const ags = lerLocal('agendamentos');
        const ag = ags.find(a => a.id === agendamentoAtivoId);
        if (!ag) return;

        ag.status = 'finalizado';
        ag.horaFim = new Date().toISOString();
        salvarLocal('agendamentos', ags);

        pararTimer();
        agendamentoAtivoId = null;
        modalEditar.classList.remove('ativo');
        gerarAgenda();
    });

    document.getElementById('botao-cancelar')?.addEventListener('click', () => {
        if (!agendamentoAtivoId) return;

        let ags = lerLocal('agendamentos');
        ags = ags.filter(a => a.id !== agendamentoAtivoId);
        salvarLocal('agendamentos', ags);

        agendamentoAtivoId = null;
        modalEditar.classList.remove('ativo');
        gerarAgenda();
    });

    gerarAgenda();
}

/* ======================================================
   FINANCEIRO
   ====================================================== */
function inicializarFinanceiro() {
    if (!document.body.classList.contains('pagina-financeiro')) return;

    const hoje = new Date().toISOString().split('T')[0];
    const ags = lerLocal('agendamentos').filter(a => a.data === hoje && a.status === 'finalizado');
    const servicos = lerLocal('servicos');
    const funcs = lerLocal('funcionarios');

    let recebido = 0;
    let comissao = 0;

    ags.forEach(a => {
        const s = servicos.find(x => x.nome === a.servico);
        if (!s) return;

        recebido += Number(s.valor || 0);
        (a.funcionarios || []).forEach(f => {
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
