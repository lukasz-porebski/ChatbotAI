using ChatbotAI.Domain;
using MediatR;

namespace ChatbotAI.Handlers.GetHistory;

public record GetHistoryRequest : IRequest<IReadOnlyCollection<ChatMessage>>;