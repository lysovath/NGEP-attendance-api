import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ZodSchema } from "zod";

interface validateTarget {
    body?: ZodSchema<any>;
    query?: ZodSchema<any>;
    params?: ZodSchema<any>;
}

export const validateSchemas = (schemas: validateTarget) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }

            if (schemas.query) {
                const parsedQuery = schemas.query.parse(req.query);
                Object.keys(req.query).forEach((key) => {
                    delete req.query[key];
                })
                Object.assign(req.query, parsedQuery);
            }

            if (schemas.params) {
                const parsedParams = schemas.params.parse(req.params);
                Object.keys(req.params).forEach((key) => {
                    delete req.params[key];
                })
                Object.assign(req.params, parsedParams);
            }

            return next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: "Validation Error",
                    details: error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message,
                    }))
                });
            }
            return res.status(500).json({ error: "Internal Server Error" });
        }

    }
}

export default validateSchemas;