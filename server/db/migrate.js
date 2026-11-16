import dotenv from "dotenv";

import connectDB from "./connection.js";

import User from "../models/User.js";
import Post from "../models/Post.js";
import Category from "../models/Category.js";
import Media from "../models/Media.js";
import Subscriber from "../models/Subscriber.js";
import Campaign from "../models/Campaign.js";
import Setting from "../models/Setting.js";

import mongoose from "mongoose";

dotenv.config();

async function migrate() {
  try {
    await connectDB();

    const models = [
      User,
      Post,
      Category,
      Media,
      Subscriber,
      Campaign,
      Setting,
    ];

    for (const model of models) {
      await model.createIndexes();
      console.log(`Indexes initialised: ${model.modelName}`);
    }

    console.log("MongoDB database setup completed.");
  } catch (error) {
    console.error("Database setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrate();