# consolidated project Dockerfile
FROM node:18

# set working directory
WORKDIR /app

# copy package files to install dependencies first (docker build optimization, helps with caching)
COPY package.json ./
COPY package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# install dependencies
RUN npm ci

# copy the rest of the project files
COPY . .

# expose ports for frontend, backend
EXPOSE 5173 3000

# start the dev servers at the end of the build to keep compose file clean
CMD ["npm", "run", "dev"]
