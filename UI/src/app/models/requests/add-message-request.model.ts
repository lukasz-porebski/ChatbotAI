export class AddMessageRequest {
  public constructor(public readonly isUser: boolean, public readonly text: string) {
  }
}
