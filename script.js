/* ======================================================
   SCRIPT FINAL ESTÁVEL – AGENDA + FINANCEIRO + COMISSÕES
   ====================================================== */

/* ================= STORAGE ================= */
function salvarLocal(k, d){localStorage.setItem(k,JSON.stringify(d))}
function lerLocal(k){return JSON.parse(localStorage.getItem(k))||[]}
const moeda=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})

let dataAtual=new Date(),timer=null

/* ================= TIMER ================= */
function iniciarTimer(i){
 const b=document.getElementById('timer-servico')
 const s=document.getElementById('valor-timer')
 if(!b||!s)return
 clearInterval(timer);b.style.display='block'
 timer=setInterval(()=>{
  const d=Math.floor((Date.now()-new Date(i))/1000)
  s.textContent=
   String(Math.floor(d/3600)).padStart(2,'0')+':' +
   String(Math.floor((d%3600)/60)).padStart(2,'0')+':' +
   String(d%60).padStart(2,'0')
 },1000)
}
function pararTimer(){
 clearInterval(timer)
 const b=document.getElementById('timer-servico')
 if(b)b.style.display='none'
}

/* ======================================================
   AGENDA
   ====================================================== */
document.addEventListener('DOMContentLoaded',()=>{
 const cal=document.getElementById('calendario-diario')
 if(!cal)return

 const modalN=document.getElementById('modal-agendamento')
 const modalE=document.getElementById('modal-editar-agendamento')

 document.getElementById('fechar-modal').onclick=()=>modalN.classList.remove('ativo')
 document.getElementById('fechar-modal-edicao').onclick=()=>{
  pararTimer();modalE.classList.remove('ativo')
 }

 function preencherSelects(){
  const c=document.getElementById('cliente-agendamento')
  const s=document.getElementById('servico-agendamento')
  const f=document.getElementById('funcionario-agendamento')

  c.innerHTML='<option value="">Cliente</option>'
  lerLocal('clientes').forEach(x=>c.innerHTML+=`<option>${x.nome}</option>`)

  s.innerHTML='<option value="">Serviço</option>'
  lerLocal('servicos').forEach(x=>s.innerHTML+=`<option>${x.nome}</option>`)

  f.innerHTML=''
  lerLocal('funcionarios').forEach(x=>f.innerHTML+=`<option>${x.nome}</option>`)
 }

 function gerarAgenda(){
  cal.innerHTML=''
  const d=dataAtual.toISOString().split('T')[0]
  document.getElementById('data-selecionada').textContent=
   'Agendamentos de '+dataAtual.toLocaleDateString('pt-BR')

  const ags=lerLocal('agendamentos').filter(a=>a.data===d)

  for(let h=0;h<24;h++)for(let m=0;m<60;m+=30){
   const hr=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
   const ag=ags.find(a=>a.hora===hr)
   const div=document.createElement('div')
   div.className='horario'
   if(ag){
    div.classList.add('ocupado')
    div.innerHTML=`<b>${hr}</b><br>${ag.cliente}`
    div.onclick=()=>abrirEdicao(ag)
   }else{
    div.innerHTML=`<b>${hr}</b> Livre`
    div.onclick=()=>{
     document.getElementById('data-agendamento').value=d
     document.getElementById('hora-agendamento').value=hr
     preencherSelects()
     modalN.classList.add('ativo')
    }
   }
   cal.appendChild(div)
  }
 }

 function abrirEdicao(ag){
  const clientes=lerLocal('clientes')
  const cli=clientes.find(c=>c.nome===ag.cliente)

  document.getElementById('detalhes-cliente').textContent=ag.cliente
  document.getElementById('detalhes-servico').textContent=ag.servico
  document.getElementById('detalhes-funcionarios').textContent=ag.funcionarios.join(', ')
  document.getElementById('detalhes-status').textContent=ag.status
  document.getElementById('agendamento-id').value=ag.id

  // WHATSAPP / MAPS
  if(cli){
   const w=document.getElementById('botao-whatsapp')
   const m=document.getElementById('botao-maps')
   w.href=cli.telefone?`https://wa.me/55${cli.telefone.replace(/\D/g,'')}`:'#'
   m.href=cli.endereco?`https://maps.google.com/?q=${encodeURIComponent(cli.endereco)}`:'#'
  }

  document.getElementById('botao-iniciar').style.display=
   ag.status==='agendado'?'block':'none'
  document.getElementById('bloco-finalizar').style.display=
   ag.status==='em andamento'?'block':'none'

  pararTimer()
  if(ag.status==='em andamento'&&ag.horaInicio)iniciarTimer(ag.horaInicio)

  modalE.classList.add('ativo')
 }

 document.getElementById('form-novo-agendamento').onsubmit=e=>{
  e.preventDefault()
  const ags=lerLocal('agendamentos')
  ags.push({
   id:Date.now(),
   data:dataAgendamento.value,
   hora:horaAgendamento.value,
   cliente:clienteAgendamento.value,
   servico:servicoAgendamento.value,
   funcionarios:[...funcionarioAgendamento.selectedOptions].map(o=>o.value),
   status:'agendado'
  })
  salvarLocal('agendamentos',ags)
  modalN.classList.remove('ativo')
  gerarAgenda()
 }

 document.getElementById('botao-iniciar').onclick=()=>{
  const ags=lerLocal('agendamentos')
  const ag=ags.find(a=>a.id==agendamentoId.value)
  ag.status='em andamento'
  ag.horaInicio=new Date().toISOString()
  salvarLocal('agendamentos',ags)
  abrirEdicao(ag);gerarAgenda()
 }

 document.getElementById('botao-finalizar').onclick=()=>{
  const ags=lerLocal('agendamentos')
  const ag=ags.find(a=>a.id==agendamentoId.value)

  const serv=lerLocal('servicos').find(s=>s.nome===ag.servico)
  const funcs=lerLocal('funcionarios')

  ag.status='finalizado'
  ag.valor=serv?serv.valor:0
  ag.comissao=0

  ag.funcionarios.forEach(f=>{
   const fu=funcs.find(x=>x.nome===f)
   if(fu)ag.comissao+=(ag.valor*fu.comissao)/100
  })

  salvarLocal('agendamentos',ags)
  pararTimer();modalE.classList.remove('ativo');gerarAgenda()
 }

 document.getElementById('botao-cancelar').onclick=()=>{
  salvarLocal('agendamentos',
   lerLocal('agendamentos').filter(a=>a.id!=agendamentoId.value))
  modalE.classList.remove('ativo');gerarAgenda()
 }

 gerarAgenda()
})

/* ======================================================
   FINANCEIRO
   ====================================================== */
document.addEventListener('DOMContentLoaded',()=>{
 if(!document.body.classList.contains('pagina-financeiro'))return

 const hoje=new Date().toISOString().split('T')[0]
 const ags=lerLocal('agendamentos').filter(a=>a.data===hoje&&a.status==='finalizado')

 let r=0,c=0
 ags.forEach(a=>{r+=a.valor||0;c+=a.comissao||0})

 document.getElementById('total-recebido').textContent=moeda(r)
 document.getElementById('total-comissao').textContent=moeda(c)
 document.getElementById('lucro-liquido').textContent=moeda(r-c)
})
