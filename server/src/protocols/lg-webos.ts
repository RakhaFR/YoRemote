import type { TVProtocol, CommandMap } from "./base.js";
import { WebSocket } from "ws";

const KEY_MAP: CommandMap = {
  POWER: "KEY_POWER",
  UP: "KEY_UP", DOWN: "KEY_DOWN", LEFT: "KEY_LEFT", RIGHT: "KEY_RIGHT",
  ENTER: "KEY_ENTER",
  BACK: "KEY_RETURN", HOME: "KEY_HOME", MENU: "KEY_MENU",
  VOLUME_UP: "KEY_VOLUMEUP", VOLUME_DOWN: "KEY_VOLUMEDOWN", MUTE: "KEY_MUTE",
  CHANNEL_UP: "KEY_CHANNELUP", CHANNEL_DOWN: "KEY_CHANNELDOWN", GUIDE: "KEY_GUIDE",
  PLAY: "KEY_PLAY", PAUSE: "KEY_PAUSE", STOP: "KEY_STOP",
  REWIND: "KEY_REWIND", FAST_FORWARD: "KEY_FASTFORWARD",
  INPUT_HDMI1: "KEY_HDMI1", INPUT_HDMI2: "KEY_HDMI2", INPUT_HDMI3: "KEY_HDMI3",
  INPUT_TV: "KEY_TV", INPUT_AV: "KEY_EXT",
  NUM_0: "KEY_0", NUM_1: "KEY_1", NUM_2: "KEY_2", NUM_3: "KEY_3", NUM_4: "KEY_4",
  NUM_5: "KEY_5", NUM_6: "KEY_6", NUM_7: "KEY_7", NUM_8: "KEY_8", NUM_9: "KEY_9",
  DELETE: "KEY_DELETE",
};

export class LGWebOSProtocol implements TVProtocol {
  private ws: WebSocket | null = null;
  private ip = "";
  private port = 3000;
  private registered = false;
  private msgId = 0;

  async connect(ip: string, port: number): Promise<boolean> {
    this.ip = ip;
    this.port = port;

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(`ws://${ip}:${port}`);

        const timeout = setTimeout(() => {
          this.ws?.close();
          resolve(false);
        }, 5000);

        this.ws.on("open", () => {
          clearTimeout(timeout);
          this.register().then((ok) => {
            this.registered = ok;
            resolve(ok);
          });
        });

        this.ws.on("error", () => {
          clearTimeout(timeout);
          resolve(false);
        });
      } catch {
        resolve(false);
      }
    });
  }

  private async register(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.ws) { resolve(false); return; }

      const payload = {
        type: "register",
        id: `reg_${++this.msgId}`,
        payload: {
          forcePairing: false,
          pairingType: "PROMPT",
          "client-key": "",
          manifest: {
            appVersion: "1.0",
            signed: {},
          },
        },
      };

      const handler = (data: Buffer | string) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === "registered") {
            this.ws?.off("message", handler);
            resolve(true);
          } else if (msg.type === "error") {
            this.ws?.off("message", handler);
            resolve(false);
          }
        } catch { /* ignore parse errors */ }
      };

      this.ws.on("message", handler);
      this.ws.send(JSON.stringify(payload));

      setTimeout(() => {
        this.ws?.off("message", handler);
        resolve(true);
      }, 10000);
    });
  }

  async sendKey(key: string): Promise<boolean> {
    const mapped = KEY_MAP[key] ?? key;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const reconnected = await this.connect(this.ip, this.port);
      if (!reconnected) return false;
    }

    if (key === "POWER") {
      return this.sendRequest("ssap://system/turnOff", {});
    }

    return this.sendButton(mapped);
  }

  private async sendButton(button: string): Promise<boolean> {
    const payload = {
      type: "request",
      id: `btn_${++this.msgId}`,
      uri: "ssap://com.webos.service.networkinput/getPointerInputSocket",
    };

    return new Promise((resolve) => {
      if (!this.ws) { resolve(false); return; }

      const handler = (data: Buffer | string) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.id === payload.id && msg.payload?.socketPath) {
            this.ws?.off("message", handler);
            const inputWs = new WebSocket(msg.payload.socketPath);
            inputWs.on("open", () => {
              inputWs.send(`type:button\nname:${button}\n\n`);
              setTimeout(() => { inputWs.close(); resolve(true); }, 100);
            });
            inputWs.on("error", () => resolve(false));
          }
        } catch { /* ignore */ }
      };

      this.ws.on("message", handler);
      this.ws.send(JSON.stringify(payload));

      setTimeout(() => {
        this.ws?.off("message", handler);
        resolve(false);
      }, 3000);
    });
  }

  private async sendRequest(uri: string, payload: Record<string, unknown>): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.ws) { resolve(false); return; }

      const msg = {
        type: "request",
        id: `req_${++this.msgId}`,
        uri,
        payload,
      };

      this.ws.send(JSON.stringify(msg));
      resolve(true);
    });
  }

  async disconnect(): Promise<void> {
    this.ws?.close();
    this.ws = null;
    this.registered = false;
  }
}
