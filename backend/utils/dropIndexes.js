const mongoose = require('mongoose');
require('dotenv').config();

async function dropGeospatialIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reports');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Drop any geospatial indexes
    for (const index of indexes) {
      if (index.key && Object.values(index.key).includes('2dsphere')) {
        console.log('Dropping geospatial index:', index.name);
        await collection.dropIndex(index.name);
      }
    }

    console.log('Geospatial indexes dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping indexes:', error);
    process.exit(1);
  }
}

dropGeospatialIndexes(); 