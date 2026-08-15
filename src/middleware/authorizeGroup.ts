import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { Role } from "@prisma/client"

export const authorizeGroup = (req: Request, res: Response, next: NextFunction) => {
  if (req.dbUser.role !== Role.ADMIN && req.dbUser.groupId !== Number(req.params.id)) {
    throw ApiError.forbidden("You do not have access to this group");
  }
  next();
};