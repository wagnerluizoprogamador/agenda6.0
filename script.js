//Acessar os formulários e elementos pelo ID
const  formCadastroCliente  =  documento . getElementById ( 'formulário-cadastro-cliente' ) ;
const  formCadastroServico  =  documento . getElementById ( 'formulário-cadastro-servico' ) ;
const  formCadastroFuncionario  =  document . getElementById ( 'formulário-cadastro-funcionário' ) ;
const  formNovoAgendamento  =  documento . getElementById ( 'formulário-novo-agendamento' ) ;
const  calendárioioDiarioDiv  =  documento . getElementById ( 'calendario-diario' ) ;
const  dadosSelecionadaSpan  =  documento . getElementById ( 'dados-selecionados' ) ;
const  diasDaSemanaDiv  =  documento . getElementById ( 'dias-da-semana' ) ;

//Modos e botões de controle
const  modalAgendamento  =  document . getElementById ( 'agendamento modal' ) ;
const  fecharModalBtn  =  documento . getElementById ( 'fechar-modal' ) ;
const  modalEditarAgendamento  =  document . getElementById ( 'modal-editar-agendamento' ) ;
const  fecharModalEdicaoBtn  =  documento . getElementById ( 'fechar-modal-edição' ) ;

// Elementos do modal de edição
const  detalhesAgendamentoDiv  =  documento . getElementById ( 'detalhes-agendamento' ) ;
const  formFluxoDiv  =  document . getElementById ( 'form-fluxo' ) ;
const  blocoFinalizarDiv  =  documento . getElementById ( 'bloco-finalizar' ) ;
const  botoesEdicaoDiv  =  documento . getElementById ( 'botoes-edição' ) ;
const  formAlterarDados  =  documento . getElementById ( 'form-alterar-dados' ) ;
const  botaoAlterarDados  =  document . getElementById ( 'botão-alterar-dados' ) ;
const  botaoVoltar  =  documento . getElementById ( 'botao-voltar' ) ;

// Botões de ação do fluxo
const  botaoIniciar  =  documento . getElementById ( 'botão-iniciar' ) ;
const  botaoFinalizar  =  documento . getElementById ( 'botao-finalizar' ) ;
const  botaoCancelar  =  documento . getElementById ( 'botao-cancelar' ) ;
const  fotoServicoInput  =  documento . getElementById ( 'foto-servico' ) ;
const  timerServicoDiv  =  document . getElementById ( 'timer-servico' ) ;
const  valorTimerSpan  =  documento . getElementById ( 'valor-timer' ) ;

// Elementos de ação rápida
const  botoesAcaoRapidaDiv  =  documento . querySelector ( '.botoes-acao-rapida' ) ;
const  botaoWhatsapp  =  documento . getElementById ( 'botao-whatsapp' ) ;
const  botaoMaps  =  documento . getElementById ( 'botao-mapas' ) ;

// Variáveis globais
deixe  dataAtual  =  nova  Data ( ) ;
deixe  timerInterval ;

// --- Funções de Cadastro, Listagem e Agendamento (inalteradas) ---
se  ( formCadastroCliente )  {
    formCadastroCliente . addEventListener ( 'enviar' ,  função ( evento )  {
        evento . preventDefault ( ) ; 
        const  nome  =  documento . getElementById ( 'nome-cliente' ) . valor ;
        const  telefone  =  documento . getElementById ( 'telefone-cliente' ) . valor ;
        const  endereco  =  documento . getElementById ( 'endereco-cliente' ) . valor ;
        const  novoCliente  =  { nome , telefone , endereco } ;
        const  clientes  =  JSON . analisar ( localStorage . getItem ( 'clientes' ) )  ||  [ ] ;
        clientes . push ( novoCliente ) ;
        armazenamento local . setItem ( ' clientes ' ,  JSON.stringify ( clientes ) ) ;
        formCadastroCliente . reset ( ) ;
        alert ( 'Cliente cadastrado com sucesso!' ) ;
        preencherSelects ( ) ;
    } ) ;
}
se  ( formCadastroServico )  {
    formCadastroServico . addEventListener ( 'enviar' ,  função ( evento )  {
        evento . preventDefault ( ) ; 
        const  nome  =  documento . getElementById ( 'nome-servico' ) . valor ;
        const  duracao  =  document . getElementById ( 'duracao-servico' ) . value ;
        const  valor  =  documento . getElementById ( 'valor-serviço' ) . valor ;
        const  novoServico  =  { nome , duração , valor } ;
        const  serviços  =  JSON . parse ( localStorage . getItem ( 'serviços' ) )  ||  [ ] ;
        serviços . push ( novoServiço ) ;
        armazenamento local . setItem ( 'servicos ' ,  JSON.stringify ( servicos ) ) ) ;
        formCadastroServico . reset ( ) ;
        alert ( 'Serviço cadastrado com sucesso!' ) ;
        preencherSelects ( ) ;
    } ) ;
}
if  ( formCadastroFuncionario )  {
    formCadastroFuncionario . addEventListener ( 'submit' ,  function ( event )  {
        evento . preventDefault ( ) ;
        const  nome  =  documento . getElementById ( 'nome-funcionário' ) . valor ;
        const  comissão  =  documento . getElementById ( 'comissão-funcionamento' ) . valor ;
        const  novoFuncionario  =  { nome , comissão } ;
        const  funcionarios  =  JSON . parse ( localStorage . getItem ( 'funções' ) )  ||  [ ] ;
        funcionarios . push ( novoFuncionario ) ;
        armazenamento local . setItem ( ' funcionarios ' ,  JSON.stringify ( funcionarios ) ) ;
        formCadastroFuncionario . reset ( ) ;
        alert ( 'Funcionário cadastrado com sucesso!' ) ;
        preencherSelects ( ) ;
    } ) ;
}
function  carregarClientes ( )  {
    const  listaClientesDiv  =  documento . getElementById ( 'lista-de-clientes' ) ;
    se  ( ! listaClientesDiv )  retornar ;
    const  clientes  =  JSON . analisar ( localStorage . getItem ( 'clientes' ) )  ||  [ ] ;
    if  ( clientes . length  ===  0 )  {  listaClientesDiv . innerHTML  =  '<p>Nenhum cliente cadastrado ainda.</p>' ;  retornar ;  }
    listaClientesDiv . HTML interno  =  '' ;
    clientes . forEach ( cliente  =>  {
        const  itemDiv  =  document.createElement ( ' div ' ) ;
        itemDiv . className  =  'item-da-lista' ;
        itemDiv . innerHTML  =  `<strong> ${ cliente . nome } </strong><p>Telefone: ${ cliente . telefone } </p><p>Endereço: ${ cliente . endereco  ||  'Não informado' } </p>` ;
        listaClientesDiv . anexarCriança ( itemDiv ) ;
    } ) ;
}
function  carregarServiços ( )  {
    const  listaServicosDiv  =  documento . getElementById ( 'lista-de-servicos' ) ;
    se  ( ! listaServicosDiv )  retornar ;
    const  serviços  =  JSON . parse ( localStorage . getItem ( 'serviços' ) )  ||  [ ] ;
    if  ( serviços . length  ===  0 )  {  listaServicosDiv . innerHTML  =  '<p>Nenhum serviço cadastrado ainda.</p>' ;  retornar ;  }
    listaServicosDiv . HTML interno  =  '' ;
    serviços . forEach ( serviço  =>  {
        const  itemDiv  =  document.createElement ( ' div ' ) ;
        itemDiv . className  =  'item-da-lista' ;
        itemDiv . innerHTML  =  `<strong> ${ serviço . nome } </strong><p>Duração: ${ serviço . duracao } minutos</p><p>Valor: R$ ${ parseFloat ( serviço . valor ) . paraFixado ( 2 ) . substituir ( '.' ,  ',' ) } </p>` ;
        listaServicosDiv.appendChild(itemDiv);
    });
}
function carregarFuncionarios() {
    const listaFuncionariosDiv = document.getElementById('lista-de-funcionarios');
    if (!listaFuncionariosDiv) return;
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    if (funcionarios.length === 0) { listaFuncionariosDiv.innerHTML = '<p>Nenhum funcionário cadastrado ainda.</p>'; return; }
    listaFuncionariosDiv.innerHTML = '';
        }
    });
}

// Função auxiliar para calcular apenas as comissões pendentes (não pagas)
function calcularComissoesPendentesPorFuncionario() {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const servicos = JSON.parse(localStorage.getItem('servicos')) || [];
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];

    const comissaoPendente = {};

    agendamentos.filter(a => a.status === 'finalizado' && !a.comissaoPaga).forEach(agendamento => {
        const servicoDetalhe = servicos.find(s => s.nome === agendamento.servico);
        if (servicoDetalhe) {
            const valorServico = parseFloat(servicoDetalhe.valor);
            const valorComissaoServico = valorServico;

            const valorComissaoPorFuncionario = valorComissaoServico / agendamento.funcionarios.length;
            agendamento.funcionarios.forEach(funcNome => {
                const funcionarioDetalhe = funcionarios.find(f => f.nome === funcNome);
                if (funcionarioDetalhe) {
                    const comissaoPercentual = parseFloat(funcionarioDetalhe.comissao) / 100;
                    const valorComissao = valorComissaoPorFuncionario * comissaoPercentual;
                    comissaoPendente[funcNome] = (comissaoPendente[funcNome] || 0) + valorComissao;
                }
            });
        }
    });

    return comissaoPendente;
}

// Função auxiliar para exibir os detalhes do funcionário selecionado
function exibirDetalhesComissao(funcionario) {
    const comissoesPendentes = calcularComissoesPendentesPorFuncionario();
    const comissao = comissoesPendentes[funcionario] || 0;

    const vales = JSON.parse(localStorage.getItem('vales')) || [];
    const valesFuncionario = vales.filter(v => v.funcionario === funcionario);
    const totalVales = valesFuncionario.reduce((sum, vale) => sum + vale.valor, 0);

    const saldoLiquido = comissao - totalVales;

    document.getElementById('comissao-pendente').textContent = formatarMoeda(comissao);
    document.getElementById('total-vales').textContent = formatarMoeda(totalVales);
    document.getElementById('saldo-liquido').textContent = formatarMoeda(saldoLiquido);
}


// Chamadas iniciais
document.addEventListener('DOMContentLoaded', () => {
    // Verifica a página atual para carregar o conteúdo correto
    if (document.body.classList.contains('pagina-cadastro')) {
        carregarClientes();
        carregarServicos();
        carregarFuncionarios();
        preencherSelects();
    } else if (document.body.classList.contains('pagina-agenda')) {
        preencherSelects();
        gerarNavegacaoSemanal();
        gerarCalendarioDoDia(dataAtual);
    } else if (document.body.classList.contains('pagina-financeiro')) {
        carregarDadosFinanceirosDoDia();
    } else if (document.body.classList.contains('pagina-comissoes')) {
        preencherSelects(); // Preenche a lista de funcionários
        carregarPaginaComissoes(); // Adiciona os listeners
    } else {
        carregarClientes();
        carregarServicos();
        carregarFuncionarios();
        preencherSelects();
    }
});
