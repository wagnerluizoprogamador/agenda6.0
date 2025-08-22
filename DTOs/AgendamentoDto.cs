using System.Collections.Generic;

public class AgendamentoDto
{
    public string clienteNome { get; set; }
    public string servico { get; set; }
    public decimal valorTotal { get; set; }
    public string data { get; set; }
    public string horaInicio { get; set; }

    public List<ProfissionalComissaoDto> profissionais { get; set; }
}
public class ProfissionalComissaoDto
{
    public int id { get; set; }
    public decimal comissao_porcentagem { get; set; }
}
