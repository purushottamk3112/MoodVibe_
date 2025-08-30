import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users, sessions, type User, type NewUser } from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  provider: string;
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }

  // Create user
  static async createUser(userData: {
    email: string;
    name: string;
    password?: string;
    googleId?: string;
    avatar?: string;
    provider?: string;
  }): Promise<User> {
    const hashedPassword = userData.password ? await this.hashPassword(userData.password) : null;
    
    const [user] = await db.insert(users).values({
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      googleId: userData.googleId,
      avatar: userData.avatar,
      provider: userData.provider || "email",
      emailVerified: userData.provider === "google", // Auto-verify Google users
    }).returning();

    return user;
  }

  // Find user by email
  static async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
  }

  // Find user by Google ID
  static async findUserByGoogleId(googleId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return user || null;
  }

  // Find user by ID
  static async findUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  // Register user with email/password
  static async registerUser(email: string, name: string, password: string): Promise<{ user: AuthUser; token: string }> {
    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create new user
    const user = await this.createUser({
      email,
      name,
      password,
      provider: "email",
    });

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
      },
      token,
    };
  }

  // Login user with email/password
  static async loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    // Find user
    const user = await this.findUserByEmail(email);
    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
      },
      token,
    };
  }

  // Handle Google OAuth user
  static async handleGoogleUser(profile: any): Promise<{ user: AuthUser; token: string }> {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;
    const avatar = photos[0]?.value;

    // Check if user exists
    let user = await this.findUserByGoogleId(id);
    
    if (!user) {
      // Check if user exists with same email but different provider
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        // Link Google account to existing user
        await db.update(users)
          .set({ 
            googleId: id, 
            avatar: avatar || existingUser.avatar,
            emailVerified: true 
          })
          .where(eq(users.id, existingUser.id));
        user = { ...existingUser, googleId: id, avatar: avatar || existingUser.avatar };
      } else {
        // Create new user
        user = await this.createUser({
          email,
          name: displayName,
          googleId: id,
          avatar,
          provider: "google",
        });
      }
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
      },
      token,
    };
  }

  // Get user from token
  static async getUserFromToken(token: string): Promise<AuthUser | null> {
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    const user = await this.findUserById(decoded.userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
    };
  }
}