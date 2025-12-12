# ---------- STAGE 1: Build frontend + backend ----------
FROM node:20 AS builder
WORKDIR /app

# Kopieer package.json & lockfile
COPY package*.json ./

# Installeer dependencies inclusief dev
RUN npm install

# Kopieer volledige project
COPY . .

# Bouw frontend + backend
RUN npm run build

# ---------- STAGE 2: Run ----------
FROM node:20 AS runner
WORKDIR /app

# Kopieer alleen package.json & production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Kopieer build output van de builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Stel de poort in waarop de server luistert
EXPOSE 3000

# Start de server
CMD ["node", "dist/index.js"]
