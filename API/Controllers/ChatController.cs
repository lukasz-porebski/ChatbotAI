using System.Text.Json;
using ChatbotAI.Domain;
using ChatbotAI.Handlers.AddMessage;
using ChatbotAI.Handlers.GenerateAnswer;
using ChatbotAI.Handlers.GetHistory;
using ChatbotAI.Handlers.RateAnswer;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ChatbotAI.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController(IMediator mediator) : ControllerBase
{
    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyCollection<ChatMessage>>> GetHistory(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetHistoryRequest(), cancellationToken);
        return Ok(result);
    }

    [HttpPost("generate-answer")]
    public async Task GenerateAnswer([FromBody] GenerateAnswerRequest request, CancellationToken cancellationToken)
    {
        Response.Headers.Append("Content-Type", "text/event-stream");

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await foreach (var chatMessage in mediator.CreateStream(request, cancellationToken))
        {
            var json = JsonSerializer.Serialize(chatMessage, options);
            await Response.WriteAsync(json, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
    }

    [HttpPost("add-message")]
    public async Task<IActionResult> AddMessage([FromBody] AddMessageRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(request, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("rate-answer")]
    public async Task<IActionResult> RateAnswer([FromBody] RateAnswerRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(request, cancellationToken);
        return Ok();
    }
}