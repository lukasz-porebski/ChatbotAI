import { Optional } from './types/optional.type';

export function isDefined<T>(value: Optional<T>): value is T {
  return value !== null && value !== undefined;
}
