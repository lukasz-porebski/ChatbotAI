import { Optional } from '../../../shared/types/optional.type';
import { isDefined } from '../../../shared/utils';

export interface ChatMessageResponse {
  Id: string;
  IsUser: boolean;
  Text: string;
  Timestamp: string;
  IsLiked?: boolean;
}

export class ChatMessageViewModel {
  public readonly id: string = '';
  public readonly isUser: boolean = false;
  public readonly text: string = '';
  public readonly timestamp: Date = new Date();
  public isLiked: Optional<boolean>;

  public constructor(response: ChatMessageResponse) {
    if (!isDefined(response)) {
      return;
    }

    this.id = response.Id;
    this.isUser = response.IsUser;
    this.text = response.Text;
    this.timestamp = new Date(response.Timestamp);
    this.isLiked = response.IsLiked;
  }
}
