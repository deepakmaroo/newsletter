# Newsletter Subscription Web Application

A full-stack newsletter and subscription management system built with React and Node.js.
![image](https://github.com/deepakmaroo/newsletter/blob/main/dashboard.png)


## Features

- 📧 **Newsletter Subscription**: Easy email subscription with validation
- 📰 **Newsletter Archive**: Browse and read published newsletters
- 🔐 **Admin Dashboard**: Secure admin interface for content management
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🚀 **Modern Tech Stack**: React, Node.js, MongoDB/PostgreSQL, Tailwind CSS
- 🔒 **Security**: JWT authentication, input validation, rate limiting
- 🗄️ **Database Choice**: Support for both MongoDB and PostgreSQL

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - NoSQL database and ODM
- **PostgreSQL & Sequelize** - SQL database and ORM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## Project Structure

```
newsletter/
├── backend/               # Node.js API server
│   ├── config/           # Database configuration
│   ├── middleware/       # Auth and admin middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Express server entry point
├── frontend/            # React web application
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable React components
│       ├── pages/       # Page components
│       ├── hooks/       # Custom React hooks
│       ├── utils/       # Utilities and API functions
│       └── styles/      # CSS and styling
└── shared/              # Shared utilities
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Database: **MongoDB** (local installation or MongoDB Atlas) **OR** **PostgreSQL** (local installation or cloud service)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newsletter
   ```

2. **Install dependencies**
   ```powershell
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   npm install sanitize-html
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5050
   NODE_ENV=development
   CLIENT_URL=http://localhost:3030
   
   # Database Configuration
   # Choose: 'mongodb' or 'postgresql'
   DATABASE_TYPE=mongodb
   
   # MongoDB Configuration (if using MongoDB)
   MONGODB_URI=mongodb://localhost:27017/newsletter
   
   # PostgreSQL Configuration (if using PostgreSQL)
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=newsletter
   POSTGRES_USER=newsletter_user
   POSTGRES_PASSWORD=newsletter_password
   
   JWT_SECRET=your-super-secret-jwt-key
   
   # Email configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=your-email@gmail.com
   ```

4. **Database Setup**
   
   The application supports both MongoDB and PostgreSQL. Choose your preferred database:
   
   **For MongoDB:**
   - Set `DATABASE_TYPE=mongodb` in your `.env` file
   - Install MongoDB locally or use MongoDB Atlas (cloud)
   
   **For PostgreSQL:**
   - Set `DATABASE_TYPE=postgresql` in your `.env` file
   - Install PostgreSQL locally or use a cloud service
   
   See `MONGODB_SETUP.md` for detailed database installation instructions.

5. **Start the Application**
   
   From the root directory:
   ```powershell
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start them separately:
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory)  
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3030
   - Backend API: http://localhost:5050

## API Endpoints

### Public Endpoints
- `GET /api/newsletters` - Get all published newsletters
- `GET /api/newsletters/:id` - Get newsletter by ID
- `POST /api/subscriptions/subscribe` - Subscribe to newsletter
- `POST /api/subscriptions/unsubscribe` - Unsubscribe from newsletter
- `GET /api/subscriptions/status/:email` - Check subscription status

### Admin Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `GET /api/newsletters/admin/all` - Get all newsletters (including drafts)
- `POST /api/newsletters` - Create new newsletter
- `PUT /api/newsletters/:id` - Update newsletter
- `DELETE /api/newsletters/:id` - Delete newsletter
- `GET /api/subscriptions/admin/all` - Get all subscriptions

## Usage

### For Visitors
1. Visit the homepage to browse newsletters
2. Click on any newsletter to read the full content
3. Use the subscribe page to join the mailing list
4. Manage subscription status (subscribe/unsubscribe)

### For Admins
1. Access the admin panel at `/admin`
2. Login with admin credentials
3. Manage newsletters (create, edit, delete, publish)
4. View subscriber statistics
5. Send newsletters to subscribers

## Development

### Available Scripts

**Root directory:**
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

**Backend directory:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

**Frontend directory:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Environment Variables

Backend environment variables (`.env`):
- `PORT` - Server port (default: 5050)
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS
- `DATABASE_TYPE` - Database type ('mongodb' or 'postgresql')
- `MONGODB_URI` - MongoDB connection string (if using MongoDB)
- `POSTGRES_*` - PostgreSQL connection details (if using PostgreSQL)
- `JWT_SECRET` - Secret for JWT tokens
- `SMTP_*` - Email server configuration

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
