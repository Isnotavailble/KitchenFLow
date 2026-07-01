# KitchenFlow: User Stories

This document defines the key User Stories for KitchenFlow, mapping target persona requirements from the Product Requirements Document (PRD) and their current implementation details from Project Features & Implementation Status. It is tailored to a **Pre-Paid Self-Service Model**.

---

## 🧑‍💼 Cashier (Front-of-House) User Stories

### US-FOH-01: Order Creation
* **As a** Cashier (Front-of-House)  
* **I want to** rapidly build a customer ticket from menu categories and submit it  
* **So that** I can complete orders quickly and minimize customer queue times.

#### Acceptance Criteria:
1. The Cashier must be able to select items from distinct menu categories.
2. The Cashier can adjust quantities and add notes for specific items.
3. The system automatically fetches menu price snapshots to calculate the ticket subtotal and total.
4. Newly created tickets default to a `waiting` status.
5. Placed orders immediately dispatch to the kitchen display screen.

### US-FOH-02: Payment Processing
* **As a** Cashier (Front-of-House)  
* **I want to** choose a payment method (cash or card) and mark the order as paid  
* **So that** customer transactions are closed out and the cash drawer is balanced.

#### Acceptance Criteria:
1. The Cashier can select either cash or card (`online`) payment methods.
2. If cash is selected, the system calculates the exact change required based on cash received.
3. The database saves `payment_status` as `paid` along with computed `tax_amount` and `discount_amount` fields.

### US-FOH-03: Order Immutability & Customer Resolution
* **As a** Cashier (Front-of-House)  
* **I want to** be notified if an order is cancelled by the Owner due to an ingredient shortage
* **So that** I can communicate the issue to the pre-paid customer, process a manual refund or swap, and place a new corrected order.

#### Acceptance Criteria:
1. Cashiers **cannot** edit or cancel an order once it is created (status is locked to `waiting`).
2. If the Owner marks an order as `cancelled`, the Cashier screen receives a real-time notification.
3. The Cashier is responsible for physically refunding the customer or processing a replacement order.

---

## 👨‍🍳 Chef (Back-of-House) User Stories

### US-BOH-01: Real-Time Ticket Monitoring & Priority
* **As a** Chef (Back-of-House)  
* **I want to** view a live queue of incoming orders with calculated complexity ratings
* **So that** I can prioritize my preparation and manage my physical workload.

#### Acceptance Criteria:
1. Incoming tickets appear on the KDS terminal within a 500ms latency threshold of cashier submission.
2. The tickets display the human-readable daily tracker number (`order_number`).
3. Each order displays an algorithmically calculated Workload Complexity Rating (Light, Medium, Heavy) based on the formula $\sum (Q_i \times W_i)$.
4. Orders are sorted chronologically.

### US-BOH-02: Single-Touch Preparation Status
* **As a** Chef (Back-of-House)  
* **I want to** use a single tap to mark an order as finished 
* **So that** I spend less time touching screens and more time cooking.

#### Acceptance Criteria:
1. The Chef can tap a `waiting` order to immediately transition its state to `completed`.
2. Once completed, the order is finalized and moves off the active queue.
3. Changing status broadcasts the state change to cashier screens instantly.
4. The Chef does not have permission to cancel orders or mark menu items as unavailable.

---

## 📊 Owner (Back-Office) User Stories (In Backlog)

### US-OWN-01: Live Operations & Menu Control
* **As a** Restaurant Owner  
* **I want to** monitor live operations and exclusively control menu item availability
* **So that** I can prevent chef/cashier fraud and manage sudden ingredient shortages.

#### Acceptance Criteria:
1. The Dashboard displays active metrics: today's cumulative gross revenue, current queue length, and average order fulfillment duration.
2. The Owner has the exclusive right to toggle `is_available` on menu items.
3. The Owner has the exclusive right to cancel a paid order (`status = cancelled`) in the event of an ingredient race condition.

### US-OWN-02: Staff Provisioning & Efficiency Tracking
* **As a** Restaurant Owner  
* **I want to** provision user credentials, assign roles, and review cashier checkout speed  
* **So that** only authorized users access terminals and I can measure staff efficiency.

#### Acceptance Criteria:
1. The Admin can create, modify, and deactivate employee login accounts.
2. The Admin can map credentials to explicit roles (`ROLE_CASHIER`, `ROLE_CHEF`, `ROLE_OWNER`).
3. Employees are restricted to a single concurrent active session.

### US-OWN-03: Financial Auditing & Waste Reconciliation
* **As a** Restaurant Owner  
* **I want to** generate revenue, tax, discount, and cashier cash reconciliation reports  
* **So that** I can satisfy tax liabilities, balance cash drawers, and audit food waste.

#### Acceptance Criteria:
1. The Owner can filter reports by daily, weekly, and monthly timeframes.
2. The reports show aggregated net vs. gross sales. Net Sales calculation **excludes** orders with `status = cancelled`.
3. Cashier balancing reports group totals by `user_id` to compare physical drawer cash with expected digital sales.
