// SerpApi Configuration Template
// Copy this file to serpapi.ts and add your actual API key
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
// 1. Copy this file to serpapi.ts: cp serpapi.example.ts serpapi.ts
// 2. Go to https://serpapi.com/
// 3. Sign up for free account
// 4. Go to https://serpapi.com/manage-api-key
// 5. Copy your API key
// 6. Replace 'YOUR_SERPAPI_KEY' above with your actual key
// 7. That's it! You'll now get real Google Images results