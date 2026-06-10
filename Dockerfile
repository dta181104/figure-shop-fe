# =========================
# STAGE 1: Build Angular App
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files trước để tận dụng cache Docker layer
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ project vào container
COPY . .

# Build Angular (production)
RUN npm run build

# Serve with Nginx
FROM nginx:stable-alpine

# Copy build output từ stage 1 vào thư mục phục vụ của nginx
COPY --from=build /app/dist/angular-basic-project/browser /usr/share/nginx/html

# Copy file cấu hình Nginx (nếu có route Angular SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 81
EXPOSE 81

# Khởi động nginx
CMD ["nginx", "-g", "daemon off;"]
