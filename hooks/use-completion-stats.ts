import { BookStatus, GameStatus, HobbyType, TvFilmStatus } from '@/data/hobby';
import { useEffect, useState } from 'react';
import { useHobbyStorage } from './use-hobby-storage';

export interface CompletionStats {
  gamesCompleted: number;
  booksRead: number;
  moviesWatched: number;
  gamesInProgress: number;
  booksInProgress: number;
  totalHobbies: number;
}

export const useCompletionStats = () => {
  const { hobbies } = useHobbyStorage();
  const [stats, setStats] = useState<CompletionStats>({
    gamesCompleted: 0,
    booksRead: 0,
    moviesWatched: 0,
    gamesInProgress: 0,
    booksInProgress: 0,
    totalHobbies: 0,
  });

  const calculateStats = (): CompletionStats => {
    let gamesCompleted = 0;
    let booksRead = 0;
    let moviesWatched = 0;
    let gamesInProgress = 0;
    let booksInProgress = 0;

    hobbies.forEach((hobby) => {
      switch (hobby.type) {
        case HobbyType.GAMES:
          gamesCompleted += hobby.items.filter(
            (item: any) => item.status === GameStatus.COMPLETED
          ).length;
          gamesInProgress += hobby.items.filter(
            (item: any) => item.status === GameStatus.PLAYING
          ).length;
          break;

        case HobbyType.BOOKS:
          booksRead += hobby.items.filter(
            (item: any) => item.status === BookStatus.COMPLETED
          ).length;
          booksInProgress += hobby.items.filter(
            (item: any) => item.status === BookStatus.READING
          ).length;
          break;

        case HobbyType.TV_FILM:
          moviesWatched += hobby.items.filter(
            (item: any) => item.status === TvFilmStatus.WATCHED
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
      gamesInProgress,
      booksInProgress,
      totalHobbies: hobbies.length,
    };
  };

  useEffect(() => {
    const newStats = calculateStats();
    setStats(newStats);
  }, [hobbies]);

  return {
    stats,
  };
};