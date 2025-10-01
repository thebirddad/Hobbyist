export enum HobbyType {
  GAMES = 'Games',
  BOOKS = 'Books',
  TV_FILM = 'TV/Film',
  CUSTOM = 'Custom',
  CARDS = 'Cards',
}
export type Hobby = GameHobby | BookHobby | TvFilmHobby | CustomHobby | CardHobby;

export interface BaseHobby {
  id: string;
  name: string;
  dateStarted: string;
  type: HobbyType;
}

export interface ItemBase {
  id: string;
  title: string;
  dateAdded: string;
  dateCompleted?: string;
  thumbnail?: string;
  tags?: string[];
  collapsed?: boolean;
}

export interface GameHobby extends BaseHobby {
  type: HobbyType.GAMES;
  items: Game[];
}

//HOBBY INTERFACES==============================================
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

export interface CardHobby extends BaseHobby {
  type: HobbyType.CARDS;
  items: CardItem[];
}

//STATUS ENUMS==============================================
export enum GameStatus {
  WANT_TO_PLAY = 'Want to Play',
  PLAYING = 'Currently Playing',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped'
}

export enum BookStatus {
  WANT_TO_READ = 'Want to Read',
  READING = 'Currently Reading',
  COMPLETED = 'Completed',
}

export enum BookFormat {
  HARDCOVER = 'Hardcover',
  PAPERBACK = 'Paperback',
  EBOOK = 'eBook',
  AUDIOBOOK = 'Audiobook'
}

export enum BookGenre {
  FICTION = 'Fiction',
  NON_FICTION = 'Non-Fiction',
  MYSTERY = 'Mystery',
  FANTASY = 'Fantasy',
  SCIENCE_FICTION = 'Science Fiction',
  BIOGRAPHY = 'Biography',
  HISTORY = 'History',
  ROMANCE = 'Romance',
  THRILLER = 'Thriller',
  SELF_HELP = 'Self-Help',
  OTHER = 'Other',
}

export enum TvFilmStatus {
  WANT_TO_WATCH = 'Want to Watch',
  WATCHED = 'Watched',
  WATCHING = 'Currently Watching',
}

export enum CardStatus {
  OWNED = 'Owned',
  WISHLIST = 'Wishlist',
}

//ITEM ENUMS==============================================
export enum CardType {
  FOIL = 'Foil',
  NON_FOIL = 'Non-Foil',
  PROMO = 'Promo',
  ALTERNATE_ART = 'Alternate Art',
  SIGNED = 'Signed',
  OTHER = 'Other',
}

export interface Game extends ItemBase {
  platform: string;
  status: GameStatus;
  timeToBeat?: number;
  hoursPlayed?: number;
  rating?: number;
}

export interface BookItem extends ItemBase {
  author?: string;
  status: BookStatus;
  totalPages?: number;
  pagesRead?: number;
  rating?: number; // 1-5 stars
  genre?: string;
  format?: BookFormat;
}

export interface TvFilmItem extends ItemBase {
  director?: string;
  status: TvFilmStatus;
  rating?: number; // 1-5 stars
  currentSeason?: string; // For TV shows
  dateAdded: string;
  dateWatched?: string;
  rottenTomatoes?: boolean;
  rottenValue?: string;
  releaseYear?: string;
  runTime?: string;
  plot?: string;
  imdbRating?: string;
}

export interface CustomItem extends ItemBase {
  name: string;
}

export interface CardItem extends ItemBase {
  // Basic identity
  cardName: string;               // "Subway Train"
  typeLine: string;               // "Artifact — Vehicle"
  manaCost?: string;              // "{2}"
  cmc?: number;                   // 2
  oracleText?: string;            // Rules text
  keywords?: string[];            // ["Crew"]
  power?: string;                 // "3"
  toughness?: string;             // "1"
  rarity?: string;                // "common"

  // Set info
  setName: string;                // "Marvel's Spider-Man"
  setCode: string;                // "spm"
  collectorNumber: string;        // "178"
  releasedAt?: string;            // "2025-09-26"

  // Card state
  foil?: boolean;                 // true
  nonfoil?: boolean;              // true
  digital?: boolean;              // false
  promo?: boolean;                // false
  fullArt?: boolean;              // false

  // Artist / art
  artist?: string;                // "Jonas De Ro"
  artistId?: string;              // single artist id if needed
  illustrationId?: string;        // id of illustration
  imageUris?: {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    artCrop?: string;
    borderCrop?: string;
  };

  // Legalities
  legalities?: Record<string, "legal" | "not_legal" | "restricted" | "banned">;

  // Market info
  pricePaid?: number;
  currentValue?: number;
  prices?: {
    usd?: string | null;
    usdFoil?: string | null;
    eur?: string | null;
    eurFoil?: string | null;
    tix?: string | null;
  };

  // Game / card state
  status: CardStatus;
  type: CardType;
  condition: string;              // e.g., "Near Mint", "Lightly Played"
  quantity: number;

  // Optional references
  scryfallUri?: string;
  purchaseUris?: {
    tcgplayer?: string;
    cardmarket?: string;
    cardhoarder?: string;
  };
  relatedUris?: {
    edhrec?: string;
    tcgplayerArticles?: string;
    tcgplayerDecks?: string;
  };
}


