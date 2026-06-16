const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');

async function validate() {
  await client.connect();
  const db = client.db('myapp_nosql');
  const count = await db.collection('users').countDocuments();
  console.log('Migrated users:', count);
  const sample = await db.collection('users').findOne({});
  console.log('Sample document:', JSON.stringify(sample, null, 2));
  await client.close();
}

validate().catch(console.error);
