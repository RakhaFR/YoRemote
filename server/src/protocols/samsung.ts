import type { TVProtocol, CommandMap } from "./base.js";
import { WebSocket } from "ws";

const KEY_MAP: CommandMap = {
  POWER: "KEY_POWER",
  UP: "KEY_UP", DOWN: "KEY_DOWN", LEFT: "KEY_LEFT", RIGHT: "KEY_RIGHT",
  ENTER: "KEY_ENTER",
  BACK: "KEY_BACK", HOME: "KEY_HOME", MENU: "KEY_MENU",
  VOLUME_UP: "KEY_VOLUMEUP", VOLUME_DOWN: "KEY_VOLUMEDOWN", MUTE: "KEY_MUTE",
  CHANNEL_UP: "KEY_CHANNELUP", CHANNEL_DOWN: "KEY_CHANNELDOWN", GUIDE: "KEY_GUIDE",
  PLAY: "KEY_PLAY", PAUSE: "KEY_PAUSE", STOP: "KEY_STOP",
  REWIND: "KEY_REWIND", FAST_FORWARD: "KEY_FF",
  INPUT_HDMI1: "KEY_HDMI1", INPUT_HDMI2: "KEY_HDMI2", INPUT_HDMI3: "KEY_HDMI3",
  INPUT_TV: "KEY_TV", INPUT_AV: "KEY_AV1",
  NUM_0: "KEY_0", NUM_1: "KEY_1", NUM_2: "KEY_2", NUM_3: "KEY_3", NUM_4: "KEY_4",
  NUM_5: "KEY_5", NUM_6: "KEY_6", NUM_7: "KEY_7", NUM_8: "KEY_8", NUM_9: "KEY_9",
  DELETE: "KEY_DELETE",
};

export class SamsungProtocol implements TVProtocol {
  private ws: WebSocket | null = null;
  private ip = "";
  private port = 8001;

  async connect(ip: string, port: number): Promise<boolean> {
    this.ip = ip;
    this.port = port;

    return new Promise((resolve) => {
      try {
        const url = `ws://${ip}:${port}/api/v2/channels/samsung.remote.control?name=${Buffer.from("YoRemote").toString("base64")}`;
        this.ws = new WebSocket(url);

        const timeout = setTimeout(() => {
          this.ws?.close();
          resolve(false);
        }, 5000);

        this.ws.on("open", () => {
          clearTimeout(timeout);
          resolve(true);
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

  async sendKey(key: string): Promise<boolean> {
    const mapped = KEY_MAP[key] ?? key;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const reconnected = await this.connect(this.ip, this.port);
      if (!reconnected) return false;
    }

    try {
      this.ws!.send(JSON.stringify({
        method: "ms.remote.control",
        params: {
          Cmd: "Click",
          DataOfCmd: mapped,
          Option: "false",
          TypeOfRemote: "SendRemoteKey",
        },
      }));
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.ws?.close();
    this.ws = null;
  }
}
