using ChatbotAI.Database;
using ChatbotAI.Domain;
using MediatR;

namespace ChatbotAI.Handlers.AddMessage;

public class AddMessageRequestHandler(ChatDbContext dbContext) : IRequestHandler<AddMessageRequest, ChatMessage>
{
    public async Task<ChatMessage> Handle(AddMessageRequest request, CancellationToken cancellationToken)
    {
        var message = new ChatMessage(request.Id ?? Guid.NewGuid(), request.IsUser, request.Text);

        var existingMessage = await dbContext.ChatMessages.FindAsync([message.Id], cancellationToken);
        if (existingMessage != null)
            throw new Exception("Message with given id already exists");

        await dbContext.AddAsync(message, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return message;
    }
}