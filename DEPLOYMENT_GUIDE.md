# SecureSignal Deployment Guide

This guide covers deploying both the frontend and backend components of SecureSignal to production.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (Atlas or self-hosted)
- Domain name (optional but recommended)
- SSL certificate (required for production)

---

## 📋 Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/securesignal

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload (Optional - for cloud storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=SecureSignal
```

---

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended for beginners)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   cd backend
   railway login
   railway init
   ```

3. **Set environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI=your-mongodb-uri
   railway variables set JWT_SECRET=your-jwt-secret
   # ... set all other variables
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### Option 2: Render

1. **Connect your GitHub repository**
2. **Create a new Web Service**
3. **Configure:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. **Set environment variables in the dashboard**
5. **Deploy**

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Create app:**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   # ... set all other variables
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Connect your GitHub repository**
2. **Create a new App**
3. **Configure:**
   - **Source:** Your repository
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
4. **Set environment variables**
5. **Deploy**

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure environment variables in Vercel dashboard**

### Option 2: Netlify

1. **Connect your GitHub repository**
2. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. **Set environment variables**
4. **Deploy**

### Option 3: GitHub Pages

1. **Add to package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create a free cluster**
2. **Set up database access:**
   - Create a database user
   - Set network access (0.0.0.0/0 for all IPs)
3. **Get connection string**
4. **Add to environment variables**

### Self-hosted MongoDB

1. **Install MongoDB on your server**
2. **Configure authentication**
3. **Set up firewall rules**
4. **Use connection string:**
   ```
   mongodb://username:password@your-server:27017/securesignal
   ```

---

## 🔒 Security Checklist

### Backend Security

- [ ] **Environment Variables:** All sensitive data in environment variables
- [ ] **JWT Secret:** Strong, unique JWT secret
- [ ] **Rate Limiting:** Implemented and configured
- [ ] **CORS:** Properly configured for your domain
- [ ] **Input Validation:** All endpoints validate input
- [ ] **File Upload:** File type and size restrictions
- [ ] **HTTPS:** SSL certificate installed
- [ ] **Dependencies:** Regular security updates

### Frontend Security

- [ ] **Environment Variables:** API URLs in environment variables
- [ ] **HTTPS:** Site served over HTTPS
- [ ] **Content Security Policy:** CSP headers configured
- [ ] **Dependencies:** Regular security updates

---

## 📁 File Storage Options

### Option 1: Local Storage (Current Setup)

Files are stored locally in the `uploads` directory.

**Pros:**
- Simple setup
- No additional costs
- Full control

**Cons:**
- Not scalable
- Backup complexity
- Server storage limits

### Option 2: Cloudinary (Recommended for production)

1. **Install Cloudinary:**
   ```bash
   cd backend
   npm install cloudinary
   ```

2. **Update fileUpload.js to use Cloudinary**
3. **Set environment variables:**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Option 3: AWS S3

1. **Install AWS SDK:**
   ```bash
   npm install aws-sdk
   ```

2. **Configure S3 bucket and IAM user**
3. **Update fileUpload.js to use S3**
4. **Set environment variables:**
   ```env
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

---

## 🔧 Production Optimizations

### Backend Optimizations

1. **Enable compression:**
   ```bash
   npm install compression
   ```

2. **Add to server.js:**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

3. **Enable caching headers**
4. **Set up monitoring (e.g., Sentry)**
5. **Configure logging (e.g., Winston)**

### Frontend Optimizations

1. **Enable build optimizations in vite.config.ts**
2. **Set up CDN for static assets**
3. **Enable service worker for caching**
4. **Optimize images and assets**

---

## 🚨 Monitoring & Maintenance

### Health Checks

- **Backend:** `GET /api/health`
- **Frontend:** Implement health check page
- **Database:** Monitor connection status

### Logging

- **Backend:** Use Winston or similar
- **Frontend:** Error tracking (Sentry)
- **Database:** Monitor slow queries

### Backups

- **Database:** Automated daily backups
- **Files:** Regular backup of uploads directory
- **Code:** Version control with GitHub

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check FRONTEND_URL environment variable
   - Verify CORS configuration

2. **File Upload Issues:**
   - Check file size limits
   - Verify file type restrictions
   - Ensure uploads directory exists

3. **Database Connection:**
   - Verify MONGODB_URI
   - Check network access
   - Ensure database user permissions

4. **JWT Issues:**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper token format

### Support

- Check the logs for error messages
- Verify all environment variables are set
- Test endpoints with Postman or similar
- Check database connectivity

---

## 📞 Next Steps

After deployment:

1. **Test all functionality**
2. **Set up monitoring**
3. **Configure backups**
4. **Set up SSL certificate**
5. **Test file uploads**
6. **Verify admin access**
7. **Set up error tracking**

---

## 🔗 Useful Links

- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Railway](https://railway.app/)
- [Vercel](https://vercel.com/)
- [Cloudinary](https://cloudinary.com/)
- [Let's Encrypt](https://letsencrypt.org/) (Free SSL)

---

**Need help?** Check the troubleshooting section or create an issue in the repository. 