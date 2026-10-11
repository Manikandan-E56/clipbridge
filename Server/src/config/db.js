import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/clipbridge";

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} (${conn.connection.host})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error:`, error.message);
    throw error;
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected from server.");
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] Reconnected successfully.");
});
