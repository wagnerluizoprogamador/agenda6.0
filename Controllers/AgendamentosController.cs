using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/agendamentos")]
public class AgendamentosController : ControllerBase
{
    private readonly ApplicationDbContext _context; // Substitua pelo nome do seu DbContext

    public AgendamentosController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("salvar")]
    public async Task<IActionResult> SalvarAgendamento([FromBody] AgendamentoDto agendamentoDto)
    {
        // Validação das porcentagens de comissão
        var somaPorcentagens = agendamentoDto.profissionais.Sum(p => p.comissao_porcentagem);
        if (somaPorcentagens != 100)
        {
            return BadRequest(new { message = "A soma das comissões deve ser 100%." });
        }

        // Mapeamento e criação do Agendamento
        var novoAgendamento = new Agendamento
        {
            ClienteNome = agendamentoDto.clienteNome,
            Servico = agendamentoDto.servico,
            ValorTotal = agendamentoDto.valorTotal,
            DataHora = DateTime.ParseExact($"{agendamentoDto.data} {agendamentoDto.horaInicio}", "yyyy-MM-dd HH:mm", null)
        };

        foreach (var profDto in agendamentoDto.profissionais)
        {
            var profissional = await _context.Profissionais.FindAsync(profDto.id);
            if (profissional == null)
            {
                return NotFound(new { message = $"Profissional com ID {profDto.id} não encontrado." });
            }

            // Criação do objeto de comissão
            novoAgendamento.Comissoes.Add(new Comissao
            {
                Profissional = profissional,
                Porcentagem = profDto.comissao_porcentagem,
                ValorComissao = (profDto.comissao_porcentagem / 100) * agendamentoDto.valorTotal
            });
        }

        // Salvamento no banco de dados
        _context.Agendamentos.Add(novoAgendamento);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Agendamento salvo com sucesso!" });
    }
}

