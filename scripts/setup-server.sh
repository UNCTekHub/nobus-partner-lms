#!/bin/bash
# ============================================
# Nobus LMS — First-time Server Setup Script
# Run this ONCE on your Ubuntu production server
# ============================================

set -e

APP_DIR="/opt/nobus-lms"
DOMAIN="${1:-lms.yourdomain.com}"

echo "================================================"
echo "  Nobus LMS Server Setup"
echo "  Deploy directory: $APP_DIR"
echo "  Domain: $DOMAIN"
echo "================================================"

# 1. System updates and dependencies
echo "[1/7] Installing system dependencies..."
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git build-essential

# 2. Install PM2 globally
echo "[2/7] Installing PM2 process manager..."
sudo npm install -g pm2

# 3. Clone the repository
echo "[3/7] Cloning repository..."
if [ -d "$APP_DIR" ]; then
  echo "Directory $APP_DIR already exists, pulling latest..."
  cd "$APP_DIR" && git pull origin main
else
  sudo git clone https://github.com/UNCTekHub/nobus-partner-lms.git "$APP_DIR"
  sudo chown -R $USER:$USER "$APP_DIR"
fi

cd "$APP_DIR"

# 4. Set up environment files
echo "[4/7] Setting up environment..."
cp .env.example .env

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -hex 32)
cat > server/.env << EOF
PORT=3001
JWT_SECRET=$JWT_SECRET
DB_PATH=./data/lms.db
EOF

# 5. Install dependencies and build
echo "[5/7] Installing dependencies and building..."
npm install
cd server && npm install --production
npm run seed
cd ..
npm run build

# 6. Start with PM2
echo "[6/7] Starting application with PM2..."
cd "$APP_DIR"
pm2 start server/index.js --name nobus-lms --env production
pm2 save
pm2 startup | tail -1 | bash

# 7. Configure Nginx reverse proxy
echo "[7/7] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/nobus-lms > /dev/null << NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/nobus-lms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "================================================"
echo "  Setup complete!"
echo ""
echo "  App running at: http://$DOMAIN"
echo "  PM2 status:     pm2 status"
echo "  View logs:      pm2 logs nobus-lms"
echo ""
echo "  To enable HTTPS, run:"
echo "  sudo certbot --nginx -d $DOMAIN"
echo ""
echo "  Demo accounts:"
echo "  admin@nobus.io / admin123  (Super Admin)"
echo "  chinedu@acmetech.ng / demo (Org Admin)"
echo "================================================"
