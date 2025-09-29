// SerpApi Configuration
// Get your free API key at: https://serpapi.com/manage-api-key
// Free tier includes 100 searches per month

export const APP_CONFIG = {
  // Replace with your actual SerpApi key to enable real Google Image Search
  // Leave as 'YOUR_SERPAPI_KEY' to use demo fallback images
  API_KEY: 'ec01683685b82e0e8f0846e42bf32786b91f8f5fed82677af6a20d7873e34a99',
  VERSION: 'BETA-0.5.0', // App version
  // API endpoint
  BASE_URL: 'https://serpapi.com/search',
  
  // Search parameters
  RESULTS_PER_PAGE: 6,
  SAFE_SEARCH: 'active',
  IMAGE_SIZE: 'medium', // small, medium, large
  IMAGE_TYPE: 'photo', // face, photo, clipart, lineart
};
