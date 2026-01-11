/* ======================================================
   SCRIPT FINAL ESTÁVEL – AGENDA + FINANCEIRO + COMISSÕES
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
    const modalNovo = document.getElementById('modal-agendamento');
    const modalEditar = document.getElementById('modal-editar-agendamento');

    /* FECHAR MODAIS */
    document.getElementById('fechar-modal')?.addEventListener('click', () => {
        modalNovo.classList.remove('ativo');
    });

    document.getElementById('fechar-modal-edicao')?.addEventListener('click', () => {
        pararTimer();
        modalEditar.classList.remove('ativo');
    });

    /* SELECTS */
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

    /* GERAR AGENDA */
    function gerarAgenda() {
        calendario.innerHTML = '';
        const dataStr = dataAtual.toISOString().split('T')[0];

        if (tituloData) {
            tituloData.textContent =
                `Agendamentos de ${dataAtual.toLocaleDateString('pt-BR')}`;
        }

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

    /* MODAL EDIÇÃO */
    function abrirEdicao(ag) {
        document.getElementById('detalhes-cliente').textContent = ag.cliente;
        document.getElementById('detalhes-servico').textContent = ag.servico;
        document.getElementById('detalhes-funcionarios').textContent = ag.funcionarios.join(', ');
        document.getElementById('detalhes-status').textContent = ag.status;
        document.getElementById('agendamento-id').value = ag.id;

        const cliente = lerLocal('clientes').find(c => c.nome === ag.cliente);
        document.getElementById('detalhes-telefone').textContent = cliente?.telefone || '';
        document.getElementById('detalhes-endereco').textContent = cliente?.endereco || '';

        const btnWhats = document.getElementById('botao-whatsapp');
        const btnMaps = document.getElementById('botao-maps');

        if (cliente?.telefone) {
            btnWhats.href = `https://wa.me/55${cliente.telefone.replace(/\D/g,'')}`;
        }

        if (cliente?.endereco) {
            btnMaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cliente.endereco)}`;
        }

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

    /* NOVO AGENDAMENTO */
    document.getElementById('form-novo-agendamento')
        ?.addEventListener('submit', e => {
            e.preventDefault();

            const data = document.getElementById('data-agendamento').value;
            const hora = document.getElementById('hora-agendamento').value;
            const cliente = document.getElementById('cliente-agendamento').value;
            const servico = document.getElementById('servico-agendamento').value;
            const funcionarios = [...document.getElementById('funcionario-agendamento').selectedOptions]
                .map(o => o.value);

            if (!data || !hora || !cliente || !servico || funcionarios.length === 0) {
                alert('Preencha todos os campos');
                return;
            }

            const ags = lerLocal('agendamentos');
            ags.push({
                id: Date.now(),
                data,
                hora,
                cliente,
                servico,
                funcionarios,
                status: 'agendado'
            });

            salvarLocal('agendamentos', ags);
            modalNovo.classList.remove('ativo');
            gerarAgenda();
        });

    /* BOTÕES */
    document.getElementById('botao-iniciar')?.addEventListener('click', () => {
        const id = document.getElementById('agendamento-id').value;
        const ags = lerLocal('agendamentos');
        const ag = ags.find(a => a.id == id);
        if (!ag) return;

        ag.status = 'em andamento';
        ag.horaInicio = new Date().toISOString();
        salvarLocal('agendamentos', ags);

        iniciarTimer(ag.horaInicio);
        gerarAgenda();
    });

    document.getElementById('botao-finalizar')?.addEventListener('click', () => {
        const id = document.getElementById('agendamento-id').value;
        const ags = lerLocal('agendamentos');
        const ag = ags.find(a => a.id == id);
        if (!ag) return;

        ag.status = 'finalizado';
        salvarLocal('agendamentos', ags);

        pararTimer();
        modalEditar.classList.remove('ativo');
        gerarAgenda();
    });

    document.getElementById('botao-cancelar')?.addEventListener('click', () => {
        let ags = lerLocal('agendamentos');
        ags = ags.filter(a => a.id != document.getElementById('agendamento-id').value);
        salvarLocal('agendamentos', ags);
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

    const totalRecebido = document.getElementById('total-recebido');
    const totalComissao = document.getElementById('total-comissao');
    const lucroLiquido = document.getElementById('lucro-liquido');

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

    totalRecebido.textContent = moeda(recebido);
    totalComissao.textContent = moeda(comissao);
    lucroLiquido.textContent = moeda(recebido - comissao);
}

/* ======================================================
   INIT
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
    inicializarAgenda();
    inicializarFinanceiro();
});
