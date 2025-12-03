# Beetle Diffuser User Backend

Backend API for the Beetle Diffuser e-commerce user-facing application.

## Setup

1. Install dependencies:
```bash
cd User/backend
npm install
```

2. Configure environment variables (`.env` file is already created):
- MongoDB URI
- JWT Secret
- SMTP Configuration (Gmail)
- Google Maps API Key

3. Start MongoDB (make sure it's running)

4. Seed the database:
```bash
node seeds/seedProducts.js
node seeds/seedReviews.js
```

5. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/change-password` - Change password (Protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search/:query` - Search products

### Cart (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create order (Guest/Protected)
- `GET /api/orders` - Get user's orders (Protected)
- `GET /api/orders/:id` - Get order by ID (Protected)
- `GET /api/orders/track/:orderNumber` - Track order (Public)
- `POST /api/orders/:id/cancel` - Cancel order (Protected)

### Contact
- `POST /api/contact` - Submit contact form

### Reviews
- `GET /api/reviews` - Get all approved reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Submit a review

### Config
- `GET /api/health` - Health check
- `GET /api/config/maps` - Get Google Maps API key

## Email Features
- Welcome email on registration
- Order confirmation emails
- Contact form confirmation
- Password reset emails

## Port
Server runs on port **5001** (different from admin backend on 5000)
