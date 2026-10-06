import express from "express";
import cors from "cors";
import { networkInterfaces } from "os";
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

// Helper to get local LAN IPs
function getLocalNetworkIPs(): string[] {
  const ips: string[] = [];
  const interfaces = networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

// Continuous background network scanner (runs on boot and every 25s)
let scanningInProgress = false;

async function triggerAutoScan() {
  if (scanningInProgress) return;
  scanningInProgress = true;
  try {
    const devices = await scanNetwork();
    if (devices.length > 0) {
      console.log(`[YoRemote Bridge] Ditemukan ${devices.length} perangkat TV di jaringan.`);
    }
  } catch (err) {
    console.error("[Scanner] Error during background scan:", err);
  } finally {
    scanningInProgress = false;
  }
}

app.listen(PORT, "0.0.0.0", () => {
  const localIps = getLocalNetworkIPs();
  
  console.log("\n=======================================================");
  console.log("             YOREMOTE COMPANION BRIDGE                ");
  console.log("=======================================================");
  console.log(`  > Local:   http://localhost:${PORT}`);
  if (localIps.length > 0) {
    localIps.forEach((ip) => {
      console.log(`  > Network: http://${ip}:${PORT}  <-- Masukkan ini di menu Bridge HP`);
    });
  } else {
    console.log(`  > Network: http://127.0.0.1:${PORT}`);
  }
  console.log("=======================================================");
  console.log(`[Auto-Scan] Memindai TV di WiFi lokal...\n`);
  
  // Initial scan
  triggerAutoScan();

  // Periodic scan every 25 seconds
  setInterval(triggerAutoScan, 25000);
});
