# Quick Start Guide

## Prerequisites

Before running the application, ensure you have:

1. **Node.js 18+** installed
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL 15+** installed and running
   - Download from: https://www.postgresql.org/download/
   - Create database: `CREATE DATABASE recipe_generator;`

3. **OpenAI API Key** (Required for AI features)
   - Get from: https://platform.openai.com/api-keys

## Quick Setup

### Option 1: Using the Batch Script (Windows)

1. Create `server/.env` file with your configuration:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=recipe_generator
   DB_PASSWORD=your_password
   DB_PORT=5432
   JWT_SECRET=your-secret-key
   OPENAI_API_KEY=your-openai-api-key
   CLIENT_URL=http://localhost:3000
   PORT=5000
   ```

2. Double-click `start.bat` or run:
   ```bash
   start.bat
   ```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Create `server/.env` file** (see above)

3. **Run database migrations:**
   ```bash
   cd server
   npm run migrate
   ```

4. **Start the application:**
   ```bash
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

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## First Steps

1. Register a new account or login
2. Set up your dietary preferences in Profile
3. Upload ingredient photos or manually add ingredients
4. Generate your first AI recipe!
5. Plan your meals for the week
6. Generate a shopping list

## Troubleshooting

### "Node is not recognized"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Database connection error
- Ensure PostgreSQL is running
- Check database credentials in `server/.env`
- Verify database exists: `psql -U postgres -l`

### Port already in use
- Change `PORT` in `server/.env` for backend
- Or kill the process using the port

### OpenAI API errors
- Verify your API key is correct
- Check you have credits in your OpenAI account
- Ensure you have access to GPT-4 models

## Need Help?

See `README.md` for detailed documentation or `SETUP.md` for detailed setup instructions.

