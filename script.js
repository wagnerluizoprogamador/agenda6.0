// Acessando as variáveis globais 'db' e 'auth' do window (definidas no HTML)
const db = window.db;

document.addEventListener('DOMContentLoaded', () => {
    // Referências do DOM
    const formNovoAgendamento = document.getElementById('form-novo-agendamento');
    const formCadastroCliente = document.getElementById('form-cadastro-cliente');
    const formCadastroServico = document.getElementById('form-cadastro-servico');
    const formCadastroFuncionario = document.getElementById('form-cadastro-funcionario');
    const listaClientes = document.getElementById('lista-clientes');
    const listaServicos = document.getElementById('lista-servicos');
    const listaFuncionarios = document.getElementById('lista-funcionarios');
    const calendarioDiario = document.getElementById('calendario-diario');
    const diasDaSemanaDiv = document.getElementById('dias-da-semana');
    const dataSelecionadaH2 = document.getElementById('data-selecionada');
    const modalAgendamento = document.getElementById('modal-agendamento');
    const fecharModalBtn = document.getElementById('fechar-modal');
    const dataAgendamentoInput = document.getElementById('data-agendamento');
    const horaAgendamentoInput = document.getElementById('hora-agendamento');
    const clienteAgendamentoSelect = document.getElementById('cliente-agendamento');
    const servicoAgendamentoSelect = document.getElementById('servico-agendamento');
    const funcionarioAgendamentoSelect = document.getElementById('funcionario-agendamento');
    const telefoneAgendamentoInput = document.getElementById('telefone-agendamento');
    const enderecoAgendamentoInput = document.getElementById('endereco-agendamento');

    const modalEdicaoAgendamento = document.getElementById('modal-editar-agendamento');
    const fecharModalEdicaoBtn = document.getElementById('fechar-modal-edicao');
    const detalhesClienteSpan = document.getElementById('detalhes-cliente');
    const detalhesTelefoneSpan = document.getElementById('detalhes-telefone');
    const detalhesEnderecoSpan = document.getElementById('detalhes-endereco');
    const detalhesServicoSpan = document.getElementById('detalhes-servico');
    const detalhesFuncionariosSpan = document.getElementById('detalhes-funcionarios');
    const detalhesStatusSpan = document.getElementById('detalhes-status');
    const detalhesDuracao = document.getElementById('detalhes-duracao');
    const valorDuracao = document.getElementById('valor-duracao');
    const timerServico = document.getElementById('timer-servico');
    const valorTimer = document.getElementById('valor-timer');
    const botaoIniciar = document.getElementById('botao-iniciar');
    const botaoFinalizar = document.getElementById('botao-finalizar');
    const blocoFinalizar = document.getElementById('bloco-finalizar');
    const fotoServicoInput = document.getElementById('foto-servico');
    const botaoWhatsapp = document.getElementById('botao-whatsapp');
    const botaoMaps = document.getElementById('botao-maps');
    const botoesEdicao = document.getElementById('botoes-edicao');
    const botaoAlterarDados = document.getElementById('botao-alterar-dados');
    const botaoReverter = document.getElementById('botao-reverter');
    const botaoCancelar = document.getElementById('botao-cancelar');
    const formAlterarDados = document.getElementById('form-alterar-dados');
    const agendamentoIdInput = document.getElementById('agendamento-id');
    const dataHoraEdicaoInput = document.getElementById('data-hora-edicao');
    const clienteEdicaoSelect = document.getElementById('cliente-edicao');
    const servicoEdicaoSelect = document.getElementById('servico-edicao');
    const funcionarioEdicaoSelect = document.getElementById('funcionario-edicao');
    const botaoVoltar = document.getElementById('botao-voltar');

    let agendamentoAtual = null;
    let timerInterval = null;

    // --- Funções de interação com o Firebase ---

    // Função genérica para salvar um novo item
    const salvarItem = async (colecao, dados) => {
        try {
            const docRef = await db.collection(colecao).add({
                ...dados,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("Documento escrito com ID: ", docRef.id);
            return docRef;
        } catch (e) {
            console.error("Erro ao adicionar documento: ", e);
            alert("Erro ao salvar. Verifique o console para mais detalhes.");
        }
    };

    // Função genérica para buscar todos os itens de uma coleção
    const buscarItens = async (colecao) => {
        const snapshot = await db.collection(colecao).orderBy('nome').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    // Função para renderizar listas
    const renderizarLista = (listaElemento, itens) => {
        if (!listaElemento) return;
        listaElemento.innerHTML = '';
        if (itens.length === 0) {
            listaElemento.innerHTML = '<p>Nenhum item cadastrado.</p>';
            return;
        }
        itens.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.nome;
            li.dataset.id = item.id;
            li.dataset.nome = item.nome;
            li.classList.add('item-lista');
            listaElemento.appendChild(li);
        });
    };

    // Função para popular selects
    const popularSelect = (selectElemento, itens) => {
        selectElemento.innerHTML = '<option value="">Selecione...</option>';
        itens.forEach(item => {
            const option = document.createElement('option');
            option.value = item.nome;
            option.textContent = item.nome;
            selectElemento.appendChild(option);
        });
    };

    // Função para popular selects de funcionários com múltiplos
    const popularSelectFuncionarios = (selectElemento, itens) => {
        selectElemento.innerHTML = '';
        itens.forEach(item => {
            const option = document.createElement('option');
            option.value = item.nome;
            option.textContent = item.nome;
            selectElemento.appendChild(option);
        });
    };

    // --- Funções de renderização da Agenda ---

    const renderizarCalendarioDiario = async (data) => {
        if (!calendarioDiario || !db) return;

        const dataFormatada = formatarDataParaFirestore(data);
        dataSelecionadaH2.textContent = `Agendamentos para ${formatarDataParaExibicao(data)}`;

        calendarioDiario.innerHTML = '';
        const agendamentosRef = db.collection('agendamentos').where('data', '==', dataFormatada);

        const snapshot = await agendamentosRef.get();
        const agendamentos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const horarios = gerarHorarios();

        horarios.forEach(hora => {
            const agendamentosNoHorario = agendamentos.filter(a => a.hora === hora);
            const slotElement = document.createElement('div');
            slotElement.classList.add('horario-slot');
            slotElement.dataset.hora = hora;
            slotElement.dataset.data = dataFormatada;

            let htmlConteudo = `<div class="horario">${hora}</div><div class="agendamento-info">`;

            if (agendamentosNoHorario.length > 0) {
                agendamentosNoHorario.forEach(agendamento => {
                    const statusClass = agendamento.status === 'agendado' ? 'agendado' : agendamento.status === 'iniciado' ? 'iniciado' : 'finalizado';
                    htmlConteudo += `
                        <div class="agendamento-card ${statusClass}" data-id="${agendamento.id}">
                            <span>${hora} - ${agendamento.servico}</span>
                            <span>Cliente: ${agendamento.cliente}</span>
                            <span>Funcionário(s): ${agendamento.funcionarios.join(', ')}</span>
                        </div>
                    `;
                });
            } else {
                htmlConteudo += `<span>Livre</span>`;
            }

            htmlConteudo += `</div>`;
            slotElement.innerHTML = htmlConteudo;
            calendarioDiario.appendChild(slotElement);
        });
    };

    const renderizarDiasDaSemana = (data) => {
        if (!diasDaSemanaDiv) return;

        const hoje = new Date();
        const diaDaSemana = data.getDay();
        const inicioSemana = new Date(data);
        inicioSemana.setDate(data.getDate() - diaDaSemana);

        diasDaSemanaDiv.innerHTML = '';

        for (let i = 0; i < 7; i++) {
            const dia = new Date(inicioSemana);
            dia.setDate(inicioSemana.getDate() + i);

            const diaElemento = document.createElement('div');
            diaElemento.classList.add('dia-semana');
            if (dia.getDate() === hoje.getDate() && dia.getMonth() === hoje.getMonth() && dia.getFullYear() === hoje.getFullYear()) {
                diaElemento.classList.add('hoje');
            }
            if (dia.getDate() === data.getDate() && dia.getMonth() === data.getMonth() && dia.getFullYear() === data.getFullYear()) {
                diaElemento.classList.add('ativo');
            }

            const nomeDia = dia.toLocaleDateString('pt-BR', { weekday: 'short' });
            const numeroDia = dia.getDate();
            const mes = dia.getMonth() + 1; // getMonth() é base 0

            diaElemento.innerHTML = `<span>${nomeDia}</span><br><span>${numeroDia}</span>`;
            diaElemento.dataset.data = `${dia.getFullYear()}-${String(mes).padStart(2, '0')}-${String(numeroDia).padStart(2, '0')}`;
            diasDaSemanaDiv.appendChild(diaElemento);
        }
    };

    // --- Funções Auxiliares ---

    const gerarHorarios = () => {
        const horarios = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 30) {
                const hora = String(i).padStart(2, '0');
                const minuto = String(j).padStart(2, '0');
                horarios.push(`${hora}:${minuto}`);
            }
        }
        return horarios;
    };

    const formatarDataParaFirestore = (data) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    };

    const formatarDataParaExibicao = (data) => {
        return data.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const segundosParaTempo = (segundos) => {
        const h = Math.floor(segundos / 3600);
        const m = Math.floor((segundos % 3600) / 60);
        const s = segundos % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const esconderModal = (modal) => {
        modal.classList.remove('visivel');
        agendamentoAtual = null;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    };

    // --- Lógica da Aplicação (Event Listeners) ---

    // Rotação de Páginas
    if (window.location.pathname.includes('index.html')) {
        formCadastroCliente?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome-cliente').value;
            await salvarItem('clientes', { nome });
            e.target.reset();
            alert('Cliente cadastrado com sucesso!');
        });

        formCadastroServico?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome-servico').value;
            await salvarItem('servicos', { nome });
            e.target.reset();
            alert('Serviço cadastrado com sucesso!');
        });

        formCadastroFuncionario?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome-funcionario').value;
            await salvarItem('funcionarios', { nome });
            e.target.reset();
            alert('Funcionário cadastrado com sucesso!');
        });
    }

    if (window.location.pathname.includes('clientes.html')) {
        const carregarClientes = async () => {
            const clientes = await buscarItens('clientes');
            renderizarLista(listaClientes, clientes);
        };
        carregarClientes();
    }

    if (window.location.pathname.includes('servicos.html')) {
        const carregarServicos = async () => {
            const servicos = await buscarItens('servicos');
            renderizarLista(listaServicos, servicos);
        };
        carregarServicos();
    }

    if (window.location.pathname.includes('funcionarios.html')) {
        const carregarFuncionarios = async () => {
            const funcionarios = await buscarItens('funcionarios');
            renderizarLista(listaFuncionarios, funcionarios);
        };
        carregarFuncionarios();
    }

    if (window.location.pathname.includes('agenda.html')) {
        let dataAtual = new Date();
        renderizarDiasDaSemana(dataAtual);
        renderizarCalendarioDiario(dataAtual);

        diasDaSemanaDiv.addEventListener('click', (e) => {
            if (e.target.closest('.dia-semana')) {
                const diaElemento = e.target.closest('.dia-semana');
                const dataString = diaElemento.dataset.data;
                const [ano, mes, dia] = dataString.split('-').map(Number);
                dataAtual = new Date(ano, mes - 1, dia);

                document.querySelectorAll('.dia-semana').forEach(d => d.classList.remove('ativo'));
                diaElemento.classList.add('ativo');

                renderizarCalendarioDiario(dataAtual);
            }
        });

        // Abrir modal de novo agendamento
        calendarioDiario.addEventListener('click', async (e) => {
            if (e.target.classList.contains('horario-slot') || e.target.closest('.horario-slot')) {
                const slot = e.target.closest('.horario-slot');
                const hora = slot.dataset.hora;
                const data = slot.dataset.data;

                const agendamentoExistente = await db.collection('agendamentos')
                    .where('data', '==', data)
                    .where('hora', '==', hora)
                    .get();

                if (agendamentoExistente.empty) {
                    const clientes = await buscarItens('clientes');
                    popularSelect(clienteAgendamentoSelect, clientes);
                    const servicos = await buscarItens('servicos');
                    popularSelect(servicoAgendamentoSelect, servicos);
                    const funcionarios = await buscarItens('funcionarios');
                    popularSelectFuncionarios(funcionarioAgendamentoSelect, funcionarios);

                    dataAgendamentoInput.value = data;
                    horaAgendamentoInput.value = hora;
                    modalAgendamento.classList.add('visivel');
                }
            }
        });

        // Abrir modal de detalhes do agendamento
        calendarioDiario.addEventListener('click', async (e) => {
            const card = e.target.closest('.agendamento-card');
            if (card) {
                const agendamentoId = card.dataset.id;
                const doc = await db.collection('agendamentos').doc(agendamentoId).get();
                agendamentoAtual = { id: doc.id, ...doc.data() };

                detalhesClienteSpan.textContent = agendamentoAtual.cliente;
                detalhesTelefoneSpan.textContent = agendamentoAtual.telefone;
                detalhesEnderecoSpan.textContent = agendamentoAtual.endereco;
                detalhesServicoSpan.textContent = agendamentoAtual.servico;
                detalhesFuncionariosSpan.textContent = agendamentoAtual.funcionarios.join(', ');
                detalhesStatusSpan.textContent = agendamentoAtual.status;

                const status = agendamentoAtual.status;
                botaoIniciar.style.display = status === 'agendado' ? 'block' : 'none';
                blocoFinalizar.style.display = status === 'iniciado' ? 'block' : 'none';
                detalhesDuracao.style.display = status === 'finalizado' ? 'block' : 'none';
                timerServico.style.display = status === 'iniciado' ? 'block' : 'none';

                if (status === 'iniciado') {
                    const inicio = agendamentoAtual.inicio.toDate();
                    timerInterval = setInterval(() => {
                        const segundosDecorridos = Math.floor((new Date() - inicio) / 1000);
                        valorTimer.textContent = segundosParaTempo(segundosDecorridos);
                    }, 1000);
                }

                if (status === 'finalizado') {
                    const duracaoSegundos = agendamentoAtual.duracao || 0;
                    valorDuracao.textContent = segundosParaTempo(duracaoSegundos);
                }

                // Ações rápidas
                const telefone = agendamentoAtual.telefone.replace(/\D/g, '');
                botaoWhatsapp.href = `https://api.whatsapp.com/send?phone=55${telefone}`;
                botaoMaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agendamentoAtual.endereco)}`;

                // Botões de edição
                botaoReverter.style.display = status === 'finalizado' ? 'block' : 'none';
                formAlterarDados.style.display = 'none';
                botoesEdicao.style.display = 'flex';

                modalEdicaoAgendamento.classList.add('visivel');
            }
        });

        // Enviar novo agendamento
        formNovoAgendamento?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const agendamento = {
                data: dataAgendamentoInput.value,
                hora: horaAgendamentoInput.value,
                cliente: clienteAgendamentoSelect.value,
                telefone: telefoneAgendamentoInput.value,
                endereco: enderecoAgendamentoInput.value,
                servico: servicoAgendamentoSelect.value,
                funcionarios: Array.from(funcionarioAgendamentoSelect.selectedOptions).map(opt => opt.value),
                status: 'agendado'
            };

            await salvarItem('agendamentos', agendamento);
            esconderModal(modalAgendamento);
            renderizarCalendarioDiario(dataAtual);
            alert('Agendamento salvo com sucesso!');
        });

        // --- Eventos do modal de edição/detalhes ---

        // Botão Iniciar Serviço
        botaoIniciar?.addEventListener('click', async () => {
            if (agendamentoAtual) {
                await db.collection('agendamentos').doc(agendamentoAtual.id).update({
                    status: 'iniciado',
                    inicio: firebase.firestore.FieldValue.serverTimestamp()
                });
                esconderModal(modalEdicaoAgendamento);
                renderizarCalendarioDiario(dataAtual);
            }
        });

        // Botão Finalizar Serviço
        botaoFinalizar?.addEventListener('click', async () => {
            if (agendamentoAtual) {
                const inicio = agendamentoAtual.inicio.toDate();
                const duracao = Math.floor((new Date() - inicio) / 1000);

                let fotoUrl = null;
                if (fotoServicoInput.files[0]) {
                    // Upload da foto para o Firebase Storage (código futuro)
                    // Por enquanto, vamos ignorar
                    // const storageRef = firebase.storage().ref(`servicos/${agendamentoAtual.id}`);
                    // await storageRef.put(fotoServicoInput.files[0]);
                    // fotoUrl = await storageRef.getDownloadURL();
                }

                await db.collection('agendamentos').doc(agendamentoAtual.id).update({
                    status: 'finalizado',
                    duracao: duracao,
                    foto: fotoUrl
                });
                esconderModal(modalEdicaoAgendamento);
                renderizarCalendarioDiario(dataAtual);
            }
        });

        // Botão Reverter
        botaoReverter?.addEventListener('click', async () => {
            if (agendamentoAtual) {
                await db.collection('agendamentos').doc(agendamentoAtual.id).update({
                    status: 'agendado',
                    duracao: firebase.firestore.FieldValue.delete(),
                    inicio: firebase.firestore.FieldValue.delete()
                });
                esconderModal(modalEdicaoAgendamento);
                renderizarCalendarioDiario(dataAtual);
            }
        });

        // Botão Cancelar
        botaoCancelar?.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                if (agendamentoAtual) {
                    await db.collection('agendamentos').doc(agendamentoAtual.id).delete();
                    esconderModal(modalEdicaoAgendamento);
                    renderizarCalendarioDiario(dataAtual);
                }
            }
        });

        // Botão Alterar Dados
        botaoAlterarDados?.addEventListener('click', async () => {
            formAlterarDados.style.display = 'block';
            botoesEdicao.style.display = 'none';

            // Popular selects para edição
            const clientes = await buscarItens('clientes');
            popularSelect(clienteEdicaoSelect, clientes);
            const servicos = await buscarItens('servicos');
            popularSelect(servicoEdicaoSelect, servicos);
            const funcionarios = await buscarItens('funcionarios');
            popularSelectFuncionarios(funcionarioEdicaoSelect, funcionarios);

            // Preencher o formulário de edição com os dados atuais
            agendamentoIdInput.value = agendamentoAtual.id;
            const dataHora = new Date(`${agendamentoAtual.data}T${agendamentoAtual.hora}`);
            dataHoraEdicaoInput.value = dataHora.toISOString().slice(0, 16);
            clienteEdicaoSelect.value = agendamentoAtual.cliente;
            servicoEdicaoSelect.value = agendamentoAtual.servico;

            Array.from(funcionarioEdicaoSelect.options).forEach(option => {
                if (agendamentoAtual.funcionarios.includes(option.value)) {
                    option.selected = true;
                }
            });
        });

        // Botão Voltar do formulário de edição
        botaoVoltar?.addEventListener('click', (e) => {
            e.preventDefault();
            formAlterarDados.style.display = 'none';
            botoesEdicao.style.display = 'flex';
        });

        // Salvar alterações
        formAlterarDados?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novaDataHora = new Date(dataHoraEdicaoInput.value);
            const novaData = formatarDataParaFirestore(novaDataHora);
            const novaHora = `${String(novaDataHora.getHours()).padStart(2, '0')}:${String(novaDataHora.getMinutes()).padStart(2, '0')}`;

            const dadosAtualizados = {
                data: novaData,
                hora: novaHora,
                cliente: clienteEdicaoSelect.value,
                servico: servicoEdicaoSelect.value,
                funcionarios: Array.from(funcionarioEdicaoSelect.selectedOptions).map(opt => opt.value)
            };

            await db.collection('agendamentos').doc(agendamentoIdInput.value).update(dadosAtualizados);
            esconderModal(modalEdicaoAgendamento);
            renderizarCalendarioDiario(dataAtual);
        });

        fecharModalBtn?.addEventListener('click', () => esconderModal(modalAgendamento));
        fecharModalEdicaoBtn?.addEventListener('click', () => esconderModal(modalEdicaoAgendamento));
    }
});
