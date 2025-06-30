# SecureSignal Backend Environment Variables Setup Guide

This guide explains how to obtain all the values needed for your `.env` file.

## 📋 Quick Setup Steps

1. Copy the example file: `cp env.example .env`
2. Follow this guide to fill in your values
3. Never commit your `.env` file to version control

---

## 🔧 SERVER CONFIGURATION

### `PORT`
- **What it is**: The port number your backend server will run on
- **How to get**: Choose any available port (3000, 5000, 8000, etc.)
- **Example**: `PORT=5000`
- **Note**: Make sure this port isn't used by other applications

### `NODE_ENV`
- **What it is**: Environment mode that affects security, logging, and error handling
- **Options**: 
  - `development` - More verbose logging, less security
  - `production` - Optimized for performance, maximum security
  - `test` - For running tests
- **Example**: `NODE_ENV=development`

---

## 🗄️ MONGODB DATABASE CONFIGURATION

### Local MongoDB Setup (`MONGODB_URI`)

#### Option 1: Install MongoDB Locally
1. **Download MongoDB Community Server**:
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Download for your operating system
   - Install following the wizard

2. **Start MongoDB Service**:
   - **Windows**: MongoDB runs as a service automatically
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

3. **Connection String**:
   ```
   MONGODB_URI=mongodb://localhost:27017/securesignal
   ```

#### Option 2: Use MongoDB with Authentication
1. **Create a MongoDB user**:
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Switch to admin database
   use admin
   
   # Create user
   db.createUser({
     user: "securesignal_user",
     pwd: "your_secure_password",
     roles: [{ role: "readWrite", db: "securesignal" }]
   })
   ```

2. **Connection String**:
   ```
   MONGODB_URI=mongodb://securesignal_user:your_secure_password@localhost:27017/securesignal
   ```

### MongoDB Atlas Setup (`MONGODB_URI_PROD`)

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Sign up for a free account

2. **Create a Cluster**:
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create"

3. **Set Up Database Access**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `securesignal`

6. **Final Connection String**:
   ```
   MONGODB_URI_PROD=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/securesignal
   ```

---

## 🔐 JWT CONFIGURATION

### `JWT_SECRET`
- **What it is**: Secret key used to sign and verify JWT tokens
- **How to generate**:

#### Method 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Method 2: Online Generator
- Go to [Generate Secret](https://generate-secret.vercel.app/64)
- Generate a 64-character secret

#### Method 3: Using OpenSSL
```bash
openssl rand -hex 64
```

- **Example**: `JWT_SECRET=a1b2c3d4e5f6...` (64 characters)
- **Security**: Keep this secret and never share it

### `JWT_EXPIRE`
- **What it is**: How long JWT tokens remain valid
- **Options**:
  - `1h` - 1 hour
  - `24h` - 24 hours
  - `7d` - 7 days
  - `30d` - 30 days
- **Example**: `JWT_EXPIRE=7d`

---

## ☁️ CLOUDINARY CONFIGURATION (For Image Uploads)

### Step-by-Step Setup:

1. **Create Cloudinary Account**:
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account

2. **Get Your Credentials**:
   - After signing up, go to your Dashboard
   - Look for "Account Details" section
   - You'll find:
     - Cloud Name
     - API Key
     - API Secret

3. **Environment Variables**:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Example:
```
CLOUDINARY_CLOUD_NAME=myapp123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## 📧 EMAIL CONFIGURATION

### Gmail Setup (Recommended for Development):

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - In Security settings, find "App passwords"
   - Click "Generate"
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Environment Variables**:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

### Other Email Providers:

#### Outlook/Hotmail:
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your.email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo:
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your.email@yahoo.com
EMAIL_PASS=your-app-password
```

#### Custom SMTP Server:
```
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

---

## 🛡️ RATE LIMITING CONFIGURATION

### `RATE_LIMIT_WINDOW_MS`
- **What it is**: Time window for rate limiting in milliseconds
- **Options**:
  - `60000` - 1 minute
  - `300000` - 5 minutes
  - `900000` - 15 minutes (recommended)
  - `3600000` - 1 hour
- **Example**: `RATE_LIMIT_WINDOW_MS=900000`

### `RATE_LIMIT_MAX_REQUESTS`
- **What it is**: Maximum requests allowed per time window
- **Recommendations**:
  - Development: `100`
  - Production: `50-200` (depending on server capacity)
- **Example**: `RATE_LIMIT_MAX_REQUESTS=100`

---

## 🔒 ENCRYPTION CONFIGURATION

### `ENCRYPTION_KEY`
- **What it is**: 32-character key for encrypting sensitive data
- **How to generate**:

#### Method 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Method 2: Using OpenSSL
```bash
openssl rand -hex 32
```

- **Example**: `ENCRYPTION_KEY=a1b2c3d4e5f6...` (32 characters)
- **Security**: This encrypts sensitive report data

---

## 🌐 FRONTEND URL (CORS)

### `FRONTEND_URL`
- **What it is**: URL of your frontend application for CORS
- **Development**: `FRONTEND_URL=http://localhost:8080`
- **Production**: `FRONTEND_URL=https://yourdomain.com`
- **Multiple URLs**: `FRONTEND_URL=http://localhost:8080,https://yourdomain.com`

---

## 📁 FILE UPLOAD CONFIGURATION

### `MAX_FILE_SIZE`
- **What it is**: Maximum file size in bytes
- **Common values**:
  - `5242880` - 5MB
  - `10485760` - 10MB (recommended)
  - `20971520` - 20MB
- **Example**: `MAX_FILE_SIZE=10485760`

### `ALLOWED_FILE_TYPES`
- **What it is**: Comma-separated list of allowed MIME types
- **Common types**:
  - Images: `image/jpeg,image/png,image/gif`
  - Documents: `application/pdf,application/msword`
  - All images: `image/*`
- **Example**: `ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf`

---

## 🔧 OPTIONAL CONFIGURATIONS

### Session Timeout
```
SESSION_TIMEOUT=86400000  # 24 hours in milliseconds
```

### Security Features
```
ENABLE_HTTPS_REDIRECT=false  # Set to true in production
ENABLE_HSTS=false           # Set to true in production
ENABLE_CSP=false            # Set to true in production
```

### Logging
```
LOG_LEVEL=info              # error, warn, info, debug
ENABLE_REQUEST_LOGGING=true
```

### Analytics
```
ENABLE_ANALYTICS=false
ANALYTICS_API_KEY=          # If using external analytics
```

### Backup
```
ENABLE_AUTO_BACKUP=false
BACKUP_SCHEDULE=0 2 * * *   # Daily at 2 AM (cron format)
BACKUP_RETENTION_DAYS=30
```

---

## 🚀 PRODUCTION CHECKLIST

Before deploying to production:

- [ ] Change `NODE_ENV` to `production`
- [ ] Use MongoDB Atlas connection string
- [ ] Generate strong JWT secret
- [ ] Set up Cloudinary for file uploads
- [ ] Configure email service
- [ ] Set appropriate rate limits
- [ ] Enable security features
- [ ] Set up proper CORS URLs
- [ ] Generate encryption key
- [ ] Test all functionality

---

## 🔍 TROUBLESHOOTING

### Common Issues:

1. **MongoDB Connection Failed**:
   - Check if MongoDB is running
   - Verify connection string format
   - Check network access (for Atlas)

2. **JWT Errors**:
   - Ensure JWT_SECRET is set
   - Check JWT_EXPIRE format

3. **Email Not Sending**:
   - Verify SMTP settings
   - Check app password (for Gmail)
   - Test with different email provider

4. **File Upload Issues**:
   - Check Cloudinary credentials
   - Verify file size limits
   - Check allowed file types

5. **CORS Errors**:
   - Verify FRONTEND_URL is correct
   - Check if frontend is running on correct port

---

## 📞 SUPPORT

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check server logs for error messages
4. Ensure all services (MongoDB, Cloudinary) are accessible

---

## 🔐 SECURITY NOTES

- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Regularly rotate JWT secrets and encryption keys
- Enable 2FA on all accounts
- Use HTTPS in production
- Keep dependencies updated 