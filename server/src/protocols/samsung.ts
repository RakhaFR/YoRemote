import type { TVProtocol, CommandMap } from "./base.js";
import { WebSocket } from "ws";

const KEY_MAP: CommandMap = {
  POWER: "KEY_POWER",
  UP: "KEY_UP",
  DOWN: "KEY_DOWN",
  LEFT: "KEY_LEFT",
  RIGHT: "KEY_RIGHT",
  ENTER: "KEY_ENTER",
  BACK: "KEY_RETURN",
  HOME: "KEY_HOME",
  MENU: "KEY_MENU",
  VOLUME_UP: "KEY_VOLUP",
  VOLUME_DOWN: "KEY_VOLDOWN",
  MUTE: "KEY_MUTE",
  CHANNEL_UP: "KEY_CHUP",
  CHANNEL_DOWN: "KEY_CHDOWN",
  GUIDE: "KEY_GUIDE",
  PLAY: "KEY_PLAY",
  PAUSE: "KEY_PAUSE",
  STOP: "KEY_STOP",
  REWIND: "KEY_REWIND",
  FAST_FORWARD: "KEY_FF",
  INPUT_HDMI1: "KEY_HDMI",
  INPUT_HDMI2: "KEY_HDMI2",
  INPUT_HDMI3: "KEY_HDMI3",
  INPUT_TV: "KEY_TV",
  INPUT_AV: "KEY_AV1",
  RED: "KEY_RED",
  GREEN: "KEY_GREEN",
  YELLOW: "KEY_YELLOW",
  BLUE: "KEY_BLUE",
  NUM_0: "KEY_0",
  NUM_1: "KEY_1",
  NUM_2: "KEY_2",
  NUM_3: "KEY_3",
  NUM_4: "KEY_4",
  NUM_5: "KEY_5",
  NUM_6: "KEY_6",
  NUM_7: "KEY_7",
  NUM_8: "KEY_8",
  NUM_9: "KEY_9",
  DELETE: "KEY_RETURN",
};

export class SamsungProtocol implements TVProtocol {
  private ws: WebSocket | null = null;
  private ip = "";
  private token = "";

  async connect(ip: string, port?: number): Promise<boolean> {
    this.ip = ip;
    const nameBase64 = Buffer.from("YoRemote").toString("base64");

    const candidates = [
      `wss://${ip}:${port === 8001 ? 8002 : (port || 8002)}/api/v2/channels/samsung.remote.control?name=${nameBase64}${this.token ? `&token=${this.token}` : ""}`,
      `ws://${ip}:8001/api/v2/channels/samsung.remote.control?name=${nameBase64}`,
    ];

    for (const url of candidates) {
      const ok = await this.tryConnectUrl(url);
      if (ok) return true;
    }

    return false;
  }

  private tryConnectUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const socket = new WebSocket(url, {
          rejectUnauthorized: false,
          handshakeTimeout: 3000,
        });

        const timeout = setTimeout(() => {
          socket.terminate();
          resolve(false);
        }, 4000);

        socket.on("open", () => {
          clearTimeout(timeout);
          this.ws = socket;
          resolve(true);
        });

        socket.on("message", (data) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.event === "ms.channel.connect" && msg.data?.token) {
              this.token = msg.data.token;
            }
          } catch {
            // ignore
          }
        });

        socket.on("error", () => {
          clearTimeout(timeout);
          socket.terminate();
          resolve(false);
        });
      } catch {
        resolve(false);
      }
    });
  }

  async sendKey(key: string): Promise<boolean> {
    const mapped = KEY_MAP[key] ?? `KEY_${key}`;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const reconnected = await this.connect(this.ip);
      if (!reconnected) return false;
    }

    try {
      this.ws!.send(
        JSON.stringify({
          method: "ms.remote.control",
          params: {
            Cmd: "Click",
            DataOfCmd: mapped,
            Option: "false",
            TypeOfRemote: "SendRemoteKey",
          },
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.ws?.terminate();
    this.ws = null;
  }
}
