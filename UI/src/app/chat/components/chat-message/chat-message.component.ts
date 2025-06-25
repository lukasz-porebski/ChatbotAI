import { Component, inject, input } from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
} from '@angular/material/card';
import { ChatMessageViewModel } from '../../models/views/chat-message-view.model';
import { MatIcon } from '@angular/material/icon';
import { Optional } from '../../../shared/types/optional.type';
import { ChatAPIService } from '../../chat-api.service';

@Component({
  selector: 'app-chat-message',
  imports: [MatCard, MatCardActions, MatCardContent, MatIcon],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent {
  public message = input.required<ChatMessageViewModel>();
  public hideButtons = input<boolean>(false);

  private readonly _apiService = inject(ChatAPIService);

  public toggleLike(answer: ChatMessageViewModel): void {
    this._rateAnswer(answer, answer.isLiked ? undefined : true);
  }

  public toggleDislike(answer: ChatMessageViewModel): void {
    this._rateAnswer(answer, answer.isLiked === false ? undefined : false);
  }

  private _rateAnswer(
    msg: ChatMessageViewModel,
    like: Optional<boolean>,
  ): void {
    this._apiService
      .rateAnswer(msg.id, like)
      .subscribe(() => (msg.isLiked = like));
  }
}
