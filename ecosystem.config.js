module.exports = {
  apps: [{
    name: 'newsletter-backend',
    script: 'server.js',
    cwd: '/var/www/newsletter/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5050
    },
    error_file: '/var/log/pm2/newsletter-backend-error.log',
    out_file: '/var/log/pm2/newsletter-backend-out.log',
    log_file: '/var/log/pm2/newsletter-backend-combined.log',
    time: true
  }]
}
