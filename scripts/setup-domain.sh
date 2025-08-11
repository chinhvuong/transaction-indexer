#!/bin/bash

# Domain Setup Script for Production Deployment
# Usage: ./scripts/setup-domain.sh <domain-name>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if domain is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Domain name is required${NC}"
    echo -e "${YELLOW}Usage: ./scripts/setup-domain.sh <domain-name>${NC}"
    echo -e "${YELLOW}Example: ./scripts/setup-domain.sh api.yourdomain.com${NC}"
    exit 1
fi

DOMAIN=$1
SERVER_IP=$(curl -s ifconfig.me)

echo -e "${BLUE}🌐 Setting up domain: $DOMAIN${NC}"
echo -e "${BLUE}📡 Server IP: $SERVER_IP${NC}"

# Create nginx configuration for the domain
echo -e "${BLUE}📝 Creating Nginx configuration...${NC}"

cat > nginx/sites-enabled/api.conf << EOF
# API Server Configuration for $DOMAIN
upstream api_backend {
    server api:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    client_max_body_size 50M;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API routes
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://api_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API documentation
    location /docs {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://api_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Rate limiting for login endpoints
    location ~ ^/(auth/login|auth/register) {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://api_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo -e "${GREEN}✅ Nginx configuration created for $DOMAIN${NC}"

# Create SSL directory
mkdir -p nginx/ssl

echo -e "${BLUE}🔐 SSL Certificate Setup${NC}"
echo -e "${YELLOW}Choose SSL certificate method:${NC}"
echo -e "${YELLOW}1. Let's Encrypt (Recommended for production)${NC}"
echo -e "${YELLOW}2. Self-signed certificate (For testing)${NC}"
echo -e "${YELLOW}3. Manual certificate upload${NC}"

read -p "Enter your choice (1-3): " ssl_choice

case $ssl_choice in
    1)
        echo -e "${BLUE}🔐 Setting up Let's Encrypt SSL certificate...${NC}"
        echo -e "${YELLOW}⚠️  Make sure your domain DNS is pointing to this server before continuing.${NC}"
        echo -e "${YELLOW}⚠️  DNS should point $DOMAIN to $SERVER_IP${NC}"
        read -p "Press Enter when DNS is configured..."
        
        # Install certbot if not available
        if ! command -v certbot &> /dev/null; then
            echo -e "${BLUE}📦 Installing Certbot...${NC}"
            sudo apt update
            sudo apt install -y certbot
        fi
        
        # Stop nginx temporarily for certbot
        echo -e "${BLUE}🔄 Temporarily stopping nginx for certificate generation...${NC}"
        docker-compose -f docker-compose.prod.yml stop nginx || true
        
        # Generate certificate
        echo -e "${BLUE}🔐 Generating SSL certificate...${NC}"
        sudo certbot certonly --standalone -d $DOMAIN
        
        # Copy certificates
        echo -e "${BLUE}📋 Copying certificates...${NC}"
        sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem
        sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem
        sudo chown $USER:$USER nginx/ssl/*
        
        # Setup auto-renewal
        echo -e "${BLUE}🔄 Setting up auto-renewal...${NC}"
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $(pwd)/nginx/ssl/cert.pem && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $(pwd)/nginx/ssl/key.pem && docker-compose -f $(pwd)/docker-compose.prod.yml restart nginx") | crontab -
        
        echo -e "${GREEN}✅ Let's Encrypt SSL certificate setup completed!${NC}"
        ;;
    2)
        echo -e "${BLUE}🔐 Generating self-signed certificate...${NC}"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
        
        echo -e "${GREEN}✅ Self-signed certificate generated!${NC}"
        echo -e "${YELLOW}⚠️  Note: Self-signed certificates will show security warnings in browsers.${NC}"
        ;;
    3)
        echo -e "${BLUE}🔐 Manual certificate upload${NC}"
        echo -e "${YELLOW}Please place your SSL certificates in the nginx/ssl/ directory:${NC}"
        echo -e "${YELLOW}  - nginx/ssl/cert.pem (certificate file)${NC}"
        echo -e "${YELLOW}  - nginx/ssl/key.pem (private key file)${NC}"
        read -p "Press Enter when certificates are uploaded..."
        
        if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
            echo -e "${RED}❌ Certificate files not found in nginx/ssl/ directory${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ Manual certificates uploaded!${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${BLUE}📋 DNS Configuration Required${NC}"
echo -e "${YELLOW}You need to configure DNS records for your domain:${NC}"
echo -e "${BLUE}Domain: $DOMAIN${NC}"
echo -e "${BLUE}Server IP: $SERVER_IP${NC}"
echo -e "${BLUE}Record Type: A${NC}"
echo -e "${BLUE}Value: $SERVER_IP${NC}"

echo -e "${YELLOW}📝 DNS Configuration Steps:${NC}"
echo -e "${YELLOW}1. Log into your domain registrar or DNS provider${NC}"
echo -e "${YELLOW}2. Add an A record:${NC}"
echo -e "${YELLOW}   - Name: $DOMAIN${NC}"
echo -e "${YELLOW}   - Type: A${NC}"
echo -e "${YELLOW}   - Value: $SERVER_IP${NC}"
echo -e "${YELLOW}   - TTL: 300 (or default)${NC}"
echo -e "${YELLOW}3. Wait for DNS propagation (can take up to 24 hours)${NC}"

echo -e "${GREEN}✅ Domain setup completed!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${BLUE}1. Configure DNS as shown above${NC}"
echo -e "${BLUE}2. Wait for DNS propagation${NC}"
echo -e "${BLUE}3. Run: npm run docker:start:prod${NC}"
echo -e "${BLUE}4. Test: https://$DOMAIN/health${NC}"
