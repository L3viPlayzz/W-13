# Windows 13 Simulator

A fully-featured Windows 13 operating system simulator built with React, TypeScript, and Express.js. Run it in your browser with a realistic desktop experience including apps, games, settings, and more.

## Quick Start

### Running on Replit (Easiest)
The app is pre-configured to run on Replit. Just click **Run** and it will start on port 5000.

### Running Standalone
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on running this app on your own server or local machine.

**Quick version:**
```bash
npm install
npm run build
DATABASE_URL="postgresql://..." npm start
```

## Features

### OS Interface
- Full Windows-like desktop with taskbar and start menu
- Window management system
- Settings and themes
- Power monitor with real-time system stats
- Startup and shutdown animations

### Built-in Applications
- **Calculator** - Full-featured calculator
- **Calendar** - Monthly calendar view
- **File Explorer** - File browser interface
- **Browser** - Web browsing simulator
- **Terminal** - Command-line interface
- **Camera** - Webcam integration
- **Gallery** - Image viewer
- **Music Player** - Audio player
- **Video Editor** - Simple video editing
- **Maps** - Location explorer
- **Mail** - Email simulator
- **Messages** - Chat interface
- **Windows Hello** - Biometric authentication (fingerprint, iris, face recognition)

### App Store
Download and install additional apps directly from the App Store:
- Notes
- Weather
- Paint
- Photos
- Maps
- Reader
- Games Hub

### Features
- ✅ Persistent storage (user settings, installed apps, wallpapers)
- ✅ Dark/Light theme support
- ✅ Custom wallpapers
- ✅ Session-based user settings
- ✅ PWA support (install as app on Chromebook/Android)
- ✅ Responsive design
- ✅ Sound effects and animations

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite (fast build tool)
- Tailwind CSS 4
- Framer Motion (animations)
- React Hook Form (forms)
- Zod (validation)

**Backend:**
- Node.js + Express.js
- PostgreSQL + Drizzle ORM
- WebSockets support

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page routes
│   │   ├── hooks/       # React hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── server/              # Express backend
├── shared/              # Shared types and schemas
└── script/              # Build scripts
```

## Development

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```
Runs on `http://localhost:5000` with hot reload.

### Type Checking
```bash
npm run check
```

### Production Build
```bash
npm run build
npm start
```

## Database

The app uses PostgreSQL for persistent storage. To set up:

1. Create a PostgreSQL database
2. Set `DATABASE_URL` environment variable
3. Run: `npm run db:push`

**Data stored:**
- User settings (wallpaper, theme, profile)
- Installed apps list
- Custom wallpapers

## Deployment

For production deployment on your own server, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick deployment checklist:**
- [ ] Set `DATABASE_URL` environment variable
- [ ] Set `NODE_ENV=production`
- [ ] Run `npm run build`
- [ ] Run `npm start`
- [ ] App available at configured PORT (default: 5000)

## PWA Installation

The app can be installed as a native app on:
- ✅ Chromebooks
- ✅ Android phones
- ✅ iOS (limited)

On Chrome: Look for install icon in address bar or click the three-dot menu.

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Support

For issues or deployment questions, check [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting.

---

**Ready to run? On Replit, just hit Run. Running standalone? Check out [DEPLOYMENT.md](./DEPLOYMENT.md)!**
