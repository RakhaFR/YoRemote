import { Router } from "express";
import { getDevices } from "../discovery/device-store.js";
import { scanNetwork } from "../discovery/scanner.js";

export const deviceRoutes = Router();

deviceRoutes.get("/", (_req, res) => {
  res.json(getDevices());
});

deviceRoutes.post("/scan", async (_req, res) => {
  try {
    const devices = await scanNetwork();
    res.json(devices);
  } catch {
    res.status(500).json({ error: "Scan failed" });
  }
});
