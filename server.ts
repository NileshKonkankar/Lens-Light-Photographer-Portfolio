import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve Firebase config dynamically so it isn't bundled in the client code
  app.get("/api/firebase-config", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      res.json(config);
    } catch (e) {
      console.error("Error reading firebase config:", e);
      res.status(500).json({ error: 'Firebase config not found' });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
