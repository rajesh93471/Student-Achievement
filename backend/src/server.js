import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 5000;

const bootstrap = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
