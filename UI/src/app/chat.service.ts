import { ChatMessage } from './chat-message.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ChatService {
  private base = '/api/chat';

  constructor(private http: HttpClient) {
  }

  stream(prompt: string): Observable<ChatMessage> {
    return new Observable(sub => {
      const req = this.http.post(`${this.base}/stream`, {prompt}, {responseType: 'text', observe: 'body'});
      const subReq = req.subscribe({
        next: chunk => {
          const parts = chunk.split(/^data: /gm);
          parts.forEach(p => p && sub.next(JSON.parse(p)));
        }, error: e => sub.error(e), complete: () => sub.complete()
      });
      return () => subReq.unsubscribe();
    });
  }

  getHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.base}/history`);
  }

  rate(id: string, like: boolean) {
    return this.http.patch(`${this.base}/${id}/rating`, like);
  }
}
