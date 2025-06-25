using ChatbotAI.Domain;
using MediatR;

namespace ChatbotAI.Handlers.GenerateAnswer;

public record GenerateAnswerRequest(string Prompt) : IStreamRequest<ChatMessage>;