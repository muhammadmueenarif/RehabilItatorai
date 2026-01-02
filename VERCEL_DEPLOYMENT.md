# Vercel Deployment Guide

## ✅ Your project is ready for Vercel!

The API endpoint (`api/chat.js`) is now configured with ES6 exports, which is compatible with Vercel serverless functions.

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
From your project directory:
```bash
vercel
```

Or deploy to production:
```bash
vercel --prod
```

### 4. Set Environment Variables
In your Vercel dashboard, go to your project settings and add:
- `DEEPSEEK_API_KEY` - Your DeepSeek API key (if different from the default)

## Important Notes

1. **API Endpoint**: The `/api/chat` endpoint will automatically work on Vercel
2. **Static Files**: All your HTML, CSS, and JS files will be served as static files
3. **Serverless Function**: The `api/chat.js` file will run as a Vercel serverless function
4. **CORS**: CORS is already configured in the API handler

## Testing After Deployment

After deployment, your app will be available at:
- `https://your-project-name.vercel.app`

The API endpoint will be at:
- `https://your-project-name.vercel.app/api/chat`

## Local Development

For local development, use:
```bash
npm run dev
```

This starts the Express server on `http://localhost:3000`

## Troubleshooting

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Ensure `DEEPSEEK_API_KEY` is set in environment variables
3. Verify the API endpoint is accessible at `/api/chat`

