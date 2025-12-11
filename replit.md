# Windows 13 Simulator

## Overview
A Windows 13 simulator built with React, TypeScript, and Express. This project simulates a Windows-like operating system interface in the browser with various applications including Calculator, Calendar, File Explorer, Browser, Music Player, and more.

**Current State**: Successfully imported and configured for Replit environment. Application is running on port 5000 with full-stack capabilities.

## Project Architecture

### Frontend (Client-side)
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.1.9
- **Styling**: Tailwind CSS v4 with custom animations
- **Routing**: Wouter for client-side routing
- **UI Components**: Custom component library using Radix UI primitives
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation

### Backend (Server-side)
- **Runtime**: Node.js 20
- **Framework**: Express.js 4.21.2
- **WebSocket**: ws library for real-time communication
- **Storage**: Currently using in-memory storage (MemStorage class)
- **Database Ready**: Drizzle ORM configured for PostgreSQL (optional)

### Key Applications
Located in `client/src/components/os/`:
- Desktop environment with Taskbar and Start Menu
- Calculator, Calendar, Camera
- File Explorer, Gallery, Games
- Mail, Messages, Maps
- Music Player, Video Editor
- Browser, Terminal
- Settings, Themes, Power Monitor
- Windows Hello authentication (Fingerprint, Iris, Password, PIN)
- **Microsoft Store** - App marketplace with downloadable apps

### Downloadable Apps (from App Store)
Located in `client/src/components/os/DownloadedApps.tsx`:
- **Notes** - Quick notes with persistent storage
- **Weather** - Weather forecasts display
- **Paint** - Digital drawing canvas with brush/eraser tools
- **Photos** - Photo viewer with upload and zoom
- **Maps** - Location explorer
- **Reader** - E-book/PDF reader
- **Games Hub** - Click challenge game

## Project Structure
```
/
├── client/                 # Frontend React application
│   ├── public/            # Static assets (favicon, sounds)
│   └── src/
│       ├── components/    # React components
│       │   ├── os/       # OS-level components (Desktop, Apps, etc.)
│       │   └── ui/       # Reusable UI components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and configurations
│       └── pages/        # Page components (home, not-found)
├── server/                # Backend Express server
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Storage interface and implementation
│   ├── static.ts         # Static file serving
│   └── vite.ts           # Vite dev server integration
├── shared/                # Shared code between client and server
│   └── schema.ts         # Database schema and types
└── attached_assets/       # Project assets (screenshots, images, sounds)
```

## Development Setup

### Running the Application
The application is configured to run on **port 5000** with a single command:
```bash
npm run dev
```

This starts the Express server which:
- Serves the Vite dev server in development mode
- Handles API routes at `/api/*`
- Serves static files in production

### Available Scripts
- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes (if using PostgreSQL)

### Environment Variables
Currently configured:
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment (development/production)
- `SESSION_SECRET` - Session encryption key (auto-configured)
- `DATABASE_URL` - PostgreSQL connection string (optional, not currently required)

## Storage & Database

### PostgreSQL Database (Active)
The app uses PostgreSQL with Drizzle ORM for permanent data storage:
- **User Settings**: Wallpaper, profile picture, accent color, dark mode, display/sound/notification settings
- **Installed Apps**: Apps downloaded from the App Store persist across sessions
- **Custom Wallpapers**: User-uploaded wallpapers stored as base64 in database

Database tables (defined in `shared/schema.ts`):
- `users` - User accounts
- `user_settings` - All user preferences and installed apps
- `custom_wallpapers` - User-uploaded wallpaper images

API Routes (defined in `server/routes.ts`):
- `GET/POST /api/settings/:sessionId` - Load/save user settings
- `GET/POST/DELETE /api/wallpapers/:sessionId` - Manage custom wallpapers

### Session-Based Persistence
Each browser session gets a unique ID stored in localStorage. This ID links to the database record, ensuring settings persist permanently even after page refresh.

## Deployment

### Configuration
Deployment is configured with:
- **Type**: Autoscale (stateless, scales with traffic)
- **Build**: `npm run build`
- **Start**: `npm start`
- **Port**: 5000 (automatically exposed)

### Production Build
The build process:
1. Compiles TypeScript server code
2. Builds React frontend with Vite
3. Outputs to `dist/` directory
4. Server serves pre-built static files

## Tech Stack Details

### Core Dependencies
- **React & ReactDOM** 19.2.0 - UI framework
- **TypeScript** 5.6.3 - Type safety
- **Express** 4.21.2 - Backend framework
- **Vite** 7.1.9 - Build tool and dev server
- **Tailwind CSS** 4.1.14 - Styling framework
- **Drizzle ORM** 0.39.1 - Database ORM
- **Zod** 3.25.76 - Runtime type validation
- **Framer Motion** 12.23.24 - Animations
- **Lucide React** - Icon library

### Replit Integration
- Vite plugin for Cartographer (code navigation)
- Dev banner plugin
- Runtime error modal for debugging
- Configured for Replit proxy and domain handling

## Recent Changes
- **Dec 8, 2025**: Major Power Monitor upgrade and PWA improvements
  - Completely rebuilt PowerMonitor.tsx with professional system monitoring:
    - Overview tab: CPU, RAM, GPU, Network at a glance with live animated graphs
    - CPU tab: Per-core usage, temperatures, clock speeds (simulates i9-13900K)
    - GPU tab: NVIDIA RTX 4080 simulation with VRAM, temps, fan speeds, power draw
    - Memory tab: RAM usage with DDR5 slot information
    - Storage tab: Multiple drives (NVMe, SSD, HDD) with usage bars
    - Network tab: Download/upload speeds with real-time graphs
    - Processes tab: Running processes list with CPU/memory usage
    - Performance tab: FPS counter, frame time, benchmark scores
  - Enhanced PWA configuration for Chromebook installation:
    - Updated manifest.json with fullscreen display mode and launch_handler
    - Improved service worker with better caching strategy
    - Added PWAInstall.tsx component with in-app install prompt
  - Database tables created and working (user_settings, custom_wallpapers)
  
- **Dec 8, 2025**: Added PostgreSQL database persistence and App Store
  - Integrated PostgreSQL with Drizzle ORM for permanent storage
  - Created database schema for user_settings, custom_wallpapers tables
  - Added API routes for saving/loading settings to database
  - Settings (wallpaper, profile picture, installed apps) now persist permanently
  - Created App Store component with 18 downloadable apps
  - Built 7 fully functional downloaded apps: Notes, Weather, Paint, Photos, Maps, Reader, Games Hub
  - Updated Desktop to integrate App Store and render downloaded apps
  - Added session-based persistence linking browser sessions to database records
  - Updated SystemSettingsContext to sync with server-side storage
  
- **Dec 3, 2025**: Successfully imported from GitHub repository and configured for Replit
  - Extracted project from ZIP archive and moved files to root directory
  - Installed Node.js 20 module
  - Installed all npm dependencies (443 packages)
  - Created .gitignore file for Node.js project
  - Configured workflow: "Windows 13 Simulator" running on port 5000 with webview output
  - Set up deployment configuration: autoscale type with npm build and start scripts
  - Verified Vite config has proper host settings (0.0.0.0, allowedHosts: true)
  - Application confirmed running successfully - Vite connected on port 5000
  - Using in-memory storage (MemStorage) - no database required for basic functionality
  - Import completed and ready for use

## User Preferences
None specified yet.

## Notes
- The simulator includes startup and shutdown animations with sound effects
- All OS components are modular and can be extended
- WebSocket support is available for real-time features
- The application is ready to use immediately after import
