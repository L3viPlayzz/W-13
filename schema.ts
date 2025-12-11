import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull().unique(),
  userName: text("user_name").default('User'),
  userInitials: text("user_initials").default('U'),
  profilePicture: text("profile_picture"),
  wallpaper: jsonb("wallpaper"),
  accentColor: text("accent_color").default('#3b82f6'),
  isDarkMode: text("is_dark_mode").default('true'),
  displaySettings: jsonb("display_settings"),
  soundSettings: jsonb("sound_settings"),
  notificationSettings: jsonb("notification_settings"),
  installedApps: jsonb("installed_apps"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customWallpapers = pgTable("custom_wallpapers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  imageData: text("image_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings);
export const insertCustomWallpaperSchema = createInsertSchema(customWallpapers);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type CustomWallpaper = typeof customWallpapers.$inferSelect;
