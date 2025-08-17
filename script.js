// Abrir modal de novo agendamento
calendarioDiario.addEventListener('click', async (e) => {
    // Verifica se o clique foi em um slot de horário ou em um elemento dentro dele
    if (e.target.classList.contains('horario-slot') || e.target.closest('.horario-slot')) {
        const slot = e.target.closest('.horario-slot');
        const hora = slot.dataset.hora;
        const data = slot.dataset.data;

        console.log(`Você clicou no horário ${hora} da data ${data}.`);

        // Busca no banco de dados por um agendamento já existente
        const q = query(collection(db, 'agendamentos'), where('data', '==', data), where('hora', '==', hora));
        const agendamentoExistente = await getDocs(q);

        // Se a busca retornar vazia, significa que o horário está livre
        if (agendamentoExistente.empty) {
            console.log("Nenhum agendamento encontrado no banco de dados para este horário. Prosseguindo para abrir o modal...");
            
            const clientes = await buscarItens('clientes');
            popularSelect(clienteAgendamentoSelect, clientes);
            const servicos = await buscarItens('servicos');
            popularSelect(servicoAgendamentoSelect, servicos);
            const funcionarios = await buscarItens('funcionarios');
            popularSelectFuncionarios(funcionarioAgendamentoSelect, funcionarios);

            dataAgendamentoInput.value = data;
            horaAgendamentoInput.value = hora;
            modalAgendamento.classList.add('visivel');
        } else {
            // Se a busca retornar algo, significa que o horário já está ocupado
            console.log("AGENDAMENTO JÁ EXISTE NESTE HORÁRIO. Não é possível criar um novo agendamento.");
            agendamentoExistente.forEach(doc => {
                console.log("Dados do agendamento existente:", doc.id, doc.data());
            });
        }
    }
});

// A segunda função para abrir o modal de detalhes do agendamento (mantida)
calendarioDiario.addEventListener('click', async (e) => {
    const card = e.target.closest('.agendamento-card');
    if (card) {
        const agendamentoId = card.dataset.id;
        const docRef = doc(db, 'agendamentos', agendamentoId);
        const docSnap = await getDoc(docRef);
        agendamentoAtual = { id: docSnap.id, ...docSnap.data() };
        
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
