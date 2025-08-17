// Funções para salvar e carregar dados do localStorage
function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function carregarDados(chave, valorPadrao = []) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : valorPadrao;
}

// Dados de exemplo (simulando um "banco de dados" local)
// ATENÇÃO: A estrutura dos clientes foi alterada para um array de objetos
let clientes = carregarDados('clientes', [
    { id: 'cli-1', nome: 'Wagner', telefone: '21987654321', endereco: 'Rua A, 123' },
    { id: 'cli-2', nome: 'João', telefone: '21987654322', endereco: 'Av. Principal, 456' },
    { id: 'cli-3', nome: 'Maria', telefone: '', endereco: '' },
    { id: 'cli-4', nome: 'Pedro', telefone: '', endereco: '' }
]);

let agendamentos = carregarDados('agendamentos', [
    {
        id: 'agendamento-0800',
        data: '2025-08-15', // Exemplo com data real para testar
        horario: '08:00',
        cliente: 'Wagner',
        telefone: '21987654321',
        endereco: 'Rua Exemplo, 123, Rio de Janeiro',
        servico: 'Montagem de 50',
        funcionarios: ['Arthur'],
        status: 'agendado'
    },
    {
        id: 'agendamento-1000',
        data: '2025-08-15',
        horario: '10:00',
        cliente: 'João',
        telefone: '21987654322',
        endereco: 'Av. Principal, 456, Rio de Janeiro',
        servico: 'Manutenção de 100',
        funcionarios: ['Arthur'],
        status: 'finalizado',
        duracao: '01:30:00'
    }
]);

let servicos = carregarDados('servicos', ['Montagem de 50', 'Manutenção de 100', 'Formatação', 'Instalação']);
let funcionarios = carregarDados('funcionarios', ['Arthur', 'Beatriz', 'Carlos', 'Diana']);


// Lógica para a página de cadastro (index.html)
if (document.body.classList.contains('pagina-cadastro')) {
    const formCliente = document.getElementById('form-cadastro-cliente');
    const formServico = document.getElementById('form-cadastro-servico');
    const formFuncionario = document.getElementById('form-cadastro-funcionario');

    formCliente.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-cliente').value;
        const clienteExistente = clientes.some(c => c.nome === nome);
        if (!clienteExistente) {
            const novoCliente = {
                id: `cli-${Date.now()}`,
                nome: nome,
                telefone: '',
                endereco: ''
            };
            clientes.push(novoCliente);
            salvarDados('clientes', clientes);
            alert(`Cliente "${nome}" cadastrado com sucesso!`);
            formCliente.reset();
        } else {
            alert(`Cliente "${nome}" já existe.`);
        }
    });

    formServico.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-servico').value;
        if (!servicos.includes(nome)) {
            servicos.push(nome);
            salvarDados('servicos', servicos);
            alert(`Serviço "${nome}" cadastrado com sucesso!`);
            formServico.reset();
        } else {
            alert(`Serviço "${nome}" já existe.`);
        }
    });

    formFuncionario.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-funcionario').value;
        if (!funcionarios.includes(nome)) {
            funcionarios.push(nome);
            salvarDados('funcionarios', funcionarios);
            alert(`Funcionário "${nome}" cadastrado com sucesso!`);
            formFuncionario.reset();
        } else {
            alert(`Funcionário "${nome}" já existe.`);
        }
    });
}

// Lógica para a página de agenda (agenda.html)
if (document.body.classList.contains('pagina-agenda')) {
    const formNovoAgendamento = document.getElementById('form-novo-agendamento');
    const modalAgendamento = document.getElementById('modal-agendamento');
    const fecharNovoAgendamentoBtn = document.getElementById('fechar-modal');
    const modalEditar = document.getElementById('modal-editar-agendamento');
    const fecharModalEdicaoBtn = document.getElementById('fechar-modal-edicao');
    const botaoAlterarDados = document.getElementById('botao-alterar-dados');
    const formAlterarDados = document.getElementById('form-alterar-dados');
    const detalhesAgendamento = document.getElementById('detalhes-agendamento');
    const botoesEdicao = document.getElementById('botoes-edicao');
    const botaoVoltar = document.getElementById('botao-voltar');
    const formFluxo = document.getElementById('form-fluxo');
    const tituloModalEdicao = document.getElementById('titulo-modal-edicao');
    const detalhesDuracao = document.getElementById('detalhes-duracao');
    const botaoCancelar = document.getElementById('botao-cancelar');
    const botaoReverter = document.getElementById('botao-reverter');
    const dataSelecionadaH2 = document.getElementById('data-selecionada');
    const diasDaSemanaDiv = document.getElementById('dias-da-semana');
    const botaoIniciar = document.getElementById('botao-iniciar');
    const blocoFinalizar = document.getElementById('bloco-finalizar');
    const botaoFinalizar = document.getElementById('botao-finalizar');
    const valorTimer = document.getElementById('valor-timer');
    const timerServico = document.getElementById('timer-servico');
    
    let agendamentoSelecionadoId = null;
    let dataAtual = new Date();
    let intervaloTimer = null;
    let tempoInicial = 0;

    formNovoAgendamento.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = document.getElementById('data-agendamento').value;
        const horario = document.getElementById('hora-agendamento').value;
        const clienteNome = document.getElementById('cliente-agendamento').value;
        const servico = document.getElementById('servico-agendamento').value;
        const funcionariosSelecionados = Array.from(document.getElementById('funcionario-agendamento').selectedOptions).map(option => option.value);

        const clienteSelecionado = clientes.find(c => c.nome === clienteNome);

        const novoAgendamento = {
            id: `agendamento-${Date.now()}`,
            data: data,
            horario: horario,
            cliente: clienteNome,
            telefone: clienteSelecionado ? clienteSelecionado.telefone : '',
            endereco: clienteSelecionado ? clienteSelecionado.endereco : '',
            servico: servico,
            funcionarios: funcionariosSelecionados,
            status: 'agendado'
        };

        agendamentos.push(novoAgendamento);
        salvarDados('agendamentos', agendamentos);
        criarAgendaDiaria(dataAtual);
        modalAgendamento.classList.remove('ativo');
        alert('Agendamento salvo com sucesso!');
        formNovoAgendamento.reset();
    });

    fecharNovoAgendamentoBtn.addEventListener('click', () => {
        modalAgendamento.classList.remove('ativo');
    });

    fecharModalEdicaoBtn.addEventListener('click', () => {
        modalEditar.classList.remove('ativo');
    });

    botaoAlterarDados.addEventListener('click', () => {
        detalhesAgendamento.style.display = 'none';
        formFluxo.style.display = 'none';
        formAlterarDados.style.display = 'block';
        botoesEdicao.style.display = 'none';
        tituloModalEdicao.textContent = 'Editar Atendimento';
    });

    botaoVoltar.addEventListener('click', () => {
        detalhesAgendamento.style.display = 'block';
        formFluxo.style.display = 'block';
        formAlterarDados.style.display = 'none';
        botoesEdicao.style.display = 'flex';
        tituloModalEdicao.textContent = 'Detalhes do Agendamento';
    });

    botaoCancelar.addEventListener('click', () => {
        if (agendamentoSelecionadoId && confirm('Tem certeza que deseja cancelar este agendamento?')) {
            agendamentos = agendamentos.filter(agendamento => agendamento.id !== agendamentoSelecionadoId);
            salvarDados('agendamentos', agendamentos);
            criarAgendaDiaria(dataAtual);
            alert('Agendamento cancelado com sucesso!');
            modalEditar.classList.remove('ativo');
        }
    });

    botaoReverter.addEventListener('click', () => {
        if (agendamentoSelecionadoId && confirm('Tem certeza que deseja reverter este agendamento para o status "Agendado"?')) {
            const agendamento = agendamentos.find(a => a.id === agendamentoSelecionadoId);
            if (agendamento) {
                agendamento.status = 'agendado';
                agendamento.duracao = '';
                salvarDados('agendamentos', agendamentos);
                criarAgendaDiaria(dataAtual);
                alert('Agendamento revertido com sucesso!');
                modalEditar.classList.remove('ativo');
            }
        }
    });

    formAlterarDados.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('agendamento-id').value;
        const dataHora = document.getElementById('data-hora-edicao').value;
        const clienteNome = document.getElementById('cliente-edicao').value;
        const servico = document.getElementById('servico-edicao').value;
        const funcionariosSelecionados = Array.from(document.getElementById('funcionario-edicao').selectedOptions).map(option => option.value);
    
        const agendamento = agendamentos.find(a => a.id === id);
        if (agendamento) {
            const novaData = new Date(dataHora);
            const clienteSelecionado = clientes.find(c => c.nome === clienteNome);

            agendamento.data = novaData.toISOString().split('T')[0];
            agendamento.horario = novaData.toTimeString().substring(0, 5);
            agendamento.cliente = clienteNome;
            agendamento.telefone = clienteSelecionado ? clienteSelecionado.telefone : agendamento.telefone;
            agendamento.endereco = clienteSelecionado ? clienteSelecionado.endereco : agendamento.endereco;
            agendamento.servico = servico;
            agendamento.funcionarios = funcionariosSelecionados;
            salvarDados('agendamentos', agendamentos);
        }
    
        criarAgendaDiaria(dataAtual);
        alert('Agendamento alterado com sucesso!');
        modalEditar.classList.remove('ativo');
    });

    function preencherSelects(selectId, options) {
        const selectElement = document.getElementById(selectId);
        selectElement.innerHTML = '';
        if (selectId.includes('agendamento')) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `Selecione um ${selectId.replace('-agendamento', '')}`;
            selectElement.appendChild(defaultOption);
        }
        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            selectElement.appendChild(option);
        });
    }
    
    function preencherSelectsEdicao() {
        const clienteSelect = document.getElementById('cliente-edicao');
        const servicoSelect = document.getElementById('servico-edicao');
        const funcionarioSelect = document.getElementById('funcionario-edicao');

        clienteSelect.innerHTML = '';
        servicoSelect.innerHTML = '';
        funcionarioSelect.innerHTML = '';

        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.nome;
            option.textContent = cliente.nome;
            clienteSelect.appendChild(option);
        });

        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico;
            option.textContent = servico;
            servicoSelect.appendChild(option);
        });

        funcionarios.forEach(funcionario => {
            const option = document.createElement('option');
            option.value = funcionario;
            option.textContent = funcionario;
            funcionarioSelect.appendChild(option);
        });
    }

    // Funções para o timer
    function formatarTempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const secs = segundos % 60;
        return [horas, minutos, secs]
            .map(v => v < 10 ? "0" + v : v)
            .join(":");
    }

    function iniciarTimer() {
        if (intervaloTimer) clearInterval(intervaloTimer);
        tempoInicial = Math.floor(Date.now() / 1000); // Tempo em segundos
        valorTimer.textContent = "00:00:00";
        timerServico.style.display = 'block';

        intervaloTimer = setInterval(() => {
            const tempoAtual = Math.floor(Date.now() / 1000);
            const tempoDecorrido = tempoAtual - tempoInicial;
            valorTimer.textContent = formatarTempo(tempoDecorrido);
        }, 1000);
    }
    
    function pararTimer() {
        if (intervaloTimer) {
            clearInterval(intervaloTimer);
            intervaloTimer = null;
        }
        const tempoFinal = Math.floor(Date.now() / 1000);
        const duracao = tempoFinal - tempoInicial;
        return formatarTempo(duracao);
    }

    function abrirModalComDetalhes(agendamento) {
        agendamentoSelecionadoId = agendamento.id;

        formAlterarDados.style.display = 'none';
        detalhesAgendamento.style.display = 'block';
        botoesEdicao.style.display = 'flex';
        
        document.getElementById('detalhes-cliente').textContent = agendamento.cliente;
        document.getElementById('detalhes-telefone').textContent = agendamento.telefone || 'N/A';
        document.getElementById('detalhes-endereco').textContent = agendamento.endereco || 'N/A';
        document.getElementById('detalhes-servico').textContent = agendamento.servico;
        document.getElementById('detalhes-funcionarios').textContent = agendamento.funcionarios.join(', ');
        document.getElementById('detalhes-status').textContent = agendamento.status;
        
        preencherSelectsEdicao();
        document.getElementById('agendamento-id').value = agendamento.id;
        document.getElementById('cliente-edicao').value = agendamento.cliente;
        document.getElementById('servico-edicao').value = agendamento.servico;

        const funcionariosSelecionados = Array.from(document.getElementById('funcionario-edicao').options);
        funcionariosSelecionados.forEach(option => {
            if (agendamento.funcionarios.includes(option.value)) {
                option.selected = true;
            } else {
                option.selected = false;
            }
        });

        // Garantir que os botões de ação rápida estejam visíveis
        const botoesAcaoRapida = document.querySelector('.botoes-acao-rapida');
        botoesAcaoRapida.style.display = 'flex';
        
        const telefoneFormatado = agendamento.telefone ? agendamento.telefone.replace(/\D/g, '') : '';
        document.getElementById('botao-whatsapp').href = `https://wa.me/55${telefoneFormatado}`;
        document.getElementById('botao-maps').href = `http://googleusercontent.com/maps.google.com/4{encodeURIComponent(agendamento.endereco)}`;
        
        if (agendamento.status === 'agendado') {
            tituloModalEdicao.textContent = 'Detalhes do Agendamento';
            botaoIniciar.style.display = 'block';
            blocoFinalizar.style.display = 'none';
            detalhesDuracao.style.display = 'none';
            formFluxo.style.display = 'block';
            botaoReverter.style.display = 'none';
            timerServico.style.display = 'none';
            botaoAlterarDados.style.display = 'block';
            botaoCancelar.style.display = 'block';
        } else if (agendamento.status === 'iniciado') {
            tituloModalEdicao.textContent = 'Serviço em Andamento';
            botaoIniciar.style.display = 'none';
            blocoFinalizar.style.display = 'block';
            detalhesDuracao.style.display = 'none';
            formFluxo.style.display = 'block';
            botaoReverter.style.display = 'none';
            timerServico.style.display = 'block';
            botaoAlterarDados.style.display = 'none';
            botaoCancelar.style.display = 'none';
            iniciarTimer(); // Reinicia o timer ao abrir o modal
        } else if (agendamento.status === 'finalizado') {
            tituloModalEdicao.textContent = 'Serviço Finalizado';
            botaoIniciar.style.display = 'none';
            blocoFinalizar.style.display = 'none';
            detalhesDuracao.style.display = 'block';
            document.getElementById('valor-duracao').textContent = agendamento.duracao;
            formFluxo.style.display = 'none';
            botaoReverter.style.display = 'block';
            timerServico.style.display = 'none';
            botaoAlterarDados.style.display = 'none';
            botaoCancelar.style.display = 'none';
        }

        modalEditar.classList.add('ativo');
    }

    // Event listeners dos botões de fluxo de trabalho
    botaoIniciar.addEventListener('click', () => {
        const agendamento = agendamentos.find(a => a.id === agendamentoSelecionadoId);
        if (agendamento) {
            agendamento.status = 'iniciado';
            salvarDados('agendamentos', agendamentos);
            iniciarTimer();
            alert('Serviço iniciado!');
            // Atualiza a exibição do modal para mostrar o bloco de finalizar
            abrirModalComDetalhes(agendamento);
        }
    });

    botaoFinalizar.addEventListener('click', () => {
        const agendamento = agendamentos.find(a => a.id === agendamentoSelecionadoId);
        if (agendamento) {
            const duracao = pararTimer();
            agendamento.status = 'finalizado';
            agendamento.duracao = duracao;
            // Lógica para a foto do serviço
            const fotoInput = document.getElementById('foto-servico');
            if (fotoInput.files.length > 0) {
                // Aqui você pode adicionar a lógica para fazer upload da foto para o Firebase Storage
                // ou apenas registrar que uma foto foi tirada.
                console.log('Foto capturada, mas não salva. Implementar lógica de upload.');
            }
            salvarDados('agendamentos', agendamentos);
            alert(`Serviço finalizado! Duração: ${duracao}`);
            criarAgendaDiaria(dataAtual);
            modalEditar.classList.remove('ativo');
        }
    });

    function abrirModalNovoAgendamento(horario, data) {
        modalAgendamento.classList.add('ativo');
        document.getElementById('data-agendamento').value = data;
        document.getElementById('hora-agendamento').value = horario;
        preencherSelects('cliente-agendamento', clientes.map(c => c.nome));
        preencherSelects('servico-agendamento', servicos);
        preencherSelects('funcionario-agendamento', funcionarios);
    }

    function criarAgendaDiaria(data) {
        const calendarioDiario = document.getElementById('calendario-diario');
        calendarioDiario.innerHTML = '';

        const horarios = [];
        for (let i = 0; i < 24; i++) {
            horarios.push(`${String(i).padStart(2, '0')}:00`);
            horarios.push(`${String(i).padStart(2, '0')}:30`);
        }
        
        const dataFormatada = data.toISOString().split('T')[0];

        horarios.forEach(horario => {
            const horarioDiv = document.createElement('div');
            horarioDiv.classList.add('horario');
            horarioDiv.textContent = horario;
            calendarioDiario.appendChild(horarioDiv);

            const agendamentoDoHorario = agendamentos.find(a => a.horario === horario && a.data === dataFormatada);
            
            const agendamentoDiv = document.createElement('div');
            agendamentoDiv.classList.add('bloco-agendamento');

            if (agendamentoDoHorario) {
                agendamentoDiv.classList.add('agendado');
                agendamentoDiv.innerHTML = `
                    <span>${agendamentoDoHorario.horario} - ${agendamentoDoHorario.servico}</span>
                    <span>Cliente: ${agendamentoDoHorario.cliente}</span>
                    <span>Funcionário(s): ${agendamentoDoHorario.funcionarios.join(', ')}</span>
                `;
                agendamentoDiv.addEventListener('click', () => {
                    abrirModalComDetalhes(agendamentoDoHorario);
                });
            } else {
                agendamentoDiv.innerHTML = `<span>${horario} - Livre</span>`;
                agendamentoDiv.addEventListener('click', () => {
                    abrirModalNovoAgendamento(horario, dataFormatada);
                });
            }
            calendarioDiario.appendChild(agendamentoDiv);
        });
    }
    
    function criarNavegacaoSemanal() {
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        diasDaSemanaDiv.innerHTML = '';
        
        const hoje = new Date();
        const dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 15);

        for (let i = 0; i < 30; i++) {
            const dataDoDia = new Date(dataInicial);
            dataDoDia.setDate(dataInicial.getDate() + i);
            
            const diaDiv = document.createElement('div');
            diaDiv.classList.add('dia-semana');
            
            const diaSemana = dias[dataDoDia.getDay()];
            const diaMes = dataDoDia.getDate();
            
            diaDiv.innerHTML = `<span>${diaSemana}</span><span>${diaMes}</span>`;
            
            const dataFormatada = dataDoDia.toISOString().split('T')[0];
            const hojeFormatado = hoje.toISOString().split('T')[0];
            
            if (dataFormatada === hojeFormatado) {
                diaDiv.classList.add('ativo');
            }
            
            diaDiv.addEventListener('click', () => {
                dataAtual = dataDoDia;
                document.querySelectorAll('.dia-semana').forEach(d => d.classList.remove('ativo'));
                diaDiv.classList.add('ativo');
                criarAgendaDiaria(dataAtual);
            });
            
            diasDaSemanaDiv.appendChild(diaDiv);
        }
    }

    // Lógica para a página de clientes (clientes.html)
    if (document.body.classList.contains('pagina-clientes')) {
        const tabelaClientesBody = document.querySelector('#tabela-clientes tbody');
        const modalEditarCliente = document.getElementById('modal-editar-cliente');
        const fecharModalClienteBtn = document.getElementById('fechar-modal-cliente');
        const formEditarCliente = document.getElementById('form-editar-cliente');

        function renderizarClientes() {
            tabelaClientesBody.innerHTML = '';
            clientes.forEach(cliente => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cliente.nome}</td>
                    <td>${cliente.telefone || 'N/A'}</td>
                    <td>${cliente.endereco || 'N/A'}</td>
                    <td>
                        <button class="btn-editar" data-id="${cliente.id}">Editar</button>
                        <button class="btn-excluir" data-id="${cliente.id}">Excluir</button>
                    </td>
                `;
                tabelaClientesBody.appendChild(tr);
            });

            // Adiciona event listeners para os botões de editar e excluir
            document.querySelectorAll('.btn-editar').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const clienteParaEditar = clientes.find(c => c.id === id);
                    if (clienteParaEditar) {
                        document.getElementById('cliente-id').value = clienteParaEditar.id;
                        document.getElementById('nome-cliente-edicao').value = clienteParaEditar.nome;
                        document.getElementById('telefone-cliente-edicao').value = clienteParaEditar.telefone;
                        document.getElementById('endereco-cliente-edicao').value = clienteParaEditar.endereco;
                        modalEditarCliente.classList.add('ativo');
                    }
                });
            });

            document.querySelectorAll('.btn-excluir').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm('Tem certeza que deseja excluir este cliente?')) {
                        clientes = clientes.filter(c => c.id !== id);
                        salvarDados('clientes', clientes);
                        renderizarClientes();
                    }
                });
            });
        }
        
        formEditarCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('cliente-id').value;
            const nome = document.getElementById('nome-cliente-edicao').value;
            const telefone = document.getElementById('telefone-cliente-edicao').value;
            const endereco = document.getElementById('endereco-cliente-edicao').value;
            
            const clienteParaAtualizar = clientes.find(c => c.id === id);
            if (clienteParaAtualizar) {
                clienteParaAtualizar.nome = nome;
                clienteParaAtualizar.telefone = telefone;
                clienteParaAtualizar.endereco = endereco;
                salvarDados('clientes', clientes);
                renderizarClientes();
                modalEditarCliente.classList.remove('ativo');
                alert('Cliente atualizado com sucesso!');
            }
        });

        fecharModalClienteBtn.addEventListener('click', () => {
            modalEditarCliente.classList.remove('ativo');
        });

        renderizarClientes();
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.classList.contains('pagina-agenda')) {
            criarNavegacaoSemanal();
            criarAgendaDiaria(dataAtual);
        }
    });

}
