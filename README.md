# Newsletter Subscription Web Application

A full-stack newsletter and subscription management system built with React and Node.js.
![image](https://github.com/deepakmaroo/newsletter/blob/main/dashboard.png)


## Features

- 📧 **Newsletter Subscription**: Easy email subscription with validation
- 📰 **Newsletter Archive**: Browse and read published newsletters
- 🔐 **Admin Dashboard**: Secure admin interface for content management
- ✏️ **Rich Content Editor**: Support for both rich text (WYSIWYG) and Markdown editing
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🚀 **Modern Tech Stack**: React, Node.js, MongoDB/PostgreSQL, Tailwind CSS
- 🔒 **Security**: JWT authentication, input validation, rate limiting
- 🗄️ **Database Choice**: Support for both MongoDB and PostgreSQL
- 🎨 **Content Flexibility**: Create newsletters with rich formatting, images, links, and more

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **ReactQuill** - Rich text editor
- **Marked** - Markdown parsing (optional)
- **React Markdown** - Markdown rendering (optional)
- **Remark GFM** - GitHub Flavored Markdown support (optional)
- **Rehype Raw & Sanitize** - HTML processing and sanitization (optional)

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - NoSQL database and ODM
- **PostgreSQL & Sequelize** - SQL database and ORM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Sanitize HTML** - HTML content sanitization
- **HTML-to-Text** - Convert HTML to plain text for emails

## Project Structure

```
newsletter/
├── package.json             # Root package.json with dev scripts
├── package-lock.json        # Root dependency lock file
├── backend/                 # Node.js API server
│   ├── package.json        # Backend dependencies
│   ├── package-lock.json   # Backend dependency lock file
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth and admin middleware
│   ├── models/            # Database models (MongoDB/PostgreSQL)
│   ├── routes/            # API routes
│   └── server.js          # Express server entry point
├── frontend/              # React web application
│   ├── package.json      # Frontend dependencies (includes optional markdown packages)
│   ├── package-lock.json # Frontend dependency lock file
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable React components
│       ├── pages/        # Page components (Admin.js contains editor)
│       ├── hooks/        # Custom React hooks
│       ├── utils/        # Utilities and API functions
│       └── styles/       # CSS and styling
└── shared/               # Shared utilities
```

**Key Dependencies by Directory:**
- **Root**: Development tools (concurrently for running both servers)
- **Backend**: Express, database ORMs, authentication, email sending
- **Frontend**: React, UI components, form handling, content editing (Rich Text + Markdown)

**Important Files for CI/CD:**
- **package-lock.json files**: Lock dependency versions for consistent builds
- **Root package-lock.json**: Controls development workflow dependencies
- **Backend package-lock.json**: Ensures consistent server-side dependencies
- **Frontend package-lock.json**: Locks client-side dependencies and build tools
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
   # Install root dependencies (creates package-lock.json)
   npm install

   # Install backend dependencies (creates backend/package-lock.json)
   cd backend
   npm install

   # Install frontend dependencies (creates frontend/package-lock.json)
   cd ../frontend
   npm install
   ```

   **Package Notes:**
   - `marked` - Fast markdown parser and compiler
   - `react-markdown` - React component for rendering markdown
   - `remark-gfm` - GitHub Flavored Markdown support (tables, task lists, etc.)
   - `rehype-raw` - Allows raw HTML in markdown
   - `rehype-sanitize` - Sanitizes HTML for security

   **Workflow Best Practices:**
   - Commit all `package-lock.json` files to version control
   - Use `npm ci` in production/CI environments for faster, reliable installs
   - Never manually edit `package-lock.json` files

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
   - **Rich Text Mode**: Use the WYSIWYG editor with formatting toolbar
   - **Markdown Mode**: Write content in Markdown for faster, cleaner editing
   - **Preview**: Real-time preview of your newsletter content
4. View subscriber statistics
5. Send newsletters to subscribers

### Content Creation Features
- **Dual Editor Modes**: Switch between rich text and Markdown editing
- **Live Preview**: See how your newsletter will look before publishing
- **Excerpt Support**: Add brief descriptions for each newsletter
- **Content Formatting**: Headers, lists, links, images, code blocks, and more
- **Email Optimization**: Content is automatically optimized for email delivery

## Development

### Available Scripts

**Root directory:**
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies
- `npm ci` - Clean install from package-lock.json (recommended for CI/CD)

**Backend directory:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm ci` - Clean install from package-lock.json

**Frontend directory:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm ci` - Clean install from package-lock.json

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

### CI/CD Workflow

**Package Lock Files:**
Each directory contains a `package-lock.json` file that locks exact dependency versions:
- `./package-lock.json` - Development tools (concurrently, etc.)
- `./backend/package-lock.json` - Server dependencies
- `./frontend/package-lock.json` - React app and build dependencies

**Production Deployment:**
```bash
# Use npm ci for faster, reliable installs in production
npm ci                    # Install root dependencies
cd backend && npm ci      # Install backend dependencies  
cd ../frontend && npm ci  # Install frontend dependencies
npm run build            # Build frontend for production
```

**Docker Considerations:**
- Copy `package*.json` files before `npm ci` for better layer caching
- Use multi-stage builds to reduce final image size
- Set `NODE_ENV=production` for optimized builds

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Environment variable protection

## Troubleshooting

### Common Installation Issues

**Package Lock File Conflicts**
If you encounter dependency conflicts or inconsistent installs:
```powershell
# Clean install from lock files (recommended)
npm ci

# Or if you need to regenerate lock files:
rm -rf node_modules package-lock.json
npm install

# For specific directories:
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend  
rm -rf node_modules package-lock.json
npm install
```

**Markdown Dependencies (Optional)**
If you encounter issues with markdown packages:
```powershell
# Clear npm cache and reinstall
npm cache clean --force
cd frontend
rm -rf node_modules package-lock.json
npm install
npm install marked react-markdown remark-gfm rehype-raw rehype-sanitize
```

**Node Version Compatibility**
- Ensure Node.js v16 or higher is installed
- Check `.nvmrc` file if present for recommended Node version
- Use `npm list` to check for dependency conflicts

**Database Connection Issues**
- Ensure your database server is running
- Check connection string in `.env` file
- For PostgreSQL, ensure the database and user exist
- For MongoDB, ensure MongoDB service is started

**Port Conflicts**
If ports 3030 or 5050 are in use:
- Change `PORT=5050` in backend `.env` file
- Update `REACT_APP_API_URL` in frontend if needed

**SMTP Email Issues**
- Use app-specific passwords for Gmail
- Check firewall settings for SMTP ports
- Test SMTP settings with a simple email client first

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. **Important**: Commit package-lock.json files if dependencies changed
5. Test your changes locally
6. Submit a pull request

### Version Control Best Practices

**Always Commit These Files:**
- `package.json` (all directories)
- `package-lock.json` (all directories)
- `.env.example` (environment template)

**Never Commit These Files:**
- `node_modules/` (excluded by .gitignore)
- `.env` (contains secrets)
- Build artifacts (`frontend/build/`)

**Dependency Management:**
- Use `npm install <package>` to add new dependencies
- Use `npm ci` in CI/CD pipelines for consistent builds
- Update `package-lock.json` when changing dependencies
- Document any new optional dependencies in README

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
