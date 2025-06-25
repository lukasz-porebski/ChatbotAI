using System.Runtime.CompilerServices;
using System.Text;
using ChatbotAI.Database;
using ChatbotAI.Domain;
using MediatR;

namespace ChatbotAI.Handlers.GenerateAnswer;

public class GenerateAnswerRequestHandler(IChatbotAnswerProvider chatbotAnswerProvider)
    : IStreamRequestHandler<GenerateAnswerRequest, ChatMessage>
{
    public async IAsyncEnumerable<ChatMessage> Handle(
        GenerateAnswerRequest request, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var stringBuilder = new StringBuilder();

        var botAnswer = await chatbotAnswerProvider.GetAsync(request.Prompt, cancellationToken);
        var botMessage = new ChatMessage(isUser: false, text: string.Empty);

        foreach (var character in botAnswer)
        {
            botMessage.SetText(stringBuilder.ToString());
            stringBuilder.Append(character);

            await Task.Delay(30, cancellationToken);
            yield return botMessage;
        }
    }
}