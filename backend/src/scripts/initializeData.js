import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShelfLifeService from '../services/shelfLifeService.js';

dotenv.config();

const initializeData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodtracker');

    console.log('✅ Connected to MongoDB');

    // Initialize shelf life data
    await ShelfLifeService.initializeDefaultData();

    console.log('✅ Data initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
};

initializeData();
