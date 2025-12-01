# Beetle Diffuser Admin Panel

A comprehensive MERN stack admin panel for managing the Beetle Diffuser e-commerce platform. Features include product management, order processing, user administration, and analytics dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB running (using provided connection)
- Git installed

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd admin/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file with these variables:
   PORT=5000
   MONGODB_URI=mongodb://72.60.103.18:27017/bettle-diffuser
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=30d
   NODE_ENV=development
   ```

4. **Start backend server:**
   ```bash
   npm start
   ```
   Backend will run on http://localhost:5000

### Frontend Setup

1. **Open new terminal and navigate to frontend:**
   ```bash
   cd admin/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start React development server:**
   ```bash
   npm start
   ```
   Frontend will run on http://localhost:3000

## 📋 Features

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin only)
- Password hashing with bcryptjs
- Secure cookie handling
- Rate limiting protection

### 📊 Dashboard Analytics
- Sales overview with charts
- Order status distribution
- Recent orders display
- Low stock alerts
- Revenue analytics

### 🛍️ Product Management
- Full CRUD operations for products
- Image upload and management
- Category organization
- Stock tracking and alerts
- Product status toggles
- Search and filtering

### 📦 Order Management
- Complete order processing workflow
- Order status updates
- Payment tracking
- Customer information
- Order search and filtering

### 👥 User Management
- User account administration
- Role assignment
- Account status control
- User activity tracking

### ⚙️ Settings & Configuration
- Admin profile management
- Password change functionality
- System configuration options

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Helmet** - Security headers
- **CORS** - Cross-origin requests

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Styling framework
- **Headless UI** - Accessible components
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

## 📁 Project Structure

```
admin/
├── backend/
│   ├── models/           # Database schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/           # API endpoints
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── users.js
│   │   ├── dashboard.js
│   │   └── upload.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   └── validation.js
│   ├── uploads/          # File storage
│   ├── .env             # Environment variables
│   ├── server.js        # Main server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable components
    │   │   ├── Layout/
    │   │   └── UI/
    │   ├── pages/        # Route components
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── Products.js
    │   │   ├── Orders.js
    │   │   ├── Users.js
    │   │   └── Settings.js
    │   ├── contexts/     # React contexts
    │   ├── services/     # API services
    │   └── index.css     # Global styles
    ├── public/
    ├── tailwind.config.js
    └── package.json
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/toggle-status` - Toggle product status

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id/toggle-status` - Toggle user status
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/sales-chart` - Get sales chart data
- `GET /api/dashboard/recent-orders` - Get recent orders

### File Upload
- `POST /api/upload` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build for production
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the React app:
   ```bash
   npm run build
   ```
2. Deploy build folder to hosting service (Netlify, Vercel, etc.)

## 🔧 Configuration

### Environment Variables (Backend)
```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=30d
NODE_ENV=production
```

### Proxy Configuration (Frontend)
The frontend includes a proxy configuration in package.json to handle API calls during development.

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Rate Limiting** - Express rate limit for API protection
- **Helmet** - Security headers for Express
- **CORS** - Cross-origin request configuration
- **Input Validation** - Joi validation for API inputs

## 📈 Performance Features

- **React Query** - Efficient server state management with caching
- **Code Splitting** - Route-based code splitting
- **Image Optimization** - Multer for efficient file handling
- **Database Indexing** - MongoDB indexes for optimal queries

## 🎨 UI/UX Features

- **Dark Theme** - Modern dark interface
- **Responsive Design** - Mobile-friendly layout
- **Loading States** - Skeleton loading and spinners
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Success/error feedback
- **Accessible Components** - ARIA-compliant UI elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔮 Future Enhancements

- **Advanced Analytics** - More detailed reporting
- **Email Notifications** - Order status updates
- **Inventory Management** - Stock alerts and reordering
- **Multi-language Support** - Internationalization
- **Advanced Search** - Elasticsearch integration
- **Mobile App** - React Native admin app