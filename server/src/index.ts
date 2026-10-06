import express from "express";
import cors from "cors";
import { deviceRoutes } from "./routes/devices.js";
import { remoteRoutes } from "./routes/remote.js";

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/devices", deviceRoutes);
app.use("/remote", remoteRoutes);

app.listen(PORT, () => {
  console.log(`YoRemote server running on http://localhost:${PORT}`);
});
