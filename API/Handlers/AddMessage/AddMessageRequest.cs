using ChatbotAI.Domain;
using MediatR;

namespace ChatbotAI.Handlers.AddMessage;

public record AddMessageRequest(bool IsUser, string Text) : IRequest<ChatMessage>;