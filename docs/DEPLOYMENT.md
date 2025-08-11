# Deployment Guide

This document provides comprehensive instructions for deploying the NestJS Backend Boilerplate in both development and production environments.

## Table of Contents

1. [Production Deployment](#production-deployment)
2. [Server Configuration](#server-configuration)
3. [SSL Certificate Setup](#ssl-certificate-setup)
4. [Monitoring and Logging](#monitoring-and-logging)
5. [Troubleshooting](#troubleshooting)

## Production Deployment

This guide focuses on production deployment. For development setup, see the [Development Guide](DEVELOPMENT.md).

## Production Deployment

### Prerequisites

- Ubuntu 20.04+ server
- Docker and Docker Compose installed
- Domain name with DNS configured
- SSH access to server

### Server Setup

1. **Update system**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Create application directory**
   ```bash
   sudo mkdir -p /opt/nestjs-app
   sudo chown $USER:$USER /opt/nestjs-app
   cd /opt/nestjs-app
   ```

### Application Deployment

1. **Clone repository**
   ```bash
   git clone <repository-url> .
   ```

2. **Create environment file**
   ```bash
   cp env.example .env
   ```

3. **Configure environment variables**
   ```bash
   nano .env
   ```

   Required variables:
   ```env
   NODE_ENV=development
   PORT=3000

   # Database
   DB_HOST=localhost # overriden in compose file
   DB_PORT=54323
   DB_USERNAME=postgres # overriden in compose file
   DB_PASSWORD=password 
   DB_NAME=tx-indexer

   # JWT
   ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-change-in-production
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-in-production
   ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS=900000
   REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS=604800000

   # Redis
   REDIS_URL=redis://localhost:63791 #override in docker compose file
   REDIS_HOST=localhost
   REDIS_PORT=63791
   REDIS_COMMANDER_PORT=8082

   SUPER_ADMIN_ADDRESSES=

   CRAWLER_NETWORK=sepolia

   ETHEREUM_RPC_URLS=
   BSC_TESTNET_RPC_URLS=
   POLYGON_RPC_URLS=
   BSC_RPC_URLS=
   SEPOLIA_RPC_URLS=
   BSC_TESTNET_RPC_URLS=
   SOLANA_RPC_URL=

   ```

4. **Setup domain and SSL certificates**
   ```bash
   # Run the domain setup script
   ./scripts/setup-domain.sh yourdomain.com
   ```
   
   This script will:
   - Create Nginx configuration for your domain
   - Set up SSL certificates (Let's Encrypt, self-signed, or manual)
   - Provide DNS configuration instructions

5. **Configure DNS**
   - Point your domain to your server IP
   - Wait for DNS propagation (can take up to 24 hours)

6. **Start production services**
   ```bash
   npm run docker:start:prod
   ```

### Production Commands

```bash
# Setup domain and SSL
./scripts/setup-domain.sh yourdomain.com

# Start production environment
npm run docker:start:prod

# Stop production environment
npm run docker:stop:prod

# View production logs
npm run docker:logs:prod

# Update application
git pull
npm run docker:build
npm run docker:start:prod
```

## Server Configuration

### Nginx Configuration

The production setup includes a pre-configured Nginx reverse proxy with:

- SSL/TLS termination
- Rate limiting
- Security headers
- Gzip compression
- Load balancing

### Security Headers

The Nginx configuration includes the following security headers:

- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Rate Limiting

- API endpoints: 10 requests per second
- Login endpoints: 5 requests per minute

## Domain and SSL Setup

### Automated Setup (Recommended)

Use the provided domain setup script:

```bash
./scripts/setup-domain.sh yourdomain.com
```

This script will:
- Create Nginx configuration for your domain
- Set up SSL certificates (Let's Encrypt, self-signed, or manual)
- Provide DNS configuration instructions
- Set up auto-renewal for Let's Encrypt certificates

### DNS Configuration

**Before running the domain setup script:**

1. **Get your server IP**:
   ```bash
   curl ifconfig.me
   ```

2. **Configure DNS records**:
   - Log into your domain registrar or DNS provider
   - Add an A record:
     - **Name**: yourdomain.com (or subdomain)
     - **Type**: A
     - **Value**: Your server IP
     - **TTL**: 300 (or default)

3. **Wait for DNS propagation** (can take up to 24 hours)

### SSL Certificate Options

The setup script offers three options:

1. **Let's Encrypt** (Recommended for production)
   - Free SSL certificates
   - Automatic renewal
   - Requires DNS to be configured first

2. **Self-signed certificates** (For testing)
   - Quick setup for development
   - Will show security warnings in browsers

3. **Manual certificate upload**
   - Use your own SSL certificates
   - Place cert.pem and key.pem in nginx/ssl/ directory

## Monitoring and Logging

### Health Checks

The application includes health checks for all services:

- **API**: `/health` endpoint
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command

### Logging

Logs are available through Docker Compose:

```bash
# View all logs
npm run docker:logs:prod

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Monitoring

Consider setting up monitoring tools:

- **Prometheus + Grafana** for metrics
- **ELK Stack** for log aggregation
- **Uptime Robot** for uptime monitoring

## Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate validity
   openssl x509 -in nginx/ssl/cert.pem -text -noout
   
   # Test nginx configuration
   docker-compose exec nginx nginx -t
   ```

3. **Port conflicts**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

4. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /opt/nestjs-app
   sudo chmod -R 755 /opt/nestjs-app
   ```

### Performance Optimization

1. **Database optimization**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_created_at ON users(created_at);
   ```

2. **Redis optimization**
   ```bash
   # Configure Redis for production
   # Edit redis.conf in the Redis container
   docker-compose exec redis redis-cli CONFIG SET maxmemory 256mb
   docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
   ```

3. **Nginx optimization**
   ```bash
   # Enable gzip compression (already configured)
   # Adjust worker processes based on CPU cores
   # Monitor and adjust rate limiting as needed
   ```

### Backup Strategy

1. **Database backup**
   ```bash
   # Create backup script
   cat > backup.sh << 'EOF'
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   docker-compose exec -T postgres pg_dump -U $DB_USERNAME $DB_NAME > backup_$DATE.sql
   gzip backup_$DATE.sql
   EOF
   
   chmod +x backup.sh
   ```

2. **Automated backups**
   ```bash
   # Add to crontab
   0 2 * * * /opt/nestjs-app/backup.sh
   ```

### Security Checklist

- [ ] SSL certificates installed and valid
- [ ] Environment variables secured
- [ ] Database passwords strong
- [ ] JWT secrets secure
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Monitoring and alerting setup
- [ ] Backup strategy implemented

## Support

For additional support:

1. Check the application logs
2. Review the troubleshooting section
3. Consult the main README.md
4. Check the module-specific documentation in `/docs` 