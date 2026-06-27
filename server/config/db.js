const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

let mongoServer;

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds connection timeout
    });
    console.log(`MongoDB Connected to Atlas: ${conn.connection.host}`);
  } catch (error) {
    if (process.env.VERCEL) {
      console.error(`MongoDB Atlas connection error on Vercel: ${error.message}`);
      throw error;
    }
    console.warn(`\n======================================================`);
    console.warn(`WARNING: Failed to connect to MongoDB Atlas: ${error.message}`);
    console.warn(`This is likely due to MongoDB Atlas IP whitelisting blocking your access.`);
    console.warn(`Attempting to launch a local persistent MongoDB Server fallback...`);
    console.warn(`======================================================\n`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      
      const dbPath = path.join(__dirname, '../.local-db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      console.log('Starting local MongoDB Server instance...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
          dbName: 'rentalhouse',
        },
      });

      const localURI = mongoServer.getUri();
      console.log(`Local MongoDB Server started at: ${localURI}`);

      const conn = await mongoose.connect(localURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected locally: ${conn.connection.host}`);

      // Check if we need to auto-seed
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Local database is empty. Automatically seeding data...');
        try {
          execSync('node scripts/seed.js', {
            cwd: path.join(__dirname, '..'),
            env: {
              ...process.env,
              MONGODB_URI: localURI,
            },
            stdio: 'inherit',
          });
          console.log('Auto-seeding completed successfully!');
        } catch (seedError) {
          console.error(`Auto-seeding failed: ${seedError.message}`);
        }
      }
    } catch (localError) {
      console.error(`Local MongoDB Server failed to start: ${localError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
