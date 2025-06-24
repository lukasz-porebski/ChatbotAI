using System.Runtime.CompilerServices;
using System.Text;
using MediatR;

namespace ChatbotAI;

public class StreamChatHandler : IStreamRequestHandler<StreamChatRequest, ChatMessage>
{
    private readonly ChatDbContext _db;
    public StreamChatHandler(ChatDbContext db) => _db = db;

    public async IAsyncEnumerable<ChatMessage> Handle(
        StreamChatRequest req, 
        [EnumeratorCancellation] CancellationToken ct)
    {
        var userMsg = new ChatMessage
        {
            Id = Guid.NewGuid(),
            IsUser = true, 
            Text = req.Prompt,
            Timestamp = DateTime.UtcNow
        }; 
        // _db.ChatMessages.Add(userMsg);
        // await _db.SaveChangesAsync(ct);

        // 2. Generuj lorem ipsum tekst
        string full = LoremIpsumGenerator.GenerateRandom();

        // 3. Streamuj litera-po-literze lub linia-po-linii
        var sb = new StringBuilder();
        var id = Guid.NewGuid();
        
        foreach (char c in full)
        {
            if (ct.IsCancellationRequested) 
                yield break;
            
            sb.Append(c);
            var partial = new ChatMessage {
                Id = id, 
                IsUser = false,
                Text = sb.ToString(), 
                Timestamp = DateTime.UtcNow
            };
            // Zapis każdej wersji częściowej
            // _db.ChatMessages.Add(partial);
            // await _db.SaveChangesAsync(ct);
            yield return partial;
            await Task.Delay(30, ct);
        }
    }
}
