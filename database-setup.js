#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🚀 Newsletter Application Database Setup\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Function to run commands
const runCommand = (command, cwd = process.cwd()) => {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed to execute: ${command}`);
    return false;
  }
};

// Function to create .env file
const createEnvFile = (databaseType, config) => {
  const envPath = path.join(process.cwd(), 'backend', '.env');
  
  let envContent = `# Server Configuration
PORT=5050
NODE_ENV=development
CLIENT_URL=http://localhost:3030

# Database Configuration
DATABASE_TYPE=${databaseType}

`;

  if (databaseType === 'mongodb') {
    envContent += `# MongoDB Configuration
MONGODB_URI=${config.mongoUri || 'mongodb://localhost:27017/newsletter'}

`;
  } else if (databaseType === 'postgresql') {
    envContent += `# PostgreSQL Configuration
POSTGRES_HOST=${config.host || 'localhost'}
POSTGRES_PORT=${config.port || '5432'}
POSTGRES_DB=${config.database || 'newsletter'}
POSTGRES_USER=${config.username || 'newsletter_user'}
POSTGRES_PASSWORD=${config.password || 'newsletter_password'}

`;
  }

  envContent += `# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Optional - for sending newsletters)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
};

// Main setup function
const setup = async () => {
  try {
    console.log('📦 Installing dependencies...\n');
    
    // Install root dependencies
    if (!runCommand('npm install')) {
      console.error('❌ Failed to install root dependencies');
      return;
    }

    // Install backend dependencies
    console.log('\n📦 Installing backend dependencies...');
    if (!runCommand('npm install', path.join(process.cwd(), 'backend'))) {
      console.error('❌ Failed to install backend dependencies');
      return;
    }

    // Install frontend dependencies
    console.log('\n📦 Installing frontend dependencies...');
    if (!runCommand('npm install', path.join(process.cwd(), 'frontend'))) {
      console.error('❌ Failed to install frontend dependencies');
      return;
    }

    console.log('\n🗄️ Database Configuration\n');
    console.log('Choose your preferred database:');
    console.log('1. MongoDB (NoSQL Document Database)');
    console.log('2. PostgreSQL (SQL Relational Database)');
    
    const dbChoice = await question('\nEnter your choice (1 or 2): ');
    
    let databaseType, config = {};
    
    if (dbChoice === '1') {
      databaseType = 'mongodb';
      console.log('\n📝 MongoDB Configuration');
      console.log('1. Local MongoDB (mongodb://localhost:27017/newsletter)');
      console.log('2. MongoDB Atlas (cloud)');
      console.log('3. Custom connection string');
      
      const mongoChoice = await question('\nChoose MongoDB option (1, 2, or 3): ');
      
      if (mongoChoice === '1') {
        config.mongoUri = 'mongodb://localhost:27017/newsletter';
        console.log('\n⚠️  Make sure MongoDB is installed and running locally.');
        console.log('   Install MongoDB: https://www.mongodb.com/try/download/community');
      } else if (mongoChoice === '2') {
        console.log('\n📋 MongoDB Atlas Setup:');
        console.log('1. Go to https://www.mongodb.com/atlas');
        console.log('2. Create a free account and cluster');
        console.log('3. Create a database user');
        console.log('4. Get your connection string');
        config.mongoUri = await question('\nEnter your MongoDB Atlas connection string: ');
      } else if (mongoChoice === '3') {
        config.mongoUri = await question('Enter custom MongoDB connection string: ');
      }
      
    } else if (dbChoice === '2') {
      databaseType = 'postgresql';
      console.log('\n📝 PostgreSQL Configuration');
      console.log('1. Local PostgreSQL');
      console.log('2. Cloud PostgreSQL (ElephantSQL, Heroku, etc.)');
      
      const pgChoice = await question('\nChoose PostgreSQL option (1 or 2): ');
      
      if (pgChoice === '1') {
        console.log('\n⚠️  Make sure PostgreSQL is installed and running locally.');
        console.log('   Install PostgreSQL: https://www.postgresql.org/download/');
        config.host = 'localhost';
        config.port = '5432';
        config.database = await question('Database name (default: newsletter): ') || 'newsletter';
        config.username = await question('Username (default: newsletter_user): ') || 'newsletter_user';
        config.password = await question('Password (default: newsletter_password): ') || 'newsletter_password';
      } else if (pgChoice === '2') {
        console.log('\n📋 Cloud PostgreSQL Setup:');
        config.host = await question('Host: ');
        config.port = await question('Port (default: 5432): ') || '5432';
        config.database = await question('Database name: ');
        config.username = await question('Username: ');
        config.password = await question('Password: ');
      }
    } else {
      console.log('❌ Invalid choice. Defaulting to MongoDB local.');
      databaseType = 'mongodb';
      config.mongoUri = 'mongodb://localhost:27017/newsletter';
    }

    // Create .env file
    console.log('\n⚙️ Creating environment configuration...');
    createEnvFile(databaseType, config);

    console.log('\n✅ Setup completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log(`1. Make sure your ${databaseType.toUpperCase()} database is running`);
    if (databaseType === 'postgresql') {
      console.log('2. Create the database and user if using local PostgreSQL:');
      console.log(`   CREATE DATABASE ${config.database || 'newsletter'};`);
      console.log(`   CREATE USER ${config.username || 'newsletter_user'} WITH PASSWORD '${config.password || 'newsletter_password'}';`);
      console.log(`   GRANT ALL PRIVILEGES ON DATABASE ${config.database || 'newsletter'} TO ${config.username || 'newsletter_user'};`);
    }
    console.log('3. Run "npm run seed" to add sample data (optional)');
    console.log('4. Run "npm run dev" to start the application');
    console.log('\n📱 The app will be available at:');
    console.log('   Frontend: http://localhost:3030');
    console.log('   Backend:  http://localhost:5050');
    console.log('\n👤 Default admin credentials (after seeding):');
    console.log('   Email: admin@example.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
};

// Run setup
setup();
