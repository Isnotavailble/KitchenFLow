## KitchenFlow: Product Requirements Document (PRD)

---

### 1. Executive Summary

KitchenFlow is a modern, lightweight Restaurant Management, Point of Sale (POS), and Kitchen Display System (KDS) designed to streamline operations across the front-of-house (cashiers), back-of-house (chefs), and back-office (owners). By replacing fragmented legacy systems with a single cohesive platform, KitchenFlow reduces order friction, optimizes kitchen output, and provides real-time financial visibility.

### 2. User Roles & Personas

- **The Cashier (Front-of-House):** Needs a lightning-fast interface to input orders, process payments, and minimize customer wait times.

- **The Chef (Back-of-House):** Requires a clear, distraction-free Kitchen Display System (KDS) to track incoming tickets, manage cooking statuses, and alert the front-of-house when food is ready.

- **The Owner (Admin/Back-Office):** Demands accurate, high-level business intelligence to track revenue, monitor staff performance, and reconcile inventory and tax liabilities.

---

### 3. Functional Requirements (Phase 1 & 2)

#### Dashboard Module (Owner)

- **Real-Time Metrics:** Display live data on the current day's gross revenue, active ticket volume, and average order fulfillment times.
- **Operational Overview:** Provide a quick-glance view of active staff logged into the system and the current operational status of the kitchen queue.
- **Quick Navigation:** Offer immediate access links to high-priority administrative areas, such as daily reports, menu management, and inventory alerts.

#### Staff Management Module (Owner)

- **Account Provisioning:** Securely create, edit, and deactivate employee login credentials.
- **Role Assignment:** Map specific roles (e.g., Cashier, Chef, Admin) to enforce system access based on job responsibilities.
- **Shift Logging:** Track staff clock-in and clock-out times to monitor attendance and accurately calculate operational hours.
- **Efficiency Metrics:** Link individual `user_id` data to order volume and checkout speed to evaluate the performance of front-of-house staff.

#### Cashier Module (Point of Sale)

- **Order Creation:** Rapidly add items to a ticket from available menu categories. All orders are treated as pre-paid.
- **Payment Processing:** Mark orders as paid via cash or card and calculate exact change. 
- **Ticket Generation:** Generate a human-readable daily ticket number for order tracking.
- **Immutable Orders (Self-Service):** Once an order is created, cashiers cannot modify or cancel it. Only the Owner can initiate a cancellation.

#### Kitchen Monitoring Module (Chef)

- **Live Order Tracking:** Display a real-time queue of all ordered dishes, grouped by ticket number.
- **Single-Touch Completion:** Toggle tickets via a high-throughput single-touch workflow directly from `Waiting` to `Completed` (No intermediate cooking statuses).
- **Automated Workload Complexity:** Orders display an algorithmically calculated workload complexity rating (Light, Medium, Heavy) to help chefs prioritize their prep.

#### Reports Module (Owner)

- **Sales Summaries:** Aggregate gross and net revenue across daily, weekly, and monthly timeframes.

- **Tax & Discount Reports:** Isolate tax liabilities and track the financial impact of applied discounts.

- **Item Performance:** Rank menu items by sales volume to identify best-sellers and dead stock.

- **Sales Trends:** Visualize peak operational hours and days to optimize staff scheduling.

- **Cashier Balancing:** Group daily revenue by specific `user_id` to reconcile expected cash drawer totals against actual physical cash.

- **Inventory & Order Matching:** Cross-reference dishes marked "Served" by the kitchen against "Paid" orders from the cashier to identify unbilled items or food waste.

---

### 4. Non-Functional Requirements

- **Performance:** The POS order submission and Kitchen Display System (KDS) updates must resolve in under 500ms to ensure high-speed service during rush hours.

- **Reliability:** The database must support transactional integrity (ACID compliance) so that a network drop does not result in a paid order failing to reach the kitchen.

- **Security:** Passwords must be cryptographically hashed (e.g., bcrypt). API endpoints must be secured via role-based access control (RBAC) using JWTs to prevent a Cashier from accessing Owner reports.

- **Scalability:** The architecture must decouple the frontend UI from the backend APIs, allowing the database and backend services to scale horizontally as order volume increases.

---

### 5. Architecture & Tech Stack

- **Database:** PostgreSQL

- **Backend:** Spring Boot / Java

- **Frontend (POS/KDS):** React.js

- **Real-Time Sync:** Server-Sent Events (SSE) to instantly push order updates from the Cashier to the Chef's screen.
