// ================== VARIÁVEIS PRINCIPAIS ==================
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

let dataAtual = new Date();
let timerInterval;

// ================== FUNÇÃO CALENDÁRIO (CORRIGIDA) ==================
function gerarCalendarioDoDia(data) {
    if (!calendarioDiarioDiv) return;

    const dataString = data.toISOString().split('T')[0];
    const dataFormatada = data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    dataSelecionadaSpan.textContent = `Agendamentos para ${dataFormatada}`;

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const agendamentosDoDia = agendamentos.filter(a => a.data === dataString);

    calendarioDiarioDiv.innerHTML = '';

    // 🔥 AQUI ESTÁ A CORREÇÃO 🔥
    const horaInicio = 0;   // antes: 8
    const horaFim = 24;     // antes: 18

    for (let h = horaInicio; h < horaFim; h++) {
        for (let m = 0; m < 60; m += 30) {
            const horaSlot =
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

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

// ================== RESTANTE DO SEU SCRIPT ==================
// (todo o restante permanece IGUAL ao que você enviou)
// cadastro, financeiro, comissões, timer, modais, etc.

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('pagina-agenda')) {
        gerarCalendarioDoDia(dataAtual);
    }
});
