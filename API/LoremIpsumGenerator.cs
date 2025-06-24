namespace ChatbotAI;

public static class LoremIpsumGenerator
{
    private static readonly string[] Sentences = new[]
    {
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    };

    private static readonly Random _rand = new Random();

    public static string GenerateRandom()
    {
        // Wybierz losowy tryb długości: 0 - krótki (1-2 zdania), 1 - średni (3-5 zdań), 2 - długi (kilka akapitów)
        int mode = _rand.Next(3);
        switch (mode)
        {
            case 0: // krótki
                return string.Join(" ", Sentences.OrderBy(_ => _rand.Next()).Take(_rand.Next(1, 3)));
            case 1: // średni
                return string.Join(" ", Sentences.OrderBy(_ => _rand.Next()).Take(_rand.Next(3, 6)));
            default: // długi
                var paragraphs = new List<string>();
                int pCount = _rand.Next(2, 4);
                for (int i = 0; i < pCount; i++)
                {
                    var para = string.Join(" ", Sentences.OrderBy(_ => _rand.Next()).Take(_rand.Next(3, 6)));
                    paragraphs.Add(para);
                }
                return string.Join(@"

                ", paragraphs);
        }
    }
}
