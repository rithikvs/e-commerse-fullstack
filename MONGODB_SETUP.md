# 🗄️ MongoDB Setup Guide

## Quick Fix for Database Connection Issues

### Option 1: Install MongoDB Locally (Recommended for Development)

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select your operating system and download

2. **Install MongoDB**
   - Run the installer
   - Follow the installation wizard
   - Make sure to install MongoDB as a service

3. **Start MongoDB Service**
   - **Windows**: MongoDB should start automatically as a service
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

4. **Verify Installation**
   ```bash
   mongosh
   # or
   mongo
   ```

### Option 2: Use MongoDB Atlas (Cloud - Free)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select cloud provider and region
   - Click "Create"

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

4. **Update Environment Variables**
   Create a `.env` file in the `backend` folder:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/handmade_crafts
   PORT=5000
   NODE_ENV=development
   ```

### Option 3: Quick Test (No Installation)

If you just want to test the frontend without database:

1. **Comment out MongoDB connection in server.js**
   ```javascript
   // Comment out this line temporarily
   // mongoose.connect(MONGO_URI, {...});
   ```

2. **Start server**
   ```bash
   cd backend
   npm start
   ```

3. **Test frontend**
   ```bash
   npm run dev
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **"MongoDB connection error"**
   - MongoDB service not running
   - Wrong connection string
   - Firewall blocking connection

2. **"ECONNREFUSED"**
   - MongoDB not installed
   - Service not started
   - Wrong port (default: 27017)

3. **"Authentication failed"**
   - Wrong username/password
   - User not created in database

### Test Database Connection:

1. **Health Check**
   ```
   GET http://localhost:5000/api/health
   ```

2. **Database Test**
   ```
   GET http://localhost:5000/api/test-db
   ```

3. **Check Console Logs**
   Look for these messages in your terminal:
   ```
   🔗 Attempting to connect to MongoDB...
   📡 Connection string: mongodb://127.0.0.1:27017/handmade_crafts
   ✅ Connected to MongoDB successfully
   ```

## 🚀 Quick Start Commands

```bash
# 1. Install MongoDB locally (Option 1)
# Download and install from mongodb.com

# 2. Start backend server
cd backend
npm start

# 3. Start frontend
npm run dev

# 4. Test database
curl http://localhost:5000/api/health
curl http://localhost:5000/api/test-db
```

## 📱 Alternative: Use Docker

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start backend
cd backend
npm start
```

---

**Need Help?** Check the console logs for detailed error messages and connection status.
