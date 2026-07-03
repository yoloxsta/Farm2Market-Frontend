# Farm2Market API Documentation

## Base URL
```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

## Authentication
All authenticated endpoints require Bearer token in header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@greenvalley.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "farmer-1",
      "email": "john@greenvalley.com",
      "name": "John Smith",
      "role": "farmer",
      "avatar": "https://example.com/avatar.jpg",
      "phone": "+1 555-0101",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-06-20T15:30:00Z"
    },
    "token": "1|abcdefghijklmnopqrstuvwxyz"
  },
  "message": "Login successful"
}
```

### Register
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "farmer",
  "farmName": "Green Valley Farm",
  "companyName": "Fresh Market Co."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "john@example.com",
    "name": "John Smith",
    "role": "farmer",
    "createdAt": "2024-06-20T10:00:00Z",
    "updatedAt": "2024-06-20T10:00:00Z"
  },
  "message": "Registration successful"
}
```

### Logout
```
POST /auth/logout
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User
```
GET /auth/me
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "farmer-1",
    "email": "john@greenvalley.com",
    "name": "John Smith",
    "role": "farmer",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+1 555-0101",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-06-20T15:30:00Z"
  }
}
```

---

## Product Endpoints

### List Products
```
GET /products
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name, description, farmer name |
| category | string | Filter by category: vegetables, fruits, grains, dairy, meat, herbs, nuts, other |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| location | string | Filter by location |
| sortBy | string | Sort: price_asc, price_desc, rating, newest |
| page | number | Page number (default: 1) |
| perPage | number | Items per page (default: 20) |

**Response:**
```json
{
  "data": [
    {
      "id": "prod-1",
      "farmerId": "farmer-1",
      "farmerName": "Green Valley Farm",
      "farmerRating": 4.8,
      "name": "Organic Tomatoes",
      "description": "Fresh, vine-ripened organic tomatoes.",
      "category": "vegetables",
      "images": [
        "https://example.com/images/tomato1.jpg",
        "https://example.com/images/tomato2.jpg"
      ],
      "price": 3.99,
      "unit": "kg",
      "stock": 500,
      "moq": 10,
      "harvestDate": "2024-06-15",
      "location": "California, USA",
      "certifications": ["USDA Organic", "Non-GMO"],
      "rating": 4.7,
      "totalReviews": 128,
      "status": "available",
      "createdAt": "2024-06-10T08:00:00Z",
      "updatedAt": "2024-06-20T10:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "perPage": 20,
  "totalPages": 3
}
```

### Get Single Product
```
GET /products/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod-1",
    "farmerId": "farmer-1",
    "farmerName": "Green Valley Farm",
    "farmerRating": 4.8,
    "name": "Organic Tomatoes",
    "description": "Fresh, vine-ripened organic tomatoes.",
    "category": "vegetables",
    "images": [
      "https://example.com/images/tomato1.jpg"
    ],
    "price": 3.99,
    "unit": "kg",
    "stock": 500,
    "moq": 10,
    "harvestDate": "2024-06-15",
    "location": "California, USA",
    "certifications": ["USDA Organic"],
    "rating": 4.7,
    "totalReviews": 128,
    "status": "available",
    "createdAt": "2024-06-10T08:00:00Z",
    "updatedAt": "2024-06-20T10:00:00Z"
  }
}
```

### Create Product (Farmer Only)
```
POST /products
```

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| description | string | Yes | Product description |
| category | string | Yes | Category enum |
| price | number | Yes | Price per unit |
| unit | string | Yes | Unit: kg, lb, ton, piece, dozen, crate |
| stock | number | Yes | Stock quantity |
| moq | number | No | Minimum order quantity (default: 1) |
| harvestDate | date | No | Harvest date |
| location | string | No | Location |
| images[] | file[] | No | Product images (max 6) |
| certifications | array | No | Array of certification strings |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod-new",
    "farmerId": "farmer-1",
    "farmerName": "Green Valley Farm",
    "name": "Organic Carrots",
    "description": "Fresh organic carrots",
    "category": "vegetables",
    "images": ["https://example.com/storage/carrots.jpg"],
    "price": 2.99,
    "unit": "kg",
    "stock": 200,
    "moq": 5,
    "status": "available",
    "createdAt": "2024-06-20T10:00:00Z"
  },
  "message": "Product created successfully"
}
```

### Update Product (Farmer Only)
```
PUT /products/{id}
```

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data:** Same as Create Product

**Response:**
```json
{
  "success": true,
  "data": { /* Updated product object */ },
  "message": "Product updated successfully"
}
```

### Delete Product (Farmer Only)
```
DELETE /products/{id}
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Update Stock (Farmer Only)
```
PATCH /products/{id}/stock
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "stock": 150
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Updated product with new stock */ },
  "message": "Stock updated successfully"
}
```

---

## Order Endpoints

### List Orders
```
GET /orders
```

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: pending, confirmed, processing, shipped, delivered, cancelled, rejected |
| search | string | Search by order ID or buyer/seller name |
| startDate | date | Filter from date |
| endDate | date | Filter to date |
| page | number | Page number |
| perPage | number | Items per page |

**Response:**
```json
{
  "data": [
    {
      "id": "order-1",
      "buyerId": "buyer-1",
      "buyerName": "Fresh Market Co.",
      "farmerId": "farmer-1",
      "farmerName": "Green Valley Farm",
      "items": [
        {
          "id": "item-1",
          "productId": "prod-1",
          "productName": "Organic Tomatoes",
          "productImage": "https://example.com/tomato.jpg",
          "quantity": 50,
          "unit": "kg",
          "pricePerUnit": 3.99,
          "total": 199.50
        }
      ],
      "totalAmount": 274.20,
      "status": "delivered",
      "paymentStatus": "paid",
      "paymentMethod": "escrow",
      "shippingAddress": {
        "street": "123 Market St",
        "city": "Los Angeles",
        "state": "CA",
        "zipCode": "90001",
        "country": "USA"
      },
      "trackingNumber": "TRK123456789",
      "estimatedDelivery": "2024-06-22",
      "notes": "Please deliver before noon",
      "createdAt": "2024-06-15T10:00:00Z",
      "updatedAt": "2024-06-18T14:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "perPage": 20,
  "totalPages": 2
}
```

### Get Single Order
```
GET /orders/{id}
```

**Headers:** `Authorization: Bearer {token}`

**Response:** Same structure as single order in list

### Create Order (Buyer Only)
```
POST /orders
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "prod-1",
      "quantity": 50
    },
    {
      "productId": "prod-2",
      "quantity": 30
    }
  ],
  "shippingAddressId": "addr-1",
  "paymentMethod": "escrow",
  "notes": "Please deliver before noon"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-new",
    "buyerId": "buyer-1",
    "buyerName": "Fresh Market Co.",
    "farmerId": "farmer-1",
    "farmerName": "Green Valley Farm",
    "items": [...],
    "totalAmount": 274.20,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-06-20T10:00:00Z"
  },
  "message": "Order created successfully"
}
```

### Update Order Status (Farmer Only)
```
PATCH /orders/{id}/status
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Transitions:**
- `pending` → `confirmed`, `rejected`
- `confirmed` → `processing`
- `processing` → `shipped`
- `shipped` → `delivered`

**Response:**
```json
{
  "success": true,
  "data": { /* Updated order */ },
  "message": "Order status updated"
}
```

### Cancel Order
```
POST /orders/{id}/cancel
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": { /* Cancelled order */ },
  "message": "Order cancelled successfully"
}
```

---

## Farmer Endpoints

### Get Farmer Profile
```
GET /farmer/profile
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "farmer-1",
    "email": "john@greenvalley.com",
    "name": "John Smith",
    "role": "farmer",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+1 555-0101",
    "farmName": "Green Valley Farm",
    "farmLocation": "California, USA",
    "farmSize": 250,
    "farmDescription": "Family-owned organic farm...",
    "certifications": ["USDA Organic", "Non-GMO Verified"],
    "rating": 4.8,
    "totalSales": 1250,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-06-20T15:30:00Z"
  }
}
```

### Update Farmer Profile
```
PUT /farmer/profile
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1 555-0101",
  "farmName": "Green Valley Farm",
  "farmLocation": "California, USA",
  "farmSize": 250,
  "farmDescription": "Family-owned organic farm...",
  "certifications": ["USDA Organic", "Non-GMO Verified"]
}
```

### Get Farmer Dashboard Stats
```
GET /farmer/dashboard
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 8,
    "activeOrders": 3,
    "totalSales": 12500.00,
    "escrowBalance": 418.60
  }
}
```

### Get Harvest Schedules
```
GET /farmer/harvest-schedules
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "harvest-1",
      "farmerId": "farmer-1",
      "cropName": "Winter Squash",
      "fieldLocation": "Field A - North Section",
      "plantingDate": "2024-05-15",
      "expectedHarvestDate": "2024-09-20",
      "estimatedYield": 2000,
      "unit": "kg",
      "status": "growing",
      "notes": "Planted Butternut and Acorn varieties"
    }
  ]
}
```

### Create Harvest Schedule
```
POST /farmer/harvest-schedules
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "cropName": "Winter Squash",
  "fieldLocation": "Field A - North Section",
  "plantingDate": "2024-05-15",
  "expectedHarvestDate": "2024-09-20",
  "estimatedYield": 2000,
  "unit": "kg",
  "notes": "Planted Butternut and Acorn varieties"
}
```

### Update Harvest Schedule
```
PUT /farmer/harvest-schedules/{id}
```

### Delete Harvest Schedule
```
DELETE /farmer/harvest-schedules/{id}
```

### Get Analytics
```
GET /farmer/analytics
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlySales": [
      { "month": "Jan", "sales": 4500, "orders": 28 },
      { "month": "Feb", "sales": 5200, "orders": 32 },
      { "month": "Mar", "sales": 4800, "orders": 30 }
    ],
    "topProducts": [
      { "name": "Organic Tomatoes", "sales": 2500 },
      { "name": "Fresh Sweet Corn", "sales": 1800 },
      { "name": "Organic Strawberries", "sales": 1650 }
    ]
  }
}
```

### Get Earnings
```
GET /farmer/earnings
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 12500.00,
    "available": 10831.40,
    "escrow": 418.60,
    "withdrawals": [
      {
        "id": "withdrawal-1",
        "amount": 500.00,
        "status": "completed",
        "bankAccount": "****4521",
        "createdAt": "2024-06-15T10:00:00Z",
        "processedAt": "2024-06-16T14:00:00Z"
      }
    ]
  }
}
```

### Request Withdrawal
```
POST /farmer/withdrawals
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "amount": 500.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "withdrawal-new",
    "amount": 500.00,
    "status": "pending",
    "bankAccount": "****4521",
    "createdAt": "2024-06-20T10:00:00Z"
  },
  "message": "Withdrawal request submitted"
}
```

---

## Buyer Endpoints

### Get Buyer Profile
```
GET /buyer/profile
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "buyer-1",
    "email": "mike@freshmarket.com",
    "name": "Mike Wilson",
    "role": "buyer",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+1 555-0201",
    "companyName": "Fresh Market Co.",
    "businessType": "Retail",
    "shippingAddress": {
      "street": "123 Market St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "country": "USA"
    }
  }
}
```

### Update Buyer Profile
```
PUT /buyer/profile
```

### Get Buyer Dashboard Stats
```
GET /buyer/dashboard
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 15,
    "pendingDeliveries": 2,
    "totalSpent": 8750.00
  }
}
```

### Get Cart
```
GET /buyer/cart
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product": { /* Product object */ },
        "quantity": 50
      }
    ],
    "total": 199.50
  }
}
```

### Add to Cart
```
POST /buyer/cart
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "productId": "prod-1",
  "quantity": 50
}
```

### Remove from Cart
```
DELETE /buyer/cart/{productId}
```

### Checkout
```
POST /buyer/checkout
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "shippingAddressId": "addr-1",
  "paymentMethod": "escrow",
  "notes": "Please deliver before noon"
}
```

---

## Notification Endpoints

### Get Notifications
```
GET /notifications
```

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-1",
      "userId": "farmer-1",
      "title": "New Order Received",
      "message": "You have a new order #order-3 from Fresh Market Co.",
      "type": "order",
      "read": false,
      "createdAt": "2024-06-20T14:00:00Z"
    }
  ]
}
```

### Mark as Read
```
PATCH /notifications/{id}/read
```

**Headers:** `Authorization: Bearer {token}`

### Mark All as Read
```
POST /notifications/read-all
```

**Headers:** `Authorization: Bearer {token}`

---

## File Upload Endpoints

### Upload Single Image
```
POST /upload/image
```

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data:**
| Field | Type | Required |
|-------|------|----------|
| image | file | Yes |

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://your-domain.com/storage/uploads/image.jpg",
    "path": "uploads/image.jpg"
  }
}
```

### Upload Multiple Images
```
POST /upload/images
```

**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data:**
| Field | Type | Required |
|-------|------|----------|
| images[] | file[] | Yes |

**Response:**
```json
{
  "success": true,
  "data": {
    "urls": [
      "https://your-domain.com/storage/uploads/image1.jpg",
      "https://your-domain.com/storage/uploads/image2.jpg"
    ]
  }
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 6 characters."]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Types / Enums

### User Role
```
farmer, buyer, admin
```

### Product Category
```
vegetables, fruits, grains, dairy, meat, herbs, nuts, other
```

### Product Unit
```
kg, lb, ton, piece, dozen, crate
```

### Product Status
```
available, low_stock, out_of_stock, discontinued
```

### Order Status
```
pending, confirmed, processing, shipped, delivered, cancelled, rejected
```

### Payment Status
```
pending, paid, failed, refunded
```

### Payment Method
```
bank_transfer, credit_card, escrow
```

### Harvest Schedule Status
```
planned, planted, growing, ready, harvested
```

### Notification Type
```
order, payment, delivery, system
```

---

## Database Schema Reference

### Users Table
```sql
- id (string/uuid)
- email (string, unique)
- name (string)
- role (enum: farmer, buyer, admin)
- avatar (string, nullable)
- phone (string, nullable)
- password (string, hashed)
- remember_token (string, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### Farmer Profiles Table
```sql
- id (string/uuid)
- user_id (foreign key)
- farm_name (string)
- farm_location (string)
- farm_size (decimal) -- in acres
- farm_description (text, nullable)
- certifications (json)
- rating (decimal, default: 0)
- total_sales (integer, default: 0)
- created_at (timestamp)
- updated_at (timestamp)
```

### Buyer Profiles Table
```sql
- id (string/uuid)
- user_id (foreign key)
- company_name (string)
- business_type (string)
- shipping_address (json)
- billing_address (json, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### Products Table
```sql
- id (string/uuid)
- farmer_id (foreign key)
- name (string)
- description (text)
- category (enum)
- images (json)
- price (decimal)
- unit (enum)
- stock (integer)
- moq (integer, default: 1)
- harvest_date (date)
- location (string)
- certifications (json)
- rating (decimal, default: 0)
- total_reviews (integer, default: 0)
- status (enum, default: available)
- created_at (timestamp)
- updated_at (timestamp)
```

### Orders Table
```sql
- id (string/uuid)
- buyer_id (foreign key)
- farmer_id (foreign key)
- items (json)
- total_amount (decimal)
- status (enum, default: pending)
- payment_status (enum, default: pending)
- payment_method (enum)
- shipping_address (json)
- tracking_number (string, nullable)
- estimated_delivery (date, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### Harvest Schedules Table
```sql
- id (string/uuid)
- farmer_id (foreign key)
- crop_name (string)
- field_location (string)
- planting_date (date)
- expected_harvest_date (date)
- estimated_yield (integer)
- unit (enum)
- status (enum, default: planned)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### Withdrawals Table
```sql
- id (string/uuid)
- farmer_id (foreign key)
- amount (decimal)
- status (enum, default: pending)
- bank_account (string)
- processed_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## Notes for Backend Developer

1. **Authentication**: Use Laravel Sanctum for API authentication
2. **File Uploads**: Store images in `storage/app/public/uploads` and use `php artisan storage:link`
3. **CORS**: Configure `config/cors.php` to allow frontend origin
4. **Validation**: Use Form Requests for validation
5. **Resources**: Use API Resources for consistent response formatting
6. **Events**: Fire events for notifications (new order, payment received, etc.)
7. **Jobs**: Use queues for heavy operations (image processing, email sending)
8. **Policy**: Use Policies for authorization (user can only edit their own products)

---

## Postman Collection

You can import this collection to Postman for testing:

```json
{
  "info": {
    "name": "Farm2Market API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```
