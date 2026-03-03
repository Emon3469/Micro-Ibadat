require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/db");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    console.log("Starting server initialization...");
    await connectDb();
    console.log("✔ Connected to MongoDB successfully.");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✔ Micro-Ibadah API is live on port ${PORT}`);
      console.log(`✔ Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Increase timeouts for production stability
    server.keepAliveTimeout = 120000;
    server.headersTimeout = 120500;

  } catch (error) {
    console.error("✘ CRITICAL: Failed to start server!");
    console.error("Error Details:", error.message);
    if (error.message.includes("MONGO_URI")) {
      console.error("TIP: Ensure MONGO_URI is set in your Render/Railway Environment Variables.");
    }
    process.exit(1);
  }
};

start();
