/* ========= STORAGE ========= */
function salvarLocal(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}
function lerLocal(chave) {
  return JSON.parse(localStorage.getItem(chave)) || [];
}

/* ========= AGENDA ========= */
let dataHoje = new Date().toISOString().split('T')[0];
let agendamentoAtual = null;

function carregarAgenda() {
  const agenda = document.getElementById('agenda-lista');
  if (!agenda) return;

  agenda.innerHTML = '';
  document.getElementById('titulo-dia').innerText =
    'Agendamentos de ' + new Date().toLocaleDateString('pt-BR');

  const ags = lerLocal('agendamentos').filter(a => a.data === dataHoje);

  for (let h = 8; h <= 17; h++) {
    ['00','30'].forEach(m => {
      const hora = `${String(h).padStart(2,'0')}:${m}`;
      const ag = ags.find(a => a.hora === hora);

      const div = document.createElement('div');
      div.className = ag ? 'slot ocupado' : 'slot livre';

      if (ag) {
        div.innerHTML = `<b>${hora}</b> - ${ag.servico}<br>${ag.cliente}`;
        div.onclick = () => abrirDetalhes(ag);
      } else {
        div.innerHTML = `<b>${hora}</b> - Livre`;
        div.onclick = () => abrirModalNovo(hora);
      }

      agenda.appendChild(div);
    });
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

  c.innerHTML = '<option value="">Cliente</option>';
  s.innerHTML = '<option value="">Serviço</option>';
  f.innerHTML = '';

  lerLocal('clientes').forEach(x => c.innerHTML += `<option>${x.nome}</option>`);
  lerLocal('servicos').forEach(x => s.innerHTML += `<option>${x.nome}</option>`);
  lerLocal('funcionarios').forEach(x => f.innerHTML += `<option>${x.nome}</option>`);
}

/* ========= SALVAR ========= */
document.getElementById('form-agendamento')?.addEventListener('submit', e => {
  e.preventDefault();

  const ags = lerLocal('agendamentos');
  ags.push({
    id: Date.now(),
    data: dataHoje,
    hora: hora-agendamento.value,
    cliente: cliente-agendamento.value,
    servico: servico-agendamento.value,
    funcionarios: [...funcionario-agendamento.selectedOptions].map(o=>o.value),
    status: 'agendado'
  });

  salvarLocal('agendamentos', ags);
  fecharModalNovo();
  carregarAgenda();
});

/* ========= DETALHES ========= */
function abrirDetalhes(ag) {
  agendamentoAtual = ag.id;

  det-cliente.innerText = ag.cliente;
  det-servico.innerText = ag.servico;
  det-func.innerText = ag.funcionarios.join(', ');
  det-status.innerText = ag.status;

  const cli = lerLocal('clientes').find(c => c.nome === ag.cliente);
  if (cli) {
    btn-whatsapp.href = `https://wa.me/55${cli.telefone.replace(/\D/g,'')}`;
    btn-maps.href = `https://maps.google.com/?q=${encodeURIComponent(cli.endereco)}`;
  }

  modal-detalhes.classList.add('ativo');
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

/* ========= INIT ========= */
document.addEventListener('DOMContentLoaded', carregarAgenda);
