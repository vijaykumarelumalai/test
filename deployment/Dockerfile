FROM node:24-alpine

WORKDIR /app

# Copy root package.json and install backend dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy and build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install && cd ..
COPY frontend ./frontend
RUN cd frontend && npm run build && cd ..

# Copy backend source & database
COPY backend ./backend
COPY database ./database

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
