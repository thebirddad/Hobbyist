import { BookItem, CustomItem, GameItem, Hobby, HobbyType, TvFilmItem } from '@/data/hobby';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface ExportOptions {
  includeHobbyInfo: boolean;
  includeItems: boolean;
  flattenData: boolean; // true = all data in one CSV, false = separate CSVs
}

export class HobbyExportService {
  
  /**
   * Export all hobby data to CSV format and share
   */
  static async exportAndShareCSV(
    hobbies: Hobby[], 
    options: ExportOptions = {
      includeHobbyInfo: true,
      includeItems: true,
      flattenData: true
    }
  ): Promise<void> {
    let csvContent: string;
    let filename: string;

    if (options.flattenData) {
      // Single comprehensive CSV with all data
      csvContent = this.generateComprehensiveCSV(hobbies, options);
      filename = 'hobbyist_complete_export.csv';
    } else {
      // For now, just do hobby summary if not flattened
      csvContent = this.generateHobbySummaryCSV(hobbies);
      filename = 'hobbyist_hobbies_summary.csv';
    }

    await this.shareCSV(filename, csvContent);
  }

  /**
   * Generate comprehensive CSV with all data flattened
   */
  private static generateComprehensiveCSV(hobbies: Hobby[], options: ExportOptions): string {
    const headers = [
      'Hobby Name',
      'Hobby Type', 
      'Hobby Date Started',
      'Item ID',
      'Item Title/Name',
      'Item Status',
      'Date Added',
      'Date Completed/Watched',
      'Platform/Author/Director',
      'Progress Info',
      'Rating/Stars',
      'Tags',
      'Has Thumbnail'
    ];

    const rows: string[][] = [headers];

    hobbies.forEach(hobby => {
      if (hobby.items && hobby.items.length > 0) {
        hobby.items.forEach(item => {
          const row = this.generateItemRow(hobby, item);
          rows.push(row);
        });
      } else {
        // Hobby with no items
        rows.push([
          hobby.name,
          hobby.type,
          hobby.dateStarted,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ''
        ]);
      }
    });

    return this.arrayToCSV(rows);
  }

  /**
   * Generate hobby summary CSV
   */
  private static generateHobbySummaryCSV(hobbies: Hobby[]): string {
    const headers = ['Name', 'Type', 'Date Started', 'Total Items', 'Completed Items'];
    const rows: string[][] = [headers];

    hobbies.forEach(hobby => {
      const totalItems = hobby.items?.length || 0;
      const completedItems = hobby.items?.filter(item => {
        return this.isItemCompleted(item);
      }).length || 0;

      rows.push([
        hobby.name,
        hobby.type,
        hobby.dateStarted,
        totalItems.toString(),
        completedItems.toString()
      ]);
    });

    return this.arrayToCSV(rows);
  }

  /**
   * Generate Games CSV
   */
  private static generateGamesCSV(gameHobbies: Hobby[]): string {
    const headers = [
      'Hobby Name',
      'Game Title',
      'Platform',
      'Status',
      'Time to Beat (hrs)',
      'Hours Played',
      'Date Added',
      'Date Completed',
      'Tags'
    ];

    const rows: string[][] = [headers];

    gameHobbies.forEach(hobby => {
      hobby.items.forEach(item => {
        const game = item as GameItem;
        rows.push([
          hobby.name,
          game.title,
          game.platform || '',
          game.status,
          game.timeToBeat?.toString() || '',
          game.hoursPlayed?.toString() || '',
          game.dateAdded,
          game.dateCompleted || '',
          game.tags?.join('; ') || ''
        ]);
      });
    });

    return this.arrayToCSV(rows);
  }

  /**
   * Generate Books CSV
   */
  private static generateBooksCSV(bookHobbies: Hobby[]): string {
    const headers = [
      'Hobby Name',
      'Book Title',
      'Author',
      'Status',
      'Total Pages',
      'Pages Read',
      'Date Added',
      'Date Completed',
      'Tags'
    ];

    const rows: string[][] = [headers];

    bookHobbies.forEach(hobby => {
      hobby.items.forEach(item => {
        const book = item as BookItem;
        rows.push([
          hobby.name,
          book.title,
          book.author || '',
          book.status,
          book.totalPages?.toString() || '',
          book.pagesRead?.toString() || '',
          book.dateAdded,
          book.dateCompleted || '',
          book.tags?.join('; ') || ''
        ]);
      });
    });

    return this.arrayToCSV(rows);
  }

  /**
   * Generate TV/Film CSV
   */
  private static generateTvFilmCSV(tvFilmHobbies: Hobby[]): string {
    const headers = [
      'Hobby Name',
      'Title',
      'Director',
      'Status',
      'Rating (1-5)',
      'Current Season',
      'Date Added',
      'Date Watched',
      'Tags'
    ];

    const rows: string[][] = [headers];

    tvFilmHobbies.forEach(hobby => {
      hobby.items.forEach(item => {
        const tvFilm = item as TvFilmItem;
        rows.push([
          hobby.name,
          tvFilm.title,
          tvFilm.director || '',
          tvFilm.status,
          tvFilm.rating?.toString() || '',
          tvFilm.currentSeason || '',
          tvFilm.dateAdded,
          tvFilm.dateWatched || '',
          tvFilm.tags?.join('; ') || ''
        ]);
      });
    });

    return this.arrayToCSV(rows);
  }

  /**
   * Generate Custom CSV
   */
  private static generateCustomCSV(customHobbies: Hobby[]): string {
    const headers = [
      'Hobby Name',
      'Item Name',
      'Date Added',
      'Tags'
    ];

    const rows: string[][] = [headers];

    customHobbies.forEach(hobby => {
      hobby.items.forEach(item => {
        const custom = item as CustomItem;
        rows.push([
          hobby.name,
          custom.name,
          custom.dateAdded,
          custom.tags?.join('; ') || ''
        ]);
      });
    });

    return this.arrayToCSV(rows);
  }

  /**
   * Generate a row for any item type in the comprehensive CSV
   */
  private static generateItemRow(hobby: Hobby, item: any): string[] {
    let platformAuthorDirector = '';
    let progressInfo = '';
    let ratingStars = '';
    let title = '';
    let status = '';
    let dateCompleted = '';

    switch (hobby.type) {
      case HobbyType.GAMES:
        const game = item as GameItem;
        title = game.title;
        status = game.status;
        platformAuthorDirector = game.platform || '';
        progressInfo = game.hoursPlayed ? `${game.hoursPlayed}/${game.timeToBeat || '?'} hrs` : '';
        dateCompleted = game.dateCompleted || '';
        break;
      
      case HobbyType.BOOKS:
        const book = item as BookItem;
        title = book.title;
        status = book.status;
        platformAuthorDirector = book.author || '';
        progressInfo = book.pagesRead ? `${book.pagesRead}/${book.totalPages || '?'} pages` : '';
        dateCompleted = book.dateCompleted || '';
        break;
      
      case HobbyType.TV_FILM:
        const tvFilm = item as TvFilmItem;
        title = tvFilm.title;
        status = tvFilm.status;
        platformAuthorDirector = tvFilm.director || '';
        progressInfo = tvFilm.currentSeason ? `Season ${tvFilm.currentSeason}` : '';
        ratingStars = tvFilm.rating?.toString() || '';
        dateCompleted = tvFilm.dateWatched || '';
        break;
      
      case HobbyType.CUSTOM:
        const custom = item as CustomItem;
        title = custom.name;
        status = '';
        break;
    }

    return [
      hobby.name,
      hobby.type,
      hobby.dateStarted,
      item.id,
      title,
      status,
      item.dateAdded,
      dateCompleted,
      platformAuthorDirector,
      progressInfo,
      ratingStars,
      item.tags?.join('; ') || '',
      item.thumbnail ? 'Yes' : 'No'
    ];
  }

  /**
   * Check if an item is completed
   */
  private static isItemCompleted(item: any): boolean {
    const status = item.status?.toLowerCase();
    return status === 'completed' || status === 'watched';
  }

  /**
   * Convert 2D array to CSV string
   */
  private static arrayToCSV(data: string[][]): string {
    return data.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if necessary
        const cellStr = cell?.toString() || '';
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  }

  /**
   * Share CSV content by creating a temporary file
   */
  static async shareCSV(filename: string, content: string): Promise<void> {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const finalFilename = `${timestamp}_${filename}`;
    
    try {
      // Check directory availability with better error logging
      console.log('Cache directory:', (FileSystem as any).cacheDirectory);
      console.log('Document directory:', (FileSystem as any).documentDirectory);
      
      // Use cache directory first, then document directory
      let baseDir = (FileSystem as any).cacheDirectory;
      if (!baseDir) {
        baseDir = (FileSystem as any).documentDirectory;
        console.log('Falling back to document directory');
      }
      
      if (!baseDir) {
        throw new Error('No directory available for file creation - both cache and document directories are null');
      }
      
      const filePath = `${baseDir}${finalFilename}`;
      console.log('Creating file at:', filePath);
      
      // Write CSV content to temporary file
      await (FileSystem as any).writeAsStringAsync(filePath, content, {
        encoding: (FileSystem as any).EncodingType?.UTF8
      });
      console.log('File written successfully');
      
      // Verify file was created
      const fileInfo = await (FileSystem as any).getInfoAsync(filePath);
      if (!fileInfo.exists) {
        throw new Error('File was not created successfully');
      }
      console.log('File verified, size:', fileInfo.size);
      
      // Share the file - this will open iOS share sheet
      if (await Sharing.isAvailableAsync()) {
        console.log('Opening iOS share sheet...');
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: 'Save or Share Your Hobby Data',
          UTI: 'public.comma-separated-values-text' // iOS Universal Type Identifier for CSV
        });
        console.log('iOS share sheet completed');
      } else {
        throw new Error('Sharing is not available on this device');
      }
      
      // Clean up temporary file after a delay (optional)
      setTimeout(async () => {
        try {
          const currentFileInfo = await (FileSystem as any).getInfoAsync(filePath);
          if (currentFileInfo.exists) {
            await (FileSystem as any).deleteAsync(filePath);
            console.log('Temporary file cleaned up');
          }
        } catch (error) {
          console.log('Could not clean up temporary file:', error);
        }
      }, 10000); // Clean up after 10 seconds
      
    } catch (error) {
      console.error('Error sharing CSV:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create and share CSV file: ${errorMessage}`);
    }
  }

  /**
   * Get CSV content as string for direct sharing
   */
  static getCSVContent(hobbies: Hobby[], options: ExportOptions = {
    includeHobbyInfo: true,
    includeItems: true,
    flattenData: true
  }): string {
    if (options.flattenData) {
      return this.generateComprehensiveCSV(hobbies, options);
    } else {
      return this.generateHobbySummaryCSV(hobbies);
    }
  }

  /**
   * Get export statistics
   */
  static getExportStats(hobbies: Hobby[]): {
    totalHobbies: number;
    totalItems: number;
    itemsByType: Record<string, number>;
    completedItems: number;
  } {
    const totalHobbies = hobbies.length;
    const totalItems = hobbies.reduce((sum, hobby) => sum + (hobby.items?.length || 0), 0);
    const itemsByType: Record<string, number> = {};
    let completedItems = 0;

    hobbies.forEach(hobby => {
      itemsByType[hobby.type] = (itemsByType[hobby.type] || 0) + (hobby.items?.length || 0);
      completedItems += hobby.items?.filter(item => this.isItemCompleted(item)).length || 0;
    });

    return {
      totalHobbies,
      totalItems,
      itemsByType,
      completedItems
    };
  }
}