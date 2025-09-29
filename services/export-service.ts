import { BookItem, CustomItem, GameItem, Hobby, HobbyType, TvFilmItem } from '@/data/hobby';
import { Alert, Share } from 'react-native';

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
   * Share CSV content - creates a single CSV file with timestamp filename
   */
  static async shareCSV(filename: string, content: string): Promise<void> {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const csvFilename = `${timestamp}.csv`; // Simple timestamp filename
    
    try {
      console.log('Sharing CSV content...');
      
      // Use simple Share API - iOS will recognize the CSV content and suggest proper filename
      await Share.share({
        message: content,
        title: csvFilename, // This suggests the filename to iOS
      });
      
      console.log('CSV shared successfully');
      
    } catch (error) {
      console.error('Error sharing CSV:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to share CSV: ${errorMessage}`);
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

  /**
   * Import CSV data and convert to hobbies
   */
  static async importFromCSV(): Promise<Hobby[]> {
    return new Promise((resolve, reject) => {
      Alert.prompt(
        'Import Hobby Data',
        'Paste your CSV data here:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => reject(new Error('Import cancelled'))
          },
          {
            text: 'Import',
            onPress: (csvText?: string) => {
              try {
                if (!csvText || csvText.trim() === '') {
                  throw new Error('No CSV data provided');
                }
                const hobbies = this.parseCSVToHobbies(csvText.trim());
                resolve(hobbies);
              } catch (error) {
                reject(error);
              }
            }
          }
        ],
        'plain-text'
      );
    });
  }

  /**
   * Parse CSV text and convert to hobby objects
   */
  private static parseCSVToHobbies(csvText: string): Hobby[] {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }

    const headers = this.parseCSVRow(lines[0]);
    const hobbyMap = new Map<string, Hobby>();

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVRow(lines[i]);
      
      if (row.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${row.length} columns, expected ${headers.length}. Skipping.`);
        continue;
      }

      try {
        const hobbyData = this.createHobbyFromCSVRow(headers, row);
        if (hobbyData) {
          const { hobbyKey, hobby, item } = hobbyData;
          
          if (!hobbyMap.has(hobbyKey)) {
            hobbyMap.set(hobbyKey, hobby);
          }
          
          if (item) {
            const existingHobby = hobbyMap.get(hobbyKey)!;
            if (!existingHobby.items) {
              existingHobby.items = [];
            }
            existingHobby.items.push(item);
          }
        }
      } catch (error) {
        console.warn(`Error processing row ${i + 1}:`, error);
      }
    }

    return Array.from(hobbyMap.values());
  }

  /**
   * Parse a single CSV row, handling quoted values
   */
  private static parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < row.length) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  }

  /**
   * Create hobby and item from CSV row data
   */
  private static createHobbyFromCSVRow(headers: string[], row: string[]): {
    hobbyKey: string;
    hobby: Hobby;
    item?: any;
  } | null {
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      data[header] = row[index] || '';
    });

    const hobbyName = data['Hobby Name'];
    const hobbyType = data['Hobby Type'] as HobbyType;
    const hobbyDateStarted = data['Hobby Date Started'];

    if (!hobbyName || !hobbyType) {
      return null;
    }

    const hobbyKey = `${hobbyName}-${hobbyType}`;
    const hobby: Hobby = {
      id: this.generateId(),
      name: hobbyName,
      type: hobbyType,
      dateStarted: hobbyDateStarted,
      items: []
    };

    // Create item if there's item data
    const itemTitle = data['Item Title/Name'];
    if (itemTitle) {
      const itemId = data['Item ID'] || this.generateId();
      const item = this.createItemFromCSVData(hobbyType, itemId, data);
      return { hobbyKey, hobby, item };
    }

    return { hobbyKey, hobby };
  }

  /**
   * Create specific item type from CSV data
   */
  private static createItemFromCSVData(hobbyType: HobbyType, itemId: string, data: Record<string, string>): any {
    const baseItem = {
      id: itemId,
      dateAdded: data['Date Added'] || new Date().toISOString().split('T')[0],
      tags: data['Tags'] ? data['Tags'].split(';').map(tag => tag.trim()).filter(tag => tag) : [],
      thumbnail: data['Has Thumbnail'] === 'Yes' ? 'placeholder' : undefined
    };

    switch (hobbyType) {
      case HobbyType.GAMES:
        return {
          ...baseItem,
          title: data['Item Title/Name'],
          platform: data['Platform/Author/Director'],
          status: data['Item Status'] || 'Not Started',
          timeToBeat: data['Progress Info'] ? this.extractTimeFromProgress(data['Progress Info']) : undefined,
          hoursPlayed: data['Progress Info'] ? this.extractHoursPlayedFromProgress(data['Progress Info']) : undefined,
          dateCompleted: data['Date Completed/Watched'] || undefined
        } as GameItem;

      case HobbyType.BOOKS:
        return {
          ...baseItem,
          title: data['Item Title/Name'],
          author: data['Platform/Author/Director'],
          status: data['Item Status'] || 'Not Started',
          totalPages: data['Progress Info'] ? this.extractTotalFromProgress(data['Progress Info']) : undefined,
          pagesRead: data['Progress Info'] ? this.extractReadFromProgress(data['Progress Info']) : undefined,
          dateCompleted: data['Date Completed/Watched'] || undefined
        } as BookItem;

      case HobbyType.TV_FILM:
        return {
          ...baseItem,
          title: data['Item Title/Name'],
          director: data['Platform/Author/Director'],
          status: data['Item Status'] || 'Not Started',
          rating: data['Rating/Stars'] ? parseInt(data['Rating/Stars']) : undefined,
          currentSeason: data['Progress Info'] ? data['Progress Info'].replace('Season ', '') : undefined,
          dateWatched: data['Date Completed/Watched'] || undefined
        } as TvFilmItem;

      case HobbyType.CUSTOM:
        return {
          ...baseItem,
          name: data['Item Title/Name']
        } as CustomItem;

      default:
        return {
          ...baseItem,
          name: data['Item Title/Name']
        };
    }
  }

  /**
   * Helper methods to extract progress info
   */
  private static extractTimeFromProgress(progress: string): number | undefined {
    const match = progress.match(/(\d+)\/(\d+|\?)\s*hrs/);
    return match ? parseInt(match[2] === '?' ? match[1] : match[2]) : undefined;
  }

  private static extractHoursPlayedFromProgress(progress: string): number | undefined {
    const match = progress.match(/(\d+)\/(\d+|\?)\s*hrs/);
    return match ? parseInt(match[1]) : undefined;
  }

  private static extractTotalFromProgress(progress: string): number | undefined {
    const match = progress.match(/(\d+)\/(\d+|\?)\s*pages/);
    return match ? parseInt(match[2] === '?' ? match[1] : match[2]) : undefined;
  }

  private static extractReadFromProgress(progress: string): number | undefined {
    const match = progress.match(/(\d+)\/(\d+|\?)\s*pages/);
    return match ? parseInt(match[1]) : undefined;
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}