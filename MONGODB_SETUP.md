# Database Setup Instructions

This application supports both **MongoDB** and **PostgreSQL**. Choose the database that best fits your needs.

## Database Selection

Set the `DATABASE_TYPE` environment variable in your `backend/.env` file:

```env
# Choose: 'mongodb' or 'postgresql'
DATABASE_TYPE=mongodb
```

---

## Option 1: MongoDB

### MongoDB Atlas (Recommended for Development)

MongoDB Atlas is a free cloud database service that's perfect for development and testing.

#### Steps:

1. **Go to MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Sign up for a free account**
3. **Create a new cluster** (select the free tier)
4. **Create a database user**:
   - Username: `newsletter_user`
   - Password: `your_secure_password`
5. **Whitelist your IP address** (or use 0.0.0.0/0 for development)
6. **Get your connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string

#### Update your .env file:
```env
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb+srv://newsletter_user:<password>@cluster0.xxxxx.mongodb.net/newsletter?retryWrites=true&w=majority
```

### Local MongoDB Installation

#### Manual Installation:
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Run the installer with default settings
3. Install MongoDB Compass (GUI tool) when prompted
4. Start MongoDB service

#### Using Package Managers:
```powershell
# Using Chocolatey
choco install mongodb

# Using Scoop
scoop install mongodb

# Using WinGet
winget install MongoDB.Server
```

#### Update your .env file:
```env
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/newsletter
```

---

## Option 2: PostgreSQL

### PostgreSQL Installation

#### Option 1: Download from Official Site
1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Run the installer (remember the password you set for the 'postgres' user)
3. Default port is 5432

#### Option 2: Using Package Managers
```powershell
# Using Chocolatey
choco install postgresql

# Using Scoop
scoop install postgresql

# Using WinGet
winget install PostgreSQL.PostgreSQL
```

### Database Setup

1. **Connect to PostgreSQL** (using pgAdmin or command line):
   ```sql
   -- Create database
   CREATE DATABASE newsletter;
   
   -- Create user
   CREATE USER newsletter_user WITH PASSWORD 'newsletter_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE newsletter TO newsletter_user;
   ```

2. **Update your .env file**:
   ```env
   DATABASE_TYPE=postgresql
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=newsletter
   POSTGRES_USER=newsletter_user
   POSTGRES_PASSWORD=newsletter_password
   ```

### PostgreSQL Cloud Options

#### Option 1: ElephantSQL (Free Tier)
1. Go to https://www.elephantsql.com/
2. Sign up for free account
3. Create a new instance (Tiny Turtle - Free)
4. Get connection details

#### Option 2: Heroku Postgres
1. Create Heroku account
2. Create new app
3. Add Heroku Postgres add-on (free tier available)

---

## Docker Option (Both Databases)

If you have Docker installed:

### MongoDB with Docker:
```powershell
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

### PostgreSQL with Docker:
```powershell
docker run --name postgres -e POSTGRES_DB=newsletter -e POSTGRES_USER=newsletter_user -e POSTGRES_PASSWORD=newsletter_password -p 5432:5432 -d postgres:latest
```

---

## Verify Installation

### Test MongoDB Connection:
```powershell
mongosh "mongodb://localhost:27017/newsletter"
```

### Test PostgreSQL Connection:
```powershell
psql -h localhost -p 5432 -U newsletter_user -d newsletter
```

---

## Next Steps

1. Choose your preferred database option
2. Update your `backend/.env` file with the correct configuration
3. Run the seed script: `npm run seed`
4. Start the application: `npm run dev`

## Database Features Comparison

| Feature | MongoDB | PostgreSQL |
|---------|---------|------------|
| Type | NoSQL Document | SQL Relational |
| Setup Complexity | Easy | Moderate |
| Cloud Free Tier | MongoDB Atlas (512MB) | ElephantSQL (20MB) |
| Schema | Flexible | Structured |
| ACID Compliance | ✅ | ✅ |
| Scaling | Horizontal | Vertical + Horizontal |

Both databases are fully supported by the application with identical functionality.
