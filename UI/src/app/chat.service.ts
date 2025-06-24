import { ChatMessage } from './chat-message.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface StreamChatRequest {
  prompt: string;
}


@Injectable()
export class ChatService {
  private base = 'https://localhost:7202/api/chat';

  constructor(private http: HttpClient) {
  }

  stream(prompt: string): Observable<ChatMessage> {
    return new Observable<ChatMessage>(observer => {
      const controller = new AbortController();

      fetch(`${this.base}/stream`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({prompt} as StreamChatRequest),
        signal: controller.signal
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
                    const msg: ChatMessage = JSON.parse(block.substring(5));
                    observer.next(msg);
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

  getHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.base}/history`);
  }

  rate(id: string, like: boolean) {
    return this.http.patch(`${this.base}/${id}/rating`, like);
  }
}
