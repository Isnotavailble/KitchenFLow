# KitchenFlow System-Level Sequence Diagrams (SSD)

This document contains the official **System-Level Sequence Diagrams (SSDs)** for KitchenFlow, structured in two sections:
1. **Section A**: The **Master Combined End-to-End System Sequence Diagram**, illustrating the complete cross-role lifecycle across the entire restaurant.
2. **Section B**: The **3 Focused Two-Sided Human Role Diagrams**, strictly following the UML standard with human actors on both sides and the central System in the middle (`Human [Left] <---> System [Center] <---> Human [Right]`).

### Architectural & UML Standards Adhered To:
- **Two Sides of Human**: In every role-pair diagram, the initiating human user is on the Left, the counterpart human user is on the Right, and `KitchenFlow System` sits in the Center as the mediator.
- **Full Authentication Included**: All staff lifelines begin with `login( mobileNumber, password )` and `loginSuccessful( token, role )`.
- **POS Menu Hydration Included**: Cashier registers load the active catalog via `viewMenus( )` upon shift setup.
- **Unidirectional Real-Time Events**: Server-Sent Events (SSE) are modeled as one-way asynchronous notifications (`System ->> Recipient`) without fake return arrows.
- **Clean Lifelines & Direct Arrows**: No interaction boundary frames (`alt`, `opt`, `rect` omitted) and no numbers on arrow connections (`autonumber` omitted).
- **Pure Rectangular Shapes**: Declared with `participant` (standard UML rectangles, no stick figures).

---

# Section A: Master Combined System Sequence Diagram (End-to-End)

Illustrates the complete operational cycle of KitchenFlow: Staff shift initialization $\rightarrow$ Guest mobile pre-order $\rightarrow$ Cashier counter scan and checkout $\rightarrow$ Automated Workload Tier & order number generation $\rightarrow$ KDS ticket dispatch $\rightarrow$ Kitchen completion and pickup broadcast $\rightarrow$ Owner governance and sales analytics.

```mermaid
sequenceDiagram
    participant Guest as Guest (Customer)
    participant Cashier as Cashier (POS)
    participant System as KitchenFlow System
    participant Chef as Chef (Kitchen)
    participant Owner as Owner (Admin)

    %% 1. Staff Authentication & Station Initialization
    Cashier->>+System: login( mobileNumber, password )
    System-->>-Cashier: loginSuccessful( token, role="ROLE_CASHIER" )

    Cashier->>+System: viewMenus( category, search )
    System-->>-Cashier: activeMenuList( items, prices, isAvailable )

    Chef->>+System: login( mobileNumber, password )
    System-->>-Chef: loginSuccessful( token, role="ROLE_CHEF" )

    Chef->>+System: connectStream( GET /api/orders/stream )
    System-->>-Chef: streamConnected( INIT )

    %% 2. Guest In-Store Mobile Pre-Order
    Guest->>+System: viewActiveMenu( )
    System-->>-Guest: activeMenuList

    Guest->>+System: submitPreOrder( cartItems )
    System-->>-Guest: preOrderCreated( code, qrImageBase64 )

    %% 3. Cashier Scan, Payment & Kitchen Dispatch
    Cashier->>+System: scanPreOrderCode( code )
    System-->>-Cashier: cartDetails( items, subtotal, tax, total )

    Cashier->>+System: createOrder( orderRequest, orderType )
    System->>Chef: notifyOrderCreated( orderTicket: orderNumber, workloadTier, items )
    System-->>-Cashier: orderSuccess( orderNumber, receipt )

    %% 4. Kitchen Prep & Order Completion
    Chef->>+System: updateOrderStatus( orderId, "completed" )
    System->>Cashier: notifyOrderCompleted( orderId, orderNumber )
    System-->>-Chef: completionConfirmed

    %% 5. Owner Administration & Governance
    Owner->>+System: login( mobileNumber, password )
    System-->>-Owner: loginSuccessful( token, role="ROLE_ADMIN" )

    Owner->>+System: getDashboardSummary( )
    System-->>-Owner: salesSummary( totalRevenue, completedCount, activeWaiting )

    Owner->>+System: toggleMenuAvailability( menuId, isAvailable )
    System->>Cashier: notifyMenuUpdated( menuId, isAvailable )
    System-->>-Owner: updateSuccess
```

---

# Section B: Two-Sided Human Role Diagrams

---

## 1. Customer Pre-Order Intake Pipeline (/Guest : User [Left] <---> :KitchenFlowSystem [Center] <---> /Cashier : User [Right])

Models the customer-to-cashier pre-order lifecycle: from cashier shift initialization and POS menu loading, to the guest assembling a mobile cart in line, and the cashier scanning the QR code at the counter to retrieve the validated cart.

```mermaid
sequenceDiagram
    participant Guest as /Guest : User
    participant System as :KitchenFlowSystem
    participant Cashier as /Cashier : User

    Cashier->>+System: login( mobileNumber, password )
    System-->>-Cashier: authResponse

    Cashier->>+System: viewMenus( category, search )
    System-->>-Cashier: activeMenuList

    Guest->>+System: viewActiveMenu( )
    System-->>-Guest: activeMenuList

    Guest->>+System: submitPreOrder( cartItems )
    System-->>-Guest: preOrderCreated

    Cashier->>+System: scanPreOrderCode( code )
    System-->>-Cashier: cartDetails
```

---

## 2. Order Placement & Kitchen Fulfillment Pipeline (/Cashier : User [Left] <---> :KitchenFlowSystem [Center] <---> /Chef : User [Right])

Models the front-counter to kitchen lifecycle: from chef station login and live SSE stream connection, to cashier order checkout (with automated 5% tax, daily sequential order number, and Workload Tier calculation), real-time KDS dispatch, and chef completion broadcasting back to the cashier pickup screen.

```mermaid
sequenceDiagram
    participant Cashier as /Cashier : User
    participant System as :KitchenFlowSystem
    participant Chef as /Chef : User

    Chef->>+System: login( mobileNumber, password )
    System-->>-Chef: authResponse

    Chef->>+System: connectStream( )
    System-->>-Chef: connectionInitializationStatus

    Chef->>+System: getOrders( "Waiting" )
    System-->>-Chef: activeQueue

    Cashier->>+System: createOrder( orderRequest, orderType )
    System->>Chef: notifyOrderCreated( orderNumber, workloadTier, items )
    System-->>-Cashier: successfulOrderCreation

    Chef->>+System: updateOrderStatus( orderId, "completed" )
    System->>Cashier: notifyOrderCompleted( orderId )
    System-->>-Chef: orderCompletedConfirmed
```

---

## 3. Operational Governance & Broadcast Pipeline (/Admin : User [Left] <---> :KitchenFlowSystem [Center] <---> /Chef : User & /Cashier : User [Right])

Models restaurant management operations: admin authentication, sales analytics dashboard retrieval, emergency order cancellation (with real-time SSE broadcasts to both KDS and POS), and menu item update broadcasting synchronized to both Chef and Cashier screens.

```mermaid
sequenceDiagram
    participant Admin as /Admin : User
    participant System as :KitchenFlowSystem
    participant Chef as /Chef : User
    participant Cashier as /Cashier : User

    Admin->>+System: login( mobileNumber, password )
    System-->>-Admin: authResponse

    Admin->>+System: getDashboardSummary( )
    System-->>-Admin: salesSummary

    Admin->>+System: cancelOrder( orderId )
    System->>Chef: notifyOrderCancelled( orderId )
    System->>Cashier: notifyOrderCancelled( orderId )
    System-->>-Admin: cancellationConfirmed

    Admin->>+System: updateMenuList( menuId )
    System->>Chef: notifyMenuUpdated( menuId )
    System->>Cashier: notifyMenuUpdated( menuId )
    System-->>-Admin: updateSuccess
```










