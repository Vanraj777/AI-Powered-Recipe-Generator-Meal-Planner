# How to Find or Reset PostgreSQL Password

## Method 1: Check if Password is Saved

### Windows Credential Manager:
1. Press `Windows Key + R`
2. Type: `control /name Microsoft.CredentialManager`
3. Look for "PostgreSQL" entries
4. Check if password is saved there

### pgAdmin (if installed):
1. Open pgAdmin
2. Check saved server connections
3. Password might be saved there

## Method 2: Reset PostgreSQL Password

### Option A: Using pgAdmin
1. Open pgAdmin
2. Connect to PostgreSQL server (if you can)
3. Right-click server → Properties → Change password

### Option B: Using Command Line (if you know current password)
```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'newpassword';
\q
```

### Option C: Reset via Windows (if you have admin access)
1. Stop PostgreSQL service
2. Edit `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\17\data\`)
3. Change authentication method to `trust` temporarily
4. Restart service
5. Connect without password
6. Change password
7. Revert `pg_hba.conf` changes

## Method 3: Use a Different User

If you created a different user during installation:
1. Check what users exist
2. Try that user's password instead

## Method 4: Skip Database (Easiest!)

**The app works perfectly without PostgreSQL!**
- ✅ All features work
- ✅ Recipes generate successfully
- ⚠️  Just won't be saved to database

You can set up PostgreSQL later when you have time.

## Quick Test

Try these common passwords:
- `postgres` (default)
- `admin`
- `password`
- `root`
- (blank/empty)

Update `server/.env` with the correct one and test:
```bash
cd server
node setup-database.js
```

