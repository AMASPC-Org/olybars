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

# Copy local code
COPY . .

# Build the server code
RUN npm run build --prefix server

# Service must listen to $PORT environment variable.
# This variable is set by Cloud Run.
ENV PORT 8080
ENV NODE_ENV production

# Run the web service on container startup.
# We run the compiled JS directly for speed and reliability.
CMD [ "node", "server/dist/index.js" ]
