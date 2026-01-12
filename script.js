/* STORAGE */
function salvarLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}
function lerLocal(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

/* AGENDA */
function inicializarAgenda() {
    if (!document.body.classList.contains('pagina-agenda')) return;

    const calendario = document.getElementById('calendario-diario');
    const titulo = document.getElementById('data-selecionada');
    const modalNovo = document.getElementById('modal-agendamento');
    const modalEditar = document.getElementById('modal-editar-agendamento');

    const hoje = new Date().toISOString().split('T')[0];
    titulo.textContent = new Date().toLocaleDateString('pt-BR');

    function gerarAgenda() {
        calendario.innerHTML = '';
        const ags = lerLocal('agendamentos').filter(a => a.data === hoje);

        for (let h = 8; h <= 18; h++) {
            ['00','30'].forEach(m => {
                const hora = `${String(h).padStart(2,'0')}:${m}`;
                const ag = ags.find(a => a.hora === hora);

                const div = document.createElement('div');
                div.className = 'horario';

                if (ag) {
                    div.textContent = `${hora} - ${ag.cliente}`;
                    div.onclick = () => abrirEdicao(ag);
                } else {
                    div.textContent = `${hora} - Livre`;
                    div.onclick = () => {
                        document.getElementById('data-agendamento').value = hoje;
                        document.getElementById('hora-agendamento').value = hora;
                        preencherSelects();
                        modalNovo.style.display = 'block';
                    };
                }
                calendario.appendChild(div);
            });
        }
    }

    function preencherSelects() {
        const c = document.getElementById('cliente-agendamento');
        const s = document.getElementById('servico-agendamento');
        const f = document.getElementById('funcionario-agendamento');

        c.innerHTML = lerLocal('clientes').map(x=>`<option>${x.nome}</option>`).join('');
        s.innerHTML = lerLocal('servicos').map(x=>`<option>${x.nome}</option>`).join('');
        f.innerHTML = lerLocal('funcionarios').map(x=>`<option>${x.nome}</option>`).join('');
    }

    function abrirEdicao(ag) {
        document.getElementById('detalhes-cliente').textContent = ag.cliente;
        document.getElementById('detalhes-servico').textContent = ag.servico;
        document.getElementById('detalhes-funcionarios').textContent = ag.funcionarios.join(', ');
        document.getElementById('detalhes-status').textContent = ag.status;
        document.getElementById('agendamento-id').value = ag.id;

        document.getElementById('botao-iniciar').style.display = ag.status === 'agendado' ? 'block' : 'none';
        document.getElementById('bloco-finalizar').style.display = ag.status === 'em andamento' ? 'block' : 'none';

        modalEditar.style.display = 'block';
    }

    document.getElementById('form-novo-agendamento').onsubmit = e => {
        e.preventDefault();
        const ags = lerLocal('agendamentos');
        ags.push({
            id: Date.now(),
            data: hoje,
            hora: document.getElementById('hora-agendamento').value,
            cliente: document.getElementById('cliente-agendamento').value,
            servico: document.getElementById('servico-agendamento').value,
            funcionarios: [...document.getElementById('funcionario-agendamento').selectedOptions].map(o=>o.value),
            status: 'agendado'
        });
        salvarLocal('agendamentos', ags);
        modalNovo.style.display = 'none';
        gerarAgenda();
    };

    document.getElementById('botao-iniciar').onclick = () => {
        const id = document.getElementById('agendamento-id').value;
        const ags = lerLocal('agendamentos');
        ags.find(a=>a.id==id).status='em andamento';
        salvarLocal('agendamentos', ags);
        modalEditar.style.display='none';
        gerarAgenda();
    };

    document.getElementById('botao-finalizar').onclick = () => {
        const id = document.getElementById('agendamento-id').value;
        const ags = lerLocal('agendamentos');
        ags.find(a=>a.id==id).status='finalizado';
        salvarLocal('agendamentos', ags);
        modalEditar.style.display='none';
        gerarAgenda();
    };

    document.getElementById('botao-cancelar').onclick = () => {
        let ags = lerLocal('agendamentos');
        ags = ags.filter(a=>a.id!=document.getElementById('agendamento-id').value);
        salvarLocal('agendamentos', ags);
        modalEditar.style.display='none';
        gerarAgenda();
    };

    document.getElementById('fechar-modal').onclick = ()=>modalNovo.style.display='none';
    document.getElementById('fechar-modal-edicao').onclick = ()=>modalEditar.style.display='none';

    gerarAgenda();
}

/* FUNCIONÁRIOS */
function inicializarFuncionarios() {
    if (!document.body.classList.contains('pagina-funcionarios')) return;
    const lista = document.getElementById('lista-funcionarios');
    lista.innerHTML = lerLocal('funcionarios').map(f =>
        `<div>${f.nome} - ${f.comissao}%</div>`
    ).join('');
}

document.addEventListener('DOMContentLoaded', ()=>{
    inicializarAgenda();
    inicializarFuncionarios();
});
