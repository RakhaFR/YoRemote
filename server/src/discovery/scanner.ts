import { createSocket, type Socket } from "dgram";
import { addDevice, getDevices, type TVDevice } from "./device-store.js";
import { createHash } from "crypto";

function makeId(ip: string, protocol: string): string {
  return createHash("md5").update(`${ip}:${protocol}`).digest("hex").slice(0, 12);
}

function parseSSDP(msg: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of msg.split("\r\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      headers[line.slice(0, idx).toLowerCase().trim()] = line.slice(idx + 1).trim();
    }
  }
  return headers;
}

function detectProtocol(headers: Record<string, string>, ip: string): {
  protocol: TVDevice["protocol"];
  name: string;
  port: number;
} {
  const server = (headers["server"] ?? "").toLowerCase();
  const st = (headers["st"] ?? headers["nt"] ?? "").toLowerCase();
  const location = headers["location"] ?? "";

  if (server.includes("webos") || st.includes("lge") || location.includes(":3000")) {
    return { protocol: "lg-webos", name: `LG TV (${ip})`, port: 3000 };
  }

  if (server.includes("samsung") || st.includes("samsung") || location.includes(":8001")) {
    return { protocol: "samsung", name: `Samsung TV (${ip})`, port: 8001 };
  }

  if (st.includes("roku") || location.includes(":8060")) {
    return { protocol: "roku", name: `Roku (${ip})`, port: 8060 };
  }

  return { protocol: "unknown", name: `Smart TV (${ip})`, port: 0 };
}

export async function scanNetwork(): Promise<TVDevice[]> {
  return new Promise((resolve) => {
    const found: TVDevice[] = [];
    let socket: Socket | null = null;

    try {
      socket = createSocket({ type: "udp4", reuseAddr: true });

      socket.on("message", (msg, rinfo) => {
        const headers = parseSSDP(msg.toString());
        const { protocol, name, port } = detectProtocol(headers, rinfo.address);

        if (protocol !== "unknown") {
          const id = makeId(rinfo.address, protocol);
          const existing = found.find((d) => d.id === id);
          if (!existing) {
            const device: TVDevice = {
              id,
              name,
              ip: rinfo.address,
              port,
              protocol,
              status: "online",
            };
            found.push(device);
            addDevice(device);
          }
        }
      });

      socket.bind(0, () => {
        const searchMsg = [
          "M-SEARCH * HTTP/1.1",
          "HOST: 239.255.255.250:1900",
          "MAN: \"ssdp:discover\"",
          "MX: 3",
          "ST: ssdp:all",
          "",
          "",
        ].join("\r\n");

        const buf = Buffer.from(searchMsg);
        socket!.send(buf, 0, buf.length, 1900, "239.255.255.250");
      });
    } catch (err) {
      console.error("SSDP scan error:", err);
    }

    setTimeout(() => {
      try {
        socket?.close();
      } catch { /* already closed */ }

      scanAndroidTV(found).then(() => {
        resolve(getDevices());
      });
    }, 4000);
  });
}

async function scanAndroidTV(found: TVDevice[]): Promise<void> {
  // ponytail: basic ADB scan via TCP port 5555 probe, replace with adbkit if needed
  const { createConnection } = await import("net");
  const localIP = getLocalIP();
  if (!localIP) return;

  const subnet = localIP.split(".").slice(0, 3).join(".");
  const probePromises: Promise<void>[] = [];

  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`;
    if (found.some((d) => d.ip === ip)) continue;

    probePromises.push(
      new Promise<void>((resolve) => {
        const conn = createConnection({ host: ip, port: 5555, timeout: 500 });
        conn.on("connect", () => {
          const id = makeId(ip, "android-tv");
          const device: TVDevice = {
            id,
            name: `Android TV (${ip})`,
            ip,
            port: 5555,
            protocol: "android-tv",
            status: "online",
          };
          addDevice(device);
          conn.destroy();
          resolve();
        });
        conn.on("error", () => { conn.destroy(); resolve(); });
        conn.on("timeout", () => { conn.destroy(); resolve(); });
      })
    );
  }

  await Promise.allSettled(probePromises);
}

import { networkInterfaces } from "os";

function getLocalIP(): string | null {
  const interfaces = networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}
