FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./public
EXPOSE 5000
CMD ["node", "server.js"]
