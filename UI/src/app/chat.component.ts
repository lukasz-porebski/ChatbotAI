import { Subscription } from 'rxjs';
import { ChatService } from './chat.service';
import { ChatMessageViewModel } from './models/views/chat-message-view.model';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { isDefined } from './utils';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatCard,
    MatIcon,
    MatCardContent,
    MatCardActions,
    MatFormField,
    MatInput,
    CdkTextareaAutosize,
    MatFormField
  ],
  providers: [ ChatService ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  public get isSending(): boolean {
    return isDefined(this._streamSub);
  }

  public history: ChatMessageViewModel[] = [];
  public prompt = '';

  private _streamSub?: Subscription;

  public constructor(private apiService: ChatService) {
  }

  public ngOnInit(): void {
    this.loadHistory();
  }

  public loadHistory(): void {
    this.apiService.getHistory().subscribe(h => this.history = h);
  }

  public send(): void {
    this.apiService.addMessage(true, this.prompt).subscribe((message) => {
      this.history.push(message);

      this._streamSub = this.apiService.generateAnswer(this.prompt).subscribe({
        next: msg => {
          this.history = this.history.filter(m => m.id !== msg.id);
          this.history.push(msg);
        }, complete: () => {
          this._streamSub = undefined
          this.apiService.addMessage(false, this.history[this.history.length - 1].text).subscribe();
        }
      });
      this.prompt = '';
    })
  }

  public cancel(): void {
    if (isDefined(this._streamSub)) {
      this._streamSub.unsubscribe();
      this._streamSub = undefined;
      this.apiService.addMessage(false, this.history[this.history.length - 1].text).subscribe();
    }
  }

  public toggleLike(msg: ChatMessageViewModel): void {
    this.rate(msg, msg.isLiked ? undefined : true);
  }

  public toggleDislike(msg: ChatMessageViewModel): void {
    this.rate(msg, msg.isLiked === false ? undefined : false);
  }

  private rate(msg: ChatMessageViewModel, like?: boolean): void {
    this.apiService.rate(msg.id, like).subscribe(() => msg.isLiked = like);
  }
}
