using ChatbotAI.Database;
using ChatbotAI.Domain;
using MediatR;

namespace ChatbotAI.Handlers.AddMessage;

public class AddMessageRequestHandler(ChatDbContext dbContext) : IRequestHandler<AddMessageRequest, ChatMessage>
{
    public async Task<ChatMessage> Handle(AddMessageRequest request, CancellationToken cancellationToken)
    {
        var message = new ChatMessage(request.IsUser, request.Text);

        await dbContext.AddAsync(message, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return message;
    }
}