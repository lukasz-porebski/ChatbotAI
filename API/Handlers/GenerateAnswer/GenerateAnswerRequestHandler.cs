using System.Runtime.CompilerServices;
using System.Text;
using ChatbotAI.Database;
using ChatbotAI.Domain;
using MediatR;

namespace ChatbotAI.Handlers.GenerateAnswer;

public class GenerateAnswerRequestHandler(
    ChatDbContext dbContext,
    IChatbotAnswerProvider chatbotAnswerProvider
) : IStreamRequestHandler<GenerateAnswerRequest, ChatMessage>
{
    public async IAsyncEnumerable<ChatMessage> Handle(
        GenerateAnswerRequest request, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await dbContext.ChatMessages.AddAsync(ChatMessage.CreateForUser(request.Prompt));
        await dbContext.SaveChangesAsync();

        var stringBuilder = new StringBuilder();

        var botAnswer = await chatbotAnswerProvider.GetAsync(request.Prompt, cancellationToken);
        var botMessage = ChatMessage.CreateForBot();

        foreach (var character in botAnswer)
        {
            if (cancellationToken.IsCancellationRequested)
                yield break;

            botMessage.SetText(stringBuilder.ToString());
            stringBuilder.Append(character);

            await Task.Delay(30, cancellationToken);
            yield return botMessage;
        }

        await dbContext.ChatMessages.AddAsync(botMessage);
        await dbContext.SaveChangesAsync();
    }
}