import { Router, Response } from "express";
import { AuthRequest, authenticateJWT } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// 🟢 1. Sepete Ürün Ekle ( varsa miktarı artır)
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user!.id;

    if (!productId || quantity < 1) {
      return res
        .status(400)
        .json({ error: "Geçerli productId ve quantity gerekli" });
    }
    // Sepette ürün var mı?
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    let updatedItem;

    if (existing) {
      updatedItem = await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: {
          quantity: existing.quantity + quantity,
        },
      });
    } else {
      updatedItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });
    }

    res.status(201).json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürün sepete eklenirken hata oluştu" });
  }
});

// 🟡 2. Sepeti Listele
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cartItem.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        product: true,
      },
    });

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sepet listelenirken hata oluştu" });
  }
});

// 🔴 3. Sepetten Ürün Çıkar
router.delete(
  "/:productId",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const { productId } = req.params;

      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: req.user!.id,
            productId: Number(productId),
          },
        },
      });

      res.json({ message: "Ürün sepetten silindi" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ürün silinirken hata oluştu" });
    }
  }
);

// ⚫ 4. Sepeti Temizle
router.delete("/", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.cartItem.deleteMany({
      where: {
        userId: req.user!.id,
      },
    });

    res.json({ message: "Sepet temizlendi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sepet temizlenirken hata oluştu" });
  }
});

export default router;
