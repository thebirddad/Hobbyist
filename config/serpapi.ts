// SerpApi Configuration
// Get your free API key at: https://serpapi.com/manage-api-key
// Free tier includes 100 searches per month

export const SERPAPI_CONFIG = {
  // Replace with your actual SerpApi key to enable real Google Image Search
  // Leave as 'YOUR_SERPAPI_KEY' to use demo fallback images
  API_KEY: 'YOUR_SERPAPI_KEY',
  
  // API endpoint
  BASE_URL: 'https://serpapi.com/search',
  
  // Search parameters
  RESULTS_PER_PAGE: 6,
  SAFE_SEARCH: 'active',
  IMAGE_SIZE: 'medium', // small, medium, large
  IMAGE_TYPE: 'photo', // face, photo, clipart, lineart
};

// Instructions for setup:
// 1. Go to https://serpapi.com/
// 2. Sign up for free account
// 3. Go to https://serpapi.com/manage-api-key
// 4. Copy your API key
// 5. Replace 'YOUR_SERPAPI_KEY' above with your actual key
// 6. That's it! You'll now get real Google Images results