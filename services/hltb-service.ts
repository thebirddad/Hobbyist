// React Native compatible HowLongToBeat service
export interface HowLongToBeatEntry {
  id: string;
  name: string;
  imageUrl?: string;
  gameplayMain?: number;
  gameplayMainExtra?: number;
  gameplayCompletionist?: number;
  similarity?: number;
  searchTerm?: string;
}

export class HowLongToBeatService {
  private baseUrl = 'https://howlongtobeat.com/api';

  async search(query: string): Promise<HowLongToBeatEntry[]> {
    try {
      // For now, we'll create mock data since the actual HLTB API requires web scraping
      // In a production app, you'd either:
      // 1. Use a backend service that scrapes HLTB
      // 2. Use a third-party API service
      // 3. Create a proxy server
      
      // Mock data based on common games
      const mockResults = this.getMockResults(query.toLowerCase());
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockResults;
    } catch (error) {
      console.error('Failed to search HowLongToBeat:', error);
      return [];
    }
  }

  private getMockResults(query: string): HowLongToBeatEntry[] {
    const gameDatabase: { [key: string]: HowLongToBeatEntry[] } = {
      'elden': [
        {
          id: '68151',
          name: 'Elden Ring',
          gameplayMain: 58,
          gameplayMainExtra: 101,
          gameplayCompletionist: 139,
          imageUrl: 'https://howlongtobeat.com/gameimages/68151_Elden_Ring.jpg',
          similarity: 1,
          searchTerm: query,
        }
      ],
      'zelda': [
        {
          id: '38019',
          name: 'The Legend of Zelda: Breath of the Wild',
          gameplayMain: 50,
          gameplayMainExtra: 103,
          gameplayCompletionist: 184,
          similarity: 1,
          searchTerm: query,
        },
        {
          id: '72072',
          name: 'The Legend of Zelda: Tears of the Kingdom',
          gameplayMain: 59,
          gameplayMainExtra: 120,
          gameplayCompletionist: 236,
          similarity: 0.9,
          searchTerm: query,
        }
      ],
      'witcher': [
        {
          id: '10270',
          name: 'The Witcher 3: Wild Hunt',
          gameplayMain: 51,
          gameplayMainExtra: 103,
          gameplayCompletionist: 173,
          similarity: 1,
          searchTerm: query,
        }
      ],
      'cyberpunk': [
        {
          id: '2127',
          name: 'Cyberpunk 2077',
          gameplayMain: 25,
          gameplayMainExtra: 60,
          gameplayCompletionist: 101,
          similarity: 1,
          searchTerm: query,
        }
      ],
      'minecraft': [
        {
          id: '8904',
          name: 'Minecraft',
          gameplayMain: 11,
          gameplayMainExtra: 31,
          gameplayCompletionist: 102,
          similarity: 1,
          searchTerm: query,
        }
      ],
      'skyrim': [
        {
          id: '9859',
          name: 'The Elder Scrolls V: Skyrim',
          gameplayMain: 34,
          gameplayMainExtra: 107,
          gameplayCompletionist: 232,
          similarity: 1,
          searchTerm: query,
        }
      ],
      'god': [
        {
          id: '26784',
          name: 'God of War (2018)',
          gameplayMain: 21,
          gameplayMainExtra: 33,
          gameplayCompletionist: 51,
          similarity: 1,
          searchTerm: query,
        }
      ],
      'mario': [
        {
          id: '42681',
          name: 'Super Mario Odyssey',
          gameplayMain: 12,
          gameplayMainExtra: 62,
          gameplayCompletionist: 144,
          similarity: 1,
          searchTerm: query,
        }
      ],
      'red dead': [
        {
          id: '27100',
          name: 'Red Dead Redemption 2',
          gameplayMain: 50,
          gameplayMainExtra: 79,
          gameplayCompletionist: 174,
          similarity: 1,
          searchTerm: query,
        }
      ],
      'spider': [
        {
          id: '57529',
          name: "Marvel's Spider-Man",
          gameplayMain: 17,
          gameplayMainExtra: 34,
          gameplayCompletionist: 35,
          similarity: 1,
          searchTerm: query,
        }
      ]
    };

    // Find matching games
    for (const [key, games] of Object.entries(gameDatabase)) {
      if (query.includes(key) || key.includes(query)) {
        return games;
      }
    }

    // If no exact match, return a generic result
    if (query.length > 2) {
      return [
        {
          id: 'generic',
          name: `${query.charAt(0).toUpperCase() + query.slice(1)}`,
          gameplayMain: Math.floor(Math.random() * 50) + 10,
          gameplayMainExtra: Math.floor(Math.random() * 80) + 30,
          gameplayCompletionist: Math.floor(Math.random() * 120) + 60,
          similarity: 0.7,
          searchTerm: query,
        }
      ];
    }

    return [];
  }
}