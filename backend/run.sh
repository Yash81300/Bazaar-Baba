#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Bazaar Baba Backend Startup Script${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}\n"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}\n"
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Check if MongoDB is running
echo -e "${YELLOW}🔍 Checking MongoDB connection...${NC}"
if ! nc -z localhost 27017 2>/dev/null; then
    echo -e "${RED}❌ MongoDB is not running on localhost:27017${NC}"
    echo -e "${YELLOW}💡 Starting MongoDB with Docker Compose...${NC}"
    
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d mongodb
        echo -e "${GREEN}✅ MongoDB started${NC}"
        echo -e "${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
        sleep 5
    else
        echo -e "${RED}❌ docker-compose not found. Please install Docker or start MongoDB manually.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ MongoDB is running${NC}\n"
fi

# Initialize database if needed
echo -e "${YELLOW}🔍 Checking database status...${NC}"
python init_db.py stats

# Start the server
echo -e "\n${GREEN}🚀 Starting FastAPI server...${NC}\n"
python main.py
