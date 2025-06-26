import { firstValueFrom, Subscription } from 'rxjs';
import { ChatAPIService } from '../../services/chat-api.service';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { isDefined } from '../../../shared/utils';
import { ChatMessageViewModel } from './models/views/chat-message-view.model';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { Optional } from '../../../shared/types/optional.type';

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule,
    MatIcon,
    MatFormField,
    MatInput,
    CdkTextareaAutosize,
    MatFormField,
    ChatMessageComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements AfterViewChecked, OnDestroy {
  public messagesContainer =
    viewChild.required<ElementRef>('messagesContainer');

  public history = input.required<ChatMessageViewModel[]>();

  public get isSending(): boolean {
    return isDefined(this._generatedAnswerSub);
  }

  public generatedAnswer: Optional<ChatMessageViewModel>;
  public prompt = '';

  private readonly _apiService = inject(ChatAPIService);

  private _generatedAnswerSub: Optional<Subscription>;

  public ngAfterViewChecked(): void {
    this._scrollMessagesContainerToBottom();
  }

  public ngOnDestroy(): void {
    this._generatedAnswerSub?.unsubscribe();
  }

  public async send(): Promise<void> {
    const addedPrompt = await firstValueFrom(
      this._apiService.addMessage(null, true, this.prompt),
    );
    this.history().push(addedPrompt);

    this._generatedAnswerSub = this._apiService
      .generateAnswer(this.prompt)
      .subscribe({
        next: (answer) => (this.generatedAnswer = answer),
        complete: async () => {
          this._generatedAnswerSub = undefined;
          await this._saveGeneratedAnswer();
        },
      });
    this.prompt = '';
  }

  public async cancel(): Promise<void> {
    this._generatedAnswerSub?.unsubscribe();
    this._generatedAnswerSub = undefined;
    await this._saveGeneratedAnswer();
  }

  private _scrollMessagesContainerToBottom(): void {
    const element = this.messagesContainer().nativeElement;
    element.scrollTop = element.scrollHeight;
  }

  private async _saveGeneratedAnswer(): Promise<void> {
    if (!isDefined(this.generatedAnswer)) {
      return;
    }

    await firstValueFrom(
      this._apiService.addMessage(
        this.generatedAnswer.id,
        false,
        this.generatedAnswer.text,
      ),
    );
    this.history().push(this.generatedAnswer);
    this.generatedAnswer = undefined;
  }
}
