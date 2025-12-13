/**
 * Script to check what's in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varlixo';

async function checkDB() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const db = mongoose.connection.db;

    // Check counts
    const collections = ['users', 'deposits', 'withdrawals', 'transactions', 'investments', 'wallets'];
    
    console.log('Current database contents:\n');

    for (const name of collections) {
      try {
        const count = await db.collection(name).countDocuments();
        console.log(`${name}: ${count} documents`);
        
        // Show sample data for users
        if (name === 'users' && count > 0) {
          const users = await db.collection(name).find({}).toArray();
          console.log('  Users:');
          users.forEach(u => {
            console.log(`    - ${u.email} (${u.role})`);
          });
        }
      } catch (e) {
        console.log(`${name}: not found`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkDB();







