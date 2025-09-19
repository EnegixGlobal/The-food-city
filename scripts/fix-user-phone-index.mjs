#!/usr/bin/env node
/**
 * One-off script to ensure the users.phone index is sparse + unique.
 * Usage: `node scripts/fix-user-phone-index.mjs`
 */
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI env variable is required');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const coll = db.collection('users');
    const indexes = await coll.indexes();
    const phoneIdx = indexes.find(i => i.name === 'phone_1');

    if (phoneIdx) {
      const needsDrop = !phoneIdx.sparse || !phoneIdx.unique;
      if (needsDrop) {
        console.log('Dropping legacy phone_1 index (non-sparse / non-unique)...');
        await coll.dropIndex('phone_1');
      } else {
        console.log('Existing phone_1 index already sparse & unique. No action needed.');
      }
    } else {
      console.log('No phone_1 index found, will create a new one.');
    }

    // Re-create desired index (idempotent)
    console.log('Creating sparse unique phone_1 index...');
    await coll.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('Done.');
  } catch (err) {
    console.error('Index fix failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
