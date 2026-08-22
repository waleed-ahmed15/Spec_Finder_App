export class BadRequestError extends Error {
  constructor(public payload: unknown) {
    super('Bad Request');
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
