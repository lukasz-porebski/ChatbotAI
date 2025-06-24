export interface ChatMessage {
  id: string;
  isUser: boolean;      // true jeśli wiadomość od użytkownika, false jeśli od bota
  Text: string;
  timestamp: string;    // ISO 8601 UTC
  isLiked?: boolean;    // null lub niezdefiniowany jeśli brak oceny
}
