import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      dbUser?: any;
    }
  }
}



export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      include: { group: true },
    });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      if (!primaryEmail) {
        return res.status(400).json({ error: "Bad Request: No primary email" });
      }

      user = await prisma.user.findUnique({
        where: { email: primaryEmail },
        include: { group: true },
      });

      if (!user) {
        return res.status(403).json({ error: "Forbidden: Account not pre-approved" });
      }

      const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          clerkId: auth.userId,
          name: user.name ?? (fullName || null),
        },
        include: { group: true },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Forbidden: Account deactivated" });
    }

    req.dbUser = user;
    return next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};

export const checkRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      return res.status(500).json({ 
        error: "Server Error: checkRole used without prior isAuthenticated middleware" 
      });
    }

    if (!allowedRoles.includes(req.dbUser.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};