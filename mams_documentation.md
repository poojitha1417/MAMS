# Military Asset Management System (MAMS) - Project Documentation

## 1. Project Overview
**Description:**
The Military Asset Management System (MAMS) is a digital platform designed for the command and logistics units of the armed forces. It provides a centralized ledger for tracking high-value assets (vehicles, weapons, ammunition) across multiple military bases.

**Assumptions:**
- **Ledger-Based Inventory:** Inventory balances are not stored as single values but are calculated in real-time by aggregating all transactions (Purchases, Transfers, Assignments, and Expenditures).
- **Stateless Authentication:** User sessions are managed via JSON Web Tokens (JWT), ensuring scalability and security.
- **Reference Integrity:** Users are responsible for providing valid reference strings (e.g., Mission IDs or Personnel Names) for the ledger.

**Limitations:**
- **MVP Guardrails:** The current version logs transactions even if the theoretical balance would drop below zero (no stock-out validation).
- **Network Dependency:** Requires a stable connection to the central server for real-time tracking.
- **Manual Data Entry:** Asset types are predefined and require manual selection during registration.

---

## 2. Tech Stack & Architecture
**Backend:**
- **Node.js & Express:** High-performance, scalable server environment.
- **Prisma ORM:** Type-safe database access and migration management.
- **Express.js (v5.2.1):** Next-generation web framework for routing and middleware.

**Frontend:**
- **React (Vite):** Modern, fast frontend framework.
- **Tailwind CSS:** Utility-first CSS for a premium "Tactical Dark" UI.
- **Heroic Icons:** Clean, professional iconography.

**Database:**
- **PostgreSQL / SQLite:** Relational database support via Prisma. SQLite is used for development for zero-config portability.

**Architecture:**
- **Client-Server Model:** Separation of concerns between a RESTful API and a responsive React frontend.
- **JWT Auth Flow:** Secure, stateless communication between client and server.

---

## 3. Data Models / Schema
### Core Entities:
- **User:** Stores username, role, and assigned base.
- **Base:** Represents a military installation with a name and location.
- **Asset:** Defines the types of equipment tracked (e.g., M1A2 Abrams, M4 Carbine).
- **Transaction:** The central ledger capturing asset movements, types (PURCHASE, TRANSFER, ASSIGN, EXPEND), and personnel references.

**Relationships:**
- A **User** belongs to a **Base**.
- a **Transaction** links an **Asset**, a **User** (performer), and optionally a **FromBase** and **ToBase**.

---

## 4. RBAC Explanation
Role-Based Access Control is enforced via custom middleware on every sensitive API request.

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **ADMIN** | Global / Read-Write | Manage bases, users, assets, and perform any transaction. |
| **COMMANDER** | Base-Specific / Read-Write | Oversee asset movements and assignments for their assigned base. |
| **LOGISTICS** | Inventory Focal / Read-Write | Focused on recording purchases and transfers between bases. |

**Enforcement Method:**
- `authMiddleware`: Verifies the JWT and attaches the user payload to the request.
- `roleMiddleware(['ROLE'])`: Checks if the authenticated user has the required permission level.

---

## 5. API Logging
MAMS employs a **Transaction Ledger** approach:
- Every action that modifies the state of an asset is recorded as a immutable record in the `Transaction` table.
- **Logging Attributes:** Timestamp, User ID (Who), Asset ID (What), Base IDs (Where), and Type (How).
- This provides a full audit trail for accountability and historical analysis.

---

## 6. Setup Instructions
### Prerequisites:
- Node.js (v18+)
- NPM or Yarn

### Backend Setup:
1. Ensure you are in the project root directory.
2. Run `npm install` to install backend dependencies.
3. Configure `.env` with `JWT_SECRET` and `DATABASE_URL`.
4. Run `npx prisma db push` to initialize the database.
5. Run `node seed.js` to populate roles and assets.
6. Start the server with `npm run dev`.

### Frontend Setup:
1. Navigate to `smart/client` directory.
2. Run `npm install`.
3. Run `npm run dev`.
4. Access via `http://localhost:5173`.

---

## 7. Core Features Walkthrough

### 📊 Mission Dashboard
The Dashboard provides a real-time "Mission Overview" of all global assets.
- **Aggregated Analytics:** View total closing balances, net movements, assignments, and expenditures.
- **Visual Distribution:** Interactive Bar Charts (via Recharts) showing asset allocation by type.
- **Inventory Ledger:** A live table detailing movement (Purchases, Transfers-In, Transfers-Out) for every asset/base combination.

### 👥 Personnel & Command
Accessible primarily by **ADMINS**, this module manages the human and physical infrastructure.
- **Establish Bases:** Create new operational bases with specific sector designations.
- **Register Personnel:** Authorize new users, assign roles (COMMANDER, LOGISTICS), and link them to specific bases.
- **Operational Roster:** A complete view of all authorized personnel and their current oversight assignments.

### 🛡️ Logistics Operations
The operational core for movements.
- **Purchase Orders:** Recording new asset acquisitions into the system.
- **Inter-Base Transfers:** Logging movements from one base to another (enforced by user base assignment).
- **Assignments & Expenditures:** Tracking assets as they are deployed to missions or used in the field.

---

## 8. API Endpoints (Key)
- `POST /api/auth/login`: Authenticate and receive JWT.
- `GET /api/inventory/dashboard`: Fetch real-time aggregated balance across bases.
- `POST /api/transactions/transfer`: Log a move between bases.
- `GET /api/inventory/movements`: Retrieve the full history of the ledger.

---

## 8. Login Credentials
For testing and demonstration, use the following credentials:

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `admin123` | ADMIN |
| `commander_alpha` | `cdr123` | COMMANDER (Base Alpha) |
| `logistics_bravo` | `log123` | LOGISTICS (Base Bravo) |

---
*End of Documentation*
