// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  return res.status(500).json({ error: "Internal Server Error" });
};