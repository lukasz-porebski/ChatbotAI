using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace ChatbotAI;

public class ChatDbContext : DbContext
{
    public DbSet<ChatMessage> ChatMessages { get; set; }

    public ChatDbContext(DbContextOptions options) : base(options) {}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Wymuszenie zapisu Timestamp w UTC
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        modelBuilder.Entity<ChatMessage>()
            .Property(e => e.Timestamp)
            .HasConversion(dateTimeConverter)
            .HasColumnType("datetime2");

        base.OnModelCreating(modelBuilder);
    }
}
