import express from "express";
import { setupApp } from "./app";
import { setupVite, serveStatic } from "./vite";

const app = express();

(async () => {
  const server = await setupApp(app);

  // Setup Vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start the server
  const port = parseInt(process.env.PORT || "5000");
  server.listen(port, "0.0.0.0", () => {
    console.log(`[express] serving on port ${port}`);
  });
})();
