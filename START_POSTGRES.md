# How to Start PostgreSQL

## Option 1: Using Windows Services (Easiest)

1. **Open Services:**
   - Press `Windows Key + R`
   - Type: `services.msc`
   - Press Enter

2. **Find PostgreSQL:**
   - Look for services named:
     - `postgresql-x64-15` (or similar version number)
     - `PostgreSQL Database Server`
     - Any service with "postgres" in the name

3. **Start the Service:**
   - Right-click on the PostgreSQL service
   - Click "Start"
   - Wait for it to start (status will change to "Running")

## Option 2: Using Command Line

### PowerShell (Run as Administrator):
```powershell
# Find PostgreSQL service
Get-Service -Name "*postgres*"

# Start the service (replace with actual service name)
Start-Service -Name "postgresql-x64-15"
```

### Command Prompt (Run as Administrator):
```cmd
# Find PostgreSQL service
sc query type= service | findstr postgres

# Start the service (replace with actual service name)
net start postgresql-x64-15
```

## Option 3: Using pg_ctl (If installed)

```bash
# Navigate to PostgreSQL bin directory (usually)
cd "C:\Program Files\PostgreSQL\15\bin"

# Start server
pg_ctl start -D "C:\Program Files\PostgreSQL\15\data"
```

## Option 4: Skip Database (Recommended for Now)

**You don't need PostgreSQL to use the app!**

The app has been updated to work without PostgreSQL:
- ✅ Recipe generation works
- ✅ All features work
- ⚠️  Recipes just won't be saved to database

You can set up PostgreSQL later when you want to save recipes permanently.

## Verify PostgreSQL is Running

After starting, test the connection:
```bash
psql -U postgres -c "SELECT version();"
```

If this works, PostgreSQL is running!

## Common Issues

### Service won't start
- Check if port 5432 is already in use
- Check PostgreSQL logs in: `C:\Program Files\PostgreSQL\15\data\log\`
- Try restarting your computer

### Can't find PostgreSQL service
- PostgreSQL may not be installed
- Service name might be different
- Check "Programs and Features" to see if PostgreSQL is installed

### Port 5432 already in use
- Another PostgreSQL instance might be running
- Check with: `netstat -ano | findstr :5432`

## Quick Test

Try this to see if PostgreSQL is accessible:
```bash
psql -U postgres -h localhost -p 5432
```

If it connects, you're good! If not, the service needs to be started.

