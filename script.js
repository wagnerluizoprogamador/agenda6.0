/* ======================================================
   SCRIPT DEFINITIVO – CADASTROS + AGENDA + FINANCEIRO
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

/* ======================================================
   CADASTROS (ESTAVA FALTANDO)
   ====================================================== */
function inicializarCadastros() {

    /* CLIENTES */
    const formCliente = document.getElementById('form-cadastro-cliente');
    if (formCliente) {
        formCliente.addEventListener('submit', e => {
            e.preventDefault();

            const nome = document.getElementById('nome-cliente').value.trim();
            const telefone = document.getElementById('telefone-cliente').value.trim();
            const endereco = document.getElementById('endereco-cliente').value.trim();

            if (!nome || !telefone) {
                alert('Preencha nome e telefone');
                return;
            }

            const clientes = lerLocal('clientes');
            clientes.push({ nome, telefone, endereco });
            salvarLocal('clientes', clientes);

            alert('✅ Cliente cadastrado');
            formCliente.reset();
        });
    }

    /* SERVIÇOS */
    const formServico = document.getElementById('form-cadastro-servico');
    if (formServico) {
        formServico.addEventListener('submit', e => {
            e.preventDefault();

            const nome = document.getElementById('nome-servico').value.trim();
            const duracao = document.getElementById('duracao-servico').value;
            const valor = Number(document.getElementById('valor-servico').value);

            if (!nome || !duracao || !valor) {
                alert('Preencha todos os campos do serviço');
                return;
            }

            const servicos = lerLocal('servicos');
            servicos.push({ nome, duracao, valor });
            salvarLocal('servicos', servicos);

            alert('✅ Serviço cadastrado');
            formServico.reset();
        });
    }

    /* FUNCIONÁRIOS */
    const formFuncionario = document.getElementById('form-cadastro-funcionario');
    if (formFuncionario) {
        formFuncionario.addEventListener('submit', e => {
            e.preventDefault();

            const nome = document.getElementById('nome-funcionario').value.trim();
            const comissao = Number(document.getElementById('comissao-funcionario').value);

            if (!nome || !comissao) {
                alert('Preencha todos os campos do funcionário');
                return;
            }

            const funcionarios = lerLocal('funcionarios');
            funcionarios.push({ nome, comissao });
            salvarLocal('funcionarios', funcionarios);

            alert('✅ Funcionário cadastrado');
            formFuncionario.reset();
        });
    }
}

/* ======================================================
   AGENDA
   ====================================================== */
let dataAtual = new Date();
let timerInterval = null;

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

function inicializarAgenda() {

    const calendario = document.getElementById('calendario-diario');
    if (!calendario) return;

    const modalNovo = document.getElementById('modal-agendamento');
    const modalEditar = document.getElementById('modal-editar-agendamento');

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
                    div.onclick = () => abrirEdicao(ag);
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

    function abrirEdicao(ag) {
        document.getElementById('detalhes-cliente').textContent = ag.cliente;
        document.getElementById('detalhes-servico').textContent = ag.servico;
        document.getElementById('detalhes-funcionarios').textContent = ag.funcionarios.join(', ');
        document.getElementById('detalhes-status').textContent = ag.status;
        document.getElementById('agendamento-id').value = ag.id;

        pararTimer();
        if (ag.status === 'em andamento' && ag.horaInicio) iniciarTimer(ag.horaInicio);

        modalEditar.classList.add('ativo');
    }

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

        recebido += s.valor;
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
   INIT GLOBAL
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
    inicializarCadastros();
    inicializarAgenda();
    inicializarFinanceiro();
});
