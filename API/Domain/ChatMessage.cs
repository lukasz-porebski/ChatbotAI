namespace ChatbotAI.Domain;

public class ChatMessage
{
    private ChatMessage(bool isUser, string text)
    {
        Id = Guid.NewGuid();
        IsUser = isUser;
        Text = text;
        Timestamp = DateTime.UtcNow;
        IsLiked = null;
    }

    private ChatMessage()
    {
    }

    public Guid Id { get; private set; }
    public bool IsUser { get; private set; }
    public string Text { get; private set; }
    public DateTime Timestamp { get; private set; }
    public bool? IsLiked { get; private set; }

    public static ChatMessage CreateForUser(string text) =>
        new(true, text);

    public static ChatMessage CreateForBot() =>
        new(false, string.Empty);

    public void SetText(string text)
    {
        if (IsUser)
            throw new Exception("Only bot message can be set.");

        Text = text;
    }

    public void SetIsLiked(bool? isLiked)
    {
        if (IsUser)
            throw new Exception("Only user message can be set.");

        IsLiked = isLiked;
    }
}