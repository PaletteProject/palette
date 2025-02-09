#!/bin/bash

MAGENTA='\e[35m'
NC='\e[0m'

echo -e "${MAGENTA}Pulling the latest branch...${NC}"
git pull origin main

echo -e "${MAGENTA}Rebuilding the docker image...${NC}"
docker-compose down
docker-compose build --no-cache

docker-compose up -d
echo -e "${MAGENTA}Docker container started in detached mode! Run docker-compose down to stop it.${NC}"
echo -e "${MAGENTA}Access Palette at http://localhost:5173${NC}"