# KitchenFlow Conceptual Class Diagram

This diagram visualizes the core domain models combined with their respective service-level behaviors (methods), providing a conceptual overview of the system's capabilities.

```mermaid
classDiagram
    class User {
        -Long id
        -String username
        -String mobileNumber
        -String password
        -String role
        -boolean isDeleted
        -Instant createdAt
        +provisionAccount()
        +login()
        +logout()
        +deactivateAccount()
    }
    
    class Token {
        -Long id
        -String tokenHash
        -LocalDateTime expiresAt
        -boolean isRevoked
        +generateToken()
        +validateToken()
        +revokeSession()
    }
    
    class Category {
        -Integer id
        -String name
        +addCategory()
        +updateCategory()
    }
    
    class Menu {
        -Integer id
        -String name
        -int price
        -String imageUrl
        -boolean isAvailable
        -Integer workloadTier
        -boolean isDeleted
        +createMenuItem()
        +updatePrice()
        +toggleAvailability()
    }
    
    class Order {
        -Integer id
        -Integer orderNumber
        -String status
        -String orderWorkloadTier
        -String paymentStatus
        -String paymentMethod
        -Integer subtotalPrice
        -Integer taxAmount
        -int totalPrice
        +createOrder()
        +processPayment()
        +calculateTotal()
        +calculateWorkload()
        +markAsCompleted()
        +cancelOrder()
    }
    
    class OrderItem {
        -Integer id
        -int quantity
        -int unitPrice
        -String itemNotes
        +addItemToOrder()
        +calculateItemSubtotal()
    }

    User "1" -- "*" Token : has
    User "1" -- "*" Order : created_by
    Category "1" -- "*" Menu : contains
    Order "1" -- "*" OrderItem : contains
    Menu "1" -- "*" OrderItem : ordered_as
```
