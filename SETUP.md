# Setup Guide

## Quick Start

### 1. Environment Variables

Create a `server/.env` file with the following variables:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=recipe_generator
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# OpenAI API Key (Required for AI features)
OPENAI_API_KEY=your-openai-api-key

# Nutrition API (Optional - for accurate nutrition data)
NUTRITION_API_ID=your-nutrition-api-id
NUTRITION_API_KEY=your-nutrition-api-key

# Client URL
CLIENT_URL=http://localhost:3000

# Server Port
PORT=5000
```

### 2. Database Setup

1. Install PostgreSQL if not already installed
2. Create the database:
   ```sql
   CREATE DATABASE recipe_generator;
   ```
3. Run migrations:
   ```bash
   cd server
   npm run migrate
   ```

### 3. Get API Keys

#### OpenAI API Key (Required)
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file

#### Nutrition API (Optional)
1. Sign up at https://www.edamam.com/
2. Get your App ID and App Key
3. Add them to your `.env` file

#### OAuth Credentials (Optional)
- **Google OAuth**: https://console.cloud.google.com/
- **GitHub OAuth**: https://github.com/settings/developers

### 4. Run the Application

```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### OpenAI API Errors
- Verify your API key is correct
- Check your OpenAI account has credits
- Ensure you have access to GPT-4 models

### Port Already in Use
- Change `PORT` in `.env` for backend
- Change port in `client/package.json` for frontend

## Docker Setup

See the main README.md for Docker deployment instructions.

