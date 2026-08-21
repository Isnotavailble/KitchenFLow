# 📖 KitchenFlow: REST API Endpoints Specification

This document provides a comprehensive, human-readable reference for all backend API endpoints in **KitchenFlow (POS & KDS)**.

---

## 🌐 Global API Conventions

* **Base URL**: `http://localhost:8080` (or production host domain)
* **Content-Type**: `application/json` (unless uploading images via `multipart/form-data`)
* **Authentication**: Bearer JWT token passed in header:
  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  ```
* **Unified Error Response Format**:
  All endpoints return standard JSON error structures:
  ```json
  {
    "error": "Descriptive error message"
  }
  ```

---

## 📑 Table of Contents

1. [🔐 Authentication & Sessions (`/api/auth`)](#1--authentication--sessions-apiauth)
2. [📱 In-Store QR Pre-Orders (`/api/pre-orders`)](#2--in-store-qr-pre-orders-apipre-orders)
3. [📋 Menu Management (`/api/menu`)](#3--menu-management-apimenu)
4. [🍽️ Orders & Kitchen KDS (`/api/orders`)](#4--orders--kitchen-kds-apiorders)
5. [👥 Employee Accounts (`/api/accounts`)](#5--employee-accounts-apiaccounts)
6. [🖼️ Cloudinary Image Uploads (`/api/images`)](#6--cloudinary-image-uploads-apiimages)

---

## 1. 🔐 Authentication & Sessions (`/api/auth`)

### 1.1 User Login
* **Description**: Authenticate with mobile number and password to obtain an access token and refresh token.
* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Access**: Public (No token required)

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `mobileNumber` | `String` | Yes | Registered 11-digit mobile number (e.g. `"09123456789"`) |
| `password` | `String` | Yes | Account password (min 8 characters) |

```json
{
  "mobileNumber": "09123456789",
  "password": "Password123"
}
```

#### Response (`200 OK`)
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "4f9d2a1b-3c8e-4a6f-9e7b-1c2d3e4f5a6b",
  "expiresIn": 120
}
```

#### Error Response (`401 Unauthorized`)
```json
{
  "error": "fail to authenticate"
}
```

---

### 1.2 Refresh Access Token
* **Description**: Issue a new short-lived access token and rotate the refresh token without re-entering credentials.
* **Method**: `POST`
* **Path**: `/api/auth/refresh`
* **Access**: Public (No token required)

#### Request Body
```json
{
  "refresh_token": "4f9d2a1b-3c8e-4a6f-9e7b-1c2d3e4f5a6b"
}
```

#### Response (`200 OK`)
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "8b7a6c5d-4e3f-2a1b-9c8d-7e6f5a4b3c2d",
  "expiresIn": 120
}
```

#### Error Response (`425 Too Early`)
```json
{
  "error": "Refresh requested too early. Please wait before refreshing again."
}
```

---

## 2. 📱 In-Store QR Pre-Orders (`/api/pre-orders`)

### 2.1 Create QR Pre-Order (Guest Mobile)
* **Description**: Guest customer selects dishes and quantities on their mobile browser to generate a 6-digit code and Base64 QR code image. Temporary cart is cached in Redis with a 30-minute timer.
* **Method**: `POST`
* **Path**: `/api/pre-orders`
* **Access**: Public (Guest / No login needed)

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `items` | `Array` | Yes | List of menu items and quantities |
| `items[].menuId` | `Integer` | Yes | Primary ID of the menu dish |
| `items[].quantity` | `Integer` | Yes | Order quantity (1 - 99) |
| `items[].itemNote` | `String` | No | Special cooking note (e.g. `"Less sugar"`, `"No ice"`) |

```json
{
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "itemNote": "Less sugar"
    },
    {
      "menuId": 3,
      "quantity": 1,
      "itemNote": null
    }
  ]
}
```

#### Response (`201 Created`)
```json
{
  "code": "849201",
  "qrImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB55达...",
  "expiresInSeconds": 1800
}
```

---

### 2.2 Cashier Scan / Fetch Pre-Order by Code
* **Description**: Cashier scans the customer's QR or enters the 6-digit code. The server pulls item IDs from Redis and performs a live PostgreSQL lookup to verify current prices and availability.
* **Method**: `GET`
* **Path**: `/api/pre-orders/{code}`
* **Access**: `ROLE_CASHIER`, `ROLE_ADMIN`

#### Path Parameter
* `code` (`String`): 6-digit pre-order code (e.g. `849201`)

#### Response (`200 OK`)
```json
{
  "code": "849201",
  "items": [
    {
      "menuId": 1,
      "menuName": "Iced Americano",
      "price": 3000,
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1/americano.jpg",
      "quantity": 2,
      "itemNote": "Less sugar",
      "subtotal": 6000,
      "isAvailable": true
    },
    {
      "menuId": 3,
      "menuName": "Butter Croissant",
      "price": 2500,
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1/croissant.jpg",
      "quantity": 1,
      "itemNote": null,
      "subtotal": 2500,
      "isAvailable": true
    }
  ],
  "subtotalPrice": 8500,
  "taxAmount": 425,
  "totalPrice": 8925,
  "allItemsAvailable": true
}
```

#### Error Response (`404 Not Found`)
```json
{
  "error": "Pre-order with code 849201 not found or has expired"
}
```

---

### 2.3 Delete Pre-Order Token
* **Description**: Invalidate and delete the temporary pre-order draft from Redis after order completion or customer cancellation.
* **Method**: `DELETE`
* **Path**: `/api/pre-orders/{code}`
* **Access**: `ROLE_CASHIER`, `ROLE_ADMIN`

#### Response (`200 OK`)
```json
{
  "message": "Pre-order draft deleted successfully"
}
```

---

## 3. 📋 Menu Management (`/api/menu`)

### 3.1 Get All Menu Items
* **Description**: List all active menu items with categories and availability.
* **Method**: `GET`
* **Path**: `/api/menu`
* **Access**: Authenticated (`ROLE_CASHIER`, `ROLE_CHEF`, `ROLE_ADMIN`)

#### Response (`200 OK`)
```json
[
  {
    "id": 1,
    "name": "Iced Americano",
    "price": 3000,
    "imageUrl": "https://res.cloudinary.com/.../americano.jpg",
    "imageId": "pos_kds/americano_123",
    "categoryId": 1,
    "categoryName": "Beverages",
    "isAvailable": true,
    "workloadTier": 1,
    "createdAt": "2026-08-19T10:00:00",
    "updatedAt": "2026-08-19T10:00:00"
  }
]
```

---

### 3.2 Get Menu Item by ID
* **Method**: `GET`
* **Path**: `/api/menu/{id}`
* **Access**: Authenticated

#### Response (`200 OK`)
```json
{
  "id": 1,
  "name": "Iced Americano",
  "price": 3000,
  "imageUrl": "https://res.cloudinary.com/.../americano.jpg",
  "imageId": "pos_kds/americano_123",
  "categoryId": 1,
  "categoryName": "Beverages",
  "isAvailable": true,
  "workloadTier": 1,
  "createdAt": "2026-08-19T10:00:00",
  "updatedAt": "2026-08-19T10:00:00"
}
```

---

### 3.3 Create New Menu Item
* **Method**: `POST`
* **Path**: `/api/menu`
* **Access**: `ROLE_ADMIN`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Yes | Dish name (e.g. `"Iced Latte"`) |
| `price` | `Integer` | Yes | Price in base currency units (e.g. `3500`) |
| `imageUrl` | `String` | No | Cloudinary image CDN URL |
| `imageId` | `String` | No | Cloudinary public image ID |
| `categoryId` | `Integer` | No | Associated category ID |
| `isAvailable` | `Boolean` | Yes | Stock status (`true` = Available, `false` = Sold out) |
| `workloadTier` | `Integer` | Yes | Complexity tier for KDS: `1` (Light), `2` (Medium), `3` (Heavy) |

```json
{
  "name": "Iced Latte",
  "price": 3500,
  "imageUrl": "https://res.cloudinary.com/.../latte.jpg",
  "imageId": "pos_kds/latte_123",
  "categoryId": 1,
  "isAvailable": true,
  "workloadTier": 1
}
```

#### Response (`200 OK`)
```json
{
  "id": 2,
  "name": "Iced Latte",
  "price": 3500,
  "imageUrl": "https://res.cloudinary.com/.../latte.jpg",
  "imageId": "pos_kds/latte_123",
  "categoryId": 1,
  "categoryName": "Beverages",
  "isAvailable": true,
  "workloadTier": 1,
  "createdAt": "2026-08-19T14:30:00",
  "updatedAt": "2026-08-19T14:30:00"
}
```

---

### 3.4 Update Menu Item
* **Method**: `PUT`
* **Path**: `/api/menu/{id}`
* **Access**: `ROLE_ADMIN`

#### Request Body
*(Same format as Create Menu)*

#### Response (`200 OK`)
*(Returns updated menu object. `createdAt` is permanent and remains unchanged; only `updatedAt` updates).*

---

### 3.5 Toggle Item Availability (In-Stock / Sold Out)
* **Method**: `PATCH`
* **Path**: `/api/menu/{id}/toggle?value=true`
* **Access**: `ROLE_ADMIN`

#### Query Parameters
* `value` (`Boolean`): `true` to enable item, `false` to mark sold-out.

#### Response (`200 OK`)
```json
{
  "id": 1,
  "name": "Iced Americano",
  "isAvailable": false,
  "updatedAt": "2026-08-19T14:45:00"
}
```

---

### 3.6 Delete Menu Item
* **Method**: `DELETE`
* **Path**: `/api/menu/{id}`
* **Access**: `ROLE_ADMIN`

#### Response (`200 OK`)
*(Empty response body with HTTP 200 OK. Automatically cleans up Cloudinary CDN image asset).*

---

## 4. 🍽️ Orders & Kitchen KDS (`/api/orders`)

### 4.1 Create Official Order (Cashier Checkout)
* **Description**: Cashier confirms the customer's cart, collects payment, and dispatches ticket to Kitchen Display System (KDS).
* **Method**: `POST`
* **Path**: `/api/orders/create_order`
* **Access**: `ROLE_CASHIER`, `ROLE_ADMIN`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `orderItems` | `Array` | Yes | List of selected items |
| `orderItems[].menuId` | `Integer` | Yes | ID of menu item |
| `orderItems[].quantity` | `Integer` | Yes | Number of servings ($\ge 1$) |
| `orderItems[].itemNote` | `String` | No | Kitchen instructions |
| `discountAmount` | `Integer` | No | Discount deduction (defaults to `0`) |

```json
{
  "orderItems": [
    {
      "menuId": 1,
      "quantity": 2,
      "itemNote": "Extra hot"
    }
  ],
  "discountAmount": 0
}
```

#### Response (`200 OK`)
```json
{
  "id": 101,
  "orderNumber": 42,
  "status": "waiting",
  "subtotalPrice": 6000,
  "taxAmount": 300,
  "discountAmount": 0,
  "totalPrice": 6300,
  "workloadTier": "LIGHT",
  "paymentStatus": "paid",
  "paymentMethod": "cash",
  "orderItems": [
    {
      "id": 201,
      "menuId": 1,
      "menuName": "Iced Americano",
      "unitPrice": 3000,
      "quantity": 2,
      "itemNote": "Extra hot",
      "totalPrice": 6000
    }
  ],
  "createdAt": "2026-08-19T15:00:00",
  "updatedAt": "2026-08-19T15:00:00",
  "message": "order created successfully"
}
```

#### Error Response (Sold out item) (`400 Bad Request`)
```json
{
  "error": "Iced Americano is not available"
}
```

---

### 4.2 View All Orders
* **Description**: Retrieve all historical and active orders.
* **Method**: `GET`
* **Path**: `/api/orders/view_orders`
* **Access**: `ROLE_CASHIER`, `ROLE_ADMIN`, `ROLE_CHEF`

#### Response (`200 OK`)
*(Returns list of `OrderResponse` objects sorted by creation time).*

---

### 4.3 Update Order Status (Chef & Owner)
* **Description**: Transition order state (Chef moves `waiting` $\rightarrow$ `completed`; Admin can cancel `waiting` $\rightarrow$ `cancelled`).
* **Method**: `PATCH`
* **Path**: `/api/orders/update_order_status/{orderId}`
* **Access**: `ROLE_CHEF`, `ROLE_ADMIN`

#### Request Body
```json
{
  "status": "completed"
}
```

#### Response (`200 OK`)
```json
{
  "id": 101,
  "orderNumber": 42,
  "status": "completed",
  "totalPrice": 6300,
  "message": "order status updated successfully"
}
```

---

### 4.4 Real-Time Event Stream (Server-Sent Events)
* **Description**: Long-lived HTTP stream pushing real-time order creations and status updates to Chef and Cashier screens under 500ms.
* **Method**: `GET`
* **Path**: `/api/orders/stream`
* **Header**: `Accept: text/event-stream`
* **Access**: Authenticated (`ROLE_CASHIER`, `ROLE_CHEF`, `ROLE_ADMIN`)

#### Stream Events Emitted:
* **`event: order-created`**: Pushed when Cashier creates a new order.
* **`event: order-updated`**: Pushed when Chef marks an order `completed` or Admin cancels.

---

## 5. 👥 Employee Accounts (`/api/accounts`)

*All account management endpoints require `ROLE_ADMIN` authority.*

### 5.1 List All Accounts
* **Method**: `GET`
* **Path**: `/api/accounts`
* **Access**: `ROLE_ADMIN`

#### Response (`200 OK`)
```json
[
  {
    "id": 1,
    "username": "admin_user",
    "mobileNumber": "09111111111",
    "role": "ROLE_ADMIN",
    "isDeleted": false,
    "createdAt": "2026-08-01T00:00:00Z",
    "updatedAt": "2026-08-01T00:00:00Z"
  },
  {
    "id": 2,
    "username": "cashier_john",
    "mobileNumber": "09222222222",
    "role": "ROLE_CASHIER",
    "isDeleted": false,
    "createdAt": "2026-08-05T00:00:00Z",
    "updatedAt": "2026-08-05T00:00:00Z"
  }
]
```

---

### 5.2 Get Account by ID
* **Method**: `GET`
* **Path**: `/api/accounts/{id}`
* **Access**: `ROLE_ADMIN`

#### Response (`200 OK`)
```json
{
  "id": 2,
  "username": "cashier_john",
  "mobileNumber": "09222222222",
  "role": "ROLE_CASHIER",
  "isDeleted": false,
  "createdAt": "2026-08-05T00:00:00Z",
  "updatedAt": "2026-08-05T00:00:00Z"
}
```

---

### 5.3 Create Employee Account
* **Method**: `POST`
* **Path**: `/api/accounts`
* **Access**: `ROLE_ADMIN`

#### Request Body
| Field | Type | Required | Validation Rules |
| :--- | :--- | :--- | :--- |
| `username` | `String` | Yes | 3 - 50 characters |
| `mobileNumber` | `String` | Yes | 9 - 15 digits (must be unique) |
| `password` | `String` | Yes | 8 - 100 characters |
| `role` | `String` | Yes | One of: `ROLE_CASHIER`, `ROLE_CHEF`, `ROLE_ADMIN` |

```json
{
  "username": "chef_alex",
  "mobileNumber": "09333333333",
  "password": "ChefPassword2026",
  "role": "ROLE_CHEF"
}
```

#### Response (`201 Created`)
```json
{
  "id": 3,
  "username": "chef_alex",
  "mobileNumber": "09333333333",
  "role": "ROLE_CHEF",
  "isDeleted": false,
  "createdAt": "2026-08-19T16:00:00Z",
  "updatedAt": "2026-08-19T16:00:00Z"
}
```

---

### 5.4 Update Employee Account
* **Method**: `PUT`
* **Path**: `/api/accounts/{id}`
* **Access**: `ROLE_ADMIN`

#### Request Body
```json
{
  "username": "chef_alex_lead",
  "mobileNumber": "09333333333",
  "role": "ROLE_CHEF"
}
```

#### Response (`200 OK`)
*(Returns updated account object. Invalides active tokens if credentials/roles change).*

---

### 5.5 Deactivate Account (Soft Delete & Session Eviction)
* **Description**: Soft-deletes user (`isDeleted = true`) and immediately revokes all active JWT and refresh tokens. Preserves database referential integrity with historical orders.
* **Method**: `PATCH`
* **Path**: `/api/accounts/{id}/deactivate`
* **Access**: `ROLE_ADMIN`

#### Response (`200 OK`)
```json
{
  "id": 3,
  "username": "chef_alex_lead",
  "isDeleted": true,
  "updatedAt": "2026-08-19T16:15:00Z"
}
```

#### Error Response (Self-deactivation attempt) (`400 Bad Request`)
```json
{
  "error": "You cannot deactivate your own account"
}
```

---

### 5.6 Reactivate Account
* **Method**: `PATCH`
* **Path**: `/api/accounts/{id}/reactivate`
* **Access**: `ROLE_ADMIN`

#### Response (`200 OK`)
```json
{
  "id": 3,
  "username": "chef_alex_lead",
  "isDeleted": false,
  "updatedAt": "2026-08-19T16:20:00Z"
}
```

---

### 5.7 Change Account Password
* **Description**: Admin resets an employee's password. Automatically purges all active login sessions.
* **Method**: `PATCH`
* **Path**: `/api/accounts/{id}/change-password`
* **Access**: `ROLE_ADMIN`

#### Request Body
```json
{
  "newPassword": "NewSecurePassword2026"
}
```

#### Response (`200 OK`)
```json
{
  "message": "Password changed successfully and active sessions revoked"
}
```

---

## 6. 🖼️ Cloudinary Image Uploads (`/api/images`)

### 6.1 Upload & Auto-Optimize Menu Image
* **Description**: Uploads a photo to Cloudinary. Server automatically crops/resizes it to a **4:3 aspect ratio (800x600 px)** with **90% WebP quality compression** and center gravity.
* **Method**: `POST`
* **Path**: `/api/images`
* **Content-Type**: `multipart/form-data`
* **Access**: `ROLE_ADMIN`

#### Form-Data Parameter
* `file` (`File`): Raw image file (`.png`, `.jpg`, `.jpeg`, `.webp`)

#### Response (`200 OK`)
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/c_fill,g_center,h_600,q_90,w_800/v12345/dish_abc.jpg",
  "publicId": "pos_kds_menus/dish_abc"
}
```

---

### 6.2 Delete Image Asset
* **Description**: Deletes the image from Cloudinary storage and sends a CDN cache invalidation request.
* **Method**: `DELETE`
* **Path**: `/api/images?id=pos_kds_menus/dish_abc`
* **Access**: `ROLE_ADMIN`

#### Query Parameter
* `id` (`String`): The Cloudinary `publicId`

#### Response (`200 OK`)
```json
{
  "message": "Image with ID pos_kds_menus/dish_abc is deleted successfully"
}
```
