/* ======================================================
   SCRIPT ÚNICO ESTÁVEL – AGENDA + CADASTROS + FINANCEIRO
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

/* ================= TIMER ================= */
function iniciarTimer(horaInicio) {
    const box = document.getElementById('timer-servico');
    const span = document.getElementById('valor-timer');
    if (!box || !span || !horaInicio) return;

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
   CADASTROS (INDEX)
   ====================================================== */
function inicializarCadastros() {
    if (!document.body.classList.contains('pagina-cadastro')) return;

    document.getElementById('form-cliente')?.addEventListener('submit', e => {
        e.preventDefault();
        const clientes = lerLocal('clientes');
        clientes.push({
            nome: nomeCliente.value,
            telefone: telefoneCliente.value,
            endereco: enderecoCliente.value
        });
        salvarLocal('clientes', clientes);
        e.target.reset();
        alert('Cliente cadastrado');
    });

    document.getElementById('form-servico')?.addEventListener('submit', e => {
        e.preventDefault();
        const servicos = lerLocal('servicos');
        servicos.push({
            nome: nomeServico.value,
            duracao: duracaoServico.value,
            valor: Number(valorServico.value)
        });
        salvarLocal('servicos', servicos);
        e.target.reset();
        alert('Serviço cadastrado');
    });

    document.getElementById('form-funcionario')?.addEventListener('submit', e => {
        e.preventDefault();
        const funcs = lerLocal('funcionarios');
        funcs.push({
            nome: nomeFuncionario.value,
            comissao: Number(comissaoFuncionario.value)
        });
        salvarLocal('funcionarios', funcs);
        e.target.reset();
        alert('Funcionário cadastrado');
    });
}

/* ======================================================
   LISTAGENS (CLIENTES / SERVIÇOS / FUNCIONÁRIOS)
   ====================================================== */
function listar(chave, container, render) {
    const lista = lerLocal(chave);
    container.innerHTML = '';
    if (lista.length === 0) {
        container.innerHTML = '<p>Nenhum registro.</p>';
        return;
    }
    lista.forEach(render);
}

function inicializarListas() {
    if (document.body.classList.contains('pagina-clientes')) {
        listar('clientes', listaClientes, c => {
            listaClientes.innerHTML += `
                <div class="card">
                    <strong>${c.nome}</strong><br>
                    ${c.telefone}<br>${c.endereco}
                </div>`;
        });
    }

    if (document.body.classList.contains('pagina-servicos')) {
        listar('servicos', listaServicos, s => {
            listaServicos.innerHTML += `
                <div class="card">
                    <strong>${s.nome}</strong><br>
                    ${s.duracao} min<br>${moeda(s.valor)}
                </div>`;
        });
    }

    if (document.body.classList.contains('pagina-funcionarios')) {
        listar('funcionarios', listaFuncionarios, f => {
            listaFuncionarios.innerHTML += `
                <div class="card">
                    <strong>${f.nome}</strong><br>
                    Comissão: ${f.comissao}%
                </div>`;
        });
    }
}

/* ======================================================
   AGENDA
   ====================================================== */
function inicializarAgenda() {
    const cal = document.getElementById('calendario-diario');
    if (!cal) return;

    function preencherSelects() {
        clienteAgendamento.innerHTML = '<option value="">Cliente</option>';
        lerLocal('clientes').forEach(c =>
            clienteAgendamento.innerHTML += `<option>${c.nome}</option>`
        );

        servicoAgendamento.innerHTML = '<option value="">Serviço</option>';
        lerLocal('servicos').forEach(s =>
            servicoAgendamento.innerHTML += `<option>${s.nome}</option>`
        );

        funcionarioAgendamento.innerHTML = '';
        lerLocal('funcionarios').forEach(f =>
            funcionarioAgendamento.innerHTML += `<option>${f.nome}</option>`
        );
    }

    function renderAgenda() {
        cal.innerHTML = '';
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
                    div.innerHTML = `<b>${hora}</b><br>${ag.cliente}`;
                } else {
                    div.innerHTML = `<b>${hora}</b> Livre`;
                    div.onclick = () => {
                        dataAgendamento.value = dataStr;
                        horaAgendamento.value = hora;
                        preencherSelects();
                        modalAgendamento.classList.add('ativo');
                    };
                }
                cal.appendChild(div);
            }
        }
    }

    formNovoAgendamento.onsubmit = e => {
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
        renderAgenda();
    };

    renderAgenda();
}

/* ======================================================
   FINANCEIRO
   ====================================================== */
function inicializarFinanceiro() {
    if (!document.body.classList.contains('pagina-financeiro')) return;

    const hoje = new Date().toISOString().split('T')[0];
    const ags = lerLocal('agendamentos')
        .filter(a => a.data === hoje && a.status === 'finalizado');

    let recebido = 0;
    let comissao = 0;

    const servicos = lerLocal('servicos');
    const funcs = lerLocal('funcionarios');

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
   INIT
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
    inicializarCadastros();
    inicializarListas();
    inicializarAgenda();
    inicializarFinanceiro();
});
