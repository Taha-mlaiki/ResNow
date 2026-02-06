# Reserv Now

A modern full-stack application for events and reservation management.

## 🚀 Tech Stack

### Backend
- **Framework:** [NestJS](https://nestjs.com/)
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** Passport.js (JWT)
- **Testing:** Jest

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI (Radix UI)
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Icons:** Lucide React

---

## 🛠️ Getting Started

You can run the application either using **Docker** (recommended) or **Locally**.

### Option 1: Docker (Recommended)

This allows you to spin up the entire stack (Frontend, Backend, Database) with a single command.

1. **Prerequisites**: Make sure you have Docker and Docker Compose installed.
2. **Run the application**:
   ```bash
   docker-compose up --build
   ```

**Access Points:**
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

### Option 2: Local Development

If you prefer to run services individually for development:

#### 1. Database
Start the PostgreSQL database using Docker (or use your own local instance).
```bash
docker-compose up postgres -d
```
*Port mapping: Maps container port `5432` to host port `5433`.*

#### 2. Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Copy `.env.example` to `.env`.
   - Update `DB_PORT` to `5433` (if using the docker-compose postgres).
   - Update `DB_HOST` to `localhost`.
4. Run the backend:
   ```bash
   npm run start:dev
   ```
   *The backend will start on [http://localhost:3000](http://localhost:3000).*

#### 3. Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Copy `.env.example` to `.env.local`.
   - Ensure `NEXT_PUBLIC_API_URL` points to your running backend (e.g., `http://localhost:3000`).
4. Run the frontend:
   ```bash
   npm run dev
   ```
   *The frontend will start on [http://localhost:3001](http://localhost:3001) (defined in package.json).*

> **⚠️ Note on Ports:**
> - **Docker Mode:** Frontend `3000`, Backend `3001`.
> - **Local Mode:** Backend `3000`, Frontend `3001`.

---

## 🧪 Testing

### Backend
```bash
cd backend
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:cov    # Coverage report
```

### Frontend
```bash
cd frontend
npm run test
```

## 📂 Project Structure

```
reserv-now/
├── backend/            # NestJS API application
├── frontend/           # Next.js web application
├── docker-compose.yml  # Docker orchestration
└── README.md           # This file
```
