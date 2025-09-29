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
   * Creates a SINGLE CSV file with ONE header row and data rows for all hobby types
   * This ensures consistent format for both export and import parsing
   */
  private static generateComprehensiveCSV(hobbies: Hobby[], options: ExportOptions): string {
    console.log('🎯 Generating comprehensive CSV with single global header - NO multiple sections!');
    
    // Single global header that works for all data types
    const headers = [
      'Hobby Name',
      'Hobby Type',  // This will always use the enum value (Games, Books, TV/Film, Custom)
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
    console.log('📋 CSV Headers:', headers);

    hobbies.forEach(hobby => {
      console.log(`🎮 Processing hobby: ${hobby.name} (${hobby.type}) with ${hobby.items?.length || 0} items`);
      if (hobby.items && hobby.items.length > 0) {
        hobby.items.forEach(item => {
          const row = this.generateItemRow(hobby, item);
          rows.push(row);
        });
      } else {
        // Hobby with no items - add empty row
        console.log(`📝 Adding empty row for hobby: ${hobby.name}`);
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

    console.log(`✅ Generated CSV with ${rows.length} rows (including header)`);

    // Validate the CSV structure
    const dataRows = rows.slice(1); // Skip header
    const hobbyTypes = new Set(dataRows.map(row => row[1])); // Column 1 is Hobby Type
    console.log('🎯 Hobby types in export:', Array.from(hobbyTypes));
    
    const csvContent = this.arrayToCSV(rows);
    console.log('📤 CSV sample (first 300 chars):', csvContent.substring(0, 300));
    console.log('🔍 Header validation:', csvContent.split('\n')[0]);
    
    return csvContent;
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
        'Import Data - iOS Limitation',
        'Due to iOS Alert limitations, paste your CSV data below.\n\nNote: If this fails, try importing smaller sections or contact support for alternative methods.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => reject(new Error('Import cancelled'))
          },
          {
            text: 'Try Import',
            onPress: (csvText?: string) => {
              try {
                console.log('🔍 Import started with text length:', csvText?.length || 0);
                
                if (!csvText || csvText.trim() === '') {
                  throw new Error('No CSV data provided - the text input was empty');
                }
                
                const cleanedText = csvText.trim();
                console.log('📝 Cleaned CSV length:', cleanedText.length);
                console.log('📝 First 200 characters:', cleanedText.substring(0, 200));
                console.log('📝 Contains newlines:', cleanedText.includes('\n'));
                console.log('📝 Contains carriage returns:', cleanedText.includes('\r'));
                
                // Check if this looks like a flattened CSV (common iOS issue)
                if (!cleanedText.includes('\n') && !cleanedText.includes('\r') && cleanedText.length > 300) {
                  throw new Error('Import failed: iOS Alert.prompt does not handle multi-line CSV properly. The CSV data appears to have been flattened into a single line.\n\nWorkaround options:\n1. Try importing smaller sections (one hobby at a time)\n2. Contact support for alternative import methods\n3. Manually re-enter your data\n\nThis is a known iOS limitation with text input fields.');
                }
                
                const hobbies = this.parseCSVToHobbies(cleanedText);
                console.log('✅ Parsed hobbies count:', hobbies.length);
                resolve(hobbies);
              } catch (error) {
                console.error('❌ Import error details:', error);
                console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
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
    console.log('🔄 Starting CSV parse...');
    console.log('📝 Raw CSV length:', csvText.length);
    console.log('📝 First 100 chars:', csvText.substring(0, 100));
    
    // First try normal line splitting
    let lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    console.log('📄 Normal split - Total lines found:', lines.length);
    
    // If we only have 1 line but it's long, it might be a single-line CSV with spaces instead of newlines
    if (lines.length === 1 && lines[0].length > 200) {
      console.log('🔧 Detected single-line CSV, attempting to split by header pattern...');
      
      // Look for patterns that indicate row boundaries in single-line CSV
      // Look for the header pattern followed by data patterns
      const singleLine = lines[0];
      
      // Try to find where the header ends and data begins
      // Pattern: after "Has Thumbnail" should come the first data row
      const headerEndPattern = /Has Thumbnail\s+/;
      const match = singleLine.match(headerEndPattern);
      
      if (match) {
        const headerEnd = match.index! + match[0].length;
        const header = singleLine.substring(0, headerEnd).trim();
        const dataSection = singleLine.substring(headerEnd).trim();
        
        console.log('📋 Extracted header:', header.substring(0, 100));
        console.log('� Extracted data section:', dataSection.substring(0, 100));
        
        // Split data section by hobby type patterns (Books,Books or Games,Games, etc.)
        const dataRows = this.splitDataSection(dataSection);
        
        lines = [header, ...dataRows];
        console.log('🔧 Reconstructed lines:', lines.length);
      }
    }
    
    console.log('📄 Final lines:', lines.map((line, i) => `${i}: ${line.substring(0, 50)}...`));
    
    if (lines.length < 1) {
      throw new Error('CSV appears to be empty');
    }
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row. Found only ' + lines.length + ' line(s). This might be due to iOS Alert.prompt not preserving newlines. Try copying smaller sections of your CSV data.');
    }

    const headers = this.parseCSVRow(lines[0]);
    console.log('📋 Headers found:', headers);
    const hobbyMap = new Map<string, Hobby>();

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      console.log(`🔍 Processing row ${i + 1}:`, lines[i]);
      const row = this.parseCSVRow(lines[i]);
      console.log(`📊 Parsed row ${i + 1}:`, row);
      
      if (row.length !== headers.length) {
        console.warn(`⚠️ Row ${i + 1} has ${row.length} columns, expected ${headers.length}. Skipping.`);
        continue;
      }

      try {
        const hobbyData = this.createHobbyFromCSVRow(headers, row);
        console.log(`🎯 Hobby data for row ${i + 1}:`, hobbyData);
        
        if (hobbyData) {
          const { hobbyKey, hobby, item } = hobbyData;
          
          if (!hobbyMap.has(hobbyKey)) {
            console.log(`➕ Adding new hobby: ${hobbyKey}`);
            hobbyMap.set(hobbyKey, hobby);
          }
          
          if (item) {
            const existingHobby = hobbyMap.get(hobbyKey)!;
            if (!existingHobby.items) {
              existingHobby.items = [];
            }
            console.log(`📎 Adding item to ${hobbyKey}:`, item.title || item.name);
            existingHobby.items.push(item);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing row ${i + 1}:`, error);
        throw new Error(`Failed to process row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const result = Array.from(hobbyMap.values());
    const totalItems = result.reduce((sum, hobby) => sum + (hobby.items?.length || 0), 0);
    
    console.log(`✅ Successfully parsed ${result.length} hobbies with ${totalItems} total items`);
    
    // Create import summary
    const summary = result.map(hobby => 
      `${hobby.name} (${hobby.type}): ${hobby.items?.length || 0} items`
    ).join('\n');
    console.log('📋 Import Summary:\n' + summary);
    console.log('🎉 Import complete!');
    
    return result;
  }

  /**
   * Parse a single CSV row, handling quoted values
   */
  private static parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    // Handle empty rows
    if (!row || row.trim() === '') {
      return [];
    }

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
    
    console.log(`🔍 Parsed row into ${result.length} fields:`, result);
    return result;
  }

  /**
   * Split a data section that has been flattened into a single line
   */
  private static splitDataSection(dataSection: string): string[] {
    const rows: string[] = [];
    
    // Look for hobby patterns from your specific CSV:
    // Books,Books,2025-09-28T22:59:44.474Z
    // TV/Film,TV/Film,2025-09-28T22:59:47.840Z  
    // Video Games,Games,2025-09-28T23:02:29.013Z
    // Painting,Custom,2025-09-28T23:02:41.768Z
    
    // More specific pattern matching known hobby types
    const patterns = [
      /Books,Books,\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\./g,
      /TV\/Film,TV\/Film,\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\./g,
      /Video Games,Games,\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\./g,
      /[^,]+,Custom,\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\./g
    ];
    
    const matches: Array<{index: number, match: string}> = [];
    
    // Find all pattern matches
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(dataSection)) !== null) {
        matches.push({index: match.index, match: match[0]});
      }
    });
    
    // Sort matches by position
    matches.sort((a, b) => a.index - b.index);
    
    console.log('🔍 Found hobby patterns:', matches.length);
    
    if (matches.length === 0) {
      // Fallback: try to split by common hobby names
      const hobbyNames = ['Books', 'TV/Film', 'Video Games', 'Games', 'Custom'];
      for (const name of hobbyNames) {
        const parts = dataSection.split(name + ',' + name + ',');
        if (parts.length > 1) {
          console.log(`🔧 Split by ${name} pattern:`, parts.length);
          // Reconstruct the rows
          for (let i = 1; i < parts.length; i++) {
            rows.push(name + ',' + name + ',' + parts[i].split(' ' + hobbyNames.find(n => parts[i].includes(n + ',' + n + ',')) || '')[0]);
          }
          break;
        }
      }
    } else {
      // Use pattern matches to split
      let lastIndex = 0;
      matches.forEach((match, i) => {
        if (i > 0) {
          const rowData = dataSection.substring(lastIndex, match.index).trim();
          if (rowData) rows.push(rowData);
        }
        lastIndex = match.index;
      });
      
      // Add the last row
      const lastRow = dataSection.substring(lastIndex).trim();
      if (lastRow) rows.push(lastRow);
    }
    
    console.log('🔧 Split data into rows:', rows.length);
    rows.forEach((row, i) => console.log(`Row ${i}:`, row.substring(0, 100)));
    
    return rows;
  }

  /**
   * Map display names to HobbyType enum values
   */
  private static mapToHobbyType(typeString: string): HobbyType | null {
    const typeMap: Record<string, HobbyType> = {
      'Games': HobbyType.GAMES,
      'Video Games': HobbyType.GAMES,
      'Gaming': HobbyType.GAMES,
      'Books': HobbyType.BOOKS,
      'Reading': HobbyType.BOOKS,
      'TV/Film': HobbyType.TV_FILM,
      'Movies': HobbyType.TV_FILM,
      'Television': HobbyType.TV_FILM,
      'Custom': HobbyType.CUSTOM
    };
    
    return typeMap[typeString] || null;
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
    const rawHobbyType = data['Hobby Type'];
    const hobbyType = this.mapToHobbyType(rawHobbyType);
    const hobbyDateStarted = data['Hobby Date Started'];

    console.log(`🔍 Processing hobby: name="${hobbyName}", rawType="${rawHobbyType}", mappedType="${hobbyType}"`);

    // Skip completely empty rows
    if (!hobbyName && !rawHobbyType) {
      console.log('⏭️ Skipping empty row');
      return null;
    }

    if (!hobbyName || !hobbyType) {
      console.warn(`❌ Invalid hobby data: name="${hobbyName}", type="${rawHobbyType}" (mapped to ${hobbyType})`);
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