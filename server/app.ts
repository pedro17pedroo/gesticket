import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./replitAuth";
import { requestLogger, errorHandler } from "./middleware";
// Routes will be imported dynamically
import permissionRoutes from "./routes/permissionRoutes";

export async function setupApp(app: Express): Promise<Server> {
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(requestLogger);
  
  // Configure multer for file uploads
  const multer = await import('multer');
  const upload = multer.default({ 
    dest: 'uploads/', 
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });
  // Apply multer middleware only to POST routes for tickets
  app.post('/api/tickets', upload.array('attachments', 5)); // Max 5 files

  // Setup authentication
  await setupAuth(app);
  
  // Load tenant information for authenticated users
  const { loadTenantInfo } = await import('./middleware/tenantAccess.js');
  app.use(loadTenantInfo);

  // Setup API routes
  const { registerRoutes } = await import('./routes/index.js');
  await registerRoutes(app);
  
  // Setup permission routes
  app.use("/api", permissionRoutes);

  // Legacy routes for backwards compatibility
  await setupLegacyRoutes(app);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // Create HTTP server
  const server = createServer(app);

  // Setup WebSocket
  setupWebSocket(server);

  return server;
}

async function setupLegacyRoutes(app: Express): Promise<void> {
  // Import legacy routes for features not yet migrated
  const { registerLegacyRoutes } = await import("./legacyRoutes");
  await registerLegacyRoutes(app);
}

function setupWebSocket(server: Server): void {
  const wss = new WebSocketServer({ 
    server, 
    path: "/api/ws" // Use a specific path to avoid conflicts with Vite HMR
  });

  wss.on("connection", (ws) => {
    logger.info("WebSocket client connected");
    
    ws.send(JSON.stringify({
      type: "welcome",
      message: "Connected to GeckoStream WebSocket"
    }));

    ws.on("close", () => {
      logger.info("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      logger.error("WebSocket error", { error });
    });
  });

  // Store WebSocket server for broadcasting
  (global as any).wss = wss;
}