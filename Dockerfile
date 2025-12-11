# ---------- STAGE 1: Build frontend ----------
FROM node:20 AS builder

WORKDIR /app

# Kopieer package.json & lockfile
COPY package*.json ./

# Installeer dependencies (incl. dev)
RUN npm install

# Kopieer volledige project
COPY . .

# Bouw frontend via Vite
RUN npm run build


# ---------- FINAL STAGE ----------
FROM node:20 AS runner

WORKDIR /app

# Kopieer package files
COPY package*.json ./

# Installeer alleen production deps
RUN npm install --omit=dev

# Kopieer build output + server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["node", "dist/index.cjs"]
