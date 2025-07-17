# 🛒 E-Commerce API (Express + TypeScript + Prisma)

This project is a **RESTful API** for basic e-commerce operations, built with Express.js, TypeScript, and Prisma ORM.

## 🚀 Features

- User registration and login (with JWT)
- Product listing and creation (admin-only)
- Add to cart, view cart, and remove items
- Place and view orders
- Leave product reviews

## 🛠 Technologies

- **Node.js** & **Express.js**
- **TypeScript**
- **Prisma ORM** (MySQL)
- **JWT Authentication**
- **dotenv** (environment variables)
- **bcrypt** (password hashing)

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone git@github.com:melikebicer67/ecommerce-api.git
cd ecommerce-api
npm install

### 2. Install Dependencies
```bash
npm install

### 3. Setup environment variables
Create a .env file from the example:
cp .env.example .env

Fill in the values:
DATABASE_URL="mysql://user:password@localhost:3306/db_name"
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN="7d"

### 4. Database Setup
Run Migrations
```bash
npx prisma migrate dev --name init
Seed initial data (admin, products, etc.)
```bash
npx tsx prisma/seed.ts

### 5. Run the API
```bash
npm run dev
