import { Subscription } from 'rxjs';
import { ChatAPIService } from './chat-api.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { isDefined } from '../shared/utils';
import { ChatMessageViewModel } from './models/views/chat-message-view.model';
import { Optional } from '../shared/types/optional.type';

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
  providers: [ ChatAPIService ],
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

  public constructor(private readonly _apiService: ChatAPIService) {
  }

  public ngOnInit(): void {
    this._apiService.getHistory().subscribe(history => this.history = history);
  }

  public send(): void {
    this._apiService.addMessage(true, this.prompt).subscribe((message) => {
      this.history.push(message);

      this._streamSub = this._apiService.generateAnswer(this.prompt).subscribe({
        next: msg => {
          this.history = this.history.filter(m => m.id !== msg.id);
          this.history.push(msg);
        }, complete: () => {
          this._streamSub = undefined
          this._apiService.addMessage(false, this.history[this.history.length - 1].text).subscribe();
        }
      });
      this.prompt = '';
    })
  }

  public cancel(): void {
    if (isDefined(this._streamSub)) {
      this._streamSub.unsubscribe();
      this._streamSub = undefined;
      this._apiService.addMessage(false, this.history[this.history.length - 1].text).subscribe();
    }
  }

  public toggleLike(answer: ChatMessageViewModel): void {
    this._rateAnswer(answer, answer.isLiked ? undefined : true);
  }

  public toggleDislike(answer: ChatMessageViewModel): void {
    this._rateAnswer(answer, answer.isLiked === false ? undefined : false);
  }

  private _rateAnswer(msg: ChatMessageViewModel, like: Optional<boolean>): void {
    this._apiService.rateAnswer(msg.id, like).subscribe(() => msg.isLiked = like);
  }
}
