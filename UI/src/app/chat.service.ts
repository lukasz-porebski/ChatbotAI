import { ChatMessageResponse, ChatMessageViewModel } from './models/views/chat-message-view.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenerateAnswerRequest } from './models/requests/generate-answer-request.model';
import { RateAnswerRequest } from './models/requests/rate-answer-request.model';

@Injectable()
export class ChatService {
  private _apiUrl = 'https://localhost:7202/api/chat';

  constructor(private http: HttpClient) {
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

  public getHistory(): Observable<ChatMessageViewModel[]> {
    return this.http.get<ChatMessageViewModel[]>(`${this._apiUrl}/history`);
  }

  public rate(id: string, like?: boolean) {
    return this.http.patch(`${this._apiUrl}/rate-answer`, new RateAnswerRequest(id, like));
  }
}
