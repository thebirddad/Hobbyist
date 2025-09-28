// Debug script to inspect AsyncStorage data
// Run this in the browser console when debugging

async function inspectAsyncStorage() {
  try {
    const gamesData = await window.localStorage.getItem('games_data');
    if (gamesData) {
      const games = JSON.parse(gamesData);
      console.log('🔍 Current AsyncStorage games data:');
      console.log('Total games:', games.length);
      games.forEach((game, index) => {
        console.log(`Game ${index + 1}:`, {
          id: game.id,
          title: game.title,
          platform: game.platform,
          thumbnail: game.thumbnail,
          thumbnailType: typeof game.thumbnail,
          thumbnailLength: game.thumbnail?.length || 0
        });
        if (game.thumbnail) {
          console.log(`Game ${index + 1} thumbnail preview:`, game.thumbnail.substring(0, 100) + '...');
        }
      });
    } else {
      console.log('🔍 No games data found in AsyncStorage');
    }
  } catch (error) {
    console.error('🔍 Error inspecting AsyncStorage:', error);
  }
}

// Call the function
inspectAsyncStorage();