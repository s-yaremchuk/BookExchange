export class AppError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
