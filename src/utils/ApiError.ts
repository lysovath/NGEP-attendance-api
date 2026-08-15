export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    static badRequest(message: string) {
        return new ApiError(message, 400);
    }

    static unauthorized(message: string) {
        return new ApiError(message, 401);
    }

    static forbidden(message: string) {
        return new ApiError(message, 403);
    }

    static notFound(message: string) {
        return new ApiError(message, 404);
    }

    static conflict(message: string) {
        return new ApiError(message, 409);
    }

    static internal(message: string) {
        return new ApiError(message, 500);
    }
}

export default ApiError;