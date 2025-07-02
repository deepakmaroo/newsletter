# Quick Start Guide

## Prerequisites
- Node.js (v16+)
- Database: MongoDB (local or Atlas) OR PostgreSQL (local or cloud)
- Git

## Installation

1. **Install Node.js dependencies:**
   ```powershell
   npm run setup
   ```

2. **Configure environment:**
   - Copy `backend/.env.example` to `backend/.env`
   - Choose your database by setting `DATABASE_TYPE=mongodb` or `DATABASE_TYPE=postgresql`
   - Update database connection settings

3. **Start your database:**
   
   **For MongoDB:**
   - Local: Make sure MongoDB service is running
   - Atlas: Ensure connection string is correct in `.env`
   
   **For PostgreSQL:**
   - Local: Make sure PostgreSQL service is running
   - Cloud: Ensure connection details are correct in `.env`

4. **Seed database (optional):**
   ```powershell
   npm run seed
   ```

5. **Start the application:**
   ```powershell
   npm run dev
   ```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin

## Default Admin Credentials
- **Email**: admin@example.com
- **Password**: password123

## Key Features to Test

1. **Public Features:**
   - Browse newsletters on homepage
   - Subscribe to newsletter
   - Read individual newsletter articles

2. **Admin Features:**
   - Login to admin panel
   - Create/edit newsletters
   - View subscriber list
   - Publish/unpublish content

## Troubleshooting

### Common Issues:

1. **MongoDB connection error:**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Port already in use:**
   - Change ports in configuration files
   - Frontend: `package.json` (default: 3000)
   - Backend: `.env` PORT variable (default: 5000)

3. **Dependencies issues:**
   - Delete `node_modules` folders
   - Run `npm run setup` again

## Development Commands

```powershell
# Start both frontend and backend
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build frontend for production
npm run build

# Seed database with sample data
npm run seed

# Install all dependencies
npm run install-all
```

## File Structure

```
newsletter/
├── backend/          # Node.js API
├── frontend/         # React app  
├── shared/           # Shared utilities
├── .vscode/          # VS Code settings
├── .github/          # GitHub configs
└── README.md         # Full documentation
```

Happy coding! 🚀
