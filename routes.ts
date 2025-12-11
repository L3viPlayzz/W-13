import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enrollFace, verifyFace, isEnrolled, clearEnrolledFace } from "./faceVerification";
import { db } from "./db";
import { userSettings, customWallpapers } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/face/status", (_req, res) => {
    res.json({ enrolled: isEnrolled() });
  });

  app.post("/api/face/enroll", (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image || typeof image !== "string") {
        return res.status(400).json({ 
          success: false, 
          message: "Image data is required" 
        });
      }

      const base64Image = image.replace(/^data:image\/\w+;base64,/, "");
      
      enrollFace(base64Image);
      
      res.json({ 
        success: true, 
        message: "Face enrolled successfully. You can now use face unlock." 
      });
    } catch (error: any) {
      console.error("Face enrollment error:", error);
      res.status(500).json({ 
        success: false, 
        message: `Enrollment failed: ${error.message}` 
      });
    }
  });

  app.post("/api/face/verify", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image || typeof image !== "string") {
        return res.status(400).json({ 
          success: false, 
          isSamePerson: false,
          similarity: 0,
          message: "Image data is required" 
        });
      }

      const base64Image = image.replace(/^data:image\/\w+;base64,/, "");
      
      const result = await verifyFace(base64Image);
      
      res.json(result);
    } catch (error: any) {
      console.error("Face verification error:", error);
      res.status(500).json({ 
        success: false, 
        isSamePerson: false,
        similarity: 0,
        message: `Verification failed: ${error.message}` 
      });
    }
  });

  app.post("/api/face/clear", (_req, res) => {
    clearEnrolledFace();
    res.json({ 
      success: true, 
      message: "Enrolled face cleared. You can enroll a new face." 
    });
  });

  app.get("/api/settings/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const [settings] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.sessionId, sessionId));
      
      if (!settings) {
        return res.json({ settings: null });
      }
      
      res.json({ settings });
    } catch (error: any) {
      console.error("Failed to load settings:", error);
      res.status(500).json({ error: "Failed to load settings" });
    }
  });

  app.post("/api/settings/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { settings } = req.body;
      
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.sessionId, sessionId));
      
      if (existing.length > 0) {
        await db
          .update(userSettings)
          .set({
            userName: settings.userName,
            userInitials: settings.userInitials,
            profilePicture: settings.profilePicture,
            wallpaper: settings.wallpaper,
            accentColor: settings.accentColor,
            isDarkMode: String(settings.isDarkMode),
            displaySettings: settings.display,
            soundSettings: settings.sound,
            notificationSettings: settings.notifications,
            installedApps: settings.installedApps,
            updatedAt: new Date(),
          })
          .where(eq(userSettings.sessionId, sessionId));
      } else {
        await db.insert(userSettings).values({
          sessionId,
          userName: settings.userName,
          userInitials: settings.userInitials,
          profilePicture: settings.profilePicture,
          wallpaper: settings.wallpaper,
          accentColor: settings.accentColor,
          isDarkMode: String(settings.isDarkMode),
          displaySettings: settings.display,
          soundSettings: settings.sound,
          notificationSettings: settings.notifications,
          installedApps: settings.installedApps,
        });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.get("/api/wallpapers/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const wallpapers = await db
        .select()
        .from(customWallpapers)
        .where(eq(customWallpapers.sessionId, sessionId));
      
      res.json({ wallpapers });
    } catch (error: any) {
      console.error("Failed to load wallpapers:", error);
      res.status(500).json({ error: "Failed to load wallpapers" });
    }
  });

  app.post("/api/wallpapers/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { name, imageData } = req.body;
      
      const [wallpaper] = await db
        .insert(customWallpapers)
        .values({
          sessionId,
          name,
          imageData,
        })
        .returning();
      
      res.json({ success: true, wallpaper });
    } catch (error: any) {
      console.error("Failed to save wallpaper:", error);
      res.status(500).json({ error: "Failed to save wallpaper" });
    }
  });

  app.delete("/api/wallpapers/:sessionId/:wallpaperId", async (req, res) => {
    try {
      const { wallpaperId } = req.params;
      
      await db
        .delete(customWallpapers)
        .where(eq(customWallpapers.id, wallpaperId));
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete wallpaper:", error);
      res.status(500).json({ error: "Failed to delete wallpaper" });
    }
  });

  return httpServer;
}
