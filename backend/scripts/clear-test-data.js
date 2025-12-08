/**
 * Script to clear all test data from the database
 * Run with: node scripts/clear-test-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varlixo';

async function clearTestData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const db = mongoose.connection.db;

    // Get counts before deletion
    const collections = ['deposits', 'withdrawals', 'transactions', 'investments', 'wallets', 'kycs', 'adminlogs'];
    
    console.log('Clearing test data...\n');

    // Clear all transaction-related collections
    for (const collectionName of collections) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✓ Deleted ${result.deletedCount} documents from ${collectionName}`);
      } catch (e) {
        console.log(`- Collection ${collectionName} not found or empty`);
      }
    }

    // Delete non-admin users only
    try {
      const result = await db.collection('users').deleteMany({ 
        role: { $nin: ['admin', 'super_admin'] } 
      });
      console.log(`✓ Deleted ${result.deletedCount} non-admin users`);
    } catch (e) {
      console.log('- Could not delete users:', e.message);
    }

    console.log('\n✅ Test data cleared successfully!');
    console.log('Admin accounts have been preserved.\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

clearTestData();






