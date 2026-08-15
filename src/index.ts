import express from "express";
import type { Express, Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./api/api.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";

dotenv.config();
const app: Express = express();

app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim()) : true;
app.use(cors({
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(clerkMiddleware());

app.get("/", (req: Request, res: Response) => {
  res.send("Attendance Checker API is running!");
});

app.use("/api", apiRouter);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});