/* ======================================================
   SCRIPT FINAL – ESTÁVEL E ORGANIZADO
   ====================================================== */

/* ================= VARIÁVEIS GERAIS ================= */
let dataAtual = new Date();
let timerInterval;

/* ================= ELEMENTOS GERAIS ================= */
const calendarioDiarioDiv = document.getElementById('calendario-diario');
const dataSelecionadaSpan = document.getElementById('data-selecionada');
const diasDaSemanaDiv = document.getElementById('dias-da-semana');

const modalAgendamento = document.getElementById('modal-agendamento');
const fecharModalBtn = document.getElementById('fechar-modal');
const modalEditarAgendamento = document.getElementById('modal-editar-agendamento');
const fecharModalEdicaoBtn = document.getElementById('fechar-modal-edicao');

const detalhesAgendamentoDiv = document.getElementById('detalhes-agendamento');
const formFluxoDiv = document.getElementById('form-fluxo');
const blocoFinalizarDiv = document.getElementById('bloco-finalizar');
const botoesEdicaoDiv = document.getElementById('botoes-edicao');
const formAlterarDados = document.getElementById('form-alterar-dados');

const botaoIniciar = document.getElementById('botao-iniciar');
const botaoFinalizar = document.getElementById('botao-finalizar');
const botaoCancelar = document.getElementById('botao-cancelar');

const fotoServicoInput = document.getElementById('foto-servico');
const timerServicoDiv = document.getElementById('timer-servico');
const valorTimerSpan = document.getElementById('valor-timer');

const botaoWhatsapp = document.getElementById('botao-whatsapp');
const botaoMaps = document.getElementById('botao-maps');
const botoesAcaoRapidaDiv = document.querySelector('.botoes-acao-rapida');

/* ======================================================
   FUNÇÕES AUXILIARES
   ====================================================== */
function salvarLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function lerLocal(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

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
   AGENDA
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

function gerarCalendarioDoDia(data) {
    if (!calendarioDiarioDiv) return;

    const dataString = data.toISOString().split('T')[0];
    dataSelecionadaSpan.textContent = `Agendamentos de ${data.toLocaleDateString('pt-BR')}`;

    const agendamentos = lerLocal('agendamentos').filter(a => a.data === dataString);
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
                    modalAgendamento?.classList.add('ativo');
                };
            }
            calendarioDiarioDiv.appendChild(div);
        }
    }
}

/* ======================================================
   MODAL E TIMER
   ====================================================== */
function iniciarTimer(horaInicio) {
    pararTimer();
    const inicio = new Date(horaInicio).getTime();
    timerServicoDiv.style.display = 'block';

    timerInterval = setInterval(() => {
        const s = Math.floor((Date.now() - inicio) / 1000);
        valorTimerSpan.textContent =
            `${String(Math.floor(s/3600)).padStart(2,'0')}:` +
            `${String(Math.floor((s%3600)/60)).padStart(2,'0')}:` +
            `${String(s%60).padStart(2,'0')}`;
    }, 1000);
}

function pararTimer() {
    clearInterval(timerInterval);
    if (timerServicoDiv) timerServicoDiv.style.display = 'none';
}

function abrirModalEdicao(ag) {
    pararTimer();

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
fecharModalBtn?.addEventListener('click', () => modalAgendamento.classList.remove('ativo'));
fecharModalEdicaoBtn?.addEventListener('click', () => {
    modalEditarAgendamento.classList.remove('ativo');
    pararTimer();
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
    }
});
