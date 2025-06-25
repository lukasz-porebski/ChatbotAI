using ChatbotAI.Domain;
using MediatR;

namespace ChatbotAI.Handlers.AddMessage;

public record AddMessageRequest(Guid? Id, bool IsUser, string Text) : IRequest<ChatMessage>;