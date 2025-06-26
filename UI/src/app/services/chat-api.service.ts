import { map, Observable, Subscriber } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ChatMessageViewModel } from '../components/chat/models/views/chat-message-view.model';
import { AddMessageRequest } from '../components/chat/models/requests/add-message-request.model';
import { RateAnswerRequest } from '../components/chat/models/requests/rate-answer-request.model';
import { GenerateAnswerRequest } from '../components/chat/models/requests/generate-answer-request.model';
import { Optional } from '../../shared/types/optional.type';

@Injectable()
export class ChatAPIService {
  private readonly _apiUrl = 'https://localhost:7202/api/chat';
  private readonly _httpClient = inject(HttpClient);

  public getHistory(): Observable<ChatMessageViewModel[]> {
    return this._httpClient
      .get<ChatMessageViewModel[]>(`${this._apiUrl}/history`)
      .pipe(
        map((response) =>
          (response ?? []).map((r) => new ChatMessageViewModel(r)),
        ),
      );
  }

  public generateAnswer(prompt: string): Observable<ChatMessageViewModel> {
    return new Observable<ChatMessageViewModel>((observer) => {
      const controller = new AbortController();

      fetch(`${this._apiUrl}/generate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(new GenerateAnswerRequest(prompt)),
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          this._readStream(reader, decoder, response, observer);
        })
        .catch((err) => observer.error(err));

      return () => controller.abort();
    });
  }

  public addMessage(
    id: Optional<string>,
    isUser: boolean,
    text: string,
  ): Observable<ChatMessageViewModel> {
    return this._httpClient
      .post<ChatMessageViewModel>(
        `${this._apiUrl}/add-message`,
        new AddMessageRequest(id, isUser, text),
      )
      .pipe(map((response) => new ChatMessageViewModel(response)));
  }

  public rateAnswer(id: string, like: Optional<boolean>): Observable<void> {
    return this._httpClient.patch<void>(
      `${this._apiUrl}/rate-answer`,
      new RateAnswerRequest(id, like),
    );
  }

  private _readStream(
    reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
    decoder: TextDecoder,
    response: Response,
    observer: Subscriber<ChatMessageViewModel>,
  ): void {
    reader
      .read()
      .then(({ done, value }) => {
        if (done) {
          observer.complete();
          return;
        }
        const json = decoder.decode(value, { stream: true });
        const msg: ChatMessageViewModel = JSON.parse(json);
        observer.next(new ChatMessageViewModel(msg));
        this._readStream(reader, decoder, response, observer);
      })
      .catch((err) => observer.error(err));
  }
}
