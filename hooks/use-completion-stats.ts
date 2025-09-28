import { BookStatus, GameStatus, HobbyType, MovieStatus } from '@/data/hobby';
import { useHobbyStorage } from './use-hobby-storage';

export interface CompletionStats {
  gamesCompleted: number;
  booksRead: number;
  moviesWatched: number;
}

export const useCompletionStats = () => {
  const { hobbies } = useHobbyStorage();

  const getCompletionStats = (): CompletionStats => {
    let gamesCompleted = 0;
    let booksRead = 0;
    let moviesWatched = 0;

    hobbies.forEach((hobby) => {
      switch (hobby.type) {
        case HobbyType.GAMES:
          gamesCompleted += hobby.items.filter(
            (item: any) => item.status === GameStatus.COMPLETED
          ).length;
          break;

        case HobbyType.BOOKS:
          booksRead += hobby.items.filter(
            (item: any) => item.status === BookStatus.COMPLETED
          ).length;
          break;

        case HobbyType.MOVIES:
          moviesWatched += hobby.items.filter(
            (item: any) => item.status === MovieStatus.WATCHED
          ).length;
          break;

        // Custom items don't have status, so we don't count them
        case HobbyType.CUSTOM:
        default:
          break;
      }
    });

    return {
      gamesCompleted,
      booksRead,
      moviesWatched,
    };
  };

  return {
    getCompletionStats,
  };
};