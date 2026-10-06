export interface TVDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: "lg-webos" | "samsung" | "android-tv" | "roku" | "unknown";
  status: "online" | "offline" | "connecting";
  model?: string;
  mac?: string;
}

const devices = new Map<string, TVDevice>();

export function getDevices(): TVDevice[] {
  return Array.from(devices.values());
}

export function getDevice(id: string): TVDevice | undefined {
  return devices.get(id);
}

export function addDevice(device: TVDevice): void {
  devices.set(device.id, device);
}

export function updateDevice(id: string, updates: Partial<TVDevice>): void {
  const device = devices.get(id);
  if (device) {
    devices.set(id, { ...device, ...updates });
  }
}

export function clearDevices(): void {
  devices.clear();
}
