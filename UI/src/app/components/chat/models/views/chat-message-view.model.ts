import { Optional } from '../../../../../shared/types/optional.type';
import { isDefined } from '../../../../../shared/utils';

export class ChatMessageViewModel {
  public readonly id: string = '';
  public readonly isUser: boolean = false;
  public readonly text: string = '';
  public readonly timestamp: Date = new Date();
  public isLiked: Optional<boolean>;

  public constructor(response?: ChatMessageViewModel) {
    if (!isDefined(response)) {
      return;
    }

    this.id = response.id;
    this.isUser = response.isUser;
    this.text = response.text;
    this.timestamp = new Date(response.timestamp);
    this.isLiked = response.isLiked;
  }
}
