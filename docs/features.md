# KitchenFlow: Project Features & Implementation Status

This document outlines the features, architecture, and functional/non-functional requirements of the KitchenFlow Restaurant Management and Point of Sale (POS) system.

---

## 🔐 1. Authentication & Security Engine
*Status: Active / Core Implemented*

A secure, stateless session authentication system built with Spring Security and OAuth2 Resource Server. Enforces role-based access control (RBAC) to ensure different permissions for Cashiers, Chefs, and Admins/Owners.

> [!WARNING]
> **Testing Mode:** Token durations (such as the 2-minute refresh token expiry) are currently extendable and kept short for the purpose of testing.

*   **Stateless JWT Access Tokens:** 2-minute (configurable to 15-minute) JSON Web Tokens carrying client claims (`userId`, `role`) for fast authorization.
*   **Stateful Refresh Tokens:** Cryptographically secure UUID tokens stored in the database to manage active sessions..
*   **Password Hashing:** Passwords are cryptographically hashed using BCrypt.
*   **Early Refresh Protection:** Prevents client/frontend bugs from spamming token refreshes by enforcing a 30-second cooldown timer.
*   **Automatic Expiration Cleanup:** Automatically cleans up expired sessions on subsequent token generation.
*   **Custom JSON Error Filters:** Custom `AuthenticationEntryPoint` intercepting all Spring Security failures to return clean, structured JSON errors to the client instead of HTML error pages.

---

## 💵 2. Cashier Module (POS)
*Status: Active / Implemented*

*   **Order Creation:** Rapidly add items to a ticket from available menu categories, fetching current prices from the menu and capturing snapshots. Newly created orders automatically start with a `waiting` status.
*   **Payment Processing:** Marks orders as paid via cash or card (`online` method) and records billing details like `tax_amount` and `discount_amount` in the database.
*   **Ticket Generation:** Generates a unique, daily ticket tracking number (`order_number`) for order tracking.
*   **Order Modification:** Cashiers can modify order items or cancel/refund (set status to `cancel`) the order **only while it is in the `waiting` state**.
*   **Transition Blockers:** Cashiers are not allowed to update items or status once the order moves to the `cooking` state.
*   **Calculate Order Total:** Automatically sums the snapshot prices of all items.
*   **View Orders:** Allows cashiers to track the status of placed orders.The cashier can view all orders, filter by status (`waiting`, `cooking`, `complete`, `cancel`).

---

## 🍳 3. Kitchen Monitoring Module (KDS)
*Status: Active / Implemented*
*   **Receive Waiting Orders:** The Chef receives orders immediately with the `waiting` status as soon as the Cashier creates them.
*   **Transition to Cooking:** The Chef accepts a waiting order and updates its status to `cooking`.
*   **Transition to Complete:** Once the order is prepared, the Chef updates the status from `cooking` to `complete` (corresponds to the "Ready" and "Served" states in the PRD, notifying the front-of-house).
*   **No Cancellation:** Chefs do not have permission to cancel orders; only Cashiers and Admins are authorized.
*   **Finalized (Dead) States:** Once an order is marked `complete` or `cancel`, it becomes finalized and immutable. No further updates to items or status transitions are allowed.
* **View Order By Menu** The chef can view the order by menu item, allowing them to see all items that need to be prepared for a specific menu item across multiple orders.
* ****

---

## 🔄 4. Real-Time Synchronization Engine
*Status: Active / Implemented*

A lightweight, high-performance real-time synchronization engine designed to sync Cashier and Chef screens under the required 500ms threshold.

*   **Non-Blocking DeferredResult:** Holds client update requests open without blocking servlet threads.
*   **Bidirectional Global Updates:** Instantly syncs the cashier's screen when a chef changes status (`cooking`, `complete`), and updates the kitchen display immediately when a cashier creates or modifies a ticket.
*   **In-Memory Version Cache:** Uses a sequence-based in-memory cache to prevent "reconnect-gap" timeouts and avoid database polling overhead.
*   **Menu Availability Sync:** Instantly updates the cashier's active ordering menu when the chef toggles a menu item's availability (`isAvailable = false/true`) in the kitchen.

---

## ⚙️ 5. Dashboard Module (Owner)
*Status: Planned / In Backlog*

Administrative dashboard features intended for restaurant owners/administrators to monitor restaurant health.

*   **Real-Time Metrics:** Live stats on the current day's gross revenue, active ticket volume, and average order fulfillment times.
*   **Operational Overview:** Real-time visibility into active staff logged into the system and kitchen queue status.
*   **Quick Navigation:** Admin quick links to daily reports, menu management, and inventory alerts.

---

## 👥 6. Staff Management Module (Owner)
*Status: Planned / In Backlog*

Administrative staff management tools to provision, assign, and track employee performance.

*   **Account Provisioning:** Securely create, edit, and deactivate employee login credentials (currently pre-seeded via [PreUpdateUserTable](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/backend/poskds/src/main/java/com/anyawalker/poskds/features/postconstruct/PreUpdateUserTable.java)).
*   **Role Assignment:** Map specific roles (`ROLE_CASHIER`, `ROLE_CHEF`, `ROLE_ADMIN`) to enforce access control.
*   **Shift Logging:** Track clock-in and clock-out times to monitor attendance and operational hours.
*   **Efficiency Metrics:** Link individual `user_id` data to order volume and checkout speed to evaluate cashier performance.

---

## 📊 7. Reports Module (Owner)
*Status: Planned / In Backlog*

Comprehensive business intelligence reports for financial reporting, auditing, and performance optimization.

*   **Sales Summaries:** Aggregated gross and net revenue over daily, weekly, and monthly timeframes.
*   **Tax & Discount Reports:** Isolate tax liabilities and track discount impacts (tracked via `tax_amount` and `discount_amount` in [db.sql](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/db.sql)).
*   **Item Performance:** Rank menu items by sales volume to identify best-sellers and dead stock.
*   **Sales Trends:** Visualize peak operational hours and days to optimize staffing.
*   **Cashier Balancing:** Group daily revenue by `user_id` to reconcile expected cash drawer totals against physical cash.
*   **Inventory & Order Matching:** Cross-reference "complete/served" dishes from the kitchen against "paid" orders to identify waste or unbilled items.

---

## 🏗️ 8. Architecture & Non-Functional Requirements (NFRs)
*Status: Partially Implemented*

*   **Performance:** POS order submission and KDS status updates are designed to resolve in under 500ms.
*   **Reliability (ACID):** Decoupled transactional integrity enforced via PostgreSQL and Spring transactional boundaries.
*   **Security:** Passwords cryptographically hashed using BCrypt. Role-based access control (RBAC) enforced via JWTs to restrict cashier and chef access to endpoints.
*   **Scalability:** Clear separation between frontend UI and backend API layers to allow independent horizontal scaling. Database mappings avoid unnecessary entity coupling.
