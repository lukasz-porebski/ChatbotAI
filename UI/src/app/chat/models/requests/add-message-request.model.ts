import { Optional } from '../../../shared/types/optional.type';

export class AddMessageRequest {
  public constructor(
    public readonly id: Optional<string>,
    public readonly isUser: boolean,
    public readonly text: string
  ) {
  }
}
