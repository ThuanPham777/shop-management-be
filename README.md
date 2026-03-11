# Shop Management - Backend

Backend API for the Shop Management system, built with NestJS + TypeORM + PostgreSQL.

## System Description

The system allows **shop owners** to manage their shops and employees, while **freelancers** can search for and send work requests. At any given time, each freelancer can only work for one shop.

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL 13 + TypeORM
- **Auth**: JWT (access token + refresh token), Passport
- **Validation**: class-validator + class-transformer
- **Password**: bcrypt

## Requirements

- Node.js >= 18
- PostgreSQL 13+ (or Docker)

## Installation

```bash
# 1. Clone repo & install dependencies
npm install

# 2. Create .env file from .env.example
cp .env.example .env
# Edit environment variables in .env as needed

# 3. Start PostgreSQL with Docker
docker compose up -d

# 4. Run migrations (create tables + seed sample data)
npm run migration:run

# 5. Start server
npm run start:dev
```

Server runs at `http://localhost:3000`.

## Environment Variables

| Variable                   | Description              | Default           |
| -------------------------- | ------------------------ | ----------------- |
| `PORT`                     | Server port              | `3000`            |
| `POSTGRES_HOST`            | Database host            | `localhost`       |
| `POSTGRES_PORT`            | Database port            | `5432`            |
| `POSTGRES_USER`            | Database user            | `postgres`        |
| `POSTGRES_PASSWORD`        | Database password        | `postgres`        |
| `POSTGRES_DB`              | Database name            | `shop_management` |
| `JWT_SECRET`               | JWT secret key           | —                 |
| `JWT_EXPIRES_IN`           | Access token TTL         | `15m`             |
| `JWT_REFRESH_EXPIRES_DAYS` | Refresh token TTL (days) | `7`               |

## Scripts

```bash
npm run start:dev        # Development (watch mode)
npm run build            # Build
npm run start:prod       # Production (requires build)
npm run migration:run    # Build + run migrations
npm run migration:revert # Build + revert last migration
npm run lint             # Lint
npm run format           # Format code
npm run test             # Unit tests
npm run test:e2e         # E2E tests
```

## Project Structure

```
src/
├── auth/                # Register, login, email verification, JWT
├── profile/             # View & update personal profile
├── shop/                # Shop CRUD + employee management
├── search/              # Search shops (by owner code) & freelancers (by phone)
├── work-request/        # Work requests (freelancer ↔ shop owner)
├── contract/            # List & view contract details
├── common/              # Guards, filters, interceptors, decorators, error codes
├── config/              # Database config
├── entities/            # TypeORM entities
└── migrations/          # Migration files
```

## API Endpoints

### 1. Authentication

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/auth/register`      | Register a new account |
| POST   | `/api/auth/verify-email`  | Verify email           |
| POST   | `/api/auth/login`         | Login                  |
| POST   | `/api/auth/logout`        | Logout                 |
| POST   | `/api/auth/refresh-token` | Refresh access token   |

### 2. Profile

| Method | Endpoint       | Description           |
| ------ | -------------- | --------------------- |
| GET    | `/api/profile` | View personal profile |
| PUT    | `/api/profile` | Update profile        |

### 3. Shops (Shop Owner)

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/shops`         | Create a shop    |
| GET    | `/api/shops`         | List shops       |
| GET    | `/api/shops/:shopId` | Shop details     |
| PUT    | `/api/shops/:shopId` | Update shop      |
| DELETE | `/api/shops/:shopId` | Soft delete shop |

### 4. Employees (Shop Owner)

| Method | Endpoint                                   | Description        |
| ------ | ------------------------------------------ | ------------------ |
| GET    | `/api/shops/:shopId/employees`             | List employees     |
| DELETE | `/api/shops/:shopId/employees/:contractId` | Terminate contract |

### 5. Search

| Method | Endpoint                            | Description                 |
| ------ | ----------------------------------- | --------------------------- |
| GET    | `/api/search/shops?ownerCode=xxx`   | Search shops by owner code  |
| GET    | `/api/search/freelancers?phone=xxx` | Search freelancers by phone |

### 6. Work Requests (Freelancer & Shop Owner)

| Method | Endpoint                         | Description                        |
| ------ | -------------------------------- | ---------------------------------- |
| POST   | `/api/work-requests`             | Send work request/proposal         |
| GET    | `/api/work-requests`             | List work requests                 |
| PUT    | `/api/work-requests/:id/respond` | Respond to request (accept/reject) |

### 7. Contracts (Freelancer & Shop Owner)

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| GET    | `/api/contracts`     | List contracts   |
| GET    | `/api/contracts/:id` | Contract details |

## Sample Data

After running migrations, the system includes:

| Name         | Email                   | Password    | Role       |
| ------------ | ----------------------- | ----------- | ---------- |
| Nguyen Van A | owner1@example.com      | Password123 | shop_owner |
| Tran Thi B   | owner2@example.com      | Password123 | shop_owner |
| Le Van C     | freelancer1@example.com | Password123 | freelancer |
| Pham Thi D   | freelancer2@example.com | Password123 | freelancer |

- 3 shops, 5 work requests, 2 active contracts
