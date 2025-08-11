#!/bin/bash

# Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🚀 Starting deployment for environment: $ENVIRONMENT${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your production values before continuing.${NC}"
    echo -e "${YELLOW}⚠️  Press Enter when ready to continue...${NC}"
    read
fi

# Check if SSL certificates exist
if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
    echo -e "${YELLOW}⚠️  SSL certificates not found in nginx/ssl/ directory.${NC}"
    echo -e "${YELLOW}⚠️  Please add your SSL certificates:${NC}"
    echo -e "${YELLOW}   - nginx/ssl/cert.pem${NC}"
    echo -e "${YELLOW}   - nginx/ssl/key.pem${NC}"
    echo -e "${YELLOW}⚠️  Press Enter when ready to continue...${NC}"
    read
fi

echo -e "${BLUE}📦 Building Docker image...${NC}"
npm run docker:build

echo -e "${BLUE}🔄 Stopping existing containers...${NC}"
npm run docker:stop:prod || true

echo -e "${BLUE}🚀 Starting production environment...${NC}"
npm run docker:start:prod

echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check if services are healthy
echo -e "${BLUE}🔍 Checking service health...${NC}"

# Check API health
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    npm run docker:logs:prod
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Service URLs:${NC}"
echo -e "${BLUE}   - API: https://yourdomain.com${NC}"
echo -e "${BLUE}   - API Documentation: https://yourdomain.com/docs${NC}"
echo -e "${BLUE}   - Health Check: https://yourdomain.com/health${NC}"

echo -e "${BLUE}📊 View logs: npm run docker:logs:prod${NC}"
echo -e "${BLUE}🛑 Stop services: npm run docker:stop:prod${NC}" 