# ---------- STAGE 1: Build frontend + backend ----------
FROM node:20 AS builder
WORKDIR /app

# Kopieer package.json & lockfile
COPY package*.json ./

# Installeer alle dependencies inclusief devDependencies
RUN npm install

# Kopieer de volledige projectbestanden
COPY . .

# Bouw frontend + backend
RUN npm run build

# ---------- STAGE 2: Run ----------
FROM node:20 AS runner
WORKDIR /app

# Kopieer alleen de production dependencies van de builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Kopieer alleen de gecompileerde output
COPY --from=builder /app/dist ./dist

# Stel de poort in waarop de server luistert
EXPOSE 3000

# Start de server
CMD ["node", "dist/index.js"]
