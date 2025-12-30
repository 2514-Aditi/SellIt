# Seller Management System

A full-stack e-commerce seller management system similar to Amazon Seller Central, built with React, Node.js, Express, and MongoDB.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT with role-based access control (Customer, Seller, Admin)

## Features

### 1. Customer Features
- Customer registration and authentication
- Browse all active products from sellers
- Search and filter products
- Shopping cart functionality
- Place orders with shipping information
- Track order status in real-time
- Cancel orders (if not shipped/delivered)
- View order history

### 2. Seller Registration with KYC
- Seller signup with business details
- Upload PAN, GST, and Bank documents
- KYC status tracking: pending, approved, rejected

### 3. Admin Verification System
- Admin dashboard to review sellers
- View KYC documents
- Approve or reject sellers with reason
- Only approved sellers can list products

### 4. Inventory Management System
- Seller can add/edit/delete products
- SKU-based inventory tracking
- Quantity tracking
- Low stock alerts
- Product variants support (size, color)

### 5. Order Management System
- Orders linked to sellers and customers
- Order statuses: placed, confirmed, shipped, delivered, cancelled
- Seller can update order status
- Customer can track orders and cancel (if allowed)
- Inventory auto-reduces on order placement
- Orders automatically grouped by seller

### 6. Dashboards
- **Customer Dashboard**: Browse products, manage cart, track orders
- **Seller Dashboard**: Orders, sales, inventory overview, low stock alerts
- **Admin Dashboard**: Seller management, platform analytics, order overview

## Project Structure

```
arambh/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth & upload middleware
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   └── app.js         # Express app entry point
│   ├── uploads/           # Document uploads directory
│   ├── package.json
│   └── .env              # Environment variables
│
└── client/                # Frontend React app
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── context/       # React context (Auth)
    │   ├── lib/          # Utilities & API client
    │   ├── pages/        # Page components
    │   └── App.tsx       # Main app component
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `env.example`):
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/seller_central
JWT_SECRET=your-secret-key-here
UPLOAD_DIR=uploads
```

4. Start MongoDB (if running locally):
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:5000):
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/seller` - Register new seller (multipart/form-data)
- `POST /api/auth/register/customer` - Register new customer
- `POST /api/auth/login` - Login user

### Seller Routes (Protected)
- `GET /api/seller/profile` - Get seller profile
- `PUT /api/seller/kyc` - Update KYC documents
- `GET /api/seller/dashboard` - Get dashboard stats
- `GET /api/seller/products` - List seller products
- `POST /api/seller/products` - Create product
- `PUT /api/seller/products/:id` - Update product
- `DELETE /api/seller/products/:id` - Delete product
- `GET /api/seller/low-stock` - Get low stock products

### Admin Routes (Protected)
- `GET /api/admin/dashboard` - Get admin dashboard stats
- `GET /api/admin/sellers` - List all sellers (query: ?status=pending)
- `GET /api/admin/sellers/:id` - Get seller details
- `PUT /api/admin/sellers/:id/approve` - Approve seller
- `PUT /api/admin/sellers/:id/reject` - Reject seller (body: { reason })
- `GET /api/admin/orders` - Get all orders

### Customer Routes
- `GET /api/customer/products` - Browse all active products (public)
- `GET /api/customer/products/:id` - Get product details (public)
- `POST /api/customer/orders` - Place order (customer only)
- `GET /api/customer/orders` - Get customer's orders
- `GET /api/customer/orders/:id` - Get order details
- `PUT /api/customer/orders/:id/cancel` - Cancel order

### Order Routes (Protected)
- `POST /api/orders` - Create order (legacy)
- `GET /api/orders` - Get orders (seller-specific, customer-specific, or all for admin)
- `PUT /api/orders/:id/status` - Update order status (seller only)

## MongoDB Schemas

### User
- name, email, password, role (seller/admin/customer)

### SellerProfile
- user (ref), businessName, businessType, gstNumber, panNumber, bankAccount
- documents: { panUrl, gstUrl, bankUrl }
- kycStatus: pending/approved/rejected
- approvedAt, approvedBy, rejectedAt, rejectedBy, rejectionReason

### Product
- seller (ref), name, description, sku, price, quantity
- variants: [{ size, color, stock }]
- lowStockThreshold, images, isActive

### Order
- seller (ref), customer (ref), items: [{ product, quantity, price }]
- shippingAddress, customerInfo, total, status
- placedAt, shippedAt, deliveredAt

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are returned on login/register and stored in localStorage.

## User Roles

The system supports three user roles:

1. **Customer**: Can browse products, add to cart, place orders, and track orders
2. **Seller**: Can register with KYC, manage products (after approval), and manage orders
3. **Admin**: Can approve/reject sellers and view platform analytics

## Creating Admin User

To create an admin user, you can use the seed script:

```bash
cd server
npm run seed:admin admin@example.com admin123
```

Or manually in MongoDB:

```javascript
// In MongoDB shell
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$...", // bcrypt hash of password
  role: "admin"
})
```

## Development Notes

- Backend uses nodemon for auto-reload
- Frontend uses React Scripts with hot reload
- File uploads are stored in `server/uploads/`
- CORS is enabled for localhost:3000
- JWT tokens expire in 7 days

## License

MIT


