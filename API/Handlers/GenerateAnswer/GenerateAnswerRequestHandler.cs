using System.Runtime.CompilerServices;
using System.Text;
using ChatbotAI.Database;
using ChatbotAI.Domain;
using ChatbotAI.Domain.ChatbotAnswerGenerator;
using MediatR;

namespace ChatbotAI.Handlers.GenerateAnswer;

public class GenerateAnswerRequestHandler(IChatbotAnswerGenerator chatbotAnswerGenerator)
    : IStreamRequestHandler<GenerateAnswerRequest, ChatMessage>
{
    public async IAsyncEnumerable<ChatMessage> Handle(
        GenerateAnswerRequest request, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var stringBuilder = new StringBuilder();

        var answer = await chatbotAnswerGenerator.GenerateAsync(request.Prompt, cancellationToken);
        var message = new ChatMessage(Guid.NewGuid(), isUser: false, text: string.Empty);

        foreach (var character in answer)
        {
            stringBuilder.Append(character);
            message.SetText(stringBuilder.ToString());

            await Task.Delay(30, cancellationToken);
            yield return message;
        }
    }
}