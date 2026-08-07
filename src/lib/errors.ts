export class AppError extends Error {
  constructor(
    public override message: string,
    public status: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class InsufficientStockError extends AppError {
  constructor(messageOrVariantId: string) {
    const message =
      messageOrVariantId.startsWith("Insufficient") ||
      messageOrVariantId.includes("available") ||
      messageOrVariantId.includes("stock")
        ? messageOrVariantId
        : `Insufficient stock for variant ${messageOrVariantId}`;
    super(message, 409, "INSUFFICIENT_STOCK");
  }
}

export class InvalidSignatureError extends AppError {
  constructor() {
    super("Invalid payment signature", 400, "INVALID_SIGNATURE");
  }
}

export class CheckoutExpiredError extends AppError {
  constructor() {
    super("Checkout session has expired", 400, "CHECKOUT_EXPIRED");
  }
}

export function withErrorHandling(
  handler: (req: Request, ctx?: unknown) => Promise<Response>
) {
  return async (req: Request, ctx?: unknown): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AppError) {
        return Response.json(
          { error: err.message, code: err.code },
          { status: err.status }
        );
      }
      console.error("[unhandled error]", err);
      return Response.json(
        { error: "Internal server error", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }
  };
}
