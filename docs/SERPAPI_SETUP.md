# SerpApi Google Image Search Setup

This app uses SerpApi to provide real Google Images search results for selecting cover images.

## Quick Setup (5 minutes)

### 1. Get Your Free API Key
- Go to [serpapi.com](https://serpapi.com/)
- Sign up for a free account
- Visit [API Key Management](https://serpapi.com/manage-api-key)
- Copy your API key

### 2. Add Your Key
Open `config/serpapi.ts` and replace:
```typescript
API_KEY: 'YOUR_SERPAPI_KEY',
```
With:
```typescript
API_KEY: 'your_actual_api_key_here',
```

**Note:** The `config/` directory is in `.gitignore` to keep your API key secure and prevent it from being committed to version control.

### 3. That's It! 🎉
You'll now get real Google Images results instead of demo images.

## Free Tier Limits
- **100 searches per month** (free)
- Perfect for personal projects
- Paid plans available for higher usage

## Features You Get
- ✅ Real Google Images results
- ✅ High-quality cover art
- ✅ Smart portrait orientation filtering
- ✅ Safe search enabled
- ✅ 6 results per page with pagination
- ✅ Instant tap-to-select

## Fallback Mode
Without an API key, the app uses demo placeholder images so you can test the interface immediately.

## Alternative APIs
If you prefer different image sources:
- **Unsplash API** - Free high-quality photos
- **Pixabay API** - Free stock photos
- **Pexels API** - Free stock photos

The architecture is designed to easily swap between different image APIs.