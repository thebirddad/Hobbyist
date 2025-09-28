export interface Game {
  id: string;
  title: string;
  platform: string;
  status: GameStatus;
  timeToBeat?: number; // hours
  hoursPlayed?: number;
  dateAdded: string;
  dateCompleted?: string;
  thumbnail?: string; // URI to the game's thumbnail image
  tags?: string[]; // max 5 tags
}

export enum GameStatus {
  WANT_TO_PLAY = 'Want to Play',
  PLAYING = 'Currently Playing',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped'
}

// Platforms are now managed dynamically through the console storage hook
// See hooks/use-console-storage.ts for platform management
