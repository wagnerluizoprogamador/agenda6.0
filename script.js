/* ================= STORAGE ================= */
function salvar(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}
function ler(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}
function moeda(v) {
    return Number(v || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/* ================= CLIENTES ================= */
function clientesInit() {
    const lista = document.getElementById('lista-clientes');
    const form = document.getElementById('form-cliente');
    if (!lista || !form) return;

    function render() {
        lista.innerHTML = '';
        ler('clientes').forEach(c => {
            lista.innerHTML += `
                <div class="item-lista">
                    <strong>${c.nome}</strong><br>
                    ${c.telefone}<br>${c.endereco || ''}
                </div>`;
        });
    }

    form.onsubmit = e => {
        e.preventDefault();
        const clientes = ler('clientes');
        clientes.push({
            nome: nomeCliente.value,
            telefone: telefoneCliente.value,
            endereco: enderecoCliente.value
        });
        salvar('clientes', clientes);
        form.reset();
        render();
    };

    render();
}

/* ================= SERVIÇOS ================= */
function servicosInit() {
    const lista = document.getElementById('lista-servicos');
    const form = document.getElementById('form-servico');
    if (!lista || !form) return;

    function render() {
        lista.innerHTML = '';
        ler('servicos').forEach(s => {
            lista.innerHTML += `
                <div class="item-lista">
                    <strong>${s.nome}</strong><br>
                    ${s.duracao} min - ${moeda(s.valor)}
                </div>`;
        });
    }

    form.onsubmit = e => {
        e.preventDefault();
        const servicos = ler('servicos');
        servicos.push({
            nome: nomeServico.value,
            duracao: duracaoServico.value,
            valor: valorServico.value
        });
        salvar('servicos', servicos);
        form.reset();
        render();
    };

    render();
}

/* ================= FUNCIONÁRIOS ================= */
function funcionariosInit() {
    const lista = document.getElementById('lista-funcionarios');
    const form = document.getElementById('form-funcionario');
    if (!lista || !form) return;

    function render() {
        lista.innerHTML = '';
        ler('funcionarios').forEach(f => {
            lista.innerHTML += `
                <div class="item-lista">
                    <strong>${f.nome}</strong><br>
                    Comissão: ${f.comissao}%
                </div>`;
        });
    }

    form.onsubmit = e => {
        e.preventDefault();
        const funcs = ler('funcionarios');
        funcs.push({
            nome: nomeFuncionario.value,
            comissao: comissaoFuncionario.value
        });
        salvar('funcionarios', funcs);
        form.reset();
        render();
    };

    render();
}

/* ================= AGENDA ================= */
function agendaInit() {
    const box = document.getElementById('agenda-dia');
    if (!box) return;

    const data = new Date().toISOString().split('T')[0];
    const ags = ler('agendamentos').filter(a => a.data === data);

    box.innerHTML = '';
    for (let h = 8; h <= 17; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hora = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const ag = ags.find(a => a.hora === hora);

            const div = document.createElement('div');
            div.className = 'horario ' + (ag ? 'ocupado' : 'livre');
            div.innerHTML = ag
                ? `${hora} - ${ag.servico}<br>${ag.cliente}`
                : `${hora} - Livre`;

            div.onclick = () => abrirModal(hora);
            box.appendChild(div);
        }
    }
}

/* ================= MODAL ================= */
function abrirModal(hora) {
    const modal = document.getElementById('modal');
    modal.classList.add('ativo');

    horaAgendamento.value = hora;

    clienteAg.innerHTML = ler('clientes')
        .map(c => `<option>${c.nome}</option>`).join('');

    servicoAg.innerHTML = ler('servicos')
        .map(s => `<option>${s.nome}</option>`).join('');
}

function fecharModal() {
    document.getElementById('modal').classList.remove('ativo');
}

function salvarAgendamento() {
    const ags = ler('agendamentos');
    ags.push({
        data: new Date().toISOString().split('T')[0],
        hora: horaAgendamento.value,
        cliente: clienteAg.value,
        servico: servicoAg.value
    });
    salvar('agendamentos', ags);
    fecharModal();
    agendaInit();
}

/* ================= FINANCEIRO ================= */
function financeiroInit() {
    if (!document.getElementById('total-recebido')) return;

    const servicos = ler('servicos');
    const ags = ler('agendamentos');

    let total = 0;
    ags.forEach(a => {
        const s = servicos.find(x => x.nome === a.servico);
        if (s) total += Number(s.valor);
    });

    totalRecebido.textContent = moeda(total);
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
    clientesInit();
    servicosInit();
    funcionariosInit();
    agendaInit();
    financeiroInit();
});
