import type { TVProtocol, CommandMap } from "./base.js";

const KEY_MAP: CommandMap = {
  POWER: "Power",
  UP: "Up", DOWN: "Down", LEFT: "Left", RIGHT: "Right",
  ENTER: "Select",
  BACK: "Back", HOME: "Home", MENU: "Info",
  VOLUME_UP: "VolumeUp", VOLUME_DOWN: "VolumeDown", MUTE: "VolumeMute",
  CHANNEL_UP: "ChannelUp", CHANNEL_DOWN: "ChannelDown", GUIDE: "Guide",
  PLAY: "Play", PAUSE: "Play", STOP: "Play",
  REWIND: "Rev", FAST_FORWARD: "Fwd",
  INPUT_HDMI1: "InputHDMI1", INPUT_HDMI2: "InputHDMI2", INPUT_HDMI3: "InputHDMI3",
  INPUT_TV: "InputTuner", INPUT_AV: "InputAV1",
  NUM_0: "Lit_0", NUM_1: "Lit_1", NUM_2: "Lit_2", NUM_3: "Lit_3", NUM_4: "Lit_4",
  NUM_5: "Lit_5", NUM_6: "Lit_6", NUM_7: "Lit_7", NUM_8: "Lit_8", NUM_9: "Lit_9",
  DELETE: "Backspace",
};

export class RokuProtocol implements TVProtocol {
  private ip = "";
  private port = 8060;

  async connect(ip: string, port: number): Promise<boolean> {
    this.ip = ip;
    this.port = port;

    try {
      const res = await fetch(`http://${ip}:${port}/query/device-info`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async sendKey(key: string): Promise<boolean> {
    const mapped = KEY_MAP[key] ?? key;

    try {
      const res = await fetch(
        `http://${this.ip}:${this.port}/keypress/${mapped}`,
        { method: "POST", signal: AbortSignal.timeout(3000) }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    // Roku is stateless HTTP, nothing to close
  }
}
