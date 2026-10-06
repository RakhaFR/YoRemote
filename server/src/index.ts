import express from "express";
import cors from "cors";
import { deviceRoutes } from "./routes/devices.js";
import { remoteRoutes } from "./routes/remote.js";
import { scanNetwork } from "./discovery/scanner.js";

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/devices", deviceRoutes);
app.use("/remote", remoteRoutes);

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
