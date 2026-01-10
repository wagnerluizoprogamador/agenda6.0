/* ======================================================
   SCRIPT FINAL FECHADO – AGENDA + FINANCEIRO (ESTÁVEL)
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
    if (!calendario) return;

    const tituloData = document.getElementById('data-selecionada');
    const diasSemana = document.getElementById('dias-da-semana');
    const modalNovo = document.getElementById('modal-agendamento');
    const modalEditar = document.getElementById('modal-editar-agendamento');

    /* ===== FECHAR MODAIS ===== */
    document.getElementById('fechar-modal')?.onclick = () => {
        modalNovo.classList.remove('ativo');
    };

    document.getElementById('fechar-modal-edicao')?.onclick = () => {
        pararTimer();
        modalEditar.classList.remove('ativo');
    };

    /* ===== NAVEGAÇÃO SEMANAL ===== */
    function gerarSemana() {
        diasSemana.innerHTML = '';
        const inicio = new Date(dataAtual);
        inicio.setDate(inicio.getDate() - inicio.getDay());
        const nomes = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(inicio);
            d.setDate(inicio.getDate() + i);

            const div = document.createElement('div');
            div.className = 'dia-semana';
            if (d.toDateString() === dataAtual.toDateString()) div.classList.add('ativo');

            div.innerHTML = `${nomes[d.getDay()]}<br>${d.getDate()}`;
            div.onclick = () => {
                dataAtual = d;
                gerarAgenda();
                gerarSemana();
            };
            diasSemana.appendChild(div);
        }
    }

    /* ===== SELECTS ===== */
    function preencherSelects() {
        const selCliente = document.getElementById('cliente-agendamento');
        const selServico = document.getElementById('servico-agendamento');
        const selFuncionario = document.getElementById('funcionario-agendamento');

        selCliente.innerHTML = '<option value="">Selecione um cliente</option>';
        lerLocal('clientes').forEach(c =>
            selCliente.innerHTML += `<option value="${c.nome}">${c.nome}</option>`
        );

        selServico.innerHTML = '<option value="">Selecione um serviço</option>';
        lerLocal('servicos').forEach(s =>
            selServico.innerHTML += `<option value="${s.nome}">${s.nome}</option>`
        );

        selFuncionario.innerHTML = '';
        lerLocal('funcionarios').forEach(f =>
            selFuncionario.innerHTML += `<option value="${f.nome}">${f.nome}</option>`
        );
    }

    /* ===== GERAR AGENDA ===== */
    function gerarAgenda() {
        calendario.innerHTML = '';
        const dataStr = dataAtual.toISOString().split('T')[0];
        tituloData.textContent = `Agendamentos de ${dataAtual.toLocaleDateString('pt-BR')}`;

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
                    div.onclick = () => abrirEdicao(ag);
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

    /* ===== MODAL EDIÇÃO ===== */
    function abrirEdicao(ag) {

        document.getElementById('detalhes-cliente').textContent = ag.cliente;
        document.getElementById('detalhes-servico').textContent = ag.servico;
        document.getElementById('detalhes-funcionarios').textContent = ag.funcionarios.join(', ');
        document.getElementById('detalhes-status').textContent = ag.status;
        document.getElementById('agendamento-id').value = ag.id;

        const btnIniciar = document.getElementById('botao-iniciar');
        const blocoFinalizar = document.getElementById('bloco-finalizar');

        btnIniciar.style.display = ag.status === 'agendado' ? 'block' : 'none';
        blocoFinalizar.style.display = ag.status === 'em andamento' ? 'block' : 'none';

        pararTimer();
        if (ag.status === 'em andamento' && ag.horaInicio) {
            iniciarTimer(ag.horaInicio);
        }

        modalEditar.classList.add('ativo');
    }

    /* ===== BOTÕES ===== */
    document.getElementById('botao-iniciar').onclick = () => {
        const id = document.getElementById('agendamento-id').value;
        const ags = lerLocal('agendamentos');
        const ag = ags.find(a => a.id == id);
        if (!ag) return;

        ag.status = 'em andamento';
        ag.horaInicio = new Date().toISOString();
        salvarLocal('agendamentos', ags);

        abrirEdicao(ag);
        gerarAgenda();
    };

    document.getElementById('botao-finalizar').onclick = () => {
        const id = document.getElementById('agendamento-id').value;
        const ags = lerLocal('agendamentos');
        const ag = ags.find(a => a.id == id);
        if (!ag) return;

        ag.status = 'finalizado';
        ag.horaFim = new Date().toISOString();
        salvarLocal('agendamentos', ags);

        pararTimer();
        modalEditar.classList.remove('ativo');
        gerarAgenda();
    };

    document.getElementById('botao-cancelar').onclick = () => {
        let ags = lerLocal('agendamentos')
            .filter(a => a.id != document.getElementById('agendamento-id').value);
        salvarLocal('agendamentos', ags);
        modalEditar.classList.remove('ativo');
        gerarAgenda();
    };

    document.getElementById('form-novo-agendamento').onsubmit = e => {
        e.preventDefault();
        const ags = lerLocal('agendamentos');
        ags.push({
            id: Date.now(),
            data: document.getElementById('data-agendamento').value,
            hora: document.getElementById('hora-agendamento').value,
            cliente: document.getElementById('cliente-agendamento').value,
            servico: document.getElementById('servico-agendamento').value,
            funcionarios: [...document.getElementById('funcionario-agendamento').selectedOptions].map(o=>o.value),
            status: 'agendado'
        });
        salvarLocal('agendamentos', ags);
        modalNovo.classList.remove('ativo');
        gerarAgenda();
    };

    gerarSemana();
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

    let recebido = 0;
    let comissao = 0;

    ags.forEach(a => {
        const s = servicos.find(x => x.nome === a.servico);
        if (!s) return;
        recebido += Number(s.valor || 0);
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
