### 1. Typ ChatMessage (frontend)

W pliku `chat.model.ts` definiujemy interfejs wiadomości dopasowany do backendu:

```ts
export interface ChatMessage {
  id: string;
  isUser: boolean; // true jeśli wiadomość od użytkownika, false jeśli od bota
  text: string;
  timestamp: string; // ISO 8601 UTC
  isLiked?: boolean; // null lub niezdefiniowany jeśli brak oceny
}
```

### 2. ChatService (streaming + anulowanie) (streaming + anulowanie)

```ts
@Injectable({ providedIn: "root" })
export class ChatService {
  private base = "/api/chat";
  constructor(private http: HttpClient) {}

  stream(prompt: string): Observable<ChatMessage> {
    return new Observable((sub) => {
      const req = this.http.post(`${this.base}/stream`, { prompt }, { responseType: "text", observe: "body" });
      const subReq = req.subscribe({
        next: (chunk) => {
          const parts = chunk.split(/^data: /gm);
          parts.forEach((p) => p && sub.next(JSON.parse(p)));
        },
        error: (e) => sub.error(e),
        complete: () => sub.complete(),
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
```

### 3. ChatComponent (HTML)

```html
<div class="chat-container">
  <div *ngFor="let msg of history">
    <mat-card [ngClass]="msg.isUser ? 'user' : 'bot'">
      <pre>{{ msg.text }}</pre>
      <div *ngIf="!msg.isUser">
        <button mat-icon-button (click)="toggleLike(msg)">
          <mat-icon>{{ msg.isLiked? 'thumb_up':'thumb_up_off_alt' }}</mat-icon>
        </button>
        <button mat-icon-button (click)="toggleDislike(msg)">
          <mat-icon>{{ msg.isLiked===false?'thumb_down':'thumb_down_off_alt' }}</mat-icon>
        </button>
      </div>
    </mat-card>
  </div>
  <textarea [(ngModel)]="prompt"></textarea>
  <button mat-raised-button (click)="send()">Wyślij</button>
  <button mat-button *ngIf="streamSub" (click)="cancel()">Anuluj</button>
</div>
```

### 4. ChatComponent (TS)

```ts
export class ChatComponent implements OnInit {
  history: ChatMessage[] = [];
  prompt = "";
  streamSub: Subscription;

  constructor(private svc: ChatService) {}
  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.svc.getHistory().subscribe((h) => (this.history = h));
  }

  send() {
    this.streamSub = this.svc.stream(this.prompt).subscribe({
      next: (msg) => {
        // usuń fragmenty starsze o tym samym Id
        this.history = this.history.filter((m) => m.id !== msg.id);
        this.history.push(msg);
      },
      complete: () => (this.streamSub = null),
    });
    this.prompt = "";
  }

  cancel() {
    this.streamSub.unsubscribe();
    this.streamSub = null;
  }

  toggleLike(msg: ChatMessage) {
    this.rate(msg, true);
  }
  toggleDislike(msg: ChatMessage) {
    this.rate(msg, false);
  }
  private rate(msg: ChatMessage, like: boolean) {
    this.svc.rate(msg.id, like).subscribe(() => (msg.isLiked = like));
  }
}
```
