# eChannelling Backend

A production-ready RESTful API for the eChannelling hospital & doctor channeling platform built with TypeScript, Express.js, Prisma, and PostgreSQL.

## 🏗️ Architecture

- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: JWT (access & refresh tokens)
- **Email Service**: Nodemailer
- **Validation**: Zod
- **Messaging**: Kafka (kafkajs)
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Container**: Docker Compose
- **Architecture**: MVC + Service + Repository

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed the database
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

### Docker Setup

1. **Start all services**
   ```bash
   docker-compose up --build
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec app npm run db:migrate
   ```

3. **Seed the database**
   ```bash
   docker-compose exec app npm run db:seed
   ```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000`
- Production: `https://api.echannelling.com`

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `POST /logout-all` - Logout from all devices
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /change-password` - Change password
- `GET /profile` - Get user profile

#### Branches (`/api/branches`)
- `GET /` - List branches (with pagination & filters)
- `POST /` - Create branch
- `GET /:id` - Get branch by ID
- `PUT /:id` - Update branch
- `DELETE /:id` - Delete branch
- `GET /stats` - Get branch statistics
- `GET /active` - Get active branches
- `GET /by-city` - Get branches by city
- `GET /by-type` - Get branches by type
- `PATCH /:id/toggle-status` - Toggle branch status

#### Invoices (`/api/invoices`)
- `GET /` - List invoices (with pagination & filters)
- `POST /` - Create invoice
- `GET /:id` - Get invoice by ID
- `PUT /:id` - Update invoice
- `DELETE /:id` - Delete invoice
- `POST /process-payment` - Process payment
- `GET /stats` - Get invoice statistics
- `GET /overdue` - Get overdue invoices
- `GET /by-branch` - Get invoices by branch
- `POST /:id/send-notification` - Send invoice notification
- `POST /mark-overdue` - Mark overdue invoices

#### Dashboard (`/api/dashboard`)
- `GET /stats` - Get dashboard statistics
- `GET /users/stats` - Get user statistics
- `GET /branches/stats` - Get branch statistics
- `GET /invoices/stats` - Get invoice statistics
- `GET /audit/stats` - Get audit statistics
- `GET /recent-activity` - Get recent activity
- `GET /system-health` - Get system health
- `GET /analytics` - Get analytics data

#### Users (`/api/users`)
- `GET /` - List users (Admin only)
- `POST /` - Create user (Admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (Admin only)
- `GET /stats` - Get user statistics
- `PATCH /:id/toggle-status` - Toggle user status

#### Notifications (`/api/notifications`)
- `POST /send` - Send notification
- `POST /bulk-email` - Send bulk email
- `POST /custom-email` - Send custom email
- `POST /welcome-email` - Send welcome email
- `POST /password-reset-email` - Send password reset email

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/echannelling_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="no-reply@echannelling.com"
EMAIL_PASS="your-email-password"

# Kafka
KAFKA_BROKER="localhost:9092"
KAFKA_CLIENT_ID="echannelling-backend"
KAFKA_GROUP_ID="echannelling-group"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:3000"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## 📊 Database Schema

### Users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String, Optional)
- `lastName` (String, Optional)
- `role` (Enum: ADMIN, DOCTOR, HOSPITAL, PATIENT)
- `isActive` (Boolean)
- `lastLoginAt` (DateTime, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Branches
- `id` (UUID, Primary Key)
- `name` (String)
- `code` (String, Unique)
- `city` (String)
- `district` (String)
- `province` (String)
- `type` (Enum: HOSPITAL, CLINIC, LABORATORY, PHARMACY)
- `status` (Boolean)
- `address` (String, Optional)
- `phone` (String, Optional)
- `email` (String, Optional)
- `description` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Invoices
- `id` (UUID, Primary Key)
- `invoiceNo` (String, Unique)
- `branchId` (UUID, Foreign Key)
- `amount` (Decimal)
- `status` (Enum: PENDING, PAID, OVERDUE, CANCELLED)
- `dueDate` (DateTime, Optional)
- `paidAt` (DateTime, Optional)
- `description` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Audit Logs
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key, Optional)
- `action` (String)
- `resource` (String, Optional)
- `resourceId` (String, Optional)
- `description` (String, Optional)
- `metadata` (JSON, Optional)
- `ipAddress` (String, Optional)
- `userAgent` (String, Optional)
- `createdAt` (DateTime)

## 🔐 Security Features

- JWT-based authentication with refresh token rotation
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection

## 📈 Monitoring & Logging

- Winston logging with multiple transports
- Request/response logging
- Error tracking
- Performance monitoring
- Health check endpoints
- Audit logging for all operations

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set all production environment variables
   - Use strong JWT secrets
   - Configure production database URL
   - Set up email service credentials

2. **Database**
   - Run migrations: `npm run db:migrate`
   - Create admin user: `npm run create-admin`
   - Seed initial data: `npm run db:seed`

3. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Set up rate limiting
   - Enable security headers

4. **Monitoring**
   - Set up logging aggregation
   - Configure error tracking
   - Set up performance monitoring
   - Configure health checks

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Scale services
docker-compose up --scale app=3
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@echannelling.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete authentication system
- Branch management
- Invoice management
- Dashboard analytics
- User management
- Notification system
- Docker support
- Comprehensive testing
- API documentation
