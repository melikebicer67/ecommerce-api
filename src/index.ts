import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth";
import profileRouter from "./routes/profile";
import productRouter from "./routes/products";
import cardRouter from "./routes/card";
import orderRouter from "./routes/orders";
import reviewRouter from "./routes/review";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/products", productRouter);
app.use("/api/card", cardRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "E-ticaret API çalışıyor!" });
});

// Global error handler (basit)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
export default app; // Burada export et
