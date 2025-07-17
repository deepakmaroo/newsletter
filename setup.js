#!/usr/bin/env node

const { execSync } = require('child_process')  
console.log('   Frontend: http://localhost:3030');
console.log('   Backend:  http://localhost:5050');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Newsletter Application...\n');

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

// Function to check if file exists
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Main setup function
const setup = () => {
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

  // Check for environment file
  const envPath = path.join(process.cwd(), 'backend', '.env');
  if (!fileExists(envPath)) {
    console.log('\n⚙️ Creating environment file...');
    const envExample = path.join(process.cwd(), 'backend', '.env.example');
    if (fileExists(envExample)) {
      fs.copyFileSync(envExample, envPath);
      console.log('✅ Created .env file from .env.example');
      console.log('📝 Please update the .env file with your configuration');
    }
  }

  console.log('\n✅ Setup completed successfully!');
  console.log('\n🚀 Next steps:');
  console.log('1. Make sure MongoDB is running');
  console.log('2. Update backend/.env with your configuration');
  console.log('3. Run "npm run dev" to start the application');
  console.log('4. Optional: Run "cd backend && npm run seed" to add sample data');
  console.log('\n📱 The app will be available at:');
  console.log('   Frontend: http://localhost:3030');
  console.log('   Backend:  http://localhost:5050');
};

// Run setup
setup();
