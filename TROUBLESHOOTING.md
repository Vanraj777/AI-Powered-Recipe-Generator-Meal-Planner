# Troubleshooting Registration Failed Error

## Common Issues and Solutions

### 1. Backend Server Not Running

**Symptoms:**
- Error message: "Cannot connect to server"
- Registration fails immediately

**Solution:**
1. Open a terminal/PowerShell window
2. Navigate to the server directory:
   ```bash
   cd "H:\New folder\server"
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. You should see: "Server running on port 5000"
5. Keep this window open while using the app

### 2. Database Connection Failed

**Symptoms:**
- Error: "Database connection failed"
- Error: "password authentication failed"

**Solution:**
1. Check PostgreSQL is running:
   - Open Services (Windows Key + R, type `services.msc`)
   - Find "postgresql" service
   - Make sure it's running

2. Update `server/.env` with correct database password:
   ```env
   DB_PASSWORD=your_actual_postgres_password
   ```

3. Create the database if it doesn't exist:
   ```sql
   CREATE DATABASE recipe_generator;
   ```

4. Run migrations:
   ```bash
   cd server
   npm run migrate
   ```

### 3. Database Doesn't Exist

**Symptoms:**
- Error: "Database does not exist"

**Solution:**
1. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```

2. Create the database:
   ```sql
   CREATE DATABASE recipe_generator;
   ```

3. Exit psql:
   ```sql
   \q
   ```

4. Run migrations:
   ```bash
   cd server
   npm run migrate
   ```

### 4. Port Already in Use

**Symptoms:**
- Error: "Port 5000 already in use"
- Server won't start

**Solution:**
1. Find what's using port 5000:
   ```bash
   netstat -ano | findstr :5000
   ```

2. Kill the process or change the port in `server/.env`:
   ```env
   PORT=5001
   ```

3. Update `client/package.json` proxy:
   ```json
   "proxy": "http://localhost:5001"
   ```

## Quick Fix Checklist

- [ ] Backend server is running (check terminal window)
- [ ] PostgreSQL service is running
- [ ] Database `recipe_generator` exists
- [ ] Database password in `server/.env` is correct
- [ ] Migrations have been run successfully
- [ ] No firewall blocking port 5000

## Testing the Connection

1. **Test backend:**
   Open browser: http://localhost:5000/api/health
   Should show: `{"status":"ok","message":"Recipe Generator API is running"}`

2. **Test database:**
   ```bash
   psql -U postgres -d recipe_generator -c "SELECT 1;"
   ```

## Still Having Issues?

Check the backend server terminal window for detailed error messages. The improved error handling will now show more specific error messages to help diagnose the issue.

