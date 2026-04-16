import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkCounts() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    return;
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`${col.name}: ${count}`);
  }
  
  await mongoose.disconnect();
}

checkCounts();
