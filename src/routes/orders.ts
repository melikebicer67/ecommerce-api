import { Router, Response } from "express";
import { AuthRequest, authenticateJWT } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// 1️⃣ Sipariş Oluştur
router.post("/", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Sepetiniz boş" });
    }

    const total = cartItems.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    // Siparişi ve orderItem'ları oluştur
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // o anki fiyat
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Sepeti temizle
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sipariş oluşturulurken hata oluştu" });
  }
});

// 2️⃣ Kullanıcının Siparişlerini Listele
router.get("/", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Siparişler getirilirken hata oluştu" });
  }
});

export default router;
