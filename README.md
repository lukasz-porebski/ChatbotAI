# ChatbotAI

## 1. URL
API: https://localhost:7202

UI: http://localhost:4200

Baza danych: (localdb)\\MSSQLLocalDB

## 2. Użycie ChatGPT
Szablon aplikacji został wygenerowany przez ChatGPT. Poniżej podany prompt:

```
Stwórz prototyp chatbota AI, który symuluje prostego asystenta (np. ChatGPT). Spełnij tylko poniżesz wymagania funkcjonalne i techniczne.

Wymagania funkcjonalne:
- Odpowiedzi chatbota mają być generowane losowo przy użyciu "Lorem ipsum...".
- Chatbot powinien wyświetlać historię rozmowy, z rozróżnieniem wiadomości użytkownika i odpowiedzi chatbota.
- Każda odpowiedź chatbota powinna mieć możliwość oceny. 
- Ocena ogranicza się do dania like lub dislike (jak np. na YouTube). 
- Użytkownik może zmienić ocenę.
- Odpowiedzi chatbota powinny być wyświetlane stopniowo, symulując proces "pisania" (litera po literze lub linia po linii, tak jak to wygląda w ChatGPT). 
- Długość odpowiedzi powinna być zróżnicowana: 1-2 zdania, 3-5 zdań oraz kilku akapitów.
- Możliwość anulowania generowanej odpowiedzi w trakcie jej wyświetlania. System zapisze i wyświetli tylko tę część odpowiedzi, która została wygenerowana do momentu anulowania.
- Wszystkie informacje z chatu, powinny być na bieżąco zapisywane w bazie danych.
- API zaprojektowane w sposób umożliwiający łatwe rozszerzenie o integrację z prawdziwym modelem AI.
- Aplikacja powinna działać poprawnie w popularnych przeglądarkach desktopowych (np. Chrome, Firefox, Safari).
- Użyj IStreamRequest z MediatR do wymiany wiadomości między API a UI 

Wymagania techniczne:
a) Frontend: 
- Angular w najnowszej wersji. 
- Interfejs na bazie Angular Material.

b) Backend: 
- API w ASP.NET Core Web API.
- Baza danych to SQL Server.
- ORM to Entity Framework Core. 
- MediatR do komunikacji z frontedem. 
```

Wygenerowany kod jest umieszczony w folderach API i UI w plikach o nazwie ChatGPT.
