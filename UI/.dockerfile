# Stage 1: build with Node 24 (latest Current)
FROM node:24 AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build using Angular CLI default configuration
COPY . ./
RUN npm run build -- --configuration production

# Stage 2: serve with a Node.js static server
FROM node:24-alpine AS runtime
WORKDIR /app

# Install 'serve' for static hosting
RUN npm install -g serve

# Copy built files
COPY --from=build /app/dist ./dist

# Expose and start serve
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]