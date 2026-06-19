## KitchenFlow: Product Requirements Document (PRD)

---

### 1. Executive Summary

KitchenFlow is a modern, lightweight Restaurant Management and Point of Sale (POS) system designed to streamline operations across the front-of-house (cashiers), back-of-house (chefs), and back-office (owners). By replacing fragmented legacy systems with a single cohesive platform, KitchenFlow reduces order friction, optimizes kitchen output, and provides real-time financial visibility.

### 2. User Roles & Personas

- **The Cashier (Front-of-House):** Needs a lightning-fast interface to input orders, process payments, and minimize customer wait times.
- **The Chef (Back-of-House):** Requires a clear, distraction-free Kitchen Display System (KDS) to track incoming tickets, manage cooking statuses, and alert the front-of-house when food is ready.
- **The Owner (Admin/Back-Office):** Demands accurate, high-level business intelligence to track revenue, monitor staff performance, and reconcile inventory and tax liabilities.

---

### 3. Phased Implementation Strategy

To avoid over-engineering and ensure a rapid time-to-market, the product roadmap is divided into three distinct phases.

| Phase                   | Focus                    | Key Deliverables                                                                                  |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| **Phase 1: Core MVP**   | Order Capture & Checkout | Menu management, basic order creation, token/auth system, and offline-capable receipt generation. |
| **Phase 2: Operations** | Kitchen & Analytics      | Kitchen Monitoring Module (KDS), Owner Reports Module, and tax/discount calculations.             |
| **Phase 3: Scale**      | Growth & Integrations    | Online ordering APIs, loyalty programs, and third-party accounting integrations.                  |

---

### 4. Functional Requirements (Phase 1 & 2)

#### Cashier Module (Point of Sale)

- **Order Creation:** Rapidly add items to a ticket from available menu categories.
- **Payment Processing:** Mark orders as paid via cash or card and calculate exact change.
- **Ticket Generation:** Generate a human-readable daily ticket number for order tracking.
- **Order Modification:** Cancel or refund orders if mistakes are made before food preparation begins.

#### Kitchen Monitoring Module (Chef)

- **Live Order Tracking:** Display a real-time queue of all ordered dishes, grouped by ticket number.
- **Dish-Level Status Updates:** Toggle individual items through states: Waiting, Cooking, Ready, and Served.
- **Completion Alerts:** Trigger visual/audio notifications to the front-of-house when an entire ticket is ready.
- **Cooking Time Analytics:** Automatically capture `started_cooking_at` and `completed_at` timestamps to calculate preparation metrics.

#### Reports Module (Owner)

- **Sales Summaries:** Aggregate gross and net revenue across daily, weekly, and monthly timeframes.
- **Tax & Discount Reports:** Isolate tax liabilities and track the financial impact of applied discounts.
- **Item Performance:** Rank menu items by sales volume to identify best-sellers and dead stock.
- **Sales Trends:** Visualize peak operational hours and days to optimize staff scheduling.
- **Cashier Balancing:** Group daily revenue by specific `user_id` to reconcile expected cash drawer totals against actual physical cash.
- **Inventory & Order Matching:** Cross-reference dishes marked "Served" by the kitchen against "Paid" orders from the cashier to identify unbilled items or food waste.

---

### 5. Non-Functional Requirements

- **Performance:** The POS order submission and Kitchen Display System (KDS) updates must resolve in under 500ms to ensure high-speed service during rush hours.
- **Reliability:** The database must support transactional integrity (ACID compliance) so that a network drop does not result in a paid order failing to reach the kitchen.
- **Security:** Passwords must be cryptographically hashed (e.g., bcrypt). API endpoints must be secured via role-based access control (RBAC) using JWTs to prevent a Cashier from accessing Owner reports.
- **Scalability:** The architecture must decouple the frontend UI from the backend APIs, allowing the database and backend services to scale horizontally as order volume increases.

---

### 6. Architecture & Tech Stack

- **Database:** PostgreSQL (Relational integrity is mandatory for financial and order matching).
- **Backend:** Spring Boot / Java (Based on previous schema context, providing robust enterprise-grade REST APIs).
- **Frontend (POS/KDS):** React.js
- **Real-Time Sync:** Server-Sent Events (SSE) to instantly push order updates from the Cashier to the Chef's screen.
