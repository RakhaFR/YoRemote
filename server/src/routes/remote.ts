import { Router } from "express";
import { getDevice } from "../discovery/device-store.js";
import type { TVProtocol } from "../protocols/base.js";
import { LGWebOSProtocol } from "../protocols/lg-webos.js";
import { SamsungProtocol } from "../protocols/samsung.js";
import { AndroidTVProtocol } from "../protocols/android-tv.js";
import { RokuProtocol } from "../protocols/roku.js";

export const remoteRoutes = Router();

const connections = new Map<string, TVProtocol>();

function getProtocol(type: string): TVProtocol | undefined {
  switch (type) {
    case "lg-webos": return new LGWebOSProtocol();
    case "samsung": return new SamsungProtocol();
    case "android-tv": return new AndroidTVProtocol();
    case "roku": return new RokuProtocol();
    default: return undefined;
  }
}

remoteRoutes.post("/:deviceId/command", async (req, res) => {
  const { deviceId } = req.params;
  const { command } = req.body;

  if (!command) {
    res.status(400).json({ error: "Missing command" });
    return;
  }

  const device = getDevice(deviceId);
  if (!device) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  let protocol = connections.get(deviceId);

  if (!protocol) {
    protocol = getProtocol(device.protocol);
    if (!protocol) {
      res.status(400).json({ error: `Unsupported protocol: ${device.protocol}` });
      return;
    }

    const connected = await protocol.connect(device.ip, device.port);
    if (!connected) {
      res.status(503).json({ error: "Failed to connect to device" });
      return;
    }
    connections.set(deviceId, protocol);
  }

  const success = await protocol.sendKey(command);

  if (success) {
    res.json({ ok: true });
  } else {
    connections.delete(deviceId);
    res.status(500).json({ error: "Command failed" });
  }
});
