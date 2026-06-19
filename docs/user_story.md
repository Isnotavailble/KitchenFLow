# KitchenFlow: User Stories

This document defines the key User Stories for KitchenFlow, mapping target persona requirements from the Product Requirements Document (PRD) and their current implementation details from Project Features & Implementation Status.

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

### US-FOH-03: Order Modification & Cancellation
* **As a** Cashier (Front-of-House)  
* **I want to** modify or cancel a submitted order if the customer changes their mind  
* **So that** we prevent preparing incorrect food and minimize operational waste.

#### Acceptance Criteria:
1. The Cashier can cancel (status set to `cancel`) or edit items on a ticket **only** while the status remains `waiting`.
2. Once the Chef transitions the order status to `cooking`, the Cashier must be blocked from modifying or cancelling the ticket.

---

## 👨‍🍳 Chef (Back-of-House) User Stories

### US-BOH-01: Real-Time Ticket Monitoring
* **As a** Chef (Back-of-House)  
* **I want to** view a live, automatically updated queue of incoming orders  
* **So that** I know what to prepare next without physical tickets or manual screen refreshes.

#### Acceptance Criteria:
1. Incoming tickets appear on the KDS terminal within a 500ms latency threshold of cashier submission.
2. The tickets display the human-readable daily tracker number (`order_number`).
3. The tickets display order items, item quantities, and preparation notes.
4. Orders are sorted chronologically to ensure first-in, first-out preparation.

### US-BOH-02: Preparation Status Tracking
* **As a** Chef (Back-of-House)  
* **I want to** update the status of active orders as they progress (Waiting $\rightarrow$ Cooking $\rightarrow$ Complete)  
* **So that** the front-of-house is automatically updated when food is ready.

#### Acceptance Criteria:
1. The Chef can click to accept a `waiting` order, transitioning its state to `cooking`.
2. The Chef can mark a `cooking` order as `complete` once preparation finishes.
3. Once completed or cancelled, the order is finalized, moving to a dead state where its items and status are immutable.
4. Changing status broadcasts the state change to cashier screens instantly.
5. The Chef does not have permission to cancel orders.

---

## 📊 Owner (Back-Office) User Stories (In Backlog)

### US-OWN-01: Live Operations Dashboard
* **As a** Restaurant Owner  
* **I want to** monitor live operational stats including revenue, ticket volumes, and active staff  
* **So that** I have real-time visibility into current operations and store performance.

#### Acceptance Criteria:
1. The Dashboard displays active metrics: today's cumulative gross revenue, current queue length, and average order fulfillment duration.
2. The Dashboard displays a list of active cashiers and chefs currently clocked/logged into the system.
3. Quick links navigate to menu config, current reports, and inventory alert logs.

### US-OWN-02: Staff Provisioning & Efficiency Tracking
* **As a** Restaurant Owner  
* **I want to** provision user credentials, assign roles, and review cashier checkout speed  
* **So that** only authorized users access terminals and I can measure staff efficiency.

#### Acceptance Criteria:
1. The Admin can create, modify, and deactivate employee login accounts.
2. The Admin can map credentials to explicit roles (`ROLE_CASHIER`, `ROLE_CHEF`, `ROLE_ADMIN`).
3. Employees are restricted to a single concurrent active session.
4. The system logs cashier checkout processing speeds and relates them to employee `user_id`.

### US-OWN-03: Financial Auditing & Waste Reconciliation
* **As a** Restaurant Owner  
* **I want to** generate revenue, tax, discount, and cashier cash reconciliation reports  
* **So that** I can satisfy tax liabilities, balance cash drawers, and audit food waste.

#### Acceptance Criteria:
1. The Owner can filter reports by daily, weekly, and monthly timeframes.
2. The reports show aggregated net vs. gross sales, separating collected tax and promotional discounts.
3. Cashier balancing reports group totals by `user_id` to compare physical drawer cash with expected digital sales.
4. The system generates a waste log by comparing kitchen-fulfilled orders (`complete`) with paid transactions (`paid`) to identify unbilled food output.
