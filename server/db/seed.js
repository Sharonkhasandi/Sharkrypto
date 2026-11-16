import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "./connection.js";
import User from "../models/User.js";

dotenv.config();

async function seed() {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "Admin password must contain at least 12 characters"
      );
    }

    await connectDB();

    const email = ADMIN_EMAIL.toLowerCase().trim();

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin account already exists: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("Administrator account created successfully.");
    console.log(`Admin email: ${email}`);
    console.log("No sample records were inserted.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

seed();