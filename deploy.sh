#!/bin/bash

# Newsletter App Deployment Script
# This script automates the deployment of the newsletter application on nginx

set -e

echo "🚀 Starting Newsletter App Deployment..."

# Configuration
APP_DIR="/var/www/newsletter"
NGINX_SITES_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
SYSTEMD_DIR="/etc/systemd/system"
PROJECT_SOURCE="$(pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    print_status "Node.js is already installed ($(node --version))"
fi

# Install nginx (if not already installed)
if ! command -v nginx &> /dev/null; then
    print_status "Installing nginx..."
    sudo apt install -y nginx
else
    print_status "nginx is already installed"
fi

# Install PM2 globally (alternative to systemd)
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
else
    print_status "PM2 is already installed"
fi

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy application files
print_status "Copying application files..."
cp -r $PROJECT_SOURCE/backend $APP_DIR/
cp -r $PROJECT_SOURCE/shared $APP_DIR/

# Install backend dependencies
print_status "Installing backend dependencies..."
cd $APP_DIR/backend
npm install --production

# Build frontend
print_status "Building frontend for production..."
cd $PROJECT_SOURCE/frontend
npm run build

# Copy built frontend to nginx directory
print_status "Copying frontend build to nginx directory..."
sudo cp -r $PROJECT_SOURCE/frontend/build $APP_DIR/

# Set up environment file
print_status "Setting up environment file..."
if [ ! -f "$APP_DIR/backend/.env" ]; then
    print_warning "Creating sample .env file. Please update it with your actual configuration."
    cat > $APP_DIR/backend/.env << EOF
# Database Configuration
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=newsletter
DB_USER=newsletter_user
DB_PASS=CHANGE_TO_SECURE_PASSWORD

# JWT Secret
JWT_SECRET=CHANGE_TO_SECURE_JWT_SECRET

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=CHANGE_TO_SECURE_SMTP_PASSWORD
FROM_EMAIL=your_email@gmail.com

# Application URLs
BASE_URL=http://your-domain.com
PORT=5050

# Environment
NODE_ENV=production
EOF
    print_warning "⚠️  IMPORTANT: Update $APP_DIR/backend/.env with your actual configuration!"
fi

# Set up nginx configuration
print_status "Setting up nginx configuration..."
sudo cp $PROJECT_SOURCE/newsletter.conf $NGINX_SITES_DIR/newsletter
sudo ln -sf $NGINX_SITES_DIR/newsletter $NGINX_ENABLED_DIR/

# Remove default nginx site if it exists
if [ -f "$NGINX_ENABLED_DIR/default" ]; then
    sudo rm $NGINX_ENABLED_DIR/default
fi

# Test nginx configuration
print_status "Testing nginx configuration..."
sudo nginx -t

# Set up systemd service
print_status "Setting up systemd service..."
sudo cp $PROJECT_SOURCE/newsletter-backend.service $SYSTEMD_DIR/
sudo systemctl daemon-reload
sudo systemctl enable newsletter-backend

# Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# Start services
print_status "Starting services..."
sudo systemctl start newsletter-backend
sudo systemctl restart nginx

# Enable firewall rules
print_status "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh

# Check service status
print_status "Checking service status..."
echo "Backend service status:"
sudo systemctl status newsletter-backend --no-pager -l

echo "Nginx service status:"
sudo systemctl status nginx --no-pager -l

# Final instructions
echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update your domain in: $NGINX_SITES_DIR/newsletter"
echo "2. Configure your environment variables in: $APP_DIR/backend/.env"
echo "3. Set up your database (PostgreSQL or MongoDB)"
echo "4. Run database migrations/seeds if needed"
echo "5. Consider setting up SSL with Let's Encrypt"
echo ""
echo "🔧 Useful commands:"
echo "- Restart backend: sudo systemctl restart newsletter-backend"
echo "- Restart nginx: sudo systemctl restart nginx"
echo "- View backend logs: sudo journalctl -u newsletter-backend -f"
echo "- View nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "🌐 Your app should be available at: http://your-domain.com"
echo ""
print_warning "Don't forget to update your .env file with actual configuration!"
