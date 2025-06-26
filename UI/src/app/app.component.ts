import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { ChatMessageViewModel } from './components/chat/models/views/chat-message-view.model';
import { ChatAPIService } from './services/chat-api.service';
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  imports: [FormsModule, MatProgressSpinner, ChatComponent],
  providers: [ChatAPIService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public readonly history: ChatMessageViewModel[] = [];

  public isInitialized = false;

  private readonly _apiService = inject(ChatAPIService);

  public async ngOnInit(): Promise<void> {
    const history = await firstValueFrom(this._apiService.getHistory());
    this.history.push(...history);
    this.isInitialized = true;
  }
}
