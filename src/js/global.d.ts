export interface CommandPayload {
  command: string;
  args: string[];
  key: string;
}

export interface ElectronAPI {
  open: (key: string) => void;
  openLink: (url: string) => void;
  openInIde: (key: string) => void;
  runCommand: (payload: CommandPayload) => void;
  onOutput: (callback: (data: string) => void) => void;
  onError: (callback: (data: string) => void) => void;
}

declare global {
  interface Window {
    electronApi: ElectronAPI;
  }
}
