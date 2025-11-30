# Deployment Guide

This guide covers deploying the AI Recipe Generator to various platforms.

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. **Sign up at [Railway.app](https://railway.app)**
2. **Create New Project**
3. **Add PostgreSQL Database:**
   - Click "New" → "Database" → "PostgreSQL"
   - Note the connection details

4. **Deploy from GitHub:**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Railway will auto-detect and build

5. **Set Environment Variables:**
   ```
   NODE_ENV=production
   DB_USER=<from railway postgres>
   DB_HOST=<from railway postgres>
   DB_NAME=<from railway postgres>
   DB_PASSWORD=<from railway postgres>
   DB_PORT=5432
   JWT_SECRET=<generate a random secret>
   OPENAI_API_KEY=<your-openai-key>
   CLIENT_URL=https://your-app.railway.app
   PORT=5000
   ```

6. **Run Migrations:**
   - In Railway, go to your service
   - Open "Deploy Logs"
   - Or add a one-time command: `npm run migrate`

7. **Your app will be live at:** `https://your-app.railway.app`

---

### Option 2: Render

1. **Sign up at [Render.com](https://render.com)**

2. **Create PostgreSQL Database:**
   - New → PostgreSQL
   - Note connection string

3. **Create Web Service:**
   - New → Web Service
   - Connect your GitHub repo
   - Build Command: `npm run build`
   - Start Command: `cd server && npm start`

4. **Set Environment Variables** (same as Railway above)

5. **Deploy!**

---

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App:**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set OPENAI_API_KEY=your-key
   heroku config:set JWT_SECRET=your-secret
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   heroku run npm run migrate
   ```

---

### Option 4: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
1. Push code to GitHub
2. Import project on Vercel
3. Set build command: `cd client && npm run build`
4. Set output directory: `client/build`

**Backend (Railway/Render):**
- Follow Option 1 or 2 above
- Update `CLIENT_URL` to your Vercel URL

---

## Local Production Build

To test production build locally:

```bash
# Build frontend
cd client
npm run build

# Copy build to server
cd ..
mkdir -p server/public
cp -r client/build/* server/public/

# Set production mode
cd server
export NODE_ENV=production

# Start server
npm start
```

---

## Docker Deployment

### Build and Run with Docker Compose:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Build Docker Image:

```bash
docker build -t ai-recipe-generator .
docker run -p 5000:5000 --env-file server/.env ai-recipe-generator
```

---

## Environment Variables Checklist

Make sure these are set in production:

- ✅ `NODE_ENV=production`
- ✅ `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`
- ✅ `JWT_SECRET` (strong random string)
- ✅ `OPENAI_API_KEY` (your OpenAI key)
- ✅ `CLIENT_URL` (your production URL)
- ✅ `PORT` (usually 5000 or platform default)

---

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables are set
- [ ] API health check works: `/api/health`
- [ ] Frontend loads correctly
- [ ] Recipe generation works (test with OpenAI)
- [ ] Database connection is working
- [ ] CORS is configured for your domain

---

## Troubleshooting

### Database Connection Issues
- Check connection string format
- Verify database is accessible from your platform
- Check firewall/network settings

### Build Failures
- Ensure Node.js version matches (18+)
- Check all dependencies are in package.json
- Review build logs for specific errors

### API Not Working
- Verify environment variables are set
- Check server logs
- Test `/api/health` endpoint

---

## Need Help?

Check platform-specific documentation:
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Heroku Docs](https://devcenter.heroku.com)
- [Vercel Docs](https://vercel.com/docs)

