# Google Play Store Deployment Guide

## ✅ Completed Steps

### 1. Release Keystore Generated
- Location: `android/app/money-manager-release.keystore`
- Alias: `money-manager-key`
- **IMPORTANT**: Keep this file and password safe! You'll need it for all future updates.

### 2. Gradle Signing Configured
- Release builds now use the production keystore
- Credentials stored in `android/gradle.properties` (gitignored)

### 3. App Metadata Updated
- Package ID: `com.logesh153.moneymanager`
- App Name: `Money Manager`
- Version: `1.0.0` (Version Code: 1)

### 4. Signed AAB Built
- File: `android/app/build/outputs/bundle/release/app-release.aab`
- Size: 84MB
- Ready for Play Store upload

---

## 📋 Next Steps (You Need to Do)

### Step 5: Create Play Store Assets

You need to prepare these assets:

#### Required Assets:
1. **App Icon** (512x512 PNG)
   - High-resolution version of your app icon
   - No transparency, square format
   
2. **Feature Graphic** (1024x500 PNG)
   - Banner image for Play Store listing
   - Should showcase your app's main feature

3. **Screenshots** (Minimum 2, recommended 4-8)
   - Phone screenshots: 16:9 or 9:16 aspect ratio
   - Show key features: transaction list, QR scanner, analytics
   - Take from your actual app

4. **Short Description** (Max 80 characters)
   ```
   Track expenses via SMS & UPI. Automatic transaction detection.
   ```

5. **Full Description** (Max 4000 characters)
   ```
   Money Manager - Smart Expense Tracking
   
   Automatically track your transactions by reading bank SMS messages. 
   Scan UPI QR codes for quick payments. View analytics and manage 
   your finances effortlessly.
   
   Features:
   • Automatic SMS transaction detection
   • UPI QR code scanner
   • Multiple bank account support
   • Transaction categorization
   • Expense analytics
   • Dark mode support
   
   Permissions:
   • SMS: To read bank transaction messages
   • Camera: To scan UPI QR codes
   
   Your data stays on your device. We don't collect or share any 
   personal information.
   ```

---

### Step 6: Create Privacy Policy

**Required** because your app reads SMS.

Create a simple HTML page and host it (GitHub Pages, your website, etc.):

```html
<!DOCTYPE html>
<html>
<head>
    <title>Money Manager - Privacy Policy</title>
</head>
<body>
    <h1>Privacy Policy for Money Manager</h1>
    <p>Last updated: January 30, 2026</p>
    
    <h2>Data Collection</h2>
    <p>Money Manager reads SMS messages to automatically detect bank transactions. 
    All data is stored locally on your device. We do not collect, transmit, or 
    share any personal information.</p>
    
    <h2>Permissions</h2>
    <ul>
        <li><strong>READ_SMS</strong>: To read bank transaction messages</li>
        <li><strong>CAMERA</strong>: To scan UPI QR codes for payments</li>
    </ul>
    
    <h2>Data Storage</h2>
    <p>All transaction data is stored locally in your device's database. 
    No data is sent to external servers.</p>
    
    <h2>Contact</h2>
    <p>For questions, contact: [your-email@example.com]</p>
</body>
</html>
```

**Hosting options:**
- GitHub Pages (free): Create a repo, enable Pages
- Google Sites (free)
- Your own website

---

### Step 7: Create Google Play Console Account

1. Go to: https://play.google.com/console
2. Pay $25 one-time registration fee
3. Accept Developer Distribution Agreement
4. Complete account details

---

### Step 8: Create App in Play Console

1. Click **"Create app"**
2. Fill in:
   - App name: **Money Manager**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free**
3. Accept declarations
4. Click **"Create app"**

---

### Step 9: Complete Store Listing

Navigate through the left sidebar and complete:

#### 1. Store Listing
- Upload app icon (512x512)
- Upload feature graphic (1024x500)
- Upload screenshots (minimum 2)
- Enter short description
- Enter full description
- Select app category: **Finance**

#### 2. Content Rating
- Click **"Start questionnaire"**
- Answer questions honestly
- Your app will likely be rated **Everyone** or **Teen**

#### 3. Target Audience
- Select age groups: **18+** (financial app)

#### 4. Privacy Policy
- Enter your privacy policy URL

#### 5. App Access
- Select: **All functionality is available without restrictions**

#### 6. Ads
- Select: **No, my app does not contain ads**

---

### Step 10: Upload AAB

1. Go to **"Production"** (or start with **"Internal testing"** for safer first release)
2. Click **"Create new release"**
3. Upload: `android/app/build/outputs/bundle/release/app-release.aab`
4. Enter release notes:
   ```
   Initial release
   • Automatic transaction detection from SMS
   • UPI QR code scanner
   • Multi-account support
   • Transaction analytics
   ```
5. Click **"Save"**

---

### Step 11: Submit for Review

1. Complete all required sections (checklist shows 100%)
2. Click **"Send for review"**
3. Wait 1-7 days for approval

---

## 🔄 Future Updates

To release updates:

```bash
# 1. Update version in android/app/build.gradle
versionCode 2
versionName "1.0.1"

# 2. Build new AAB
cd android && ./gradlew bundleRelease

# 3. Upload to Play Console
# Go to Production → Create new release → Upload new AAB
```

---

## 🔐 Security Notes

**NEVER commit these files to Git:**
- ✅ Already in .gitignore:
  - `android/app/money-manager-release.keystore`
  - `android/gradle.properties`

**Backup these files securely:**
- Keystore file
- Keystore password: `Logesh@1503`
- Key alias: `money-manager-key`

**If you lose the keystore, you cannot update your app!**

---

## 📞 Support

If you encounter issues:
1. Check Play Console help center
2. Review rejection reasons (if rejected)
3. Common issues:
   - Missing privacy policy
   - Incomplete store listing
   - Content rating not done
   - Target audience not set

---

## 🎉 Success!

Once approved, your app will be live on Google Play Store at:
```
https://play.google.com/store/apps/details?id=com.logesh153.moneymanager
```

Share this link with users to download your app!
