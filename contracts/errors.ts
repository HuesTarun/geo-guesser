export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export const Errors = {
  badRequest: (msg: string) => new AppError("BAD_REQUEST", msg, 400),
  unauthorized: (msg: string = "Unauthorized") => new AppError("UNAUTHORIZED", msg, 401),
  forbidden: (msg: string = "Forbidden") => new AppError("FORBIDDEN", msg, 403),
  notFound: (msg: string = "Not found") => new AppError("NOT_FOUND", msg, 404),
  conflict: (msg: string) => new AppError("CONFLICT", msg, 409),
  internal: (msg: string = "Internal server error") => new AppError("INTERNAL", msg, 500),
};
