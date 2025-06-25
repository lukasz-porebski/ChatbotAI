using MediatR;

namespace ChatbotAI.Handlers.RateAnswer;

public record RateAnswerRequest(Guid Id, bool? IsLiked) : IRequest;