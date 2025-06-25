namespace ChatbotAI.Domain.ChatbotAnswerGenerator;

public interface IChatbotAnswerGenerator
{
    Task<string> GenerateAsync(string prompt, CancellationToken cancellationToken);
}