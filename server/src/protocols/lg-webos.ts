import type { TVProtocol } from "./base.js";
import { WebSocket } from "ws";

const SSAP_COMMANDS: Record<string, { uri: string; payload?: Record<string, unknown> }> = {
  POWER: { uri: "ssap://system/turnOff" },
  VOLUME_UP: { uri: "ssap://audio/volumeUp" },
  VOLUME_DOWN: { uri: "ssap://audio/volumeDown" },
  MUTE: { uri: "ssap://audio/setMute", payload: { mute: true } },
  CHANNEL_UP: { uri: "ssap://tv/channelUp" },
  CHANNEL_DOWN: { uri: "ssap://tv/channelDown" },
  PLAY: { uri: "ssap://media.controls/play" },
  PAUSE: { uri: "ssap://media.controls/pause" },
  STOP: { uri: "ssap://media.controls/stop" },
  REWIND: { uri: "ssap://media.controls/rewind" },
  FAST_FORWARD: { uri: "ssap://media.controls/fastForward" },
  INPUT_HDMI1: { uri: "ssap://tv/switchInput", payload: { inputId: "HDMI_1" } },
  INPUT_HDMI2: { uri: "ssap://tv/switchInput", payload: { inputId: "HDMI_2" } },
  INPUT_HDMI3: { uri: "ssap://tv/switchInput", payload: { inputId: "HDMI_3" } },
  INPUT_TV: { uri: "ssap://tv/switchInput", payload: { inputId: "TV" } },
  INPUT_AV: { uri: "ssap://tv/switchInput", payload: { inputId: "AV_1" } },
};

const BUTTON_MAP: Record<string, string> = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  ENTER: "ENTER",
  BACK: "BACK",
  HOME: "HOME",
  MENU: "MENU",
  GUIDE: "GUIDE",
  RED: "RED",
  GREEN: "GREEN",
  YELLOW: "YELLOW",
  BLUE: "BLUE",
  NUM_0: "0",
  NUM_1: "1",
  NUM_2: "2",
  NUM_3: "3",
  NUM_4: "4",
  NUM_5: "5",
  NUM_6: "6",
  NUM_7: "7",
  NUM_8: "8",
  NUM_9: "9",
  DELETE: "BACK",
};

export class LGWebOSProtocol implements TVProtocol {
  private ws: WebSocket | null = null;
  private inputWs: WebSocket | null = null;
  private ip = "";
  private port = 3001;
  private clientKey = "";
  private registered = false;
  private msgId = 0;

  async connect(ip: string, port?: number): Promise<boolean> {
    this.ip = ip;
    const targetPort = port && port !== 0 ? port : 3001;

    // Try SSL wss (port 3001) first, fallback to ws (port 3000)
    const candidates = [
      { url: `wss://${ip}:${targetPort === 3000 ? 3001 : targetPort}`, ssl: true },
      { url: `ws://${ip}:3000`, ssl: false },
    ];

    for (const cand of candidates) {
      try {
        const ok = await this.tryConnectUrl(cand.url, cand.ssl);
        if (ok) return true;
      } catch {
        // try next
      }
    }

    return false;
  }

  private tryConnectUrl(url: string, ssl: boolean): Promise<boolean> {
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

        socket.on("open", async () => {
          clearTimeout(timeout);
          this.ws = socket;
          const regOk = await this.register();
          this.registered = regOk;
          resolve(regOk);
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

  private register(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        resolve(false);
        return;
      }

      const payload = {
        type: "register",
        id: `reg_${++this.msgId}`,
        payload: {
          forcePairing: false,
          pairingType: "PROMPT",
          "client-key": this.clientKey || undefined,
          manifest: {
            manifestVersion: 1,
            appVersion: "1.1",
            signed: {
              created: "20140509",
              appId: "com.yoremote.app",
              vendorId: "com.yoremote",
              localizedAppNames: {
                "": "YoRemote Universal Controller",
              },
              permissions: [
                "TEST_OPEN",
                "TEST_PROTECTED",
                "CONTROL_AUDIO",
                "CONTROL_DISPLAY",
                "CONTROL_INPUT_JOYSTICK",
                "CONTROL_INPUT_MEDIA_RECORDING",
                "CONTROL_INPUT_MEDIA_PLAYBACK",
                "CONTROL_INPUT_TV",
                "READ_APP_STATUS",
                "READ_CURRENT_CHANNEL",
                "READ_INPUT_DEVICE_LIST",
                "READ_NETWORK_STATUS",
                "READ_RUNNING_APPS",
                "READ_TV_CHANNEL_LIST",
                "WRITE_NOTIFICATION_TOAST",
                "READ_POWER_STATE",
                "READ_COUNTRY_INFO",
              ],
              serial: "2f930e2d2cdc084e3fcf82c4f310bbd6",
            },
          },
        },
      };

      const handler = (data: Buffer | string) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === "registered") {
            if (msg.payload?.["client-key"]) {
              this.clientKey = msg.payload["client-key"];
            }
            this.ws?.off("message", handler);
            resolve(true);
          } else if (msg.type === "error") {
            this.ws?.off("message", handler);
            resolve(false);
          }
        } catch {
          // ignore json errors
        }
      };

      this.ws.on("message", handler);
      this.ws.send(JSON.stringify(payload));

      setTimeout(() => {
        this.ws?.off("message", handler);
        resolve(true);
      }, 8000);
    });
  }

  async sendKey(key: string): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const reconnected = await this.connect(this.ip, this.port);
      if (!reconnected) return false;
    }

    // Check if it has direct SSAP URI (Audio, SwitchInput, Media, Power)
    const ssap = SSAP_COMMANDS[key];
    if (ssap) {
      return this.sendRequest(ssap.uri, ssap.payload || {});
    }

    // Otherwise send as button click via pointer input socket
    const btn = BUTTON_MAP[key] || key;
    return this.sendButton(btn);
  }

  private async sendButton(button: string): Promise<boolean> {
    if (this.inputWs && this.inputWs.readyState === WebSocket.OPEN) {
      try {
        this.inputWs.send(`type:button\nname:${button}\n\n`);
        return true;
      } catch {
        this.inputWs = null;
      }
    }

    const payload = {
      type: "request",
      id: `btn_req_${++this.msgId}`,
      uri: "ssap://com.webos.service.networkinput/getPointerInputSocket",
    };

    return new Promise((resolve) => {
      if (!this.ws) {
        resolve(false);
        return;
      }

      const handler = (data: Buffer | string) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.id === payload.id && msg.payload?.socketPath) {
            this.ws?.off("message", handler);
            const inputSocket = new WebSocket(msg.payload.socketPath, {
              rejectUnauthorized: false,
            });

            inputSocket.on("open", () => {
              this.inputWs = inputSocket;
              inputSocket.send(`type:button\nname:${button}\n\n`);
              resolve(true);
            });

            inputSocket.on("error", () => resolve(false));
          }
        } catch {
          // ignore
        }
      };

      this.ws.on("message", handler);
      this.ws.send(JSON.stringify(payload));

      setTimeout(() => {
        this.ws?.off("message", handler);
        resolve(false);
      }, 3000);
    });
  }

  private sendRequest(uri: string, payload: Record<string, unknown>): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        resolve(false);
        return;
      }

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
    this.inputWs?.terminate();
    this.inputWs = null;
    this.ws?.terminate();
    this.ws = null;
    this.registered = false;
  }
}
