export interface Game {
  id: string;
  title: string;
  platform: string;
  status: GameStatus;
  timeToBeat?: number; // hours
  hoursPlayed?: number;
  dateAdded: string;
  dateCompleted?: string;
}

export enum GameStatus {
  WANT_TO_PLAY = 'Want to Play',
  PLAYING = 'Currently Playing',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped'
}

export const PLATFORMS = [
  'PC',
  'PlayStation 5',
  'PlayStation 4',
  'Xbox Series X/S',
  'Xbox One',
  'Nintendo Switch',
  'iOS',
  'Android',
  'Other'
] as const;

export type Platform = typeof PLATFORMS[number];
