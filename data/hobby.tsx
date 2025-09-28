export interface BaseHobby {
  id: string;
  name: string;
  dateStarted: string;
  type: HobbyType;
}

export enum HobbyType {
  GAMES = 'Games',
  BOOKS = 'Books', 
  MOVIES = 'Movies',
  CUSTOM = 'Custom'
}

export interface GameHobby extends BaseHobby {
  type: HobbyType.GAMES;
  items: GameItem[];
}

export interface BookHobby extends BaseHobby {
  type: HobbyType.BOOKS;
  items: BookItem[];
}

export interface MovieHobby extends BaseHobby {
  type: HobbyType.MOVIES;
  items: MovieItem[];
}

export interface CustomHobby extends BaseHobby {
  type: HobbyType.CUSTOM;
  items: CustomItem[];
}

export type Hobby = GameHobby | BookHobby | MovieHobby | CustomHobby;

// Game item structure (similar to existing Game interface)
export interface GameItem {
  id: string;
  title: string;
  platform: string;
  status: GameStatus;
  timeToBeat?: number; // hours
  hoursPlayed?: number;
  dateAdded: string;
  dateCompleted?: string;
  thumbnail?: string;
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
}

export enum BookStatus {
  WANT_TO_READ = 'Want to Read',
  READING = 'Currently Reading',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped'
}

// Movie item structure
export interface MovieItem {
  id: string;
  title: string;
  director?: string;
  status: MovieStatus;
  rating?: number; // 1-5 stars
  dateAdded: string;
  dateWatched?: string;
  thumbnail?: string;
}

export enum MovieStatus {
  WANT_TO_WATCH = 'Want to Watch',
  WATCHED = 'Watched'
}

// Custom item structure (minimal)
export interface CustomItem {
  id: string;
  name: string;
  dateAdded: string;
  thumbnail?: string;
}