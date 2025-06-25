import { Subscription } from 'rxjs';
import { ChatAPIService } from './chat-api.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { isDefined } from '../shared/utils';
import { ChatMessageViewModel } from './models/views/chat-message-view.model';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { Optional } from '../shared/types/optional.type';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatIcon,
    MatFormField,
    MatInput,
    CdkTextareaAutosize,
    MatFormField,
    ChatMessageComponent,
    MatProgressSpinner
  ],
  providers: [ ChatAPIService ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  public get isSending(): boolean {
    return isDefined(this._streamSub);
  }

  public isInitialized = false;
  public history: ChatMessageViewModel[] = [];
  public generatedAnswer: Optional<ChatMessageViewModel>;
  public prompt = '';

  private _streamSub: Optional<Subscription>;

  public constructor(private readonly _apiService: ChatAPIService) {
  }

  public ngOnInit(): void {
    this._apiService.getHistory().subscribe(history => {
      this.history = history
      this.isInitialized = true
    });
  }

  public send(): void {
    this._apiService.addMessage(null, true, this.prompt).subscribe((message) => {
      this.history.push(message);

      this._streamSub = this._apiService.generateAnswer(this.prompt).subscribe({
        next: msg => {
          this.generatedAnswer = msg;
        }, complete: () => {
          this._streamSub = undefined
          this._apiService.addMessage(
            this.generatedAnswer!.id, false, this.generatedAnswer!.text).subscribe(() => {
            this.history.push(this.generatedAnswer!);
            this.generatedAnswer = undefined;
          });
        }
      });
      this.prompt = '';
    })
  }

  public cancel(): void {
    if (isDefined(this._streamSub)) {
      this._streamSub.unsubscribe();
      this._streamSub = undefined;
      this._apiService.addMessage(
        this.generatedAnswer!.id, false, this.generatedAnswer!.text).subscribe(() => {
        this.history.push(this.generatedAnswer!);
        this.generatedAnswer = undefined;
      });
    }
  }
}
