import { Subscription } from 'rxjs';
import { ChatService } from './chat.service';
import { ChatMessage } from './chat-message.model';
import { Component, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [
    NgIf,
    MatButton,
    FormsModule,
    MatCard,
    NgClass,
    MatIcon,
    MatIconButton
  ],
  providers: [ ChatService ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  history: ChatMessage[] = [];
  prompt = '';
  streamSub?: Subscription;

  constructor(private svc: ChatService) {
  }

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.svc.getHistory().subscribe(h => this.history = h);
  }

  send() {
    this.streamSub = this.svc.stream(this.prompt).subscribe({
      next: msg => {
        // usuń fragmenty starsze o tym samym Id
        this.history = this.history.filter(m => m.id !== msg.id);
        this.history.push(msg);
      }, complete: () => this.streamSub = undefined
    });
    this.prompt = '';
  }

  cancel() {
    this.streamSub?.unsubscribe();
    this.streamSub = undefined;
  }

  toggleLike(msg: ChatMessage) {
    this.rate(msg, true);
  }

  toggleDislike(msg: ChatMessage) {
    this.rate(msg, false);
  }

  private rate(msg: ChatMessage, like: boolean) {
    this.svc.rate(msg.id, like).subscribe(() => msg.isLiked = like);
  }
}
