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
    return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      include: { group: true },
    });

    if(user) {
        const isInAllowedList = await prisma.allowedUser.findUnique({
            where: { email: user.email },
        });

        if (!isInAllowedList) {
            return res.status(403).json({ error: "Forbidden: User not in allowed list" });
        }

        req.dbUser = user;
        return next();
    }

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;

      if (!primaryEmail) {
        return res.status(400).json({ error: "User missing primary email address" });
      }

      const isInAllowedList = await prisma.allowedUser.findUnique({
        where: { email: primaryEmail },
      });

      if (!isInAllowedList) {
        return res.status(403).json({ error: "Forbidden: User not in allowed list" });
      }

      user = await prisma.user.create({
        data: {
          clerkId: auth.userId,
          email: primaryEmail,
          firstName: clerkUser.firstName ?? "",
          lastName: clerkUser.lastName ?? "",
          groupId: isInAllowedList.groupId,
        },
        include: { group: true },
      });
    }

    req.dbUser = user;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
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