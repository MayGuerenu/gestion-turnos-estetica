import { db } from "./memoryDb.js";
import crypto from "crypto";

export const usersRepo = {
  async findByEmail(email) {
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async create({ email, passwordHash }) {
    const user = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    return user;
  }
};
