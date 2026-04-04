# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
# NEXT_PUBLIC_API_URL must be available at build time for static export
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# --- Runtime Stage ---
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the static export results from build stage
# With basePath: "/achieve", files are in the out directory
COPY --from=builder /app/out /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the frontend port (Nginx defaults to 80)
EXPOSE 80

# Nginx starts automatically by default in the image
CMD ["nginx", "-g", "daemon off;"]
