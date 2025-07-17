import express, { Response } from "express";
import { AuthRequest, authenticateUser } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// creating new review
router.post("/", authenticateUser, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { productId, content, rating } = req.body;
  if (!userId) {
    return res.status(401).json({ error: "Yetkisiz işlem" });
  }
  try {
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        content,
        rating: rating ?? 5,
      },
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: "Yorum oluşturulamadı" });
  }
});

// Belirli bir ürünün yorumlarını listeleme
router.get("/product/:productId", async (req, res) => {
  const productId = Number(req.params.productId);

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: true },
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Yorumlar getirilemedi" });
  }
});

export default router;
