import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    // Fallback to in-memory MongoDB for local/dev usage when no URI is provided.
    // This allows running the app without a local MongoDB server installed.
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    console.warn("No MONGODB_URI configured, using in-memory MongoDB.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
