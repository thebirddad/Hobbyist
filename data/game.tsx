export interface Game {
  id: string;
  title: string;
  platform: string;
  genre: string;
  status: GameStatus;
  rating?: number; // 1-10 scale
  dateAdded: string;
  hoursPlayed?: number;
  notes?: string;
  hltbData?: {
    gameplayMain?: number;
    gameplayMainExtra?: number;
    gameplayCompletionist?: number;
    imageUrl?: string;
  };
}

export enum GameStatus {
  NOT_STARTED = 'Not Started',
  PLAYING = 'Currently Playing',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold',
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

export const GENRES = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Simulation',
  'Sports',
  'Racing',
  'Fighting',
  'Puzzle',
  'Horror',
  'FPS',
  'Platformer',
  'Indie',
  'MMO',
  'Other'
] as const;

export type Platform = typeof PLATFORMS[number];
export type Genre = typeof GENRES[number];
