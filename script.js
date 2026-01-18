/* ========= STORAGE ========= */
function salvarLocal(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

function lerLocal(chave) {
  return JSON.parse(localStorage.getItem(chave)) || [];
}

/* ========= VARIÁVEIS ========= */
let dataHoje = new Date().toISOString().split('T')[0];
let agendamentoAtual = null;

/* ========= AGENDA ========= */
function carregarAgenda() {
  const agenda = document.getElementById('agenda-lista');
  const titulo = document.getElementById('titulo-dia');
  if (!agenda || !titulo) return;

  agenda.innerHTML = '';
  titulo.textContent =
    'Agendamentos de ' + new Date(dataHoje).toLocaleDateString('pt-BR');

  const ags = lerLocal('agendamentos').filter(a => a.data === dataHoje);

  for (let h = 0; h < 24; h++) {
    for (let m of ['00', '30']) {
      const hora = `${String(h).padStart(2, '0')}:${m}`;
      const ag = ags.find(a => a.hora === hora);

      const div = document.createElement('div');
      div.classList.add('horario');

      if (ag) {
        div.classList.add('ocupado');
        div.innerHTML = `
          <strong>${hora}</strong><br>
          ${ag.servico}<br>
          ${ag.cliente}
        `;
        div.onclick = () => abrirDetalhes(ag);
      } else {
        div.classList.add('livre');
        div.innerHTML = `<strong>${hora}</strong> - Livre`;
        div.onclick = () => abrirModalNovo(hora);
      }

      agenda.appendChild(div);
    }
  }
}

/* ========= MODAIS ========= */
function abrirModalNovo(hora) {
  document.getElementById('hora-agendamento').value = hora;
  preencherSelects();
  document.getElementById('modal-novo').classList.add('ativo');
}

function fecharModalNovo() {
  document.getElementById('modal-novo').classList.remove('ativo');
}

function fecharModalDetalhes() {
  document.getElementById('modal-detalhes').classList.remove('ativo');
}

/* ========= SELECTS ========= */
function preencherSelects() {
  const c = document.getElementById('cliente-agendamento');
  const s = document.getElementById('servico-agendamento');
  const f = document.getElementById('funcionario-agendamento');

  if (!c || !s || !f) return;

  c.innerHTML = '<option value="">Selecione o cliente</option>';
  s.innerHTML = '<option value="">Selecione o serviço</option>';
  f.innerHTML = '';

  lerLocal('clientes').forEach(x => {
    const opt = document.createElement('option');
    opt.value = x.nome;
    opt.textContent = x.nome;
    c.appendChild(opt);
  });

  lerLocal('servicos').forEach(x => {
    const opt = document.createElement('option');
    opt.value = x.nome;
    opt.textContent = x.nome;
    s.appendChild(opt);
  });

  lerLocal('funcionarios').forEach(x => {
    const opt = document.createElement('option');
    opt.value = x.nome;
    opt.textContent = x.nome;
    f.appendChild(opt);
  });
}

/* ========= SALVAR AGENDAMENTO ========= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-agendamento');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const hora = document.getElementById('hora-agendamento').value;
    const cliente = document.getElementById('cliente-agendamento').value;
    const servico = document.getElementById('servico-agendamento').value;
    const funcionarios = [...document.getElementById('funcionario-agendamento').selectedOptions]
      .map(o => o.value);

    if (!hora || !cliente || !servico || funcionarios.length === 0) {
      alert('Preencha todos os campos');
      return;
    }

    const ags = lerLocal('agendamentos');
    ags.push({
      id: Date.now(),
      data: dataHoje,
      hora,
      cliente,
      servico,
      funcionarios,
      status: 'agendado'
    });

    salvarLocal('agendamentos', ags);
    fecharModalNovo();
    carregarAgenda();
  });

  carregarAgenda();
});

/* ========= DETALHES ========= */
function abrirDetalhes(ag) {
  agendamentoAtual = ag.id;

  document.getElementById('det-cliente').textContent = ag.cliente;
  document.getElementById('det-servico').textContent = ag.servico;
  document.getElementById('det-func').textContent = ag.funcionarios.join(', ');
  document.getElementById('det-status').textContent = ag.status;

  const cli = lerLocal('clientes').find(c => c.nome === ag.cliente);

  const btnWpp = document.getElementById('btn-whatsapp');
  const btnMaps = document.getElementById('btn-maps');

  if (cli && cli.telefone) {
    btnWpp.href = `https://wa.me/55${cli.telefone.replace(/\D/g, '')}`;
    btnWpp.style.display = 'inline-block';
  } else {
    btnWpp.style.display = 'none';
  }

  if (cli && cli.endereco) {
    btnMaps.href = `https://maps.google.com/?q=${encodeURIComponent(cli.endereco)}`;
    btnMaps.style.display = 'inline-block';
  } else {
    btnMaps.style.display = 'none';
  }

  document.getElementById('modal-detalhes').classList.add('ativo');
}

/* ========= AÇÕES ========= */
function iniciarServico() {
  atualizarStatus('em andamento');
}

function finalizarServico() {
  atualizarStatus('finalizado');
}

function cancelarAgendamento() {
  let ags = lerLocal('agendamentos');
  ags = ags.filter(a => a.id !== agendamentoAtual);
  salvarLocal('agendamentos', ags);
  fecharModalDetalhes();
  carregarAgenda();
}

function atualizarStatus(status) {
  const ags = lerLocal('agendamentos');
  const ag = ags.find(a => a.id === agendamentoAtual);
  if (!ag) return;

  ag.status = status;
  salvarLocal('agendamentos', ags);
  fecharModalDetalhes();
  carregarAgenda();
}
