using Microsoft.EntityFrameworkCore;

// Substitua 'SeuProjeto.Data' pelo namespace do seu projeto
agenda 6.0.Data
{
    // Substitua 'ApplicationDbContext' pelo nome da sua classe de DbContext
    agenda 6.0 ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Adicione os DbSet para as suas novas entidades
        public DbSet<Agendamento> Agendamentos { get; set; }
        public DbSet<Profissional> Profissionais { get; set; }
        public DbSet<Comissao> Comissoes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração da chave estrangeira
            modelBuilder.Entity<Comissao>()
                .HasOne(c => c.Agendamento)
                .WithMany(a => a.Comissoes)
                .HasForeignKey(c => c.AgendamentoId);

            modelBuilder.Entity<Comissao>()
                .HasOne(c => c.Profissional)
                .WithMany() // Se o Profissional não tiver uma lista de Comissoes
                .HasForeignKey(c => c.ProfissionalId);
        }
    }
}
