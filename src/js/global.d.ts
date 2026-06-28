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
  resolveCourseIdByName: (courseName: string) => Promise<number | null>;
  saveToLog: (formData: Record<string, unknown>) => Promise<{
    ok: boolean;
    message: string;
    filePath?: string;
    tempPath?: string;
  }>;
  pickDirectory: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronApi: ElectronAPI;
  }
}
