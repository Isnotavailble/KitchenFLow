# KitchenFlow System Architecture Flow

This flowchart represents the backend **System Flow**, mapping how the server processes data based on the three explicit roles. It encompasses the full intended design from `features.md`, including SSE synchronization for all required modules.

```mermaid
graph TD
    DB[(PostgreSQL Database)]
    
    Auth([System: Authenticate JWT Session]) --> Router{System: Route by RBAC Role}
    
    %% Cashier System Pipeline
    Router -- ROLE_CASHIER --> POS[Cashier: Submit Pre-Paid Order via HTTP POST]
    POS --> SysCalc[System: Calculate Workload Tier Algorithm]
    SysCalc -->|Insert Transaction| DB
    SysCalc --> SSE1[System: Publish 'order-created' Event via SSE]
    SSE1 --> EndPOS([End: Ticket Dispatched])
    
    %% Chef System Pipeline
    Router -- ROLE_CHEF --> KDS[Chef: Submit Status Update to 'completed']
    KDS -->|Update Order Status| DB
    KDS --> SSE2[System: Publish 'order-updated' Event via SSE]
    SSE2 --> EndKDS([End: Status Broadcasted])
    
    %% Owner System Pipeline
    Router -- ROLE_OWNER --> AdminRouter{Owner: Select Module}
    
    %% Owner: Order Cancellation
    AdminRouter -- Cancel Order --> OwnerCancel[Owner: Submit Status Update to 'cancelled']
    OwnerCancel -->|Update Order Status| DB
    OwnerCancel --> SSE3[System: Publish 'order-updated' Event via SSE]
    SSE3 --> EndCancel([End: Cancellation Broadcasted])
    
    %% Owner: Menu Operations
    AdminRouter -- Toggle Menu --> SysMenu[Owner: Toggle Menu Availability]
    SysMenu -->|Update Record| DB
    SysMenu --> SSE4[System: Publish 'menu-updated' Event via SSE]
    SSE4 --> EndMenu([End: Menu Synced])
    
    %% Owner: Analytics
    AdminRouter -- Analytics --> SysReport[System: Aggregate Sales & Tax Metrics]
    SysReport -->|Query Metrics| DB
    SysReport --> EndReport([End: Report Generated])
```
