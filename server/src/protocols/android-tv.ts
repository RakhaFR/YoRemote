import type { TVProtocol, CommandMap } from "./base.js";
import { createConnection, type Socket } from "net";

const KEY_MAP: CommandMap = {
  POWER: "KEYCODE_POWER",
  UP: "KEYCODE_DPAD_UP", DOWN: "KEYCODE_DPAD_DOWN",
  LEFT: "KEYCODE_DPAD_LEFT", RIGHT: "KEYCODE_DPAD_RIGHT",
  ENTER: "KEYCODE_DPAD_CENTER",
  BACK: "KEYCODE_BACK", HOME: "KEYCODE_HOME", MENU: "KEYCODE_MENU",
  VOLUME_UP: "KEYCODE_VOLUME_UP", VOLUME_DOWN: "KEYCODE_VOLUME_DOWN",
  MUTE: "KEYCODE_VOLUME_MUTE",
  CHANNEL_UP: "KEYCODE_CHANNEL_UP", CHANNEL_DOWN: "KEYCODE_CHANNEL_DOWN",
  GUIDE: "KEYCODE_TV_INPUT",
  PLAY: "KEYCODE_MEDIA_PLAY", PAUSE: "KEYCODE_MEDIA_PAUSE",
  STOP: "KEYCODE_MEDIA_STOP",
  REWIND: "KEYCODE_MEDIA_REWIND", FAST_FORWARD: "KEYCODE_MEDIA_FAST_FORWARD",
  INPUT_HDMI1: "KEYCODE_TV_INPUT_HDMI_1", INPUT_HDMI2: "KEYCODE_TV_INPUT_HDMI_2",
  INPUT_HDMI3: "KEYCODE_TV_INPUT_HDMI_3", INPUT_TV: "KEYCODE_TV", INPUT_AV: "KEYCODE_TV_INPUT",
  NUM_0: "KEYCODE_0", NUM_1: "KEYCODE_1", NUM_2: "KEYCODE_2", NUM_3: "KEYCODE_3",
  NUM_4: "KEYCODE_4", NUM_5: "KEYCODE_5", NUM_6: "KEYCODE_6", NUM_7: "KEYCODE_7",
  NUM_8: "KEYCODE_8", NUM_9: "KEYCODE_9",
  DELETE: "KEYCODE_DEL",
};

export class AndroidTVProtocol implements TVProtocol {
  private conn: Socket | null = null;
  private ip = "";
  private port = 5555;

  async connect(ip: string, port: number): Promise<boolean> {
    this.ip = ip;
    this.port = port;

    return new Promise((resolve) => {
      this.conn = createConnection({ host: ip, port, timeout: 3000 });

      this.conn.on("connect", () => resolve(true));
      this.conn.on("error", () => { this.conn?.destroy(); resolve(false); });
      this.conn.on("timeout", () => { this.conn?.destroy(); resolve(false); });
    });
  }

  async sendKey(key: string): Promise<boolean> {
    const mapped = KEY_MAP[key] ?? key;

    // ponytail: shell command over ADB TCP, proper ADB protocol if throughput matters
    try {
      const { exec } = await import("child_process");
      return new Promise((resolve) => {
        exec(
          `adb -s ${this.ip}:${this.port} shell input keyevent ${mapped}`,
          { timeout: 3000 },
          (err) => resolve(!err)
        );
      });
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.conn?.destroy();
    this.conn = null;
  }
}
