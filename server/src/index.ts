import express from "express";
import cors from "cors";
import { deviceRoutes } from "./routes/devices.js";
import { remoteRoutes } from "./routes/remote.js";
import { scanNetwork } from "./discovery/scanner.js";

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json());

const handleHealth = (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok", timestamp: Date.now() });
};

// Mount health check
app.get("/health", handleHealth);
app.get("/api/health", handleHealth);

// Mount device & remote routes for direct and /api rewrites
app.use("/devices", deviceRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/remote", remoteRoutes);
app.use("/api/remote", remoteRoutes);

// Continuous background network scanner (runs on boot and every 25s)
let scanningInProgress = false;

async function triggerAutoScan() {
  if (scanningInProgress) return;
  scanningInProgress = true;
  try {
    await scanNetwork();
  } catch (err) {
    console.error("[Scanner] Error during background scan:", err);
  } finally {
    scanningInProgress = false;
  }
}

app.listen(PORT, () => {
  console.log(`[YoRemote Bridge] Running on http://localhost:${PORT}`);
  console.log(`[YoRemote Bridge] Starting automatic SSDP & network device discovery...`);
  
  // Initial scan
  triggerAutoScan();

  // Periodic scan every 25 seconds
  setInterval(triggerAutoScan, 25000);
});
