<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Newsletter Application - Development Guidelines

This is a full-stack newsletter and subscription web application built with React (frontend) and Node.js/Express (backend).

## Project Structure
- `backend/` - Node.js/Express API server
- `frontend/` - React web application  
- `shared/` - Shared utilities and types

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB/PostgreSQL, JWT authentication
- **Frontend**: React, React Router, React Query, Tailwind CSS
- **Database**: MongoDB with Mongoose ODM OR PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Email**: Nodemailer for newsletter delivery

## Development Guidelines

### Backend Development
- Use Express.js with proper middleware (helmet, cors, rate limiting)
- Implement proper error handling and validation
- Use Mongoose for MongoDB operations OR Sequelize for PostgreSQL operations
- Follow RESTful API conventions
- Implement JWT-based authentication
- Use environment variables for configuration
- Use DatabaseAdapter utility for database-agnostic operations

### Frontend Development  
- Use functional components with React hooks
- Implement React Query for data fetching and caching
- Use React Hook Form for form management
- Apply Tailwind CSS for styling
- Use React Router for navigation
- Implement proper error handling and loading states

### Code Style
- Use consistent naming conventions (camelCase for JS, kebab-case for CSS)
- Write descriptive commit messages
- Add proper JSDoc comments for functions
- Use TypeScript-style prop validation where applicable

### Security Considerations
- Sanitize user inputs
- Use HTTPS in production
- Implement rate limiting
- Validate all API requests
- Use secure JWT secrets
- Hash passwords with bcrypt

### Features Implemented
- Newsletter subscription/unsubscription
- Newsletter creation and management (admin)
- User authentication
- Responsive design
- Email validation
- Admin dashboard
- Newsletter archive

### API Endpoints
- `GET /api/newsletters` - Get published newsletters
- `POST /api/subscriptions/subscribe` - Subscribe to newsletter
- `POST /api/auth/login` - Admin login
- `POST /api/newsletters` - Create newsletter (admin)
- And more...

When suggesting code improvements or new features, consider the existing architecture and maintain consistency with the current codebase.
