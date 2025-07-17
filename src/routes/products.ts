import { Router, Request, Response } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Middleware ile rol kontrolü için yardımcı fonksiyon
const isAdmin = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Yalnızca admin erişebilir" });
  }
  next();
};

//  Ürün Ekleme (Sadece admin)
router.post(
  "/",
  authenticateJWT,
  isAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, price, category } = req.body;
      if (!name || !price) {
        return res.status(400).json({ error: "Ürün adı ve fiyatı zorunlu" });
      }

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price,
          category,
          createdById: req.user!.id,
        },
      });

      res.status(201).json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Ürün oluşturulurken hata oluştu" });
    }
  }
);

//  Ürün Listeleme (Herkes erişebilir)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const whereClause = category ? { category: String(category) } : {};

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürünler listelenirken hata oluştu" });
  }
});

// Ürün Detaylarını Görüntüleme (ID ile)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Geçersiz ürün ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürün getirilirken hata oluştu" });
  }
});

export default router;
