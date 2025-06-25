namespace ChatbotAI.Domain;

public class ExternalChatbotAIAnswerProvider : IChatbotAnswerProvider
{
    public Task<string> GetAsync(string prompt, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}