import { Subscription } from 'rxjs';
import { ChatService } from './chat.service';
import { ChatMessageViewModel } from './models/views/chat-message-view.model';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

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
  history: ChatMessageViewModel[] = [];
  prompt = '';
  streamSub?: Subscription;
  public isLiked?: boolean = false;
  public isSending: boolean = false;

  public constructor(private svc: ChatService) {
  }

  public ngOnInit(): void {
    this.loadHistory();
  }

  public loadHistory(): void {
    this.svc.getHistory().subscribe(h => this.history = h);
  }

  public send(): void {
    this.streamSub = this.svc.generateAnswer(this.prompt).subscribe({
      next: msg => {
        // usuń fragmenty starsze o tym samym Id
        this.history = this.history.filter(m => m.id !== msg.id);
        this.history.push(msg);
      }, complete: () => this.streamSub = undefined
    });
    this.prompt = '';
  }

  public cancel(): void {
    this.streamSub?.unsubscribe();
    this.streamSub = undefined;
  }

  public toggleLike(msg: ChatMessageViewModel): void {
    this.rate(msg, msg.isLiked ? undefined : true);
  }

  public toggleDislike(msg: ChatMessageViewModel): void {
    this.rate(msg, msg.isLiked === false ? undefined : false);
  }

  private rate(msg: ChatMessageViewModel, like?: boolean): void {
    this.svc.rate(msg.id, like).subscribe(() => msg.isLiked = like);
  }
}
