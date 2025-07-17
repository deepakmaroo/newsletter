# Newsletter App - nginx Deployment Guide

This guide will help you deploy your newsletter application on a Linux server with nginx.

## Prerequisites

- Ubuntu/Debian server with sudo access
- Domain name pointing to your server (optional)
- Verify backend is listening on port 5050
- Basic knowledge of Linux commands

## Quick Deployment

1. **Make the deployment script executable:**
   ```bash
   chmod +x deploy.sh
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

3. **Update configuration files:**
   - Edit `/var/www/newsletter/backend/.env` with your actual database and SMTP settings
   - Update domain in `/etc/nginx/sites-available/newsletter`

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx
sudo apt install -y nginx

# Install PM2 (optional, for process management)
sudo npm install -g pm2
```

### 2. Prepare Application

```bash
# Create application directory
sudo mkdir -p /var/www/newsletter
sudo chown -R $USER:$USER /var/www/newsletter

# Copy backend files
cp -r backend /var/www/newsletter/
cp -r shared /var/www/newsletter/

# Install backend dependencies
cd /var/www/newsletter/backend
npm install --production

# Build frontend
cd /path/to/your/project/frontend
npm run build

# Copy frontend build
sudo cp -r build /var/www/newsletter/
```

### 3. Configure Environment

Create `/var/www/newsletter/backend/.env`:

```env
# Database Configuration
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=newsletter
DB_USER=newsletter_user
DB_PASS=your_password_here

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com

# Application URLs
BASE_URL=http://your-domain.com
PORT=5050

# Environment
NODE_ENV=production
```

### 4. Configure nginx

Copy the nginx configuration:

```bash
sudo cp newsletter.conf /etc/nginx/sites-available/newsletter
sudo ln -s /etc/nginx/sites-available/newsletter /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

Update the domain in `/etc/nginx/sites-available/newsletter`:
```nginx
server_name your-domain.com www.your-domain.com;
```

Test nginx configuration:
```bash
sudo nginx -t
```

### 5. Set Up Backend Service

Copy and enable the systemd service:

```bash
sudo cp newsletter-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable newsletter-backend
```

### 6. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/newsletter
sudo chmod -R 755 /var/www/newsletter
```

### 7. Start Services

```bash
sudo systemctl start newsletter-backend
sudo systemctl restart nginx
```

### 8. Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Database Setup

### PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE newsletter;
CREATE USER newsletter_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE newsletter TO newsletter_user;
\q
```

### MongoDB (Alternative)

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

## SSL Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Useful Commands

### Service Management
```bash
# Restart backend
sudo systemctl restart newsletter-backend

# Restart nginx
sudo systemctl restart nginx

# Check backend status
sudo systemctl status newsletter-backend

# Check nginx status
sudo systemctl status nginx
```

### Logs
```bash
# Backend logs
sudo journalctl -u newsletter-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Updates
```bash
# Update backend code
cd /var/www/newsletter/backend
git pull  # if using git
npm install --production
sudo systemctl restart newsletter-backend

# Update frontend
cd /path/to/your/project/frontend
npm run build
sudo cp -r build/* /var/www/newsletter/build/
```

## Troubleshooting

### Backend Not Starting
1. Check logs: `sudo journalctl -u newsletter-backend -f`
2. Verify .env file configuration
3. Check database connection
4. Ensure all dependencies are installed

### nginx 502 Bad Gateway
1. Check if backend is running: `sudo systemctl status newsletter-backend`
2. Verify backend is listening on port 5050
3. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Database Connection Issues
1. Verify database is running
2. Check database credentials in .env
3. Ensure database user has proper permissions
4. Test database connection manually

### Email Not Working
1. Verify SMTP credentials in .env
2. Check if using app-specific passwords for Gmail
3. Test SMTP connection with a simple script

## Security Considerations

1. **Use HTTPS in production** - Set up SSL certificates
2. **Secure database** - Use strong passwords, limit connections
3. **Update regularly** - Keep Node.js, nginx, and system packages updated
4. **Monitor logs** - Set up log monitoring and alerting
5. **Backup data** - Regular database backups
6. **Environment variables** - Never commit .env files to version control

## Performance Optimization

1. **Enable gzip compression** - Already configured in nginx.conf
2. **Set up caching** - Browser caching for static assets
3. **Use CDN** - For static assets in production
4. **Database optimization** - Add proper indexes
5. **Monitor resources** - Set up monitoring for CPU, memory, disk usage

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify all configuration files
4. Ensure all services are running properly
