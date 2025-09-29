export interface BaseHobby {
  id: string;
  name: string;
  dateStarted: string;
  type: HobbyType;
}

export enum HobbyType {
  GAMES = 'Games',
  BOOKS = 'Books', 
  TV_FILM = 'TV/Film',
  CUSTOM = 'Custom'
}

export interface GameHobby extends BaseHobby {
  type: HobbyType.GAMES;
  items: Game[];
}

export interface BookHobby extends BaseHobby {
  type: HobbyType.BOOKS;
  items: BookItem[];
}

export interface TvFilmHobby extends BaseHobby {
  type: HobbyType.TV_FILM;
  items: TvFilmItem[];
}

export interface CustomHobby extends BaseHobby {
  type: HobbyType.CUSTOM;
  items: CustomItem[];
}

export type Hobby = GameHobby | BookHobby | TvFilmHobby | CustomHobby;

// Game item structure (similar to existing Game interface)
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
  collapsed?: boolean; // UI state, not stored in DB
}

export enum GameStatus {
  WANT_TO_PLAY = 'Want to Play',
  PLAYING = 'Currently Playing',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped'
}

// Book item structure
export interface BookItem {
  id: string;
  title: string;
  author?: string;
  status: BookStatus;
  totalPages?: number;
  pagesRead?: number;
  dateAdded: string;
  dateCompleted?: string;
  thumbnail?: string;
  tags?: string[]; // max 5 tags
}

export enum BookStatus {
  WANT_TO_READ = 'Want to Read',
  READING = 'Currently Reading',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped'
}

// TV/Film item structure
export interface TvFilmItem {
  id: string;
  title: string;
  director?: string;
  status: TvFilmStatus;
  rating?: number; // 1-5 stars
  currentSeason?: string; // For TV shows
  dateAdded: string;
  dateWatched?: string;
  thumbnail?: string;
  tags?: string[]; // max 5 tags
}

export enum TvFilmStatus {
  WANT_TO_WATCH = 'Want to Watch',
  WATCHED = 'Watched',
  WATCHING = 'Currently Watching',
}

// Keep MovieStatus for backward compatibility
export const MovieStatus = TvFilmStatus;
export type MovieItem = TvFilmItem;

// Custom item structure (minimal)
export interface CustomItem {
  id: string;
  name: string;
  dateAdded: string;
  thumbnail?: string;
  tags?: string[]; // max 5 tags
}