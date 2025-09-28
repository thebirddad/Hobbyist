// Simple game validation service
export interface GameValidation {
  isValid: boolean;
  errors: string[];
}

export class GameService {
  static validateGame(gameData: {
    title: string;
    platform: string;
    status: string;
    timeToBeat?: number;
    hoursPlayed?: number;
    rating?: number;
  }): GameValidation {
    const errors: string[] = [];

    // Validate title
    if (!gameData.title || gameData.title.trim().length === 0) {
      errors.push('Game title is required');
    }

    // Validate platform
    if (!gameData.platform || gameData.platform.trim().length === 0) {
      errors.push('Platform is required');
    }

    // Validate status
    if (!gameData.status || gameData.status.trim().length === 0) {
      errors.push('Status is required');
    }

    // Validate time to beat (optional, but must be positive if provided)
    if (gameData.timeToBeat !== undefined) {
      if (isNaN(gameData.timeToBeat) || gameData.timeToBeat < 0) {
        errors.push('Time to beat must be a positive number');
      }
    }

    // Validate hours played (optional, but must be positive if provided)
    if (gameData.hoursPlayed !== undefined) {
      if (isNaN(gameData.hoursPlayed) || gameData.hoursPlayed < 0) {
        errors.push('Hours played must be a positive number');
      }
    }

    // Validate rating (optional, but must be between 1-10 if provided)
    if (gameData.rating !== undefined) {
      if (isNaN(gameData.rating) || gameData.rating < 1 || gameData.rating > 10) {
        errors.push('Rating must be between 1 and 10');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}