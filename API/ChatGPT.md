### 1. Model danych

````csharp
public class ChatMessage
{
    public Guid Id { get; set; }
    public bool IsUser { get; set; }    // true jeśli wiadomość od użytkownika, false jeśli od bota
    public string Text { get; set; }
    // Timestamp zawsze w UTC
    public DateTime Timestamp { get; set; }
    public bool? IsLiked { get; set; }
}

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
````

### 2. MediatR IStreamRequest + Handler

```csharp
public record StreamChatRequest(string Prompt) : IStreamRequest<ChatMessage>;

public class StreamChatHandler : IStreamRequestHandler<StreamChatRequest, ChatMessage>
{
    private readonly ChatDbContext _db;
    public StreamChatHandler(ChatDbContext db) => _db = db;

    public async IAsyncEnumerable<ChatMessage> Handle(StreamChatRequest req, [EnumeratorCancellation] CancellationToken ct)
    {
        // 1. Zapisz wiadomość użytkownika
        var userMsg = new ChatMessage { Id = Guid.NewGuid(), IsUser = true, Text = req.Prompt, Timestamp = DateTime.UtcNow }; 
        _db.ChatMessages.Add(userMsg);
        await _db.SaveChangesAsync(ct);

        // 2. Generuj lorem ipsum tekst
        string full = LoremIpsumGenerator.GenerateRandom();

        // 3. Streamuj litera-po-literze lub linia-po-linii
        var sb = new StringBuilder();
        foreach (char c in full)
        {
            if (ct.IsCancellationRequested) yield break;
            sb.Append(c);
            var partial = new ChatMessage {
                Id = Guid.NewGuid(), IsUser = false,
                Text = sb.ToString(), Timestamp = DateTime.UtcNow
            };
            // Zapis każdej wersji częściowej
            _db.ChatMessages.Add(partial);
            await _db.SaveChangesAsync(ct);
            yield return partial;
            await Task.Delay(30, ct);
        }
    }
}
```

### 3. LoremIpsumGenerator

Dodajemy klasę pomocniczą do generowania losowego tekstu Lorem Ipsum o zróżnicowanej długości:

```csharp
public static class LoremIpsumGenerator
{
    private static readonly string[] Sentences = new[]
    {
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    };

    private static readonly Random _rand = new Random();

    public static string GenerateRandom()
    {
        // Wybierz losowy tryb długości: 0 - krótki (1-2 zdania), 1 - średni (3-5 zdań), 2 - długi (kilka akapitów)
        int mode = _rand.Next(3);
        switch (mode)
        {
            case 0: // krótki
                return string.Join(" ", Sentences.OrderBy(_ => _rand.Next()).Take(_rand.Next(1, 3)));
            case 1: // średni
                return string.Join(" ", Sentences.OrderBy(_ => _rand.Next()).Take(_rand.Next(3, 6)));
            default: // długi
                var paragraphs = new List<string>();
                int pCount = _rand.Next(2, 4);
                for (int i = 0; i < pCount; i++)
                {
                    var para = string.Join(" ", Sentences.OrderBy(_ => _rand.Next()).Take(_rand.Next(3, 6)));
                    paragraphs.Add(para);
                }
                return string.Join("

", paragraphs);
        }
    }
}
```

### 4. Kontroler

```csharp
[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly IMediator _mediator;
    public ChatController(IMediator mediator) => _mediator = mediator;

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromServices] ChatDbContext db)
    {
        var all = await db.ChatMessages.OrderBy(m => m.Timestamp).ToListAsync();
        return Ok(all);
    }

    [HttpPost("stream")]    
    public async Task Stream([FromBody] StreamChatRequest req, CancellationToken ct)
    {
        Response.ContentType = "text/event-stream";
        await foreach (var msg in _mediator.CreateStream(req, ct))
        {
            var json = JsonSerializer.Serialize(msg);
            await Response.WriteAsync($"data: {json}\n\n", ct);
            await Response.Body.FlushAsync(ct);
        }
    }

    [HttpPatch("{id}/rating")]  
    public async Task<IActionResult> Rate(Guid id, [FromBody] bool isLiked, [FromServices] ChatDbContext db)
    {
        var msg = await db.ChatMessages.FindAsync(id);
        if (msg == null) return NotFound();
        msg.IsLiked = isLiked;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
````

---

## Program.cs

W pliku `Program.cs` konfigurujemy serwis, EF Core, MediatR oraz routing API:

```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Dodaj DbContext ze SQL Server
builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Dodaj MediatR (skanuje bieżązy assembly)
builder.Services.AddMediatR(typeof(Program));

// 3. Dodaj kontrolery
builder.Services.AddControllers();

// 4. Konfiguracja CORS (opcjonalnie)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// 5. Swagger (dla testów i dokumentacji)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseRouting();

app.MapControllers();

app.Run();
```

---

## Plik appsettings.Development.json

Ustawienia połączenia do lokalnej bazy SQL Server oraz poziomy logowania:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\MSSQLLocalDB;Database=ChatbotDevDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```