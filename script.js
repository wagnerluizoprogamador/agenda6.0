/* ======================================================
   SCRIPT FINAL – COMPLETO, ESTÁVEL E FUNCIONAL
   ====================================================== */

/* ================= VARIÁVEIS GERAIS ================= */
let dataAtual = new Date();
let timerInterval;

/* ================= FUNÇÕES DE STORAGE ================= */
function salvarLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function lerLocal(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

/* ================= ELEMENTOS GERAIS ================= */
const calendarioDiarioDiv = document.getElementById('calendario-diario');
const dataSelecionadaSpan = document.getElementById('data-selecionada');
const diasDaSemanaDiv = document.getElementById('dias-da-semana');

const modalAgendamento = document.getElementById('modal-agendamento');
const fecharModalBtn = document.getElementById('fechar-modal');
const modalEditarAgendamento = document.getElementById('modal-editar-agendamento');
const fecharModalEdicaoBtn = document.getElementById('fechar-modal-edicao');

/* ======================================================
   CADASTROS
   ====================================================== */
function inicializarCadastros() {

    // CLIENTES
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

            alert('✅ Cliente cadastrado com sucesso!');
            formCliente.reset();
        });
    }

    // SERVIÇOS
    const formServico = document.getElementById('form-cadastro-servico');
    if (formServico) {
        formServico.addEventListener('submit', e => {
            e.preventDefault();
            const nome = document.getElementById('nome-servico').value.trim();
            const duracao = document.getElementById('duracao-servico').value;
            const valor = document.getElementById('valor-servico').value;

            if (!nome || !duracao || !valor) {
                alert('Preencha todos os campos do serviço');
                return;
            }

            const servicos = lerLocal('servicos');
            servicos.push({ nome, duracao, valor });
            salvarLocal('servicos', servicos);

            alert('✅ Serviço cadastrado com sucesso!');
            formServico.reset();
        });
    }

    // FUNCIONÁRIOS
    const formFuncionario = document.getElementById('form-cadastro-funcionario');
    if (formFuncionario) {
        formFuncionario.addEventListener('submit', e => {
            e.preventDefault();
            const nome = document.getElementById('nome-funcionario').value.trim();
            const comissao = document.getElementById('comissao-funcionario').value;

            if (!nome || !comissao) {
                alert('Preencha todos os campos do funcionário');
                return;
            }

            const funcionarios = lerLocal('funcionarios');
            funcionarios.push({ nome, comissao });
            salvarLocal('funcionarios', funcionarios);

            alert('✅ Funcionário cadastrado com sucesso!');
            formFuncionario.reset();
        });
    }
}

/* ======================================================
   AGENDA – NAVEGAÇÃO SEMANAL
   ====================================================== */
function gerarNavegacaoSemanal() {
    if (!diasDaSemanaDiv) return;
    diasDaSemanaDiv.innerHTML = '';

    const hoje = new Date();
    const primeiroDia = new Date(hoje);
    primeiroDia.setDate(hoje.getDate() - hoje.getDay());
    const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(primeiroDia);
        d.setDate(primeiroDia.getDate() + i);

        const div = document.createElement('div');
        div.className = 'dia-semana';
        if (d.toDateString() === dataAtual.toDateString()) div.classList.add('ativo');

        div.innerHTML = `<span>${dias[d.getDay()]}</span><br><span>${d.getDate()}</span>`;
        div.onclick = () => {
            dataAtual = d;
            gerarCalendarioDoDia(d);
            document.querySelectorAll('.dia-semana').forEach(x => x.classList.remove('ativo'));
            div.classList.add('ativo');
        };
        diasDaSemanaDiv.appendChild(div);
    }
}

/* ======================================================
   AGENDA – CALENDÁRIO 24H
   ====================================================== */
function gerarCalendarioDoDia(data) {
    if (!calendarioDiarioDiv) return;

    const dataString = data.toISOString().split('T')[0];
    dataSelecionadaSpan.textContent =
        `Agendamentos de ${data.toLocaleDateString('pt-BR')}`;

    const agendamentos = lerLocal('agendamentos')
        .filter(a => a.data === dataString);

    calendarioDiarioDiv.innerHTML = '';

    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hora = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const ag = agendamentos.find(a => a.hora === hora);

            const div = document.createElement('div');
            div.className = 'horario';

            if (ag) {
                div.classList.add('ocupado');
                div.innerHTML = `<strong>${hora} - ${ag.servico}</strong><br>${ag.cliente}`;
                div.onclick = () => abrirModalEdicao(ag);
            } else {
                div.classList.add('livre');
                div.innerHTML = `<strong>${hora} - Livre</strong>`;
                div.onclick = () => {
                    document.getElementById('data-agendamento').value = dataString;
                    document.getElementById('hora-agendamento').value = hora;
                    modalAgendamento.classList.add('ativo');
                };
            }
            calendarioDiarioDiv.appendChild(div);
        }
    }
}

/* ======================================================
   SELECTS DA AGENDA
   ====================================================== */
function preencherSelectsAgenda() {
    const clientes = lerLocal('clientes');
    const servicos = lerLocal('servicos');
    const funcionarios = lerLocal('funcionarios');

    const selCliente = document.getElementById('cliente-agendamento');
    const selServico = document.getElementById('servico-agendamento');
    const selFuncionario = document.getElementById('funcionario-agendamento');

    if (selCliente) {
        selCliente.innerHTML = '<option value="">Selecione um cliente</option>';
        clientes.forEach(c => {
            const op = document.createElement('option');
            op.value = c.nome;
            op.textContent = c.nome;
            selCliente.appendChild(op);
        });
    }

    if (selServico) {
        selServico.innerHTML = '<option value="">Selecione um serviço</option>';
        servicos.forEach(s => {
            const op = document.createElement('option');
            op.value = s.nome;
            op.textContent = s.nome;
            selServico.appendChild(op);
        });
    }

    if (selFuncionario) {
        selFuncionario.innerHTML = '';
        funcionarios.forEach(f => {
            const op = document.createElement('option');
            op.value = f.nome;
            op.textContent = f.nome;
            selFuncionario.appendChild(op);
        });
    }
}

/* ======================================================
   NOVO AGENDAMENTO
   ====================================================== */
const formNovoAgendamento = document.getElementById('form-novo-agendamento');

if (formNovoAgendamento) {
    formNovoAgendamento.addEventListener('submit', e => {
        e.preventDefault();

        const data = document.getElementById('data-agendamento').value;
        const hora = document.getElementById('hora-agendamento').value;
        const cliente = document.getElementById('cliente-agendamento').value;
        const servico = document.getElementById('servico-agendamento').value;
        const funcionarios = Array.from(
            document.getElementById('funcionario-agendamento').selectedOptions
        ).map(o => o.value);

        if (!data || !hora || !cliente || !servico || funcionarios.length === 0) {
            alert('Preencha todos os campos do agendamento');
            return;
        }

        const agendamentos = lerLocal('agendamentos');
        agendamentos.push({
            id: Date.now(),
            data,
            hora,
            cliente,
            servico,
            funcionarios,
            status: 'agendado'
        });

        salvarLocal('agendamentos', agendamentos);

        alert('✅ Agendamento realizado com sucesso!');
        modalAgendamento.classList.remove('ativo');
        gerarCalendarioDoDia(dataAtual);
    });
}

/* ======================================================
   MODAL DE EDIÇÃO
   ====================================================== */
function abrirModalEdicao(ag) {
    document.getElementById('detalhes-cliente').textContent = ag.cliente;
    document.getElementById('detalhes-servico').textContent = ag.servico;
    document.getElementById('detalhes-funcionarios').textContent = ag.funcionarios.join(', ');
    document.getElementById('detalhes-status').textContent = ag.status;
    document.getElementById('agendamento-id').value = ag.id;

    modalEditarAgendamento.classList.add('ativo');
}

/* ======================================================
   FECHAR MODAIS
   ====================================================== */
fecharModalBtn?.addEventListener('click', () => {
    modalAgendamento.classList.remove('ativo');
});

fecharModalEdicaoBtn?.addEventListener('click', () => {
    modalEditarAgendamento.classList.remove('ativo');
});

/* ======================================================
   INICIALIZAÇÃO FINAL
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {

    if (document.body.classList.contains('pagina-cadastro')) {
        inicializarCadastros();
    }

    if (document.body.classList.contains('pagina-agenda')) {
        gerarNavegacaoSemanal();
        gerarCalendarioDoDia(dataAtual);
        preencherSelectsAgenda();
    }
});
