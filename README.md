# ParkWise

ParkWise is a full-stack parking management system rebuilt on a modern React, Express.js, Prisma, and PostgreSQL stack.

## Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, Tesseract.js
- Backend: Node.js, Express.js, Prisma, JWT, bcrypt, dotenv
- Database: PostgreSQL
- Deployment: Vercel for frontend, Render or Railway for backend, Railway or Supabase for PostgreSQL

## Local Setup

1. Install frontend dependencies.

```bash
cd frontend
npm install
```

2. Install backend dependencies.

```bash
cd backend
npm install
```

3. Configure environment files.

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

4. Prepare the database.

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

5. Start both apps.

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

## Environment Variables

Frontend:

- `VITE_API_BASE_URL`

Backend:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `TOTAL_SPOTS`
- `BCRYPT_ROUNDS`

## Deployment

Backend:

- Deploy the `backend` folder to Render or Railway
- Set the environment variables above
- Run Prisma migrations and seed data after provisioning PostgreSQL

Frontend:

- Deploy the `frontend` folder to Vercel
- Point `VITE_API_BASE_URL` to the deployed backend URL

Database:

- Use Railway PostgreSQL, Supabase, Neon, or another PostgreSQL provider

## Features

- JWT authentication with bcrypt password hashing
- Role-based access for user and admin flows
- Vehicle registration and parking log tracking
- Slot and booking APIs backed by Prisma relations
- OCR-based number plate recognition with Tesseract.js
- Centralized validation and error handling

