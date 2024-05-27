# Specify the base image
FROM node:20-alpine

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json to work directory
COPY package*.json ./
# COPY ./prisma ./

# Install dependencies
RUN npm install

# Copy Prisma schema to the container
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of your application's code
COPY . .

# Build your Nest application
RUN npm run build

CMD [ "npm", "run", "start:dev" ]