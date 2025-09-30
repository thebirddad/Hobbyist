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

export interface BaseHobby {
  id: string;
  title: string;
  dateAdded: string;
  dateCompleted?: string;
  thumbnail?: string; 
  tags?: string[];
  collapsed?: boolean; 
}

export enum GameStatus {
  WANT_TO_PLAY = 'Want to Play',
  PLAYING = 'Currently Playing',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped'
}

export interface Game extends BaseHobby {
  platform: string;
  status: GameStatus;
  timeToBeat?: number; 
  hoursPlayed?: number;
  rating?: number; 
}

export enum BookFormat {
  HARDCOVER = 'Hardcover',
  PAPERBACK = 'Paperback',
  EBOOK = 'eBook',
  AUDIOBOOK = 'Audiobook'
}

export enum BookStatus {
  WANT_TO_READ = 'Want to Read',
  READING = 'Currently Reading',
  COMPLETED = 'Completed',
}

export interface BookItem extends BaseHobby{
  author?: string;
  status: BookStatus;
  totalPages?: number;
  pagesRead?: number;
  rating?: number; // 1-5 stars
  genre?: string;
  format?: BookFormat;
}

export enum TvFilmStatus {
  WANT_TO_WATCH = 'Want to Watch',
  WATCHED = 'Watched',
  WATCHING = 'Currently Watching',
}

export interface TvFilmItem extends BaseHobby {
  director?: string;
  status: TvFilmStatus;
  rating?: number; // 1-5 stars
  currentSeason?: string; // For TV shows
  dateAdded: string;
  dateWatched?: string;
}

export interface CustomItem extends BaseHobby{
  name: string;
}

export enum CardStatus {
  OWNED = 'Owned',
  WISHLIST = 'Wishlist',
}

export enum CardType {
  FOIL = 'Foil',
  NON_FOIL = 'Non-Foil',
  PROMO = 'Promo',
  ALTERNATE_ART = 'Alternate Art',
  SIGNED = 'Signed',
  OTHER = 'Other',
}

export interface CardItem extends BaseHobby {
  cardName: string;
  setName: string;
  collectorNumber: string;
  condition: string; // e.g., Near Mint, Lightly Played
  status: CardStatus;
  type: CardType;
  quantity: number;
  pricePaid?: number; // Price paid per card
  currentValue?: number; // Current market value per card
}