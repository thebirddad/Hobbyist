import { Hobby } from '@/data/hobby';
import { Alert } from 'react-native';

/**
 * Alternative CSV export using a simpler approach without FileSystem
 */
export class SimpleExportService {
  
  /**
   * Export CSV content as text that can be copied
   */
  static async exportAsText(hobbies: Hobby[]): Promise<void> {
    try {
      const csvContent = this.generateSimpleCSV(hobbies);
      
      // Show the CSV content in an alert that can be copied
      Alert.alert(
        'Export Data - Copy CSV',
        'Your CSV data is ready. You can copy this text and paste it into a spreadsheet app or text editor.',
        [
          {
            text: 'Show CSV',
            onPress: () => {
              Alert.alert(
                'CSV Data',
                csvContent.length > 1000 
                  ? csvContent.substring(0, 1000) + '...\n\n(Data truncated for display)'
                  : csvContent,
                [
                  { text: 'OK' }
                ]
              );
            }
          },
          { text: 'Cancel' }
        ]
      );
      
    } catch (error) {
      console.error('Error in simple export:', error);
      throw error;
    }
  }

  /**
   * Generate a simple CSV with basic hobby information
   */
  private static generateSimpleCSV(hobbies: Hobby[]): string {
    const headers = ['Hobby Name', 'Type', 'Date Started', 'Total Items', 'Item Names'];
    const rows: string[][] = [headers];

    hobbies.forEach(hobby => {
      const itemNames = hobby.items?.map(item => {
        // Get the name/title based on item type
        if ('title' in item) return item.title;
        if ('name' in item) return item.name;
        return 'Unknown Item';
      }).join('; ') || '';

      rows.push([
        hobby.name,
        hobby.type,
        hobby.dateStarted,
        (hobby.items?.length || 0).toString(),
        itemNames
      ]);
    });

    return this.arrayToCSV(rows);
  }

  /**
   * Convert 2D array to CSV string
   */
  private static arrayToCSV(data: string[][]): string {
    return data.map(row => 
      row.map(cell => {
        const cellStr = cell?.toString() || '';
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  }
}