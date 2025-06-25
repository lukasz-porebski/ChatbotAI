using ChatbotAI.Database;
using ChatbotAI.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ChatbotAI.Handlers.GetHistory;

public class GetHistoryRequestHandler(ChatDbContext dbContext)
    : IRequestHandler<GetHistoryRequest, IReadOnlyCollection<ChatMessage>>
{
    public async Task<IReadOnlyCollection<ChatMessage>> Handle(
        GetHistoryRequest request, CancellationToken cancellationToken) =>
        await dbContext.ChatMessages.OrderBy(m => m.Timestamp).ToArrayAsync(cancellationToken);
}