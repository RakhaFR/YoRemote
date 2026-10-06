export interface TVProtocol {
  connect(ip: string, port: number): Promise<boolean>;
  sendKey(key: string): Promise<boolean>;
  disconnect(): Promise<void>;
}

export type CommandMap = Record<string, string>;

export const STANDARD_COMMANDS = [
  "POWER",
  "UP", "DOWN", "LEFT", "RIGHT", "ENTER",
  "BACK", "HOME", "MENU",
  "VOLUME_UP", "VOLUME_DOWN", "MUTE",
  "CHANNEL_UP", "CHANNEL_DOWN", "GUIDE",
  "PLAY", "PAUSE", "STOP", "REWIND", "FAST_FORWARD",
  "INPUT_HDMI1", "INPUT_HDMI2", "INPUT_HDMI3", "INPUT_TV", "INPUT_AV",
  "NUM_0", "NUM_1", "NUM_2", "NUM_3", "NUM_4",
  "NUM_5", "NUM_6", "NUM_7", "NUM_8", "NUM_9",
  "DELETE",
] as const;

export type StandardCommand = typeof STANDARD_COMMANDS[number];
