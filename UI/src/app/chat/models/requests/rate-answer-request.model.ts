import { Optional } from '../../../shared/types/optional.type';

export class RateAnswerRequest {
  public constructor(
    public readonly id: string,
    public readonly isLiked: Optional<boolean>,
  ) {}
}
