namespace ChatbotAI.Domain.ChatbotAnswerGenerator;

public class ChatbotRandomAnswerGenerator : IChatbotAnswerGenerator
{
    private readonly Random _random = new();

    private readonly string[] _sentences =
    [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt.",
        "Ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam.",
        "Quis nostrud exercitation ullamco laboris. ",
        "Nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
        "Dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat, cupidatat non proident, sunt in.",
        "Culpa qui officia deserunt mollit anim id est laborum."
    ];

    public Task<string> GenerateAsync(string prompt, CancellationToken cancellationToken)
    {
        var randomAnswerLength = Enum.GetValues<AnswerLength>()
            .OrderBy(_ => _random.Next())
            .First();

        string result;
        switch (randomAnswerLength)
        {
            case AnswerLength.Short:
                result = GenerateRandomParagraph(1, 2);
                break;
            case AnswerLength.Medium:
                result = GenerateRandomParagraph(3, 5);
                break;
            case AnswerLength.Long:
            default:
                var paragraphs = new List<string>();
                var numberOfParagraphs = _random.Next(2, 5);

                for (var i = 0; i < numberOfParagraphs; i++)
                    paragraphs.Add(GenerateRandomParagraph(2, 5));

                result = string.Join("\n", paragraphs);
                break;
        }

        return Task.FromResult(result);
    }

    private string GenerateRandomParagraph(int minNumbersOfSentences, int maxNumbersOfSentences)
    {
        var randomSentences = _sentences.OrderBy(_ => _random.Next()).ToArray();
        return string.Join(" ", randomSentences.Take(_random.Next(minNumbersOfSentences, maxNumbersOfSentences + 1)));
    }

    private enum AnswerLength
    {
        Short = 1,
        Medium,
        Long
    }
}