/* ======================================================
   SCRIPT ORIGINAL + CORREÇÕES COMBINADAS
   ====================================================== */

// ---------- VARIÁVEIS PRINCIPAIS ----------
const formCadastroCliente = document.getElementById('form-cadastro-cliente');
const formCadastroServico = document.getElementById('form-cadastro-servico');
const formCadastroFuncionario = document.getElementById('form-cadastro-funcionario');
const formNovoAgendamento = document.getElementById('form-novo-agendamento');
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

const botaoAlterarDados = document.getElementById('botao-alterar-dados');
const botaoVoltar = document.getElementById('botao-voltar');
const botaoIniciar = document.getElementById('botao-iniciar');
const botaoFinalizar = document.getElementById('botao-finalizar');
const botaoCancelar = document.getElementById('botao-cancelar');

const fotoServicoInput = document.getElementById('foto-servico');
const timerServicoDiv = document.getElementById('timer-servico');
const valorTimerSpan = document.getElementById('valor-timer');

const botaoWhatsapp = document.getElementById('botao-whatsapp');
const botaoMaps = document.getElementById('botao-maps');
const botoesAcaoRapidaDiv = document.querySelector('.botoes-acao-rapida');

let dataAtual = new Date();
let timerInterval;

/* ======================================================
   NAVEGAÇÃO SEMANAL (INALTERADA)
   ====================================================== */
function gerarNavegacaoSemanal() {
    if (!diasDaSemanaDiv) return;
    diasDaSemanaDiv.innerHTML = '';
    const hoje = new Date();
    const diaDaSemana = hoje.getDay();
    const primeiroDia = new Date(hoje);
    primeiroDia.setDate(hoje.getDate() - diaDaSemana);
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
        const dataDia = new Date(primeiroDia);
        dataDia.setDate(primeiroDia.getDate() + i);
        const divDia = document.createElement('div');
        divDia.className = 'dia-semana';

        if (dataDia.toDateString() === dataAtual.toDateString()) {
            divDia.classList.add('ativo');
        }

        divDia.innerHTML = `<span>${dias[dataDia.getDay()]}</span><br><span>${dataDia.getDate()}</span>`;
        divDia.onclick = () => {
            dataAtual = dataDia;
            gerarCalendarioDoDia(dataAtual);
            document.querySelectorAll('.dia-semana').forEach(d => d.classList.remove('ativo'));
            divDia.classList.add('ativo');
        };
        diasDaSemanaDiv.appendChild(divDia);
    }
}

/* ======================================================
   CALENDÁRIO DO DIA (CORRIGIDO PARA 24H)
   ====================================================== */
function gerarCalendarioDoDia(data) {
    if (!calendarioDiarioDiv) return;

    const dataString = data.toISOString().split('T')[0];
    dataSelecionadaSpan.textContent =
        `Agendamentos para ${data.toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}`;

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const agendamentosDoDia = agendamentos.filter(a => a.data === dataString);
    calendarioDiarioDiv.innerHTML = '';

    // ✅ CORREÇÃO AQUI
    const horaInicio = 0;
    const horaFim = 24;

    for (let h = horaInicio; h < horaFim; h++) {
        for (let m = 0; m < 60; m += 30) {
            const horaSlot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const agendamento = agendamentosDoDia.find(a => a.hora === horaSlot);
            const div = document.createElement('div');
            div.className = 'horario';

            if (agendamento) {
                div.classList.add('ocupado');
                div.innerHTML = `
                    <strong>${horaSlot} - ${agendamento.servico}</strong><br>
                    Cliente: ${agendamento.cliente}<br>
                    Funcionário(s): ${agendamento.funcionarios.join(', ')}
                `;
                div.onclick = () => abrirModalEdicao(agendamento);
            } else {
                div.classList.add('livre');
                div.innerHTML = `<strong>${horaSlot} - Livre</strong>`;
                div.onclick = () => {
                    document.getElementById('data-agendamento').value = dataString;
                    document.getElementById('hora-agendamento').value = horaSlot;
                    modalAgendamento.classList.add('ativo');
                };
            }
            calendarioDiarioDiv.appendChild(div);
        }
    }
}

/* ======================================================
   MODAL DE EDIÇÃO (CORRIGIDO)
   ====================================================== */
function abrirModalEdicao(agendamento) {
    pararTimer();

    detalhesAgendamentoDiv.style.display = 'block';
    formAlterarDados.style.display = 'none';
    formFluxoDiv.style.display = 'block';
    botoesEdicaoDiv.style.display = 'flex';
    blocoFinalizarDiv.style.display = 'none';
    timerServicoDiv.style.display = 'none';

    document.getElementById('titulo-modal-edicao').textContent = 'Detalhes do Agendamento';
    document.getElementById('detalhes-cliente').textContent = agendamento.cliente;
    document.getElementById('detalhes-servico').textContent = agendamento.servico;
    document.getElementById('detalhes-funcionarios').textContent = agendamento.funcionarios.join(', ');
    document.getElementById('detalhes-status').textContent = agendamento.status;
    document.getElementById('agendamento-id').value = agendamento.id;

    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes.find(c => c.nome === agendamento.cliente);

    document.getElementById('detalhes-telefone').textContent = cliente?.telefone || 'Não informado';
    document.getElementById('detalhes-endereco').textContent = cliente?.endereco || 'Não informado';

    botoesAcaoRapidaDiv.style.display = 'none';
    if (cliente?.telefone) {
        botaoWhatsapp.href = `https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`;
        botoesAcaoRapidaDiv.style.display = 'block';
    }
    if (cliente?.endereco) {
        botaoMaps.href = `https://maps.google.com/maps?daddr=${encodeURIComponent(cliente.endereco)}`;
        botoesAcaoRapidaDiv.style.display = 'block';
    }

    if (agendamento.status === 'em andamento') {
        document.getElementById('titulo-modal-edicao').textContent = 'Serviço em Andamento';
        blocoFinalizarDiv.style.display = 'block';
        botoesEdicaoDiv.style.display = 'none';
        iniciarTimer(agendamento.horaInicio);
    }

    if (agendamento.status === 'finalizado') {
        document.getElementById('titulo-modal-edicao').textContent = 'Serviço Finalizado';
        formFluxoDiv.style.display = 'none';
        botoesEdicaoDiv.style.display = 'none';
        document.getElementById('detalhes-duracao').style.display = 'block';
        document.getElementById('valor-duracao').textContent =
            `${agendamento.duracaoReal || 0} minutos`;
    }

    document.getElementById('data-hora-edicao').value = `${agendamento.data}T${agendamento.hora}`;
    document.getElementById('cliente-edicao').value = agendamento.cliente;
    document.getElementById('servico-edicao').value = agendamento.servico;

    const selectFunc = document.getElementById('funcionario-edicao');
    Array.from(selectFunc.options).forEach(o => {
        o.selected = agendamento.funcionarios.includes(o.value);
    });

    modalEditarAgendamento.classList.add('ativo');
}

/* ======================================================
   TIMER (INALTERADO)
   ====================================================== */
function iniciarTimer(horaInicio) {
    pararTimer();
    const inicio = new Date(horaInicio).getTime();
    timerServicoDiv.style.display = 'block';

    timerInterval = setInterval(() => {
        const seg = Math.floor((Date.now() - inicio) / 1000);
        valorTimerSpan.textContent =
            `${String(Math.floor(seg / 3600)).padStart(2, '0')}:` +
            `${String(Math.floor((seg % 3600) / 60)).padStart(2, '0')}:` +
            `${String(seg % 60).padStart(2, '0')}`;
    }, 1000);
}

function pararTimer() {
    clearInterval(timerInterval);
    timerServicoDiv.style.display = 'none';
}

/* ======================================================
   FECHAR MODAIS
   ====================================================== */
fecharModalBtn.onclick = () => modalAgendamento.classList.remove('ativo');
fecharModalEdicaoBtn.onclick = () => {
    modalEditarAgendamento.classList.remove('ativo');
    pararTimer();
};

/* ======================================================
   INICIALIZAÇÃO
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('pagina-agenda')) {
        gerarNavegacaoSemanal();
        gerarCalendarioDoDia(dataAtual);
    }
});
