import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  const hashedPassword = await bcrypt.hash("user1234", 10);
  const hashedAdminPassword = await bcrypt.hash("admin1234", 10);

  // Kullanıcılar
  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      password: hashedPassword, // Gerçekte hash'lenmeli
      role: "USER",
      name: "Alice Track",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedAdminPassword,
      role: "ADMIN",
      name: "Tom Ricky",
    },
  });

  // Ürünler
  const phone = await prisma.product.upsert({
    where: { name: "Akıllı Telefon" },
    update: {},
    create: {
      name: "Akıllı Telefon",
      description: "Son model akıllı telefon",
      price: 4500,
      createdById: admin.id,
      category: "Elektronik",
    },
  });

  const tshirt = await prisma.product.upsert({
    where: { name: "Kanvas Ceket" },
    update: {},
    create: {
      name: "Kanvas Ceket",
      description: "Mevsimlik kanvas kumaştan şık ceket",
      price: 399,
      category: "Giyim",
      createdById: admin.id,
    },
  });

  await prisma.product.upsert({
    where: { name: "Organik Müslin Battaniye" },
    update: {},
    create: {
      name: "Organik Müslin Battaniye",
      description: "%100 pamuk, nefes alabilir yapı",
      price: 180,
      category: "Bebek",
      createdById: admin.id,
    },
  });

  // Yorumlar
  await prisma.review.upsert({
    where: { id: 1 },
    update: {},
    create: {
      productId: phone.id,
      userId: user1.id,
      content: "Harika ürün, tavsiye ederim!",
      rating: 5,
    },
  });

  // Sepet
  await prisma.cartItem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      productId: phone.id,
      userId: user1.id,
      quantity: 1,
    },
  });

  // Sipariş
  const order = await prisma.order.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user1.id,
      total: phone.price,
      orderItems: {
        create: {
          productId: phone.id,
          quantity: 1,
          price: phone.price,
        },
      },
    },
  });

  console.log("Seed data başarıyla yüklendi.");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
