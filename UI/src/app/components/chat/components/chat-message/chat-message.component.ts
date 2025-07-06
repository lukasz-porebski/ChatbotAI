import { Component, effect, inject, input } from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
} from '@angular/material/card';
import { ChatMessageViewModel } from '../../models/views/chat-message-view.model';
import { MatIcon } from '@angular/material/icon';
import { Optional } from '../../../../../shared/types/optional.type';
import { ChatAPIService } from '../../../../services/chat-api.service';
import { ChatMessageParagraph } from './models/chat-message-paragraph.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-chat-message',
  imports: [MatCard, MatCardActions, MatCardContent, MatIcon],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent {
  public message = input.required<ChatMessageViewModel>();
  public hideButtons = input<boolean>(false);

  public paragraphs: ChatMessageParagraph[] = [];

  private readonly _apiService = inject(ChatAPIService);

  public constructor() {
    effect(() => {
      this.paragraphs = this.message()
        .text.split('\n')
        .map((value, index) => new ChatMessageParagraph(index, value));
    });
  }

  public async toggleLike(answer: ChatMessageViewModel): Promise<void> {
    await this._rateAnswer(answer, answer.isLiked ? undefined : true);
  }

  public async toggleDislike(answer: ChatMessageViewModel): Promise<void> {
    await this._rateAnswer(
      answer,
      answer.isLiked === false ? undefined : false,
    );
  }

  private async _rateAnswer(
    msg: ChatMessageViewModel,
    like: Optional<boolean>,
  ): Promise<void> {
    await firstValueFrom(this._apiService.rateAnswer(msg.id, like));
    msg.isLiked = like;
  }
}
