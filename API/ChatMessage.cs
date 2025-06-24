namespace ChatbotAI;

public class ChatMessage
{
    public Guid Id { get; set; }
    public bool IsUser { get; set; }    // true jeśli wiadomość od użytkownika, false jeśli od bota
    public string Text { get; set; }
    // Timestamp zawsze w UTC
    public DateTime Timestamp { get; set; }
    public bool? IsLiked { get; set; }
}