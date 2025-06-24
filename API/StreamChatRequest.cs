using MediatR;

namespace ChatbotAI;

public record StreamChatRequest(string Prompt) : IStreamRequest<ChatMessage>;