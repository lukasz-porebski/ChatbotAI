using ChatbotAI.Database;
using MediatR;

namespace ChatbotAI.Handlers.RateAnswer;

public class RateAnswerRequestHandler(ChatDbContext dbContext) : IRequestHandler<RateAnswerRequest>
{
    public async Task Handle(RateAnswerRequest request, CancellationToken cancellationToken)
    {
        var answer = await dbContext.ChatMessages.FindAsync([request.Id], cancellationToken);
        if (answer == null)
            throw new Exception("Answer not found");

        answer.SetIsLiked(request.IsLiked);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}