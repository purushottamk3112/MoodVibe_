// This file is kept for potential future storage needs
// Currently MoodVibe operates as a stateless application

export interface IStorage {
  // Future storage methods can be added here
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage needed for stateless mood-based recommendations
  }
}

export const storage = new MemStorage();
