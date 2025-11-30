# Database Setup Guide

## Do You Need PostgreSQL?

**Short answer:** No, not immediately! The app can generate recipes without PostgreSQL, but some features work better with it.

### Without PostgreSQL:
- ✅ AI Recipe Generation (works, but recipes won't be saved)
- ✅ Ingredient Recognition
- ✅ Meal Planning (uses localStorage)
- ✅ Shopping Lists (uses localStorage)
- ✅ Nutrition Tracking (uses localStorage)

### With PostgreSQL:
- ✅ All features above PLUS
- ✅ Recipes are saved and can be browsed later
- ✅ Recipe ratings and favorites
- ✅ Persistent meal plans
- ✅ Recipe search and filtering

## Quick Fix: Make It Work Without Database

The code has been updated to work without PostgreSQL. If you see database errors, the recipe will still be generated and returned to you - it just won't be saved.

## Setting Up PostgreSQL (Optional)

### Step 1: Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

### Step 2: Create Database
1. Open **pgAdmin** (comes with PostgreSQL) or use **psql**
2. Create a new database:
   ```sql
   CREATE DATABASE recipe_generator;
   ```

### Step 3: Update server/.env
Update the database password in `server/.env`:
```env
DB_PASSWORD=your_actual_postgres_password
```

### Step 4: Run Migrations
```bash
cd server
npm run migrate
```

## Troubleshooting Database Connection

### Error: "password authentication failed"
**Solution:** Update `DB_PASSWORD` in `server/.env` to match your PostgreSQL password

### Error: "database does not exist"
**Solution:** Create the database:
```sql
CREATE DATABASE recipe_generator;
```

### Error: "connection refused"
**Solution:** 
1. Make sure PostgreSQL service is running
2. Check Windows Services (search "services.msc")
3. Find "postgresql" service and start it

### Check PostgreSQL Status
```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*
```

## Skip Database for Now

If you want to use the app without PostgreSQL:
1. The app will work - recipes will be generated
2. Recipes just won't be saved to database
3. You can set up PostgreSQL later when needed

The recipe generation will work even if the database connection fails!


