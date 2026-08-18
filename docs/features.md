# KitchenFlow: Project Features & Implementation Status

This document outlines the features of the KitchenFlow project that combine the KDS (Kitchen Display System) and POS (Point of Sale).


## 🔐 1. Authentication & Security Engine
*Status: Active / Core Implemented*

A secure, stateless session authentication system built with Spring Security and OAuth2 Resource Server. Enforces role-based access control (RBAC) to ensure different permissions for Cashiers, Chefs, and Admins/Owners.

> [**⚠️WARNING**]
> **Testing Mode:** Token durations (such as the 2-minute refresh token expiry) are currently extendable and kept short for the purpose of testing.

*   **Stateless JWT Access Tokens:** 2-minute (configurable to 15-minute) JSON Web Tokens carrying client claims (`userId`, `role`) for fast authorization.

*   **Stateful Refresh Tokens:** Cryptographically secure UUID tokens stored in the database to manage active sessions..
*   **Password Hashing:** Passwords are cryptographically hashed using BCrypt.
*   **Early Refresh Protection:** Prevents client/frontend bugs from spamming token refreshes by enforcing a 30-second cooldown timer.
*   **Automatic Expiration Cleanup:** Automatically cleans up expired sessions on subsequent token generation.
*  **Role-Based Access Control (RBAC):** Restricts access to endpoints based on user roles (`ROLE_CASHIER`, `ROLE_CHEF`, `ROLE_ADMIN`).
* **Token Revocation:** Admins can revoke active sessions for any user, forcing them to re-authenticate.
* **Token reuse prevention:** Refresh tokens are single-use and invalidated after use to prevent replay attacks.


## 💵 2. Cashier Module (POS)
*Status: Active / Implemented*

*   **Order Creation:** Rapidly add items to a ticket from available menu categories. All orders are treated as pre-paid self-service orders. Newly created orders automatically start with a `waiting` status.

*   **Payment Processing:** Marks orders as paid via cash or card (`online` method) and records billing details like `tax_amount` and `discount_amount` in the database.

*   **Ticket Generation:** Generates a unique, daily ticket tracking number (`order_number`) for order tracking.

*   **Immutable Orders:** Cashiers cannot modify order items or cancel/refund orders. If an item is out of stock, the Owner must cancel the order, and the Cashier receives an alert to handle the refund/swap with the customer.

*   **Calculate Order Total:** Automatically sums the snapshot prices of all items dynamically.


*   **View Orders (SSE):** Allows cashiers to track the status of placed orders via the real-time stream with proper eventnames so that cashiers can see if the order status is `waiting`, `completed`, or `cancelled` by the Owner or Chef.


## 🍳 3. Kitchen Monitoring Module (KDS)
*Status: Active / Implemented*
*   **Receive Waiting Orders:** The Chef receives orders immediately with the `waiting` status as soon as the Cashier creates them.

*   **Automated Workload Rating:** The KDS calculates and displays a complexity rating (`order_duration` points) for each order using the mathematical formula: Total Points = Sum(Quantity * Workload Tier).The order workload tiers are defined as follows:
	*   **Light (1 point):** Simple items like drinks, salads, or easy to cook items.

	*   **Medium (4 points):** Moderate complexity items like sandwiches, wraps, or something that take moderate time to prepare.
	
	*   **Heavy (10 points):** Complex items like multi-component dishes, custom orders, or items requiring special preparation.

	* **Tier Rule in Math:** 0 - 4 (light) < 5 - 10 (medium) <= 11+ (heavy). The KDS displays the total points for each order, allowing the chef to prioritize based on workload. 

*   **Single-Touch Completion:** The Chef uses a high-throughput single-touch flow to transition an order from `waiting` directly to `completed`. There is no intermediate `cooking` state.

*   **No Cancellation/Menu Edits:** Chefs do not have permission to cancel orders or mark menu items as unavailable. This ensures strict Owner-level control over business operations.

*   **View Order By Menu:** The chef can view the order by menu item, allowing them to see all items that need to be prepared for a specific menu item across multiple orders.

* **View Orders (SSE):** The chef can view the incoming orders in real-time via SSEEmitter so that they can see if the order status is `waiting`, `completed`, or `cancelled` by the Owner or Cashier.


## 🔄 4. Real-Time Synchronization Engine
*Status: Active / Implemented*

A lightweight, high-performance real-time synchronization engine with low level spring boot classes ( SSEEmitter (for SSE) and DeferredResult for long polling ) designed to sync Cashier and Chef screens under the required 500ms threshold.

*   **SSE emitter with pub/sub pattern:** : Hold the connection longer than long polling or infinite connection, allowing the server to push updates to the client in real-time.
*   **Bidirectional Global Updates:** Instantly syncs the cashier's screen when a chef changes status to `completed` or an owner changes status to `cancelled`. Updates the kitchen display immediately when a cashier creates a ticket.
*   **Timestamp-Based Delta Sync (Optional):** Uses the `updated_at` column to invalidate caches and push incremental updates (replacing the old locking version sequence).
*   **Menu Availability Sync:** Instantly updates the cashier's active ordering menu when the owner toggles a menu item's availability (`isAvailable = false/true`), preventing invalid order creation.




## 👥 6. Account Module (Owner)
*Status: Planned / In Backlog*

*   **Account Provisioning:** Securely create, edit, and deactivate employee accounts' login credentials.
*   **Role Assignment:** Map specific roles (`ROLE_CASHIER`, `ROLE_CHEF`, `ROLE_ADMIN`) to enforce access control.


## 📊 7. Dashboard & Reporting Module (Owner)
*Status: Planned / In Backlog*
*   **Menu Creation & Management:** Allow owners to create, edit, and delete menu items, ensuring the ordering system reflects the latest offerings.Addiontally, any update by owner for menu item will be send by sse to ensure chasier don't have to refresh the ui.

*   **Menu Performance:** Rank menu items by sales volume ( order item with order status success(+) or cancel(-) ) to identify **best-sellers menu**  and **dead-menu items**.The calculation of performance will be shown in **daily, weekly and monthly** periods by each menu and all.

*   **Sales Analysis:** : Daily, weekly, and monthly revenue breakdowns with visual charts and graphs.KDI card are as follows: 
	
	*  **Today Sales ( completed orders count or largest completed order number)**
	*  **Today Highest Sales menu item (name with count)**
	*  **Today Total Revenue (have some proper unit like 1k 1M )**


*   **Sales Trends** Visualize peak operational hours and days to optimize staffing.must calculate revenue by: 
	* **Daily** : show by hours
	* **Weekly**: show by week days ( Monday - Sunday)
	* **Monthly**: show by month days (1-31)

*   **Cashier Balances checking:**  check daily revenue by specific cashier or all cashiers, and check the cashier's completed order count and total revenue.

*   **Monitor Orders In Real Time:** Owner can view the orders in real-time.If any human error occurs for order, the owner can edit/cancel the order status and order items to correct the order as needed.

*   **Data Export/Import & Reporting (optional backup feature):** Owner can export Sales Trends,Cashier Balances,Menu Performance and Sales Analysis in CSV/pdf format to backup in physical storage on their owns

*  **Tax Rate Adjustment:** Owner can adjust the tax rate dependent on its business needs. the default is 5%.



## 🏗️ 8. Architecture & Non-Functional Requirements (NFRs)
*Status: Partially Implemented*

*   **Performance:** must avoid O(N + 1) operations.

*   **Reliability (ACID):** Decoupled transactional integrity enforced via PostgreSQL and Spring transactional boundaries.
*   **Security:** Passwords cryptographically hashed using BCrypt. Role-based access control (RBAC) enforced via JWTs to restrict cashier and chef access to endpoints.
*   **Scalability:** Clear separation between frontend UI and backend API layers to allow independent horizontal scaling. Database mappings avoid unnecessary entity coupling.
