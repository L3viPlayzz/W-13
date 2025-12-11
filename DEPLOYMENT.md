# Windows 13 Deployment Guide

This guide explains how to run the Windows 13 Simulator on your own server or machine, completely independent from Replit.

## Prerequisites

- **Node.js** 18+ (download from [nodejs.org](https://nodejs.org))
- **PostgreSQL** 12+ (download from [postgresql.org](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)
- **Git** (optional, for cloning the repository)

## Step 1: Get the Project

### Option A: Clone from GitHub (if available)
```bash
git clone <your-repo-url> windows-13
cd windows-13
```

### Option B: Download as ZIP
1. Download the project files
2. Extract the ZIP file
3. Open a terminal/command prompt in the `windows-13` directory

## Step 2: Set Up PostgreSQL Database

### On Local Machine:
1. **Install PostgreSQL** and start the service
2. **Create a database**:
```bash
createdb windows13
```

3. **Get your connection string**:
```
postgresql://username:password@localhost:5432/windows13
```

### Using a Cloud Database (Recommended for Production):
You can use services like:
- **Neon** (https://neon.tech) - Free tier available
- **Render** (https://render.com)
- **Railway** (https://railway.app)
- **AWS RDS** (https://aws.amazon.com/rds/)

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Set Up Environment Variables

Create a `.env` file in the root directory with:

```
DATABASE_URL=postgresql://username:password@localhost:5432/windows13
PORT=5000
NODE_ENV=production
```

**Important Environment Variables:**
- `DATABASE_URL` - Your PostgreSQL connection string (required)
- `PORT` - Port to run the app on (default: 5000)
- `NODE_ENV` - Set to `production` for production, `development` for testing

## Step 5: Initialize Database

Run the database migrations to create the necessary tables:

```bash
npm run db:push
```

## Step 6: Build the Project

Compile the frontend and backend:

```bash
npm run build
```

This creates a `dist` folder with:
- `dist/public/` - Compiled frontend (HTML, CSS, JS)
- `dist/index.cjs` - Compiled backend server

## Step 7: Run the Application

Start the production server:

```bash
npm start
```

The app will be available at: `http://localhost:5000`

## Production Deployment

To deploy to a production server (like AWS EC2, DigitalOcean, Heroku, etc.):

1. **Build the project** (Step 6)
2. **Copy the `dist` folder** to your server
3. **Set environment variables** on your server
4. **Run**: `npm start`

### Example: Deploy to AWS EC2

```bash
# On your local machine
npm run build

# Copy to server
scp -r dist/* ubuntu@your-server:/home/ubuntu/windows13/

# SSH into server
ssh ubuntu@your-server

# On the server
cd /home/ubuntu/windows13
npm install --production
npm start
```

### Using PM2 for Process Management (Recommended)

Keep your app running even after server restarts:

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start npm --name "windows13" -- start

# Make it start on boot
pm2 startup
pm2 save

# View logs
pm2 logs windows13
```

## Troubleshooting

### Database Connection Error
- Check that PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Run: `npm run db:push` to create tables

### Port Already in Use
- Change the `PORT` in your `.env` file
- Or kill the process using the port

### App Won't Start
- Check logs: `npm start` and look for error messages
- Ensure all dependencies installed: `npm install`
- Make sure `dist` folder exists after `npm run build`

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `PORT` | No | 5000 | Port to run the server on |
| `NODE_ENV` | No | development | `production` or `development` |

## Development vs Production

### Development Mode
```bash
# Install dev dependencies
npm install

# Run with hot reload
npm run dev
```

### Production Mode
```bash
# Build for production
npm run build

# Run built app
npm start
```

## Security Notes

- Never commit `.env` files to git
- Use strong database passwords in production
- Enable HTTPS/SSL in production
- Use environment variables for all secrets
- Consider using a reverse proxy (nginx, Apache) in front of the app

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the error logs
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly

---

**You now have a standalone Windows 13 app that works anywhere Node.js and PostgreSQL are available!**
