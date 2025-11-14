# Deployment Guide - HostGator cPanel

This guide explains how to deploy SimpleClub to your HostGator shared hosting account.

## Files to Upload

You need to upload these files to your HostGator server:

### Required Files (Must Upload):
```
index.html
styles.css
app-firebase.js
firebase-config.js
manifest.json
.htaccess
```

### Optional Files (Recommended):
```
sw.js              # Service worker for offline functionality
```

### DO NOT Upload (Not needed for production):
```
app.js             # Alternative local version
app-db.js          # Database version (not used)
database.js        # Database version (not used)
server.js          # Node.js server (not needed)
package.json       # Node.js dependencies (not needed)
scripts/           # Setup scripts (not needed)
.env.example       # Environment variables (not needed)
.git/              # Git repository (never upload)
.gitignore         # Git config (not needed)
README.md          # Documentation (optional)
```

## Step-by-Step Deployment

### Method 1: Using cPanel File Manager (Easiest)

1. **Login to cPanel**
   - Go to your HostGator cPanel URL (usually `yourdomain.com/cpanel`)
   - Enter your username and password

2. **Navigate to File Manager**
   - Click on "File Manager" icon
   - Navigate to `public_html` folder (or your domain's folder)

3. **Upload Files**
   - Click "Upload" button at the top
   - Select and upload these files:
     - `index.html`
     - `styles.css`
     - `app-firebase.js`
     - `firebase-config.js`
     - `manifest.json`
     - `.htaccess`
     - `sw.js` (optional)

4. **Set Permissions** (if needed)
   - Select all uploaded files
   - Click "Permissions" or "Change Permissions"
   - Set to `644` (read/write for owner, read for others)
   - For `.htaccess`, ensure it's `644`

5. **Test Your Site**
   - Visit `http://yourdomain.com` (or `http://yourdomain.com/simpleclub` if in subfolder)
   - The app should load and work immediately!

### Method 2: Using FTP (FileZilla)

1. **Get FTP Credentials from cPanel**
   - In cPanel, go to "FTP Accounts"
   - Create an FTP account or use main account
   - Note: hostname, username, password, port (usually 21)

2. **Connect with FileZilla**
   - Host: `ftp.yourdomain.com` or your server IP
   - Username: your FTP username
   - Password: your FTP password
   - Port: 21
   - Click "Quickconnect"

3. **Upload Files**
   - Navigate to `public_html` on the remote side
   - Navigate to your project folder on local side
   - Drag and drop the required files listed above

4. **Test Your Site**
   - Visit your domain in a browser

### Method 3: Using SSH (Advanced)

If you have SSH access enabled:

```bash
# Connect via SSH
ssh your-username@yourdomain.com

# Navigate to public_html
cd public_html

# Create directory (if deploying to subfolder)
mkdir simpleclub
cd simpleclub

# Use scp to copy files from your computer
# (Run this from your local machine in a new terminal)
scp index.html styles.css app-firebase.js firebase-config.js manifest.json .htaccess sw.js \
    your-username@yourdomain.com:~/public_html/simpleclub/
```

## Important Configuration

### 1. Firebase Security (CRITICAL!)

Since your Firebase config is public, you MUST have Firestore security rules set up:

In your Firebase Console (https://console.firebase.google.com):
1. Go to Firestore Database → Rules
2. Make sure you have the rules from `firestore.rules` file applied
3. These rules ensure only authenticated users can read/write data

### 2. SSL Certificate (Recommended)

Firebase requires HTTPS for optimal security:

1. In cPanel, go to "SSL/TLS Status"
2. Enable free AutoSSL certificate for your domain
3. This enables HTTPS automatically
4. The `.htaccess` file will redirect HTTP to HTTPS

### 3. Domain Configuration

**Root Domain (yourdomain.com):**
- Upload files directly to `public_html/`

**Subdomain (app.yourdomain.com):**
- In cPanel → Subdomains, create subdomain
- Upload files to the subdomain's folder

**Subfolder (yourdomain.com/simpleclub):**
- Create folder: `public_html/simpleclub/`
- Upload files there

## Troubleshooting

### Issue: Blank page or errors
**Solution:**
- Check browser console (F12) for errors
- Ensure `firebase-config.js` uploaded correctly
- Verify Firebase project is active

### Issue: 404 errors on files
**Solution:**
- Check file permissions are `644`
- Ensure files are in correct directory
- Clear browser cache (Ctrl+Shift+R)

### Issue: "Firebase not defined" error
**Solution:**
- Check that `index.html` loads Firebase scripts from CDN
- Ensure you have internet connection (Firebase scripts load from CDN)
- Check if your hosting allows external scripts

### Issue: Data not loading
**Solution:**
- Create Firebase indexes (check console for URLs)
- Verify Firestore rules allow access
- Check Firebase project quota (free tier limits)

### Issue: HTTP instead of HTTPS
**Solution:**
- Enable SSL in cPanel → SSL/TLS Status
- The `.htaccess` file will handle the redirect
- Wait 5-10 minutes for SSL to activate

## Post-Deployment Checklist

- [ ] Site loads at your domain
- [ ] Firebase connection works (check browser console)
- [ ] Can add productos (products)
- [ ] Can add miembros (members)
- [ ] Can register ventas (sales)
- [ ] Statistics page shows data
- [ ] SSL certificate active (green padlock in browser)
- [ ] Firebase indexes created (if you see errors in console)

## Performance Tips

1. **Enable CloudFlare** (free)
   - In cPanel or separately
   - Provides CDN and DDoS protection
   - Improves global loading speed

2. **Monitor Firebase Usage**
   - Firebase free tier: 50K reads/day, 20K writes/day
   - Check usage in Firebase Console → Usage tab
   - Set up billing alerts if needed

3. **Backup Your Data**
   - Firebase has automatic backups
   - For extra safety, export Firestore data monthly
   - Firebase Console → Firestore → Import/Export

## Support

- **HostGator Support:** https://www.hostgator.com/help
- **Firebase Documentation:** https://firebase.google.com/docs
- **SimpleClub GitHub:** https://github.com/rosquillas/simpleclub

---

## Quick Upload Command Summary

If using FTP from command line:
```bash
ftp ftp.yourdomain.com
# Enter username and password
cd public_html
put index.html
put styles.css
put app-firebase.js
put firebase-config.js
put manifest.json
put .htaccess
put sw.js
bye
```

Your app should now be live! 🎉
