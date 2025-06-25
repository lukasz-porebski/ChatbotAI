namespace ChatbotAI.Domain.ChatbotAnswerGenerator;

public class ExternalChatbotAiAnswerGenerator : IChatbotAnswerGenerator
{
    public Task<string> GenerateAsync(string prompt, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}