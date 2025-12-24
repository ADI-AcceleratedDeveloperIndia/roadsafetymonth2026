# Vercel Environment Variables Configuration Guide

## Required Environment Variables for Production

Add these environment variables in your Vercel project settings:

### 🔴 Critical (Required)

1. **MONGODB_URI**
   ```
   mongodb+srv://accelerateddeveloperindia_db_user:3fJcgnsFdhJgPoRm@roadsafetymonth2026.osrjpmd.mongodb.net/roadsafetymonth2026?appName=roadsafetymonth2026
   ```
   - **Purpose**: MongoDB database connection string
   - **Source**: From CREDENTIALS.txt

2. **CERT_HMAC_SECRET**
   ```
   (Generate a long random string - at least 64 characters)
   ```
   - **Purpose**: Secret key for signing certificate download URLs
   - **Generate**: `openssl rand -base64 64`
   - **Security**: Must be unique and kept secret

3. **APP_ORIGIN**
   ```
   https://your-app-name.vercel.app
   ```
   - **Purpose**: Base URL for the application
   - **Example**: `https://roadsafetymonth2026.vercel.app`
   - **Note**: Update after Vercel assigns your domain

4. **NEXTAUTH_URL**
   ```
   https://your-app-name.vercel.app
   ```
   - **Purpose**: NextAuth.js callback URL
   - **Should match**: APP_ORIGIN
   - **Note**: Update after Vercel assigns your domain

5. **NEXTAUTH_SECRET**
   ```
   (Generate a random secret)
   ```
   - **Purpose**: Secret for NextAuth.js session encryption
   - **Generate**: `openssl rand -base64 32`
   - **Security**: Must be unique and kept secret

### 🟡 Optional (Only if you want to customize)

6. **ADMIN_EMAIL**
   ```
   admin@roadsafetymonth2026.com
   ```
   - **Purpose**: Admin login email
   - **Required**: Only if using admin features
   - **Note**: Create admin user after deployment

7. **ADMIN_PASSWORD**
   ```
   (Strong password - at least 16 characters)
   ```
   - **Purpose**: Admin login password
   - **Required**: Only if using admin features
   - **Security**: Use a strong, unique password

8. **MINISTER_NAME**
   ```
   Ponnam Prabhakar
   ```
   - **Purpose**: Minister's name for certificates
   - **Default**: "Ponnam Prabhakar" (already set in code)
   - **Required**: ❌ NO - Only add if you want to change it

9. **MINISTER_TITLE**
   ```
   Hon'ble Cabinet Minister of Government of Telangana
   ```
   - **Purpose**: Minister's title for certificates
   - **Default**: "Hon'ble Cabinet Minister" (already set in code)
   - **Required**: ❌ NO - Only add if you want to change it

10. **PRINCIPAL_SECRETARY_NAME**
    ```
    (Actual Principal Secretary Name)
    ```
    - **Purpose**: Principal Secretary name for certificates
    - **Default**: "Principal Secretary" (already set in code)
    - **Required**: ❌ NO - Only add if you want to change it

11. **PRINCIPAL_SECRETARY_TITLE**
    ```
    Principal Secretary, Transport Department
    ```
    - **Purpose**: Principal Secretary title for certificates
    - **Default**: "Principal Secretary, Transport Department" (already set in code)
    - **Required**: ❌ NO - Only add if you want to change it

## How to Add Environment Variables in Vercel

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Select your project: `roadsafetymonth2026`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Each Variable
For each variable above:
1. Click **Add New**
2. Enter the **Name** (e.g., `MONGODB_URI`)
3. Enter the **Value** (paste from CREDENTIALS.txt or generate)
4. Select **Environment(s)**:
   - ✅ **Production** (required)
   - ✅ **Preview** (recommended for testing)
   - ✅ **Development** (optional, for local dev)
5. Click **Save**

### Step 3: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

## Quick Setup Script

You can use this PowerShell script to generate secrets:

```powershell
# Generate NEXTAUTH_SECRET
$nextAuthSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Write-Host "NEXTAUTH_SECRET=$nextAuthSecret"

# Generate CERT_HMAC_SECRET
$hmacSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Write-Host "CERT_HMAC_SECRET=$hmacSecret"
```

Or use OpenSSL (if available):
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# CERT_HMAC_SECRET
openssl rand -base64 64
```

## Environment Variable Checklist

### ✅ Required (Must Add)
- [ ] `MONGODB_URI` - From CREDENTIALS.txt
- [ ] `CERT_HMAC_SECRET` - Generated (64+ chars)
- [ ] `APP_ORIGIN` - Your Vercel domain
- [ ] `NEXTAUTH_URL` - Same as APP_ORIGIN
- [ ] `NEXTAUTH_SECRET` - Generated (32 chars)

### ⚪ Optional (Only if needed)
- [ ] `ADMIN_EMAIL` - Only if using admin features
- [ ] `ADMIN_PASSWORD` - Only if using admin features
- [ ] `MINISTER_NAME` - Only if you want to change from default "Ponnam Prabhakar"
- [ ] `MINISTER_TITLE` - Only if you want to change from default
- [ ] `PRINCIPAL_SECRETARY_NAME` - Only if you want to change from default "Principal Secretary"
- [ ] `PRINCIPAL_SECRETARY_TITLE` - Only if you want to change from default

## Security Best Practices

1. ✅ **Never commit** `.env` files to Git
2. ✅ **Use different secrets** for Production, Preview, and Development
3. ✅ **Rotate secrets** periodically (especially if compromised)
4. ✅ **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
5. ✅ **Limit access** to Vercel project settings
6. ✅ **Monitor** environment variable changes in Vercel audit logs

## Troubleshooting

### Issue: "MongoDB connection failed"
- ✅ Check `MONGODB_URI` is correct
- ✅ Verify MongoDB Atlas IP whitelist includes Vercel IPs (0.0.0.0/0)
- ✅ Check MongoDB user has correct permissions

### Issue: "Certificate download fails"
- ✅ Verify `CERT_HMAC_SECRET` is set and matches
- ✅ Check `APP_ORIGIN` matches your Vercel domain

### Issue: "Admin login doesn't work"
- ✅ Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set
- ✅ Run seed script after deployment to create admin user
- ✅ Check `NEXTAUTH_SECRET` is set

### Issue: "NextAuth errors"
- ✅ Verify `NEXTAUTH_URL` matches your Vercel domain exactly
- ✅ Check `NEXTAUTH_SECRET` is set and valid

## Post-Deployment Steps

After setting environment variables and deploying:

1. **Run Database Seed** (if needed):
   ```bash
   # Connect to your deployment and run:
   npm run seed
   ```

2. **Verify Environment Variables**:
   - Check Vercel deployment logs for any env var errors
   - Test certificate generation
   - Test admin login
   - Test API endpoints

3. **Update APP_ORIGIN and NEXTAUTH_URL**:
   - After Vercel assigns your domain, update these variables
   - Redeploy to apply changes

## Notes

- Environment variables are **case-sensitive**
- Changes to environment variables require a **redeploy** to take effect
- Preview deployments use Preview environment variables (if set)
- Production deployments use Production environment variables
- You can override variables per-deployment in Vercel dashboard

