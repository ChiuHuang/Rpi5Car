export interface Settings {
  serverUrl: string;
  gridSize: number;
  pointSize: number;
  theme: 'light' | 'dark';
}

export const DEFAULT_SETTINGS: Settings = {
  serverUrl: 'http://localhost:3000',
  gridSize: 20,
  pointSize: 5,
  theme: 'light'
};