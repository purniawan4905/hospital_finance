# Hospital Financial Management System

A comprehensive web application for managing hospital financial reports, built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

### Frontend (React + TypeScript)
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Dashboard**: Real-time financial statistics and charts
- **Financial Reports**: Complete CRUD operations for monthly, quarterly, and annual reports
- **User Management**: Role-based access control (Admin, Finance, Viewer)
- **Review Scheduling**: Schedule and track financial reviews
- **Export Functionality**: PDF and Excel export capabilities
- **Settings Management**: Configurable hospital and system settings

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Complete API with proper error handling
- **Authentication**: JWT-based authentication with role-based permissions
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, input validation
- **File Upload**: Multer for handling file uploads
- **Email**: Nodemailer for notifications

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form handling
- Recharts for data visualization
- Lucide React for icons
- React Hot Toast for notifications

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation
- Helmet for security headers
- CORS for cross-origin requests
- Rate limiting for API protection

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hospital-financial-system
```

### 2. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
npm install                    # Frontend dependencies
npm run backend:install       # Backend dependencies
```

### 3. Environment Setup

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend (backend/.env)
```env
MONGODB_URI=****************
JWT_SECRET=**********
JWT_EXPIRE=********
PORT=5000
NODE_ENV=development

# Optional: Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Database Setup

1. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Seed the Database (Optional)**
   ```bash
   npm run backend:seed
   ```
   
   This creates sample data including:
   - Default admin user (admin@hospital.com / password)
   - Sample financial reports
   - Hospital settings
   - Review schedules

### 5. Start the Application

#### Development Mode
```bash
# Start both frontend and backend concurrently
npm run start:all

# Or start separately
npm run backend:dev    # Backend on http://localhost:5000
npm run dev           # Frontend on http://localhost:5173
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start backend
npm run backend:start
```

## Default Login Credentials

After seeding the database, you can use these credentials:

- **Admin**: admin@hospital.com / password
- **Finance**: finance@hospital.com / password  
- **Viewer**: viewer@hospital.com / password

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Financial Reports
- `GET /api/reports` - Get all reports (with filtering)
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get single report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `PATCH /api/reports/:id/submit` - Submit for approval
- `PATCH /api/reports/:id/approve` - Approve report

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/charts/revenue` - Revenue chart data
- `GET /api/dashboard/charts/expenses` - Expense chart data
- `GET /api/dashboard/ratios` - Financial ratios

### Settings
- `GET /api/settings` - Get hospital settings
- `PUT /api/settings` - Update settings

## Project Structure

```
hospital-financial-system/
├── backend/                 # Backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
├── src/                   # Frontend source
│   ├── components/        # React components
│   ├── context/          # React context
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── package.json         # Dependencies
```

## Features Overview

### Dashboard
- Real-time financial statistics
- Interactive charts for revenue, expenses, and profit
- Financial ratios and KPIs
- Recent activity feed
- Quick actions for common tasks

### Financial Reports
- Monthly, quarterly, and annual reports
- Complete revenue and expense tracking
- Balance sheet management
- Tax calculations
- Approval workflow
- Export to PDF and Excel

### User Management
- Role-based access control
- User registration and authentication
- Profile management
- Activity tracking

### Review Scheduling
- Schedule financial reviews
- Assign to team members
- Track progress and status
- Add comments and notes
- Overdue notifications

### Settings
- Hospital information management
- Tax rate configuration
- Notification preferences
- Security settings
- Backup management

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers with Helmet
- SQL injection prevention

## Development

### Code Style
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting

### Testing
```bash
# Run backend tests
cd backend && npm test

# Run frontend tests (if configured)
npm test
```

### Building for Production
```bash
# Build frontend
npm run build

# The built files will be in the 'dist' directory
```

## Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

### Backend Deployment
The backend can be deployed to:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

### Environment Variables for Production
Make sure to set all required environment variables in your production environment.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@hospital-financial.com or create an issue in the repository.

![image](https://github.com/user-attachments/assets/5ed9fb7c-ce84-41da-a139-d8b29976abf3)
