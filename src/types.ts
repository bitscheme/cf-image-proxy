export interface EventLike {
  waitUntil(promise: Promise<unknown>): void
}
