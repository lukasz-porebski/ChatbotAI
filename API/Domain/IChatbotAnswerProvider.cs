namespace ChatbotAI.Domain;

public interface IChatbotAnswerProvider
{
    Task<string> GetAsync(string prompt, CancellationToken cancellationToken);
}