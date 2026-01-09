/* ======================================================
   SCRIPT FINAL DEFINITIVO – AGENDA COMPLETA E ESTÁVEL
   ====================================================== */

/* ================= UTIL ================= */
function salvarLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}
function lerLocal(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

/* ================= VARIÁVEIS ================= */
let dataAtual = new Date();

/* ================= ELEMENTOS MODAIS ================= */
const modalAgendamento = document.getElementById('modal-agendamento');
const modalEditarAgendamento = document.getElementById('modal-editar-agendamento');
const fecharModal = document.getElementById('fechar-modal');
const fecharModalEdicao = document.getElementById('fechar-modal-edicao');

/* ======================================================
   CADASTROS
   ====================================================== */
function inicializarCadastros() {

    // CLIENTE
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

            alert('✅ Cliente cadastrado com sucesso');
            formCliente.reset();
        });
    }

    // SERVIÇO
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

            alert('✅ Serviço cadastrado com sucesso');
            formServico.reset();
        });
    }

    // FUNCIONÁRIO
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

            alert('✅ Funcionário cadastrado com sucesso');
            formFuncionario.reset();
        });
    }
}

/* ======================================================
   PREENCHER SELECTS DA AGENDA
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
   AGENDA
   ====================================================== */
function gerarNavegacaoSemanal() {
    const diasDiv = document.getElementById('dias-da-semana');
    if (!diasDiv) return;

    diasDiv.innerHTML = '';
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - hoje.getDay());
    const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(inicio);
        d.setDate(inicio.getDate() + i);

        const el = document.createElement('div');
        el.className = 'dia-semana';
        if (d.toDateString() === dataAtual.toDateString()) el.classList.add('ativo');

        el.innerHTML = `${dias[d.getDay()]}<br>${d.getDate()}`;
        el.onclick = () => {
            dataAtual = d;
            gerarCalendarioDoDia();
            document.querySelectorAll('.dia-semana').forEach(x => x.classList.remove('ativo'));
            el.classList.add('ativo');
        };
        diasDiv.appendChild(el);
    }
}

function gerarCalendarioDoDia() {
    const cal = document.getElementById('calendario-diario');
    const titulo = document.getElementById('data-selecionada');
    if (!cal) return;

    const dataStr = dataAtual.toISOString().split('T')[0];
    titulo.textContent = `Agendamentos de ${dataAtual.toLocaleDateString('pt-BR')}`;

    const ags = lerLocal('agendamentos').filter(a => a.data === dataStr);
    cal.innerHTML = '';

    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hora = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            const ag = ags.find(a => a.hora === hora);

            const div = document.createElement('div');
            div.className = 'horario';

            if (ag) {
                div.classList.add('ocupado');
                div.innerHTML = `<strong>${hora}</strong><br>${ag.cliente}`;
                div.onclick = () => abrirModalEdicao(ag);
            } else {
                div.classList.add('livre');
                div.innerHTML = `<strong>${hora} - Livre</strong>`;
                div.onclick = () => {
                    abrirModalNovo(hora);
                    preencherSelectsAgenda();
                };
            }
            cal.appendChild(div);
        }
    }
}

/* ======================================================
   MODAL NOVO AGENDAMENTO
   ====================================================== */
function abrirModalNovo(hora) {
    document.getElementById('data-agendamento').value =
        dataAtual.toISOString().split('T')[0];
    document.getElementById('hora-agendamento').value = hora;
    modalAgendamento.classList.add('ativo');
}

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

        alert('✅ Agendamento criado');
        modalAgendamento.classList.remove('ativo');
        gerarCalendarioDoDia();
        formNovoAgendamento.reset();
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

    document.getElementById('botao-iniciar').style.display =
        ag.status === 'agendado' ? 'block' : 'none';

    document.getElementById('bloco-finalizar').style.display =
        ag.status === 'em andamento' ? 'block' : 'none';

    configurarAcoesRapidas(ag.cliente);
    modalEditarAgendamento.classList.add('ativo');
}

/* ======================================================
   WHATSAPP E MAPS
   ====================================================== */
function configurarAcoesRapidas(clienteNome) {
    const cliente = lerLocal('clientes').find(c => c.nome === clienteNome);
    if (!cliente) return;

    const wpp = document.getElementById('botao-whatsapp');
    const maps = document.getElementById('botao-maps');

    if (cliente.telefone) {
        wpp.href = `https://wa.me/55${cliente.telefone.replace(/\D/g,'')}`;
        wpp.style.display = 'inline-block';
    } else wpp.style.display = 'none';

    if (cliente.endereco) {
        maps.href = `https://maps.google.com/maps?daddr=${encodeURIComponent(cliente.endereco)}`;
        maps.style.display = 'inline-block';
    } else maps.style.display = 'none';
}

/* ======================================================
   BOTÕES DO MODAL
   ====================================================== */
document.getElementById('botao-iniciar')?.addEventListener('click', () => {
    const id = document.getElementById('agendamento-id').value;
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a => a.id == id);
    if (!ag) return;

    ag.status = 'em andamento';
    salvarLocal('agendamentos', ags);

    alert('▶ Serviço iniciado');
    modalEditarAgendamento.classList.remove('ativo');
    gerarCalendarioDoDia();
});

document.getElementById('botao-finalizar')?.addEventListener('click', () => {
    const id = document.getElementById('agendamento-id').value;
    const ags = lerLocal('agendamentos');
    const ag = ags.find(a => a.id == id);
    if (!ag) return;

    ag.status = 'finalizado';
    salvarLocal('agendamentos', ags);

    alert('✔ Serviço finalizado');
    modalEditarAgendamento.classList.remove('ativo');
    gerarCalendarioDoDia();
});

document.getElementById('botao-cancelar')?.addEventListener('click', () => {
    const id = document.getElementById('agendamento-id').value;
    if (!confirm('Cancelar este agendamento?')) return;

    let ags = lerLocal('agendamentos');
    ags = ags.filter(a => a.id != id);
    salvarLocal('agendamentos', ags);

    alert('❌ Agendamento cancelado');
    modalEditarAgendamento.classList.remove('ativo');
    gerarCalendarioDoDia();
});

/* ======================================================
   FECHAR MODAIS
   ====================================================== */
fecharModal?.addEventListener('click', () => modalAgendamento.classList.remove('ativo'));
fecharModalEdicao?.addEventListener('click', () => modalEditarAgendamento.classList.remove('ativo'));

/* ======================================================
   INICIALIZAÇÃO
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {

    if (document.body.classList.contains('pagina-cadastro')) {
        inicializarCadastros();
    }

    if (document.body.classList.contains('pagina-agenda')) {
        gerarNavegacaoSemanal();
        gerarCalendarioDoDia();
        preencherSelectsAgenda();
    }
});
