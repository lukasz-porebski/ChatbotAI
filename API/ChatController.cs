using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatbotAI;

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