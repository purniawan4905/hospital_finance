# Hospital Financial Management System - Backend

A comprehensive backend API for managing hospital financial reports, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Finance, Viewer)
  - Password hashing with bcrypt
  - Email verification and password reset

- **Financial Reports Management**
  - CRUD operations for financial reports
  - Monthly, quarterly, and annual reports
  - Report approval workflow
  - Report versioning and duplication
  - Export functionality

- **Dashboard & Analytics**
  - Real-time financial statistics
  - Chart data for revenue, expenses, and profit
  - Financial ratios calculation
  - Comparative analysis

- **Review Scheduling**
  - Schedule financial reviews
  - Assignment to users
  - Status tracking and comments
  - Overdue notifications

- **Hospital Settings**
  - Configurable tax rates and settings
  - Notification preferences
  - Security settings
  - Backup management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hospital_financial
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database (optional)**
   ```bash
   node utils/seedData.js
   ```

6. **Start the server**
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
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password/:token` - Reset password

### Financial Reports
- `GET /api/reports` - Get all reports (with filtering)
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `PATCH /api/reports/:id/submit` - Submit report for approval
- `PATCH /api/reports/:id/approve` - Approve report
- `PATCH /api/reports/:id/archive` - Archive report
- `POST /api/reports/:id/duplicate` - Duplicate report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/stats` - Get report statistics
- `GET /api/reports/:id/export` - Export report

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts/revenue` - Get revenue chart data
- `GET /api/dashboard/charts/expenses` - Get expense chart data
- `GET /api/dashboard/charts/profit` - Get profit chart data
- `GET /api/dashboard/charts/balance-sheet` - Get balance sheet data
- `GET /api/dashboard/ratios` - Get financial ratios
- `GET /api/dashboard/analysis` - Get comparative analysis
- `GET /api/dashboard/activity` - Get recent activity

### Review Schedules
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get single schedule
- `POST /api/schedules` - Create new schedule
- `PUT /api/schedules/:id` - Update schedule
- `PATCH /api/schedules/:id/complete` - Mark schedule as completed
- `POST /api/schedules/:id/comment` - Add comment to schedule
- `GET /api/schedules/upcoming` - Get upcoming schedules
- `GET /api/schedules/overdue` - Get overdue schedules
- `DELETE /api/schedules/:id` - Delete schedule

### Hospital Settings
- `GET /api/settings` - Get hospital settings
- `PUT /api/settings` - Update hospital settings
- `POST /api/settings/reset` - Reset settings to default
- `GET /api/settings/backup` - Get backup settings
- `PUT /api/settings/backup` - Update backup settings
- `POST /api/settings/backup/create` - Create backup
- `GET /api/settings/backups` - Get all backups
- `POST /api/settings/backup/:id/restore` - Restore backup

### User Management (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/role` - Update user role
- `PATCH /api/users/:id/status` - Toggle user status
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/activity` - Get user activity

## Data Models

### User
- Personal information (name, email, phone)
- Role-based permissions (admin, finance, viewer)
- Hospital association
- Authentication data

### Financial Report
- Revenue breakdown by category
- Expense breakdown by category
- Assets (current and fixed)
- Liabilities (current and long-term)
- Equity information
- Tax calculations
- Approval workflow

### Hospital Settings
- Basic hospital information
- Tax configuration
- Reporting preferences
- Notification settings
- Security policies

### Review Schedule
- Report assignment
- Review timeline
- Status tracking
- Comments and notes

## Security Features

- **Authentication**: JWT-based with configurable expiration
- **Authorization**: Role-based access control
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: Configurable request limits
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers
- **Input Validation**: Express Validator for all inputs
- **SQL Injection Protection**: Mongoose ODM prevents injection

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database operation errors
- File upload errors
- Rate limiting errors

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

1. **Environment Variables**
   Set all required environment variables for production.

2. **Database**
   Ensure MongoDB is accessible and properly configured.

3. **Process Manager**
   Use PM2 or similar for production deployment:
   ```bash
   npm install -g pm2
   pm2 start server.js --name hospital-api
   ```

4. **Reverse Proxy**
   Configure Nginx or Apache as a reverse proxy.

5. **SSL Certificate**
   Implement HTTPS for production.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.