# 🛒SellIt: E-commerce Seller Management System

A full-stack e-commerce seller management system built with React, Node.js, Express, and MongoDB.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT with role-based access control (Customer, Seller, Admin)

## Features

### 1. Seller Registration with KYC
- Seller signup with business details
- Upload PAN, GST, and Bank documents
- KYC status tracking: pending, approved, rejected

### 2. Admin Verification System
- Admin dashboard to review sellers
- View KYC documents
- Approve or reject sellers with reason
- Only approved sellers can list products

### 3. Inventory Management System
- Seller can add/edit/delete products
- SKU-based inventory tracking
- Quantity tracking
- Low stock alerts
- Product variants support (size, color)

### 4. Order Management System
- Orders linked to sellers and customers
- Order statuses: placed, confirmed, shipped, delivered, cancelled
- Seller can update order status
- Customer can track orders and cancel (if allowed)
- Inventory auto-reduces on order placement
- Orders automatically grouped by seller

### 5. Dashboards
- **Customer Dashboard**: Browse products, manage cart, track orders
- **Seller Dashboard**: Orders, sales, inventory overview, low stock alerts
- **Admin Dashboard**: Seller management, platform analytics, order overview


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


## License

MIT


