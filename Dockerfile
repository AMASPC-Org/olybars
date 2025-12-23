# Use the official Node.js 22 image.
# Using Node 22 to match the local environment.
FROM node:22-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Service must listen to $PORT environment variable.
# This variable is set by Cloud Run.
ENV PORT 8080

# Run the web service on container startup.
CMD [ "npx", "tsx", "server/src/index.ts" ]
