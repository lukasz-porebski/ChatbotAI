import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatMessageResponse, ChatMessageViewModel } from './models/views/chat-message-view.model';
import { AddMessageRequest } from './models/requests/add-message-request.model';
import { RateAnswerRequest } from './models/requests/rate-answer-request.model';
import { GenerateAnswerRequest } from './models/requests/generate-answer-request.model';
import { Optional } from '../shared/types/optional.type';

@Injectable()
export class ChatAPIService {
  private readonly _apiUrl = 'https://localhost:7202/api/chat';

  public constructor(private readonly _httpClient: HttpClient) {
  }

  public getHistory(): Observable<ChatMessageViewModel[]> {
    return this._httpClient.get<ChatMessageViewModel[]>(`${this._apiUrl}/history`);
  }

  public generateAnswer(prompt: string): Observable<ChatMessageViewModel> {
    return new Observable<ChatMessageViewModel>(observer => {
      const controller = new AbortController();

      fetch(`${this._apiUrl}/generate-answer`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(new GenerateAnswerRequest(prompt)),
        signal: controller.signal
      })
        .then(response => {
          if (!response.ok)
            throw new Error(`HTTP ${response.status}`);

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();

          const read = (): void => {
            reader.read().then(({done, value}) => {
              if (done) {
                observer.complete();
                return;
              }
              const text = decoder.decode(value, {stream: true});
              text.split('\n\n').forEach(block => {
                if (block.startsWith('data:')) {
                  try {
                    const msg: ChatMessageResponse = JSON.parse(block.substring(5));
                    observer.next(new ChatMessageViewModel(msg));
                  } catch {
                    // ignoruj nie-JSON-owe kawałki
                  }
                }
              });
              read();
            }).catch(err => observer.error(err));
          };

          read();
        })
        .catch(err => observer.error(err));

      return () => controller.abort();
    });
  }

  public addMessage(isUser: boolean, text: string): Observable<ChatMessageViewModel> {
    return this._httpClient.post<ChatMessageViewModel>(
      `${this._apiUrl}/add-message`, new AddMessageRequest(isUser, text));
  }

  public rateAnswer(id: string, like: Optional<boolean>): Observable<void> {
    return this._httpClient.patch<void>(`${this._apiUrl}/rate-answer`, new RateAnswerRequest(id, like));
  }
}
