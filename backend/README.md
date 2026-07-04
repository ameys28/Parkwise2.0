# ParkWise Backend

Express.js API with Prisma ORM and PostgreSQL. This backend replaces the previous serverless, managed-auth, and NoSQL setup.

## Setup

1. Copy the environment template.

```bash
cp .env.example .env
```

2. Install dependencies.

```bash
npm install
```

3. Point `DATABASE_URL` at a PostgreSQL database, then generate the client and migrate the schema.

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

4. Start the server.

```bash
npm run dev
```

## API Overview

All routes are mounted under `/api`.

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /vehicles`
- `POST /vehicles`
- `GET /logs`
- `POST /logs`
- `GET /occupancy`
- `GET /slots`
- `POST /slots`
- `PATCH /slots/:slotId`
- `GET /bookings`
- `POST /bookings`
- `PATCH /bookings/:bookingId/cancel`

## Data Model

Prisma models cover:

- Users
- Vehicles
- ParkingSlots
- Bookings
- ParkingSessions
- ParkingLogs

## Deployment

The backend is ready for Render or Railway:

- Set `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`
- Run `npm install`
- Run `npx prisma migrate deploy`
- Run `npm run prisma:seed` if you want the sample data

Render works well with PostgreSQL because Prisma can connect directly to the managed database URL without any AWS-specific infrastructure.

## Notes

- Authentication uses JWT plus bcrypt.
- OCR remains client-side through Tesseract.js.
- Image uploads can use local storage now, with Cloudinary as an optional later swap.
